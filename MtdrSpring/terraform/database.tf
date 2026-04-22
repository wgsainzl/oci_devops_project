# ---------------------------------------------------------------------------
# ATP Instance (existing — not created by Terraform, only referenced)
# ---------------------------------------------------------------------------
variable "autonomous_database_db_workload" {
  default = "OLTP"
}

data "oci_database_autonomous_databases" "autonomous_databases_atp" {
  compartment_id = var.ociCompartmentOcid
  display_name   = var.mtdrDbName
  db_workload    = var.autonomous_database_db_workload
}

# ---------------------------------------------------------------------------
# Object Storage namespace
# ---------------------------------------------------------------------------
data "oci_objectstorage_namespace" "test_namespace" {
  compartment_id = var.ociCompartmentOcid
}

output "ns_objectstorage_namespace" {
  value       = data.oci_objectstorage_namespace.test_namespace.namespace
  description = "Object storage namespace"
}
