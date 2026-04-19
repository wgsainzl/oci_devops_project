# Existing output — kept for backwards compatibility with workshop scripts
output "lab_oke_cluster_id" {
  value       = oci_containerengine_cluster.mtdrworkshop_cluster.id
  description = "OKE cluster OCID"
}

# Clean alias used by the GitHub Actions pipeline.
# After terraform apply, copy this value into the OKE_CLUSTER_OCID GitHub Secret.
output "oke_cluster_id" {
  value       = oci_containerengine_cluster.mtdrworkshop_cluster.id
  description = "OKE cluster OCID (pipeline alias)"
}

output "oke_node_pool_id" {
  value       = oci_containerengine_node_pool.oke_node_pool.id
  description = "OKE node pool OCID"
}