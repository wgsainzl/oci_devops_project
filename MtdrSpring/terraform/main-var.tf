// Copyright (c) 2022 Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

variable "ociTenancyOcid" {}
variable "ociUserOcid" {}
variable "ociCompartmentOcid" {}
variable "ociRegionIdentifier" {}
variable "mtdrDbName" {}
variable "runName" {}

# mtdrKey is a unique generated id
variable "mtdrKey" {}
variable "db_ocid" {}

# SSH public key for OKE worker nodes.
# Set via terraform.tfvars or the TF_VAR_ssh_public_key environment variable.
# Never commit the actual key value to the repo.
variable "ssh_public_key" {}

# OCI provider auth — values come from ~/.oci/config
# Set these in terraform.tfvars, never commit them.
variable "ociFingerprint" {}
variable "ociPrivateKeyPath" {}
