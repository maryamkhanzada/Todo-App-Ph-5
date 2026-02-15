# Research: OKE Infrastructure with Dapr & Kafka

**Feature**: 005-oke-dapr-kafka-infra
**Date**: 2026-02-15

---

## Research Summary

This document captures technical decisions and research findings for the OKE infrastructure deployment.

---

## Decision 1: OCI Always Free Resource Allocation

**Decision**: Use Ampere A1 (ARM) shape with 2 OCPU, 8GB RAM per node

**Rationale**:
- OCI Always Free tier provides up to 4 OCPU and 24GB RAM for Ampere A1 shapes
- 2 OCPU/8GB per node allows for 1-2 nodes within free tier
- ARM architecture is energy-efficient and cost-effective
- Kafka + Dapr + applications fit within 8GB with tuning

**Alternatives Considered**:
| Option | OCPU | RAM | Always Free | Rejected Because |
|--------|------|-----|-------------|------------------|
| E4.Flex | 1/8 | 1GB | Partial | Insufficient for Kafka |
| E3.Flex | N/A | N/A | No | Not Always Free |
| A1.Flex (4 OCPU) | 4 | 24GB | Yes | Single large node less resilient |

**References**:
- [OCI Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
- [OKE with Always Free](https://docs.oracle.com/en-us/iaas/Content/ContEng/Concepts/contengclustersnodes.htm)

---

## Decision 2: Kafka Deployment Strategy

**Decision**: Strimzi Operator with ZooKeeper mode (single broker, ephemeral storage)

**Rationale**:
- Strimzi is CNCF-graduated, production-proven
- ZooKeeper mode is more stable than KRaft for single-broker deployments
- Ephemeral storage acceptable for hackathon/development
- Kubernetes-native CRD-based management
- Easy topic provisioning via KafkaTopic CRD

**Alternatives Considered**:
| Option | Mode | Maturity | Rejected Because |
|--------|------|----------|------------------|
| Strimzi KRaft | ZooKeeper-less | Newer | Less documentation for single-broker |
| Redpanda | Native K8s | Mature | Higher resource requirements |
| Confluent Operator | Enterprise | Very mature | Not free, complex |
| Managed Kafka | Cloud | N/A | No Always Free option on OCI |

**Configuration**:
```yaml
kafka:
  replicas: 1
  storage:
    type: ephemeral
  resources:
    requests:
      memory: 1Gi
      cpu: 500m
    limits:
      memory: 2Gi
      cpu: 1
zookeeper:
  replicas: 1
  storage:
    type: ephemeral
```

---

## Decision 3: Dapr Installation Method

**Decision**: Helm chart with custom values

**Rationale**:
- Production-ready installation method
- Version-controlled configuration
- Supports HA configuration (disabled for Always Free)
- Includes dapr-scheduler for Jobs API
- Easy upgrades via Helm

**Alternatives Considered**:
| Option | Type | Rejected Because |
|--------|------|------------------|
| dapr CLI init | Development | Not suitable for production |
| Manual manifests | Direct | Complex, no upgrade path |
| Operator | GitOps | Additional complexity |

**Configuration**:
```yaml
global:
  ha:
    enabled: false  # For Always Free tier
  logAsJson: true
dapr_scheduler:
  enabled: true  # For Jobs API
```

---

## Decision 4: Ingress Controller Selection

**Decision**: NGINX Ingress Controller with OCI Load Balancer

**Rationale**:
- Well-documented OCI integration
- Flexible Load Balancer shape support
- TLS termination support
- Widely adopted, extensive documentation
- Easy path routing configuration

**Alternatives Considered**:
| Option | Integration | Rejected Because |
|--------|-------------|------------------|
| OCI Native Ingress Controller | Native | Newer, less documentation |
| Traefik | Good | Smaller community for OCI |
| HAProxy | Manual | More complex configuration |

**OCI-Specific Annotations**:
```yaml
service.beta.kubernetes.io/oci-load-balancer-shape: "flexible"
service.beta.kubernetes.io/oci-load-balancer-shape-flex-min: "10"
service.beta.kubernetes.io/oci-load-balancer-shape-flex-max: "100"
```

---

## Decision 5: PostgreSQL Deployment

**Decision**: OCI Autonomous Database (Always Free)

**Rationale**:
- 20GB storage free forever
- Managed service (no K8s resources consumed)
- Auto-scaling and patching
- Native OCI integration
- TLS by default

**Alternatives Considered**:
| Option | Type | Rejected Because |
|--------|------|------------------|
| Containerized PostgreSQL | Self-managed | Consumes cluster resources |
| CloudSQL | GCP | Different cloud provider |
| RDS | AWS | Different cloud provider |

**Connection Details**:
- Use Wallet-based mTLS connection
- Connection string stored in Kubernetes Secret
- Accessed via Dapr state store component

---

## Decision 6: Container Registry

**Decision**: Oracle Cloud Container Registry (OCIR)

**Rationale**:
- Native OCI integration
- No egress fees within OCI
- Integrated with OKE
- Free tier includes registry access
- Supports multi-architecture images

**Alternatives Considered**:
| Option | Integration | Rejected Because |
|--------|-------------|------------------|
| Docker Hub | Manual | Rate limits, egress fees |
| GitHub Container Registry | Good | Additional authentication setup |
| Quay.io | Manual | Egress fees |

**Registry Format**:
```
<region>.ocir.io/<tenancy>/<repo>:<tag>
Example: phx.ocir.io/axf12345/todo-backend:v1.0.0
```

---

## Decision 7: Infrastructure State Management

**Decision**: Terraform with OCI Object Storage backend

**Rationale**:
- Free tier includes 10GB Object Storage
- Native OCI authentication
- Supports state locking via OCI
- Team collaboration ready
- Version-controlled infrastructure

**Alternatives Considered**:
| Option | Type | Rejected Because |
|--------|------|------------------|
| Local state | File | Not suitable for teams |
| Terraform Cloud | SaaS | Additional cost for larger teams |
| S3 | AWS | Different cloud, egress |

**Backend Configuration**:
```hcl
terraform {
  backend "http" {
    address        = "https://objectstorage.us-phoenix-1.oraclecloud.com/..."
    update_method  = "PUT"
  }
}
```

---

## Decision 8: CI/CD Pipeline Tool

**Decision**: GitHub Actions

**Rationale**:
- Native GitHub integration
- Free tier sufficient for most projects
- Good OCI CLI support via marketplace actions
- Matrix builds for multi-arch images
- Secrets management integrated

**Alternatives Considered**:
| Option | Integration | Rejected Because |
|--------|-------------|------------------|
| OCI DevOps | Native | Steeper learning curve |
| GitLab CI | Good | Repository migration needed |
| Jenkins | Manual | Infrastructure overhead |

---

## Decision 9: Observability Stack

**Decision**: OCI Logging + Kubernetes Metrics Server + Strimzi Metrics

**Rationale**:
- OCI Logging free tier available
- Metrics Server included with OKE
- Strimzi exports Kafka metrics natively
- Minimal resource overhead
- Production-grade for hackathon scope

**Alternatives Considered**:
| Option | Type | Rejected Because |
|--------|------|------------------|
| Full Prometheus stack | Self-managed | High resource consumption |
| Grafana Cloud | SaaS | Additional cost |
| Loki + Grafana | Self-managed | Resource overhead |

---

## Prerequisites Checklist

### Required Tools

| Tool | Version | Status | Notes |
|------|---------|--------|-------|
| OCI CLI | 3.x | Required | `oci setup config` |
| kubectl | 1.28+ | Required | Match OKE version |
| Helm | 3.x | Required | Chart management |
| Terraform | 1.5+ | Required | Infrastructure provisioning |
| Docker | 24+ | Required | Image building |

### OCI Resources

| Resource | Free Tier | Required |
|----------|-----------|----------|
| OKE Cluster | Yes | 1 cluster |
| Ampere A1 Compute | 4 OCPU, 24GB | 2 OCPU, 8GB minimum |
| Block Volume | 200GB | 50GB boot volume |
| Object Storage | 10GB | State backend |
| Load Balancer | Flexible | 10-100 Mbps |
| Autonomous Database | 20GB | PostgreSQL replacement |

### Network Requirements

| Component | Requirement |
|-----------|-------------|
| VCN CIDR | /16 minimum |
| Public Subnet | /24 for LB |
| Private Subnet | /24 for nodes |
| Internet Gateway | Required |
| NAT Gateway | Required |
| Service Gateway | Recommended |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Always Free quota exhaustion | Medium | High | Monitor usage, efficient resource allocation |
| ARM image incompatibility | Low | Medium | Test images on ARM before deployment |
| Kafka OOM on single node | Medium | High | Tune memory limits, use ephemeral storage |
| Dapr sidecar resource overhead | Low | Low | Include in resource planning |
| OCIR authentication issues | Low | Medium | Document auth token refresh process |

---

## Next Steps

1. Validate OCI account and quotas
2. Install required CLI tools
3. Proceed to Phase 1: Infrastructure Preparation
