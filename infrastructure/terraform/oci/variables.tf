# Terraform Variables for OKE Infrastructure
# Feature: 005-oke-dapr-kafka-infra

# =============================================================================
# OCI Authentication Variables
# =============================================================================

variable "tenancy_ocid" {
  description = "OCID of the tenancy"
  type        = string
}

variable "user_ocid" {
  description = "OCID of the user"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint for the user's API key"
  type        = string
}

variable "private_key_path" {
  description = "Path to the private key file"
  type        = string
}

variable "region" {
  description = "OCI region (e.g., us-phoenix-1, us-ashburn-1)"
  type        = string
  default     = "us-phoenix-1"
}

# =============================================================================
# Compartment Variables
# =============================================================================

variable "compartment_name" {
  description = "Name for the Todo application compartment"
  type        = string
  default     = "TodoApp"
}

variable "compartment_description" {
  description = "Description for the compartment"
  type        = string
  default     = "Compartment for Todo application OKE deployment"
}

# =============================================================================
# VCN Variables
# =============================================================================

variable "vcn_name" {
  description = "Name for the Virtual Cloud Network"
  type        = string
  default     = "todo-vcn"
}

variable "vcn_cidr_block" {
  description = "CIDR block for the VCN"
  type        = string
  default     = "10.0.0.0/16"
}

variable "vcn_dns_label" {
  description = "DNS label for the VCN"
  type        = string
  default     = "todovcn"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet (load balancer)"
  type        = string
  default     = "10.0.0.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR block for the private subnet (worker nodes)"
  type        = string
  default     = "10.0.1.0/24"
}

# =============================================================================
# OKE Cluster Variables
# =============================================================================

variable "cluster_name" {
  description = "Name for the OKE cluster"
  type        = string
  default     = "todo-oke-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes version for the OKE cluster"
  type        = string
  default     = "v1.28.2"
}

variable "cluster_type" {
  description = "Type of OKE cluster (BASIC_CLUSTER or ENHANCED_CLUSTER)"
  type        = string
  default     = "BASIC_CLUSTER"
}

# =============================================================================
# Node Pool Variables (Always Free Optimized)
# =============================================================================

variable "node_pool_name" {
  description = "Name for the node pool"
  type        = string
  default     = "todo-node-pool"
}

variable "node_shape" {
  description = "Shape for the worker nodes (Ampere A1 for Always Free)"
  type        = string
  default     = "VM.Standard.A1.Flex"
}

variable "node_ocpus" {
  description = "Number of OCPUs per node"
  type        = number
  default     = 2
}

variable "node_memory_gb" {
  description = "Memory in GB per node"
  type        = number
  default     = 8
}

variable "node_count" {
  description = "Number of nodes in the pool"
  type        = number
  default     = 1
}

variable "node_boot_volume_size_gb" {
  description = "Boot volume size in GB"
  type        = number
  default     = 50
}

variable "node_image_id" {
  description = "OCID of the image for worker nodes (leave empty for latest OKE image)"
  type        = string
  default     = ""
}

# =============================================================================
# Tags
# =============================================================================

variable "freeform_tags" {
  description = "Free-form tags for resources"
  type        = map(string)
  default = {
    "Project"     = "TodoApp"
    "Environment" = "development"
    "ManagedBy"   = "Terraform"
  }
}
