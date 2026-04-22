# ---------------------------------------------------------------------------
# OKE Cluster + Node Pool
# ---------------------------------------------------------------------------
data "oci_containerengine_cluster_option" "mtdrworkshop_cluster_option" {
  cluster_option_id = "all"
}

data "oci_containerengine_node_pool_option" "mtdrworkshop_node_pool_option" {
  node_pool_option_id = "all"
}

locals {
  # Pick the latest available k8s version from the cluster options list
  k8s_version = reverse(
    sort(data.oci_containerengine_cluster_option.mtdrworkshop_cluster_option.kubernetes_versions)
  )[0]

  # Extract minor version string e.g. "1.35" from "v1.35.0"
  k8s_minor = join(".", slice(split(".", trimprefix(local.k8s_version, "v")), 0, 2))

  # Oracle Linux x86 images that match the selected k8s minor version (exclude ARM)
  all_sources = data.oci_containerengine_node_pool_option.mtdrworkshop_node_pool_option.sources
  oracle_linux_images = [
    for source in local.all_sources : source.image_id
    if(
      length(regexall("Oracle-Linux-[0-9]+\\.[0-9]+-20[0-9]+", source.source_name)) > 0 &&
      length(regexall("aarch64", source.source_name)) == 0 &&
      can(regex(local.k8s_minor, source.source_name))
    )
  ]
}

resource "oci_containerengine_cluster" "mtdrworkshop_cluster" {
  compartment_id     = var.ociCompartmentOcid
  kubernetes_version = local.k8s_version
  name               = "mtdrworkshopcluster-${var.mtdrKey}"
  vcn_id             = oci_core_vcn.okevcn.id

  endpoint_config {
    is_public_ip_enabled = true
    nsg_ids              = []
    subnet_id            = oci_core_subnet.endpoint.id
  }

  options {
    service_lb_subnet_ids = [oci_core_subnet.svclb_Subnet.id]

    add_ons {
      is_kubernetes_dashboard_enabled = false
      is_tiller_enabled               = false
    }

    admission_controller_options {
      is_pod_security_policy_enabled = false
    }

    kubernetes_network_config {
      pods_cidr     = "10.244.0.0/16"
      services_cidr = "10.96.0.0/16"
    }
  }
}

resource "oci_containerengine_node_pool" "oke_node_pool" {
  cluster_id         = oci_containerengine_cluster.mtdrworkshop_cluster.id
  compartment_id     = var.ociCompartmentOcid
  kubernetes_version = local.k8s_version
  name               = "Pool"
  node_shape         = "VM.Standard.E3.Flex"

  node_shape_config {
    memory_in_gbs = 6
    ocpus         = 2
  }

  node_config_details {
    placement_configs {
      availability_domain = data.oci_identity_availability_domain.ad1.name
      subnet_id           = oci_core_subnet.nodePool_Subnet.id
    }
    size = 3
  }

  node_source_details {
    image_id    = local.oracle_linux_images[0]
    source_type = "IMAGE"
  }

  ssh_public_key = var.ssh_public_key
}
