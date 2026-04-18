terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 6.0"
    }
  }
}

provider "oci" {
  region           = var.ociRegionIdentifier
  tenancy_ocid     = var.ociTenancyOcid
  user_ocid        = var.ociUserOcid
  fingerprint      = var.ociFingerprint
  private_key_path = var.ociPrivateKeyPath
}
