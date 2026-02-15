# OKE Cluster and Node Pool Configuration
# Feature: 005-oke-dapr-kafka-infra

# =============================================================================
# OKE Cluster (T024)
# =============================================================================

resource "oci_containerengine_cluster" "todo_cluster" {
  compartment_id     = local.compartment_id
  kubernetes_version = var.kubernetes_version
  name               = var.cluster_name
  vcn_id             = oci_core_vcn.todo_vcn.id
  type               = var.cluster_type

  # Cluster endpoint configuration
  endpoint_config {
    is_public_ip_access_enabled = true
    subnet_id                   = oci_core_subnet.public_subnet.id
  }

  # Cluster options
  options {
    service_lb_subnet_ids = [oci_core_subnet.public_subnet.id]

    # Add-ons configuration
    add_ons {
      is_kubernetes_dashboard_enabled = false
      is_tiller_enabled               = false
    }

    # Kubernetes network configuration
    kubernetes_network_config {
      pods_cidr     = "10.244.0.0/16"
      services_cidr = "10.96.0.0/16"
    }

    # Persistent volume configuration
    persistent_volume_config {
      freeform_tags = var.freeform_tags
    }

    # Service LB configuration
    service_lb_config {
      freeform_tags = var.freeform_tags
    }
  }

  freeform_tags = var.freeform_tags
}

# =============================================================================
# Node Pool (T025)
# =============================================================================

resource "oci_containerengine_node_pool" "todo_node_pool" {
  cluster_id         = oci_containerengine_cluster.todo_cluster.id
  compartment_id     = local.compartment_id
  kubernetes_version = var.kubernetes_version
  name               = var.node_pool_name

  # Node shape configuration (Ampere A1 for Always Free)
  node_shape = var.node_shape

  node_shape_config {
    ocpus         = var.node_ocpus
    memory_in_gbs = var.node_memory_gb
  }

  # Node source (OS image)
  node_source_details {
    source_type             = "IMAGE"
    image_id                = local.node_image_id
    boot_volume_size_in_gbs = var.node_boot_volume_size_gb
  }

  # Node placement configuration
  node_config_details {
    size = var.node_count

    placement_configs {
      availability_domain = local.availability_domain
      subnet_id           = oci_core_subnet.private_subnet.id
    }

    # Node pool cycling configuration
    node_pool_pod_network_option_details {
      cni_type = "FLANNEL_OVERLAY"
    }

    freeform_tags = var.freeform_tags
  }

  # Initial node labels
  initial_node_labels {
    key   = "name"
    value = var.node_pool_name
  }

  initial_node_labels {
    key   = "project"
    value = "todo-app"
  }

  freeform_tags = var.freeform_tags

  # Ensure cluster is created first
  depends_on = [oci_containerengine_cluster.todo_cluster]
}

# =============================================================================
# Data source for kubeconfig generation
# =============================================================================

data "oci_containerengine_cluster_kube_config" "cluster_kube_config" {
  cluster_id = oci_containerengine_cluster.todo_cluster.id

  depends_on = [oci_containerengine_node_pool.todo_node_pool]
}
