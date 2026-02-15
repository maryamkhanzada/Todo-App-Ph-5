# Terraform Outputs for OKE Infrastructure
# Feature: 005-oke-dapr-kafka-infra

# =============================================================================
# Compartment Outputs
# =============================================================================

output "compartment_id" {
  description = "OCID of the created compartment"
  value       = oci_identity_compartment.todo_compartment.id
}

output "compartment_name" {
  description = "Name of the created compartment"
  value       = oci_identity_compartment.todo_compartment.name
}

# =============================================================================
# VCN Outputs
# =============================================================================

output "vcn_id" {
  description = "OCID of the VCN"
  value       = oci_core_vcn.todo_vcn.id
}

output "vcn_cidr_block" {
  description = "CIDR block of the VCN"
  value       = oci_core_vcn.todo_vcn.cidr_blocks[0]
}

output "public_subnet_id" {
  description = "OCID of the public subnet"
  value       = oci_core_subnet.public_subnet.id
}

output "private_subnet_id" {
  description = "OCID of the private subnet"
  value       = oci_core_subnet.private_subnet.id
}

output "internet_gateway_id" {
  description = "OCID of the Internet Gateway"
  value       = oci_core_internet_gateway.todo_igw.id
}

output "nat_gateway_id" {
  description = "OCID of the NAT Gateway"
  value       = oci_core_nat_gateway.todo_nat.id
}

output "service_gateway_id" {
  description = "OCID of the Service Gateway"
  value       = oci_core_service_gateway.todo_sgw.id
}

# =============================================================================
# OKE Cluster Outputs
# =============================================================================

output "cluster_id" {
  description = "OCID of the OKE cluster"
  value       = oci_containerengine_cluster.todo_cluster.id
}

output "cluster_name" {
  description = "Name of the OKE cluster"
  value       = oci_containerengine_cluster.todo_cluster.name
}

output "cluster_kubernetes_version" {
  description = "Kubernetes version of the cluster"
  value       = oci_containerengine_cluster.todo_cluster.kubernetes_version
}

output "cluster_endpoint" {
  description = "Kubernetes API server endpoint"
  value       = oci_containerengine_cluster.todo_cluster.endpoints[0].kubernetes
  sensitive   = false
}

# =============================================================================
# Node Pool Outputs
# =============================================================================

output "node_pool_id" {
  description = "OCID of the node pool"
  value       = oci_containerengine_node_pool.todo_node_pool.id
}

output "node_pool_name" {
  description = "Name of the node pool"
  value       = oci_containerengine_node_pool.todo_node_pool.name
}

output "node_pool_size" {
  description = "Number of nodes in the pool"
  value       = oci_containerengine_node_pool.todo_node_pool.node_config_details[0].size
}

# =============================================================================
# Kubeconfig Output
# =============================================================================

output "kubeconfig" {
  description = "Kubeconfig content for cluster access"
  value       = data.oci_containerengine_cluster_kube_config.cluster_kube_config.content
  sensitive   = true
}

# =============================================================================
# Container Registry Outputs (for reference)
# =============================================================================

output "ocir_endpoint" {
  description = "OCIR endpoint for the region"
  value       = "${var.region}.ocir.io"
}

output "ocir_repository_prefix" {
  description = "Repository prefix for OCIR images (requires tenancy namespace)"
  value       = "${var.region}.ocir.io/<tenancy-namespace>/todo"
}

# =============================================================================
# Connection Commands
# =============================================================================

output "kubeconfig_command" {
  description = "Command to configure kubectl access to the cluster"
  value       = "oci ce cluster create-kubeconfig --cluster-id ${oci_containerengine_cluster.todo_cluster.id} --file $HOME/.kube/config --region ${var.region} --token-version 2.0.0"
}

output "kubectl_test_command" {
  description = "Command to verify cluster access"
  value       = "kubectl get nodes"
}

output "ocir_login_command" {
  description = "Command to login to OCIR (replace placeholders)"
  value       = "docker login ${var.region}.ocir.io -u '<tenancy-namespace>/<username>' -p '<auth-token>'"
}
