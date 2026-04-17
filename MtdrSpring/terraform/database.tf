//================= create ATP Instance =======================================
variable "autonomous_database_db_workload" { default = "OLTP" }

data "oci_database_autonomous_databases" "autonomous_databases_atp" {
  #Required
  compartment_id = var.ociCompartmentOcid
  #Optional
  display_name =  "task-management-db"
  db_workload  = var.autonomous_database_db_workload
}

//======= Name space details ------------------------------------------------------
data "oci_objectstorage_namespace" "test_namespace" {
  #Optional
  compartment_id = var.ociCompartmentOcid
}

//========= Outputs ===========================
output "ns_objectstorage_namespace" {
  value =  [ data.oci_objectstorage_namespace.test_namespace.namespace ]
}
output "autonomous_database_admin_password" {
  value =  [ "Welcome12345" ]
}