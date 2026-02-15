# Infrastructure Entity Model: OKE with Dapr & Kafka

**Feature**: 005-oke-dapr-kafka-infra
**Date**: 2026-02-15

---

## Overview

This document defines the infrastructure entities, their relationships, and configuration schemas for the OKE deployment.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Oracle Cloud Infrastructure                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                              VCN (10.0.0.0/16)                        │  │
│  │  ┌─────────────────────┐         ┌─────────────────────────────────┐  │  │
│  │  │  Public Subnet      │         │  Private Subnet                 │  │  │
│  │  │  (10.0.0.0/24)      │         │  (10.0.1.0/24)                  │  │  │
│  │  │                     │         │                                 │  │  │
│  │  │  ┌───────────────┐  │         │  ┌───────────────────────────┐  │  │  │
│  │  │  │ Load Balancer │◄─┼─────────┼──│ OKE Node Pool             │  │  │  │
│  │  │  └───────────────┘  │         │  │  ┌─────────────────────┐  │  │  │  │
│  │  │         │           │         │  │  │ Worker Node (A1)    │  │  │  │  │
│  │  │         ▼           │         │  │  │  2 OCPU, 8GB RAM    │  │  │  │  │
│  │  │  ┌───────────────┐  │         │  │  └─────────────────────┘  │  │  │  │
│  │  │  │ NGINX Ingress │  │         │  └───────────────────────────┘  │  │  │
│  │  │  └───────────────┘  │         │                                 │  │  │
│  │  └─────────────────────┘         └─────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐│  │
│  │  │ NAT Gateway  │  │ Internet GW  │  │ OCI Autonomous DB (Always Free)│  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Kubernetes Namespace Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             OKE Cluster                                      │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Namespace: todo-app                                                      ││
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐            ││
│  │  │ Frontend   │ │ Backend    │ │ Recurring  │ │ Notification│            ││
│  │  │ + Dapr     │ │ + Dapr     │ │ Worker     │ │ Worker      │            ││
│  │  │ Sidecar    │ │ Sidecar    │ │ + Dapr     │ │ + Dapr      │            ││
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘            ││
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────────────────────────────┐ ││
│  │  │ Audit      │ │ WebSocket  │ │ Dapr Components:                     │ ││
│  │  │ Worker     │ │ Worker     │ │  - pubsub-kafka                      │ ││
│  │  │ + Dapr     │ │ + Dapr     │ │  - statestore-postgres               │ ││
│  │  └────────────┘ └────────────┘ │  - secretstore-k8s                   │ ││
│  │                                 └──────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Namespace: kafka                                                         ││
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐         ││
│  │  │ Strimzi Operator │ │ Kafka Broker     │ │ ZooKeeper        │         ││
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘         ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │ Topics: task-events (3p), reminders (1p), task-updates (3p)        │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Namespace: dapr-system                                                   ││
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐               ││
│  │  │ dapr-operator  │ │ dapr-placement │ │ dapr-scheduler │               ││
│  │  └────────────────┘ └────────────────┘ └────────────────┘               ││
│  │  ┌────────────────────┐                                                  ││
│  │  │ dapr-sidecar-injector │                                               ││
│  │  └────────────────────┘                                                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Namespace: monitoring                                                    ││
│  │  ┌──────────────────┐                                                    ││
│  │  │ Metrics Server   │ (OCI Logging Agent optional)                       ││
│  │  └──────────────────┘                                                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Namespace: ingress-nginx                                                 ││
│  │  ┌────────────────────┐                                                  ││
│  │  │ NGINX Controller   │ ←── OCI Load Balancer (external)                 ││
│  │  └────────────────────┘                                                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Entity Definitions

### 1. OKE Cluster

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Cluster name (e.g., `todo-oke-cluster`) |
| kubernetes_version | string | Kubernetes version (e.g., `1.28.2`) |
| compartment_id | OCID | OCI compartment |
| vcn_id | OCID | Associated VCN |
| endpoint_config | object | Public/private API endpoint settings |

**Relationships**:
- Contains 1+ Node Pools
- Resides in 1 VCN
- Uses 1 Compartment

### 2. Node Pool

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Pool name (e.g., `todo-node-pool`) |
| shape | string | VM shape (e.g., `VM.Standard.A1.Flex`) |
| ocpus | integer | OCPUs per node (2) |
| memory_gb | integer | Memory per node (8) |
| size | integer | Number of nodes (1-2) |
| subnet_id | OCID | Private subnet for nodes |
| boot_volume_size_gb | integer | Boot volume size (50) |

### 3. VCN

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | VCN name (e.g., `todo-vcn`) |
| cidr_block | CIDR | IP range (10.0.0.0/16) |
| dns_label | string | DNS label for VCN |

**Contains**:
- Subnets (public, private)
- Gateways (Internet, NAT, Service)
- Route Tables
- Security Lists

### 4. Kafka Cluster (Strimzi)

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Cluster name (`todo-kafka`) |
| version | string | Kafka version (`3.6.0`) |
| replicas | integer | Broker count (1) |
| storage_type | enum | `ephemeral` or `persistent` |
| listener_type | enum | `internal` (no external) |

**Contains**:
- 1 ZooKeeper instance
- 3 Topics

### 5. Kafka Topic

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Topic name |
| partitions | integer | Partition count |
| replicas | integer | Replication factor (1) |
| retention_ms | integer | Message retention |
| cluster | string | Parent Kafka cluster |

**Topics**:
| Name | Partitions | Retention | Purpose |
|------|------------|-----------|---------|
| task-events | 3 | 7 days | Task lifecycle events |
| reminders | 1 | 7 days | Scheduled reminders |
| task-updates | 3 | 7 days | Real-time sync events |

### 6. Dapr Component

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Component name |
| type | string | Component type (e.g., `pubsub.kafka`) |
| version | string | Component version |
| namespace | string | Kubernetes namespace |
| metadata | map | Configuration key-values |

**Components**:
| Name | Type | Purpose |
|------|------|---------|
| pubsub-kafka | pubsub.kafka | Event publishing/subscription |
| statestore | state.postgresql | State management |
| kubernetes-secrets | secretstores.kubernetes | Secret retrieval |

### 7. Kubernetes Deployment

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Deployment name |
| namespace | string | Target namespace |
| replicas | integer | Pod replicas |
| image | string | Container image |
| dapr_enabled | boolean | Dapr sidecar injection |
| dapr_app_id | string | Dapr application ID |
| dapr_app_port | integer | Application port |
| resources | object | CPU/memory requests/limits |

**Deployments**:
| Name | Namespace | Dapr App ID | Port |
|------|-----------|-------------|------|
| todo-frontend | todo-app | todo-frontend | 3000 |
| todo-backend | todo-app | todo-backend | 8000 |
| recurring-worker | todo-app | recurring-worker | 8001 |
| notification-worker | todo-app | notification-worker | 8002 |
| audit-worker | todo-app | audit-worker | 8003 |
| websocket-worker | todo-app | websocket-worker | 8004 |

### 8. Ingress

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Ingress name |
| host | string | External hostname |
| tls_enabled | boolean | HTTPS enabled |
| tls_secret | string | TLS certificate secret |
| paths | array | Route definitions |

**Routing**:
| Path | Service | Port |
|------|---------|------|
| / | todo-frontend | 3000 |
| /api | todo-backend | 8000 |

---

## Event Schema

### Task Event

```json
{
  "specversion": "1.0",
  "type": "task.created|task.updated|task.completed|task.deleted",
  "source": "todo-backend",
  "id": "uuid",
  "time": "ISO8601",
  "datacontenttype": "application/json",
  "data": {
    "task_id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "completed": "boolean",
    "priority": "low|medium|high",
    "due_date": "ISO8601|null",
    "recurrence_pattern": "string|null",
    "tags": ["string"]
  }
}
```

### Reminder Event

```json
{
  "specversion": "1.0",
  "type": "reminder.scheduled",
  "source": "todo-backend",
  "id": "uuid",
  "time": "ISO8601",
  "data": {
    "task_id": "uuid",
    "user_id": "uuid",
    "scheduled_time": "ISO8601",
    "reminder_type": "due_date|custom"
  }
}
```

### Task Update Event (Real-time)

```json
{
  "specversion": "1.0",
  "type": "task.sync",
  "source": "todo-backend",
  "id": "uuid",
  "time": "ISO8601",
  "data": {
    "task_id": "uuid",
    "user_id": "uuid",
    "action": "create|update|delete|complete",
    "task_snapshot": {}
  }
}
```

---

## Resource Allocation

### Namespace Resource Quotas

| Namespace | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----------|-------------|-----------|----------------|--------------|
| todo-app | 1000m | 2000m | 2Gi | 4Gi |
| kafka | 1000m | 2000m | 3Gi | 6Gi |
| dapr-system | 500m | 1000m | 512Mi | 1Gi |
| monitoring | 250m | 500m | 256Mi | 512Mi |

### Container Defaults (LimitRange)

| Setting | Value |
|---------|-------|
| Default CPU Request | 100m |
| Default CPU Limit | 500m |
| Default Memory Request | 128Mi |
| Default Memory Limit | 512Mi |
| Max CPU | 2000m |
| Max Memory | 2Gi |

---

## State Transitions

### Deployment Lifecycle

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│ Pending │────►│ Running  │────►│ Updating│────►│ Running  │
└─────────┘     └──────────┘     └─────────┘     └──────────┘
     │               │                               │
     │               ▼                               ▼
     │          ┌─────────┐                    ┌──────────┐
     └─────────►│ Failed  │                    │ Rolled   │
                └─────────┘                    │ Back     │
                                               └──────────┘
```

### Event Flow State

```
┌──────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│ Published│────►│ In Kafka  │────►│ Consumed  │────►│ Processed │
└──────────┘     └───────────┘     └───────────┘     └───────────┘
                      │                                    │
                      ▼                                    ▼
                 ┌─────────┐                         ┌─────────┐
                 │ Expired │                         │ Failed  │
                 │ (TTL)   │                         │ (DLQ)   │
                 └─────────┘                         └─────────┘
```
