# Main Terraform Configuration for OKE Infrastructure
# Feature: 005-oke-dapr-kafka-infra

# =============================================================================
# Compartment Configuration (T014)
# =============================================================================

resource "oci_identity_compartment" "todo_compartment" {
  compartment_id = var.tenancy_ocid
  name           = var.compartment_name
  description    = var.compartment_description
  freeform_tags  = var.freeform_tags

  # Enable delete even if compartment is not empty
  enable_delete = true
}

# =============================================================================
# IAM Policies for OKE Management (T015)
# =============================================================================

resource "oci_identity_policy" "oke_policy" {
  compartment_id = var.tenancy_ocid
  name           = "todo-oke-policy"
  description    = "IAM policies for OKE cluster management"

  statements = [
    # Allow OKE to manage network resources
    "Allow service OKE to manage network-resources in compartment ${var.compartment_name}",

    # Allow OKE to manage load balancers
    "Allow service OKE to manage load-balancers in compartment ${var.compartment_name}",

    # Allow OKE to manage compute instances for node pools
    "Allow service OKE to manage compute-management-family in compartment ${var.compartment_name}",

    # Allow OKE to use secrets for image pull
    "Allow service OKE to read secret-family in compartment ${var.compartment_name}",
  ]

  freeform_tags = var.freeform_tags

  depends_on = [oci_identity_compartment.todo_compartment]
}

resource "oci_identity_policy" "ocir_policy" {
  compartment_id = var.tenancy_ocid
  name           = "todo-ocir-policy"
  description    = "IAM policies for Oracle Container Registry access"

  statements = [
    # Allow users to manage container repositories
    "Allow group Administrators to manage repos in tenancy",

    # Allow users to push/pull images
    "Allow group Administrators to manage repos in compartment ${var.compartment_name}",
  ]

  freeform_tags = var.freeform_tags

  depends_on = [oci_identity_compartment.todo_compartment]
}

# =============================================================================
# Local Variables
# =============================================================================

locals {
  compartment_id = oci_identity_compartment.todo_compartment.id

  # Get the first availability domain
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name

  # OKE image selection
  node_image_id = var.node_image_id != "" ? var.node_image_id : data.oci_containerengine_node_pool_option.oke_node_pool_option.sources[0].image_id
}

# Data source for node pool options (to get latest OKE-compatible image)
data "oci_containerengine_node_pool_option" "oke_node_pool_option" {
  node_pool_option_id = "all"
  compartment_id      = local.compartment_id

  depends_on = [oci_identity_compartment.todo_compartment]
}
