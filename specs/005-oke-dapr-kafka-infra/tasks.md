# Tasks: OKE Infrastructure with Dapr & Kafka Event Architecture

**Input**: Design documents from `/specs/005-oke-dapr-kafka-infra/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested - focusing on validation checkpoints per phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Infrastructure deployment project:
- **Terraform**: `infrastructure/terraform/oci/`
- **Kubernetes Manifests**: `infrastructure/k8s/`
- **Helm Charts**: `infrastructure/helm/`
- **GitHub Actions**: `.github/workflows/`

---

## Phase 1: Setup (Prerequisites & Project Structure)

**Purpose**: Validate prerequisites and create directory structure

- [ ] T001 Validate OCI account credentials and Always Free tier access via `oci iam region list`
- [ ] T002 Verify OCI CLI configured with `oci setup config` profile
- [ ] T003 [P] Verify kubectl installed (v1.28+) via `kubectl version --client`
- [ ] T004 [P] Verify Helm installed (v3.x) via `helm version`
- [ ] T005 [P] Verify Terraform installed (v1.5+) via `terraform version`
- [ ] T006 [P] Verify Docker installed via `docker version`
- [ ] T007 Create infrastructure directory structure per plan in infrastructure/
- [ ] T008 [P] Create Terraform OCI module structure in infrastructure/terraform/oci/
- [ ] T009 [P] Create Kubernetes manifests structure in infrastructure/k8s/
- [ ] T010 [P] Create GitHub Actions workflows directory in .github/workflows/

**Checkpoint**: All tools installed, directory structure created

---

## Phase 2: Foundational (OCI Infrastructure - Terraform)

**Purpose**: Provision OCI networking and OKE cluster - BLOCKS all Kubernetes deployments

**⚠️ CRITICAL**: No Kubernetes work can begin until this phase is complete

### Terraform Configuration

- [ ] T011 Create Terraform provider configuration in infrastructure/terraform/oci/providers.tf
- [ ] T012 Create Terraform variables in infrastructure/terraform/oci/variables.tf
- [ ] T013 Create terraform.tfvars.example template in infrastructure/terraform/terraform.tfvars.example
- [ ] T014 [P] Create OCI compartment configuration in infrastructure/terraform/oci/main.tf
- [ ] T015 [P] Create IAM policies for OKE management in infrastructure/terraform/oci/main.tf

### VCN Architecture

- [ ] T016 Create VCN resource (10.0.0.0/16) in infrastructure/terraform/oci/vcn.tf
- [ ] T017 [P] Create public subnet (10.0.0.0/24) for load balancer in infrastructure/terraform/oci/vcn.tf
- [ ] T018 [P] Create private subnet (10.0.1.0/24) for worker nodes in infrastructure/terraform/oci/vcn.tf
- [ ] T019 [P] Create Internet Gateway in infrastructure/terraform/oci/vcn.tf
- [ ] T020 [P] Create NAT Gateway in infrastructure/terraform/oci/vcn.tf
- [ ] T021 [P] Create Service Gateway in infrastructure/terraform/oci/vcn.tf
- [ ] T022 Create route tables (public→IGW, private→NAT) in infrastructure/terraform/oci/vcn.tf
- [ ] T023 Create security lists for public and private subnets in infrastructure/terraform/oci/vcn.tf

### OKE Cluster

- [ ] T024 Create OKE cluster resource in infrastructure/terraform/oci/oke.tf
- [ ] T025 Create node pool (Ampere A1, 2 OCPU, 8GB) in infrastructure/terraform/oci/oke.tf
- [ ] T026 Create Terraform outputs in infrastructure/terraform/oci/outputs.tf
- [ ] T027 Run `terraform init` and `terraform plan` to validate configuration
- [ ] T028 Run `terraform apply` to provision OCI infrastructure
- [ ] T029 Configure kubeconfig via OCI CLI (`oci ce cluster create-kubeconfig`)
- [ ] T030 Validate cluster access with `kubectl get nodes`

### Container Registry

- [ ] T031 [P] Create OCIR repository for todo-frontend
- [ ] T032 [P] Create OCIR repository for todo-backend
- [ ] T033 [P] Create OCIR repository for todo-worker
- [ ] T034 Generate OCI auth token for OCIR access
- [ ] T035 Create Kubernetes docker-registry secret for OCIR pull

**Checkpoint**: OKE cluster running, `kubectl get nodes` shows Ready node

---

## Phase 3: User Story 1 - Deploy Application to OKE (Priority: P1) 🎯 MVP

**Goal**: DevOps engineer can deploy Todo application to OKE with namespace isolation, resource management, and ingress routing

**Independent Test**: Deploy frontend and backend pods, verify application accessible via load balancer URL

### Namespace & Base Configuration

- [ ] T036 [US1] Create namespace definitions (todo-app, kafka, dapr-system, monitoring) in infrastructure/k8s/namespaces/namespaces.yaml
- [ ] T037 [US1] Add Dapr injection labels to todo-app namespace in infrastructure/k8s/namespaces/namespaces.yaml
- [ ] T038 [US1] Apply namespaces with `kubectl apply -f infrastructure/k8s/namespaces/`

### NGINX Ingress Controller

- [ ] T039 [US1] Create NGINX Ingress Helm values with OCI Load Balancer annotations in infrastructure/k8s/ingress/nginx-values.yaml
- [ ] T040 [US1] Install NGINX Ingress via Helm with custom values
- [ ] T041 [US1] Wait for LoadBalancer external IP assignment
- [ ] T042 [US1] Verify ingress controller responds via `curl http://<external-ip>`

### Resource Quotas & Limits

- [ ] T043 [P] [US1] Create resource quota for todo-app namespace in infrastructure/k8s/security/resource-quotas.yaml
- [ ] T044 [P] [US1] Create resource quota for kafka namespace in infrastructure/k8s/security/resource-quotas.yaml
- [ ] T045 [P] [US1] Create resource quota for monitoring namespace in infrastructure/k8s/security/resource-quotas.yaml
- [ ] T046 [US1] Create LimitRange with default container limits in infrastructure/k8s/security/resource-quotas.yaml
- [ ] T047 [US1] Apply resource quotas with `kubectl apply -f infrastructure/k8s/security/resource-quotas.yaml`

### RBAC Configuration

- [ ] T048 [P] [US1] Create read-only ClusterRole in infrastructure/k8s/security/rbac.yaml
- [ ] T049 [P] [US1] Create deployment ClusterRole for CI/CD in infrastructure/k8s/security/rbac.yaml
- [ ] T050 [US1] Create ServiceAccount for GitHub Actions in infrastructure/k8s/security/rbac.yaml
- [ ] T051 [US1] Create RoleBinding for deployment in todo-app namespace in infrastructure/k8s/security/rbac.yaml
- [ ] T052 [US1] Apply RBAC configuration with `kubectl apply -f infrastructure/k8s/security/rbac.yaml`

### Secrets Structure

- [ ] T053 [US1] Create secrets.yaml.example template in infrastructure/k8s/secrets/secrets.yaml.example
- [ ] T054 [US1] Create db-credentials secret in todo-app namespace (manual - no values in git)
- [ ] T055 [US1] Verify secrets exist with `kubectl get secrets -n todo-app`

### Backend Deployment

- [ ] T056 [US1] Create backend Deployment manifest with Dapr annotations in infrastructure/k8s/apps/backend/deployment.yaml
- [ ] T057 [US1] Create backend Service (ClusterIP) in infrastructure/k8s/apps/backend/service.yaml
- [ ] T058 [US1] Create backend HPA configuration in infrastructure/k8s/apps/backend/hpa.yaml

### Frontend Deployment

- [ ] T059 [P] [US1] Create frontend Deployment manifest with Dapr annotations in infrastructure/k8s/apps/frontend/deployment.yaml
- [ ] T060 [P] [US1] Create frontend Service (ClusterIP) in infrastructure/k8s/apps/frontend/service.yaml
- [ ] T061 [P] [US1] Create frontend HPA configuration in infrastructure/k8s/apps/frontend/hpa.yaml

### Ingress Routing

- [ ] T062 [US1] Create Ingress resource with path routing (/ → frontend, /api → backend) in infrastructure/k8s/apps/ingress.yaml
- [ ] T063 [US1] Apply application manifests with `kubectl apply -f infrastructure/k8s/apps/`
- [ ] T064 [US1] Verify pods reach Ready state with `kubectl get pods -n todo-app`
- [ ] T065 [US1] Test frontend accessible via public URL
- [ ] T066 [US1] Test backend API accessible via /api path

**Checkpoint**: Application accessible via public URL, frontend loads, backend responds

---

## Phase 4: User Story 2 - Backend Publishes Events via Dapr (Priority: P2)

**Goal**: Backend service publishes task events through Dapr pub/sub abstracting Kafka

**Independent Test**: Create a task and verify event appears on Kafka topic via Dapr subscription

### Strimzi Kafka Operator

- [ ] T067 [US2] Add Strimzi Helm repo via `helm repo add strimzi https://strimzi.io/charts/`
- [ ] T068 [US2] Create Strimzi operator installation notes in infrastructure/k8s/kafka/strimzi-operator.yaml
- [ ] T069 [US2] Install Strimzi operator via Helm in kafka namespace
- [ ] T070 [US2] Verify Strimzi operator pod Running with `kubectl get pods -n kafka`
- [ ] T071 [US2] Verify Strimzi CRDs installed with `kubectl get crd | grep strimzi`

### Kafka Cluster

- [ ] T072 [US2] Create Kafka cluster manifest (1 broker, ephemeral storage) in infrastructure/k8s/kafka/kafka-cluster.yaml
- [ ] T073 [US2] Apply Kafka cluster manifest to kafka namespace
- [ ] T074 [US2] Wait for Kafka cluster Ready with `kubectl wait kafka/todo-kafka --for=condition=Ready -n kafka`
- [ ] T075 [US2] Verify Kafka and ZooKeeper pods Running

### Kafka Topics

- [ ] T076 [P] [US2] Create KafkaTopic for task-events (3 partitions) in infrastructure/k8s/kafka/topics.yaml
- [ ] T077 [P] [US2] Create KafkaTopic for reminders (1 partition) in infrastructure/k8s/kafka/topics.yaml
- [ ] T078 [P] [US2] Create KafkaTopic for task-updates (3 partitions) in infrastructure/k8s/kafka/topics.yaml
- [ ] T079 [US2] Apply topics manifest with `kubectl apply -f infrastructure/k8s/kafka/topics.yaml`
- [ ] T080 [US2] Verify topics created with `kubectl get kafkatopics -n kafka`

### Kafka Validation

- [ ] T081 [US2] Deploy temporary Kafka client pod for testing
- [ ] T082 [US2] Produce test message to task-events topic
- [ ] T083 [US2] Consume test message to verify broker connectivity
- [ ] T084 [US2] Delete temporary Kafka client pod

### Dapr Installation

- [ ] T085 [US2] Add Dapr Helm repo via `helm repo add dapr https://dapr.github.io/helm-charts/`
- [ ] T086 [US2] Create Dapr Helm values (HA disabled, scheduler enabled) in infrastructure/k8s/dapr/dapr-values.yaml
- [ ] T087 [US2] Install Dapr via Helm in dapr-system namespace
- [ ] T088 [US2] Verify all Dapr pods Running with `kubectl get pods -n dapr-system`
- [ ] T089 [US2] Verify dapr-sidecar-injector is Running

### Dapr Pub/Sub Component

- [ ] T090 [US2] Create Dapr pub/sub component (pubsub.kafka) in infrastructure/k8s/dapr/components/pubsub-kafka.yaml
- [ ] T091 [US2] Apply pub/sub component to todo-app namespace
- [ ] T092 [US2] Verify component registered with `kubectl get components -n todo-app`

### Dapr State Store Component

- [ ] T093 [US2] Create Dapr state store component (state.postgresql) in infrastructure/k8s/dapr/components/statestore-postgres.yaml
- [ ] T094 [US2] Apply state store component to todo-app namespace

### Dapr Secret Store Component

- [ ] T095 [US2] Create Dapr secret store component (secretstores.kubernetes) in infrastructure/k8s/dapr/components/secretstore-k8s.yaml
- [ ] T096 [US2] Apply secret store component to todo-app namespace

### Dapr Resiliency Configuration

- [ ] T097 [US2] Create Dapr resiliency configuration in infrastructure/k8s/dapr/components/resiliency.yaml
- [ ] T098 [US2] Apply resiliency configuration to todo-app namespace

### Dapr Validation

- [ ] T099 [US2] Restart backend pod to inject Dapr sidecar
- [ ] T100 [US2] Verify backend pod has 2 containers (app + daprd)
- [ ] T101 [US2] Test Dapr pub/sub connectivity via Dapr HTTP API

**Checkpoint**: Dapr sidecar injected, pub/sub test event flows to Kafka

---

## Phase 5: User Story 5 - CI/CD Pipeline Deploys Automatically (Priority: P2)

**Goal**: GitHub Actions builds images, pushes to OCIR, deploys to OKE automatically

**Independent Test**: Push a commit and verify new image deployed to cluster

### CI Workflow (Build & Test)

- [ ] T102 [US5] Create CI workflow structure in .github/workflows/ci.yaml
- [ ] T103 [US5] Add lint and test jobs to CI workflow in .github/workflows/ci.yaml
- [ ] T104 [US5] Add Docker build job for frontend in .github/workflows/ci.yaml
- [ ] T105 [US5] Add Docker build job for backend in .github/workflows/ci.yaml
- [ ] T106 [US5] Add Docker build job for worker in .github/workflows/ci.yaml
- [ ] T107 [US5] Add Trivy security scanning step in .github/workflows/ci.yaml

### CD Dev Workflow (Deploy to Dev)

- [ ] T108 [US5] Create CD dev workflow in .github/workflows/cd-dev.yaml
- [ ] T109 [US5] Add OCIR login step using OCI CLI credentials in .github/workflows/cd-dev.yaml
- [ ] T110 [US5] Add multi-arch image build (AMD64 + ARM64) in .github/workflows/cd-dev.yaml
- [ ] T111 [US5] Add image push with SHA and latest tags in .github/workflows/cd-dev.yaml
- [ ] T112 [US5] Add OKE kubeconfig setup via OCI CLI in .github/workflows/cd-dev.yaml
- [ ] T113 [US5] Add kubectl apply deployment step in .github/workflows/cd-dev.yaml
- [ ] T114 [US5] Add rollout status verification in .github/workflows/cd-dev.yaml

### CD Prod Workflow (Deploy to Production)

- [ ] T115 [P] [US5] Create CD prod workflow with manual trigger in .github/workflows/cd-prod.yaml
- [ ] T116 [P] [US5] Add approval requirement for production deploy in .github/workflows/cd-prod.yaml
- [ ] T117 [P] [US5] Add rollback on failure step in .github/workflows/cd-prod.yaml

### GitHub Secrets Documentation

- [ ] T118 [US5] Document required GitHub Secrets in infrastructure/README.md
- [ ] T119 [US5] Verify CI workflow runs on push to feature branch
- [ ] T120 [US5] Verify CD workflow runs on push to main branch

**Checkpoint**: Pipeline runs on push, images built, deployment succeeds

---

## Phase 6: User Story 3 - Worker Service Processes Recurring Tasks (Priority: P3)

**Goal**: Worker service consumes task completion events and creates next recurring task instance

**Independent Test**: Complete a recurring task and verify new instance created

### Recurring Worker Deployment

- [ ] T121 [US3] Create recurring-worker Deployment manifest in infrastructure/k8s/apps/workers/recurring-worker.yaml
- [ ] T122 [US3] Add Dapr annotations (app-id: recurring-worker) in infrastructure/k8s/apps/workers/recurring-worker.yaml
- [ ] T123 [US3] Configure task-events subscription in recurring-worker

### Dapr Subscription for Recurring Worker

- [ ] T124 [US3] Create Dapr subscription for recurring-worker in infrastructure/k8s/dapr/components/subscriptions.yaml
- [ ] T125 [US3] Configure subscription for task-events topic

### Worker Deployment

- [ ] T126 [US3] Apply recurring-worker manifest with `kubectl apply`
- [ ] T127 [US3] Verify recurring-worker pod Running with Dapr sidecar
- [ ] T128 [US3] Test event consumption by publishing test event

**Checkpoint**: Recurring worker consumes events, creates new task instances

---

## Phase 7: User Story 4 - Notification Service Sends Reminders (Priority: P3)

**Goal**: Notification service processes reminder events and sends scheduled notifications

**Independent Test**: Create task with due date, verify reminder processed at scheduled time

### Notification Worker Deployment

- [ ] T129 [P] [US4] Create notification-worker Deployment manifest in infrastructure/k8s/apps/workers/notification-worker.yaml
- [ ] T130 [P] [US4] Add Dapr annotations (app-id: notification-worker) in infrastructure/k8s/apps/workers/notification-worker.yaml

### Audit Worker Deployment

- [ ] T131 [P] [US4] Create audit-worker Deployment manifest in infrastructure/k8s/apps/workers/audit-worker.yaml
- [ ] T132 [P] [US4] Configure audit-worker to subscribe to all topics

### WebSocket Worker Deployment

- [ ] T133 [P] [US4] Create websocket-worker Deployment manifest in infrastructure/k8s/apps/workers/websocket-worker.yaml
- [ ] T134 [P] [US4] Configure websocket-worker to subscribe to task-updates topic

### Dapr Subscriptions for Workers

- [ ] T135 [US4] Add Dapr subscription for notification-worker (reminders topic) in infrastructure/k8s/dapr/components/subscriptions.yaml
- [ ] T136 [US4] Add Dapr subscription for audit-worker (all topics) in infrastructure/k8s/dapr/components/subscriptions.yaml
- [ ] T137 [US4] Add Dapr subscription for websocket-worker (task-updates topic) in infrastructure/k8s/dapr/components/subscriptions.yaml

### Worker Deployments

- [ ] T138 [US4] Apply all worker manifests with `kubectl apply -f infrastructure/k8s/apps/workers/`
- [ ] T139 [US4] Verify all worker pods Running with Dapr sidecars
- [ ] T140 [US4] Test reminder event processing end-to-end

**Checkpoint**: All workers running, consuming events from correct topics

---

## Phase 8: User Story 6 - Operations Team Monitors System Health (Priority: P3)

**Goal**: Operations can observe system health via probes, logging, and metrics

**Independent Test**: Simulate pod failure, verify detection, logging, and restart

### Health Probes

- [ ] T141 [US6] Verify /health endpoint in backend deployment manifest
- [ ] T142 [US6] Verify /ready endpoint in backend deployment manifest
- [ ] T143 [US6] Configure liveness probe (initialDelay 30s, period 10s) in all deployments
- [ ] T144 [US6] Configure readiness probe (initialDelay 5s, period 5s) in all deployments

### Metrics Server

- [ ] T145 [US6] Create metrics-server installation notes in infrastructure/k8s/monitoring/metrics-server.yaml
- [ ] T146 [US6] Verify Kubernetes Metrics Server available via `kubectl top pods`

### Centralized Logging Configuration

- [ ] T147 [US6] Document JSON logging format requirements in infrastructure/k8s/monitoring/README.md
- [ ] T148 [US6] Document OCI Logging Agent setup in infrastructure/k8s/monitoring/README.md
- [ ] T149 [US6] Verify logs include correlation_id in structured output

### Kafka Metrics

- [ ] T150 [US6] Enable Strimzi metrics exporter in Kafka cluster manifest
- [ ] T151 [US6] Verify Kafka consumer lag observable via `kubectl get kafkaconsumergroups -n kafka`

### Monitoring Validation

- [ ] T152 [US6] Test liveness probe failure detection by killing process
- [ ] T153 [US6] Verify pod auto-restart on liveness failure
- [ ] T154 [US6] Verify HPA responds to CPU metrics

**Checkpoint**: Health probes working, logs queryable, metrics available

---

## Phase 9: Polish & Security Hardening

**Purpose**: Production hardening and security configuration

### Network Policies

- [ ] T155 [P] Create default-deny NetworkPolicy in infrastructure/k8s/security/network-policies.yaml
- [ ] T156 [P] Create allow-ingress policy for frontend/backend in infrastructure/k8s/security/network-policies.yaml
- [ ] T157 [P] Create allow-kafka policy for workers in infrastructure/k8s/security/network-policies.yaml
- [ ] T158 [P] Create allow-dapr-sidecar policy in infrastructure/k8s/security/network-policies.yaml
- [ ] T159 Apply network policies with `kubectl apply -f infrastructure/k8s/security/network-policies.yaml`
- [ ] T160 Test network isolation blocks unauthorized traffic

### RBAC Refinement

- [ ] T161 [P] Create service-specific ServiceAccount for backend in infrastructure/k8s/security/rbac.yaml
- [ ] T162 [P] Create service-specific ServiceAccount for workers in infrastructure/k8s/security/rbac.yaml
- [ ] T163 Audit RBAC with `kubectl auth can-i` for each service account

### Secret Management

- [ ] T164 Audit all secrets in cluster with `kubectl get secrets -A`
- [ ] T165 Verify no secrets in ConfigMaps
- [ ] T166 Verify Dapr secret store retrieval working

### Ingress Security (HTTPS)

- [ ] T167 [P] Create TLS secret structure in infrastructure/k8s/secrets/tls-secret.yaml.example
- [ ] T168 [P] Update Ingress for TLS termination in infrastructure/k8s/apps/ingress.yaml
- [ ] T169 [P] Add security headers annotation to Ingress
- [ ] T170 Document HTTPS configuration process in infrastructure/README.md

### Helm Chart Creation (Optional)

- [ ] T171 [P] Create todo-app Helm chart structure in infrastructure/helm/todo-app/
- [ ] T172 [P] Create Chart.yaml for todo-app in infrastructure/helm/todo-app/Chart.yaml
- [ ] T173 [P] Create values.yaml with configurable parameters in infrastructure/helm/todo-app/values.yaml
- [ ] T174 [P] Create values-dev.yaml for development in infrastructure/helm/todo-app/values-dev.yaml
- [ ] T175 [P] Create values-prod.yaml for production in infrastructure/helm/todo-app/values-prod.yaml

### Documentation

- [ ] T176 Update quickstart.md with actual deployment commands
- [ ] T177 Create infrastructure/README.md with deployment instructions
- [ ] T178 Document rollback procedures in infrastructure/README.md
- [ ] T179 Run full deployment validation per quickstart.md

**Checkpoint**: Security hardened, HTTPS ready, documentation complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational - OCI/OKE)**: Depends on Phase 1 - **BLOCKS all Kubernetes work**
- **Phase 3 (US1 - Deploy to OKE)**: Depends on Phase 2 - MVP target
- **Phase 4 (US2 - Dapr Events)**: Depends on Phase 3 (app deployed)
- **Phase 5 (US5 - CI/CD)**: Depends on Phase 3 (can run parallel with Phase 4)
- **Phase 6 (US3 - Recurring Worker)**: Depends on Phase 4 (Dapr/Kafka ready)
- **Phase 7 (US4 - Notification Worker)**: Depends on Phase 4 (can run parallel with Phase 6)
- **Phase 8 (US6 - Monitoring)**: Depends on Phase 3 (can run parallel with Phases 4-7)
- **Phase 9 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1 - Deploy to OKE)**: Foundational - must complete first
- **US2 (P2 - Dapr Events)**: Depends on US1 (app deployed)
- **US5 (P2 - CI/CD)**: Depends on US1 (can parallel with US2)
- **US3 (P3 - Recurring Worker)**: Depends on US2 (Kafka/Dapr ready)
- **US4 (P3 - Notification Worker)**: Depends on US2 (can parallel with US3)
- **US6 (P3 - Monitoring)**: Depends on US1 (can parallel with US3/US4)

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
```
T017, T018, T019, T020, T021 - All VCN components in parallel
T031, T032, T033 - All OCIR repositories in parallel
```

**Within Phase 3 (US1)**:
```
T043, T044, T045 - Resource quotas in parallel
T048, T049 - RBAC ClusterRoles in parallel
T059, T060, T061 - Frontend manifests in parallel (with backend)
```

**Within Phase 4 (US2)**:
```
T076, T077, T078 - All Kafka topics in parallel
```

**Within Phase 7 (US4)**:
```
T129, T131, T133 - All worker deployments in parallel
```

**Within Phase 9 (Polish)**:
```
T155, T156, T157, T158 - All network policies in parallel
T167, T168, T169 - TLS configuration in parallel
T171, T172, T173, T174, T175 - Helm chart creation in parallel
```

---

## Parallel Example: Phase 3 (US1)

```bash
# Launch namespace configuration:
Task: T036 - Create namespace definitions

# Then in parallel:
Task: T043 - Create resource quota for todo-app
Task: T044 - Create resource quota for kafka
Task: T045 - Create resource quota for monitoring

# Then in parallel:
Task: T056 - Create backend Deployment
Task: T059 - Create frontend Deployment
Task: T060 - Create frontend Service
Task: T061 - Create frontend HPA
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (prerequisites)
2. Complete Phase 2: Foundational (OCI/OKE cluster) - **CRITICAL**
3. Complete Phase 3: User Story 1 (Deploy to OKE)
4. **STOP and VALIDATE**: Application accessible via public URL
5. Deploy/demo if ready - **This is your MVP!**

### Incremental Delivery

1. Setup + Foundational → OKE cluster running
2. Add US1 (Deploy) → Application accessible → **MVP!**
3. Add US2 (Dapr Events) → Event publishing working
4. Add US5 (CI/CD) → Automated deployments
5. Add US3 (Recurring Worker) → Event-driven processing
6. Add US4 (Notification Worker) → Full event architecture
7. Add US6 (Monitoring) → Production observability
8. Polish → Security hardened, HTTPS ready

### Suggested MVP Scope

**Minimum viable deployment (Phase 1-3):**
- OKE cluster provisioned
- Namespaces and RBAC configured
- Frontend and backend deployed
- Ingress routing working
- Application accessible via public URL

**Total MVP Tasks**: ~66 tasks (T001-T066)

---

## Summary

| Phase | User Story | Task Count | Parallel Tasks |
|-------|------------|------------|----------------|
| 1 | Setup | 10 | 4 |
| 2 | Foundational (OCI) | 25 | 7 |
| 3 | US1 - Deploy to OKE (P1) | 31 | 10 |
| 4 | US2 - Dapr Events (P2) | 35 | 3 |
| 5 | US5 - CI/CD (P2) | 19 | 3 |
| 6 | US3 - Recurring Worker (P3) | 8 | 0 |
| 7 | US4 - Notification Worker (P3) | 12 | 5 |
| 8 | US6 - Monitoring (P3) | 14 | 0 |
| 9 | Polish | 25 | 13 |
| **Total** | | **179** | **45** |

---

## Notes

- [P] tasks = different files, no dependencies on other parallel tasks
- [USx] label maps task to specific user story for traceability
- Infrastructure tasks (Terraform) must complete before Kubernetes tasks
- Kafka and Dapr must be ready before event-driven user stories
- Verify each checkpoint before proceeding to next phase
- Commit after each logical task group
- Stop at any checkpoint to validate independently
