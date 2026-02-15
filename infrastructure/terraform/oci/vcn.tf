# VCN Architecture Configuration for OKE
# Feature: 005-oke-dapr-kafka-infra

# =============================================================================
# Virtual Cloud Network (T016)
# =============================================================================

resource "oci_core_vcn" "todo_vcn" {
  compartment_id = local.compartment_id
  cidr_blocks    = [var.vcn_cidr_block]
  display_name   = var.vcn_name
  dns_label      = var.vcn_dns_label
  freeform_tags  = var.freeform_tags
}

# =============================================================================
# Internet Gateway (T019)
# =============================================================================

resource "oci_core_internet_gateway" "todo_igw" {
  compartment_id = local.compartment_id
  vcn_id         = oci_core_vcn.todo_vcn.id
  display_name   = "${var.vcn_name}-igw"
  enabled        = true
  freeform_tags  = var.freeform_tags
}

# =============================================================================
# NAT Gateway (T020)
# =============================================================================

resource "oci_core_nat_gateway" "todo_nat" {
  compartment_id = local.compartment_id
  vcn_id         = oci_core_vcn.todo_vcn.id
  display_name   = "${var.vcn_name}-nat"
  freeform_tags  = var.freeform_tags
}

# =============================================================================
# Service Gateway (T021)
# =============================================================================

data "oci_core_services" "all_services" {
  filter {
    name   = "name"
    values = ["All .* Services In Oracle Services Network"]
    regex  = true
  }
}

resource "oci_core_service_gateway" "todo_sgw" {
  compartment_id = local.compartment_id
  vcn_id         = oci_core_vcn.todo_vcn.id
  display_name   = "${var.vcn_name}-sgw"

  services {
    service_id = data.oci_core_services.all_services.services[0].id
  }

  freeform_tags = var.freeform_tags
}

# =============================================================================
# Route Tables (T022)
# =============================================================================

# Public Route Table (routes to Internet Gateway)
resource "oci_core_route_table" "public_route_table" {
  compartment_id = local.compartment_id
  vcn_id         = oci_core_vcn.todo_vcn.id
  display_name   = "${var.vcn_name}-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.todo_igw.id
  }

  freeform_tags = var.freeform_tags
}

# Private Route Table (routes to NAT Gateway)
resource "oci_core_route_table" "private_route_table" {
  compartment_id = local.compartment_id
  vcn_id         = oci_core_vcn.todo_vcn.id
  display_name   = "${var.vcn_name}-private-rt"

  # Route to NAT Gateway for internet access
  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_nat_gateway.todo_nat.id
  }

  # Route to Service Gateway for OCI services
  route_rules {
    destination       = data.oci_core_services.all_services.services[0].cidr_block
    destination_type  = "SERVICE_CIDR_BLOCK"
    network_entity_id = oci_core_service_gateway.todo_sgw.id
  }

  freeform_tags = var.freeform_tags
}

# =============================================================================
# Security Lists (T023)
# =============================================================================

# Public Security List (for Load Balancer subnet)
resource "oci_core_security_list" "public_security_list" {
  compartment_id = local.compartment_id
  vcn_id         = oci_core_vcn.todo_vcn.id
  display_name   = "${var.vcn_name}-public-sl"

  # Egress: Allow all outbound traffic
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
    stateless   = false
  }

  # Ingress: HTTP (port 80)
  ingress_security_rules {
    source    = "0.0.0.0/0"
    protocol  = "6" # TCP
    stateless = false

    tcp_options {
      min = 80
      max = 80
    }
  }

  # Ingress: HTTPS (port 443)
  ingress_security_rules {
    source    = "0.0.0.0/0"
    protocol  = "6" # TCP
    stateless = false

    tcp_options {
      min = 443
      max = 443
    }
  }

  # Ingress: Allow traffic from private subnet (for health checks)
  ingress_security_rules {
    source    = var.private_subnet_cidr
    protocol  = "all"
    stateless = false
  }

  freeform_tags = var.freeform_tags
}

# Private Security List (for Worker Nodes subnet)
resource "oci_core_security_list" "private_security_list" {
  compartment_id = local.compartment_id
  vcn_id         = oci_core_vcn.todo_vcn.id
  display_name   = "${var.vcn_name}-private-sl"

  # Egress: Allow all outbound traffic
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
    stateless   = false
  }

  # Ingress: Allow all traffic from within VCN
  ingress_security_rules {
    source    = var.vcn_cidr_block
    protocol  = "all"
    stateless = false
  }

  # Ingress: Allow traffic from public subnet
  ingress_security_rules {
    source    = var.public_subnet_cidr
    protocol  = "all"
    stateless = false
  }

  # Ingress: Kubernetes API server (port 6443)
  ingress_security_rules {
    source    = "0.0.0.0/0"
    protocol  = "6" # TCP
    stateless = false

    tcp_options {
      min = 6443
      max = 6443
    }
  }

  # Ingress: SSH (port 22) - for node access if needed
  ingress_security_rules {
    source    = "0.0.0.0/0"
    protocol  = "6" # TCP
    stateless = false

    tcp_options {
      min = 22
      max = 22
    }
  }

  freeform_tags = var.freeform_tags
}

# =============================================================================
# Subnets (T017, T018)
# =============================================================================

# Public Subnet (for Load Balancer) - T017
resource "oci_core_subnet" "public_subnet" {
  compartment_id             = local.compartment_id
  vcn_id                     = oci_core_vcn.todo_vcn.id
  cidr_block                 = var.public_subnet_cidr
  display_name               = "${var.vcn_name}-public-subnet"
  dns_label                  = "public"
  prohibit_public_ip_on_vnic = false
  route_table_id             = oci_core_route_table.public_route_table.id
  security_list_ids          = [oci_core_security_list.public_security_list.id]
  freeform_tags              = var.freeform_tags
}

# Private Subnet (for Worker Nodes) - T018
resource "oci_core_subnet" "private_subnet" {
  compartment_id             = local.compartment_id
  vcn_id                     = oci_core_vcn.todo_vcn.id
  cidr_block                 = var.private_subnet_cidr
  display_name               = "${var.vcn_name}-private-subnet"
  dns_label                  = "private"
  prohibit_public_ip_on_vnic = true
  route_table_id             = oci_core_route_table.private_route_table.id
  security_list_ids          = [oci_core_security_list.private_security_list.id]
  freeform_tags              = var.freeform_tags
}
