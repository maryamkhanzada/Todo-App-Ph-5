# OCI Terraform Provider Configuration
# Feature: 005-oke-dapr-kafka-infra

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 5.0.0"
    }
  }

  # Backend configuration for remote state (OCI Object Storage)
  # Uncomment and configure for team environments
  # backend "http" {
  #   address        = "https://objectstorage.<region>.oraclecloud.com/n/<namespace>/b/<bucket>/o/terraform.tfstate"
  #   update_method  = "PUT"
  # }
}

# OCI Provider Configuration
# Authentication via OCI CLI config file or environment variables
provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

# Data source for availability domains
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

# Data source for OKE supported Kubernetes versions
data "oci_containerengine_cluster_option" "oke_cluster_option" {
  cluster_option_id = "all"
}
