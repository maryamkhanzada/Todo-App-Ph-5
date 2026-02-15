# Implementation Plan: OKE Infrastructure with Dapr & Kafka Event Architecture

**Branch**: `005-oke-dapr-kafka-infra` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-oke-dapr-kafka-infra/spec.md`

---

## Summary

Deploy the existing Todo application to Oracle Kubernetes Engine (OKE) as an event-driven, cloud-native system using Dapr for service abstraction and Kafka (via Strimzi) for event streaming. The implementation follows a 9-phase approach: OCI infrastructure provisioning, Kubernetes base setup, Kafka deployment, Dapr integration, application deployment, event flow integration, CI/CD pipeline, monitoring/logging, and security hardening.

---

## Technical Context

**Platform**: Oracle Cloud Infrastructure (OCI) - Oracle Kubernetes Engine (OKE)
**Orchestration**: Kubernetes 1.28+ (OKE managed)
**Package Management**: Helm v3.x
**Distributed Runtime**: Dapr v1.12+
**Event Streaming**: Apache Kafka (via Strimzi Operator 0.38+)
**Container Registry**: Oracle Cloud Container Registry (OCIR)
**CI/CD**: GitHub Actions
**Infrastructure as Code**: Terraform (for OCI resources), Helm Charts (for K8s resources)
**Storage**: PostgreSQL (OCI Autonomous Database or containerized)
**Ingress**: NGINX Ingress Controller
**Monitoring**: Kubernetes Metrics Server, Prometheus (optional), OCI Logging
**Target Environment**: Always Free tier compatible where possible
**Node Shape**: Ampere A1 (ARM) or AMD E4.Flex - 2 OCPU, 8GB RAM minimum per node

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-First Development | PASS | Spec exists at `specs/005-oke-dapr-kafka-infra/spec.md` |
| II. Authentication & Security | PASS | Plan includes Dapr secrets, K8s Secrets, Network Policies, RBAC |
| III. Infrastructure as Code | PASS | All resources via Terraform + Helm; GitOps principles followed |
| IV. Containerization | PASS | Multi-stage builds, security scanning, ARM compatibility |
| V. Tech Stack Enforcement | PASS | Using Helm, Dapr, Kafka (Strimzi), OKE - all approved |
| XVII. Dapr Integration | PASS | All services use Dapr sidecars, no direct Kafka clients |
| XVIII. Event-Driven Architecture | PASS | Kafka abstracted via Dapr pub/sub; defined topics |
| XIX. Microservices & Loose Coupling | PASS | Services communicate via Dapr; async events |
| XX. Cloud-Native Deployment | PASS | Horizontal scaling, stateless design, health checks |
| XXI. CI/CD & GitHub Actions | PASS | Automated build, test, deploy pipeline |
| XXII. Observability | PASS | Structured logging, metrics, distributed tracing |

**Gate Result**: PASS - All constitution principles satisfied.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-oke-dapr-kafka-infra/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Infrastructure entity model
├── quickstart.md        # Deployment quickstart guide
├── contracts/           # API/event contracts
│   ├── events.yaml      # Event schema definitions
│   └── dapr-components.yaml  # Dapr component specifications
├── checklists/
│   └── requirements.md  # Validation checklist
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Infrastructure Code (repository root)

```text
infrastructure/
├── terraform/
│   ├── oci/
│   │   ├── main.tf              # Main OCI configuration
│   │   ├── variables.tf         # Input variables
│   │   ├── outputs.tf           # Output values
│   │   ├── vcn.tf               # VCN, subnets, gateways
│   │   ├── oke.tf               # OKE cluster, node pools
│   │   └── providers.tf         # Provider configuration
│   └── terraform.tfvars.example # Example variables
│
├── k8s/
│   ├── namespaces/
│   │   └── namespaces.yaml      # Namespace definitions
│   ├── ingress/
│   │   └── nginx-values.yaml    # NGINX ingress values
│   ├── kafka/
│   │   ├── strimzi-operator.yaml
│   │   ├── kafka-cluster.yaml
│   │   └── topics.yaml
│   ├── dapr/
│   │   ├── dapr-values.yaml
│   │   └── components/
│   │       ├── pubsub-kafka.yaml
│   │       ├── statestore-postgres.yaml
│   │       └── secretstore-k8s.yaml
│   ├── apps/
│   │   ├── frontend/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── hpa.yaml
│   │   ├── backend/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── hpa.yaml
│   │   └── workers/
│   │       ├── recurring-worker.yaml
│   │       ├── notification-worker.yaml
│   │       ├── audit-worker.yaml
│   │       └── websocket-worker.yaml
│   ├── monitoring/
│   │   └── metrics-server.yaml
│   ├── security/
│   │   ├── network-policies.yaml
│   │   ├── rbac.yaml
│   │   └── resource-quotas.yaml
│   └── secrets/
│       └── secrets.yaml.example
│
└── helm/
    ├── todo-app/
    │   ├── Chart.yaml
    │   ├── values.yaml
    │   ├── values-dev.yaml
    │   ├── values-prod.yaml
    │   └── templates/
    └── dapr-components/
        ├── Chart.yaml
        ├── values.yaml
        └── templates/

.github/
└── workflows/
    ├── ci.yaml                  # Build and test
    ├── cd-dev.yaml              # Deploy to dev
    └── cd-prod.yaml             # Deploy to production
```

**Structure Decision**: Web application with infrastructure-as-code layout. Terraform manages OCI resources; Helm/raw manifests manage Kubernetes resources. Separate directories for each concern (kafka, dapr, apps, monitoring, security).

---

## Complexity Tracking

> No violations identified. All patterns align with constitution.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

## Phase 0: Research & Prerequisites

**Objective**: Resolve technical unknowns and validate prerequisites before implementation.

### Research Tasks

| Topic | Decision | Rationale | Alternatives Considered |
|-------|----------|-----------|------------------------|
| OCI Always Free Limits | Use Ampere A1 (4 OCPU, 24GB RAM total free); 1 node sufficient for hackathon | Maximize resource availability; ARM compatible images | E4.Flex (1/8 OCPU free - insufficient) |
| Strimzi vs Redpanda | Strimzi with ZooKeeper mode | Strimzi is CNCF project, better OKE integration, ZooKeeper mode more stable | Redpanda (KRaft mode newer, less documentation) |
| Dapr Installation Method | Helm chart with custom values | Production-ready, configurable, version-controlled | dapr CLI init (development only) |
| Ingress Controller | NGINX Ingress Controller | OCI Load Balancer integration, well-documented | OCI Native Ingress (newer, less examples) |
| PostgreSQL Deployment | OCI Autonomous Database (Always Free) | Managed, no K8s resources consumed | Containerized PostgreSQL (consumes cluster resources) |
| Container Registry | OCIR (Oracle Cloud Container Registry) | Native OCI integration, no egress fees | Docker Hub (rate limits), GHCR (additional config) |
| Terraform State Backend | OCI Object Storage | Free tier available, native authentication | Local state (not suitable for team work) |

### Prerequisites Validation

- [ ] OCI account with Always Free credits active
- [ ] Compartment created for Todo application
- [ ] OCI CLI installed and configured (`oci setup config`)
- [ ] kubectl installed (v1.28+)
- [ ] Helm installed (v3.x)
- [ ] Terraform installed (v1.5+)
- [ ] Docker installed for local image builds
- [ ] GitHub repository with Actions enabled
- [ ] Domain or nip.io for ingress testing

---

## Phase 1: Oracle Infrastructure Preparation

**Objective**: Provision OCI networking and OKE cluster ready for application deployment.

**Dependencies**: Phase 0 prerequisites validated

### 1.1 OCI Account & Compartment Configuration

**Actions**:
1. Create dedicated compartment for Todo application (`TodoApp`)
2. Create IAM policies for OKE cluster management
3. Create IAM policies for OCIR access
4. Configure OCI CLI profile for automation

**Validation**:
- `oci iam compartment list` shows TodoApp compartment
- IAM policies allow OKE and OCIR operations

### 1.2 VCN Architecture

**Actions**:
1. Create VCN with CIDR 10.0.0.0/16
2. Create public subnet (10.0.0.0/24) for load balancer
3. Create private subnet (10.0.1.0/24) for worker nodes
4. Create Internet Gateway and attach to VCN
5. Create NAT Gateway for private subnet egress
6. Create Service Gateway for OCI services
7. Configure route tables (public → IGW, private → NAT)
8. Configure security lists:
   - Public: Allow 80, 443 inbound; all outbound
   - Private: Allow all from public subnet; all outbound

**Validation**:
- VCN visible in OCI Console
- Subnets created with correct CIDR
- Gateways attached and routing configured

### 1.3 OKE Cluster Provisioning

**Actions**:
1. Create OKE cluster (quick create or custom)
   - Kubernetes version: 1.28.x (latest available)
   - Network type: Flannel overlay
   - Private endpoint: Enabled
   - Public endpoint: Enabled
2. Create node pool:
   - Shape: VM.Standard.A1.Flex (Ampere)
   - OCPU: 2
   - Memory: 8 GB
   - Nodes: 1 (expandable to 2)
   - Boot volume: 50 GB
   - Placement: AD-1
3. Wait for cluster to become Active
4. Configure kubeconfig via OCI CLI:
   ```bash
   oci ce cluster create-kubeconfig --cluster-id <cluster-id> --file $HOME/.kube/config
   ```

**Validation**:
- `kubectl get nodes` returns Ready node(s)
- `kubectl cluster-info` shows OKE endpoints
- Node has expected OCPU/memory

### 1.4 Container Registry Setup

**Actions**:
1. Create OCIR repository: `todo-frontend`
2. Create OCIR repository: `todo-backend`
3. Create OCIR repository: `todo-worker`
4. Generate auth token for OCIR access
5. Create Kubernetes secret for OCIR pull:
   ```bash
   kubectl create secret docker-registry ocir-secret \
     --docker-server=<region>.ocir.io \
     --docker-username='<tenancy>/<username>' \
     --docker-password='<auth-token>'
   ```

**Validation**:
- OCIR repositories visible in OCI Console
- Docker login to OCIR succeeds
- K8s secret created successfully

---

## Phase 2: Kubernetes Base Setup

**Objective**: Configure namespaces, ingress, RBAC, and base Kubernetes infrastructure.

**Dependencies**: Phase 1 complete (cluster accessible)

### 2.1 Namespace Strategy

**Actions**:
1. Create namespaces:
   - `todo-app` - Application workloads
   - `kafka` - Kafka/Strimzi
   - `dapr-system` - Dapr runtime
   - `monitoring` - Observability tools
2. Apply namespace labels for Dapr injection:
   ```yaml
   metadata:
     labels:
       dapr.io/enabled: "true"
   ```

**Validation**:
- `kubectl get namespaces` shows all four
- Namespaces have correct labels

### 2.2 NGINX Ingress Controller

**Actions**:
1. Add NGINX Helm repo:
   ```bash
   helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
   ```
2. Install NGINX Ingress with OCI Load Balancer:
   ```bash
   helm install ingress-nginx ingress-nginx/ingress-nginx \
     --namespace ingress-nginx --create-namespace \
     --set controller.service.type=LoadBalancer \
     --set controller.service.annotations."service\.beta\.kubernetes\.io/oci-load-balancer-shape"="flexible" \
     --set controller.service.annotations."service\.beta\.kubernetes\.io/oci-load-balancer-shape-flex-min"="10" \
     --set controller.service.annotations."service\.beta\.kubernetes\.io/oci-load-balancer-shape-flex-max"="100"
   ```
3. Wait for LoadBalancer external IP assignment

**Validation**:
- `kubectl get svc -n ingress-nginx` shows EXTERNAL-IP
- Load Balancer visible in OCI Console
- `curl http://<external-ip>` returns NGINX default

### 2.3 Resource Quotas & Limit Ranges

**Actions**:
1. Define resource quotas per namespace:
   - `todo-app`: 2 CPU, 4Gi memory limit
   - `kafka`: 2 CPU, 6Gi memory limit
   - `monitoring`: 0.5 CPU, 1Gi memory limit
2. Define limit ranges for default container limits
3. Apply quota and limit range manifests

**Validation**:
- `kubectl describe resourcequota -n todo-app` shows limits
- Pods without resource specs get default limits

### 2.4 RBAC Baseline

**Actions**:
1. Create ClusterRole for read-only cluster access
2. Create ClusterRole for deployment (CI/CD)
3. Create ServiceAccount for GitHub Actions (`github-actions-sa`)
4. Create RoleBinding in `todo-app` namespace for deployment
5. Generate kubeconfig for GitHub Actions service account

**Validation**:
- Service account can deploy to `todo-app`
- Service account cannot modify `kube-system`

### 2.5 Secret Structure

**Actions**:
1. Create secrets in `todo-app` namespace:
   - `db-credentials` - PostgreSQL connection
   - `cohere-api-key` - AI API key
   - `ocir-secret` - Container registry (already created)
2. Document secret structure (no actual values in git)

**Validation**:
- Secrets exist in correct namespaces
- Values not exposed in kubectl output

---

## Phase 3: Kafka Deployment via Strimzi

**Objective**: Deploy self-hosted Kafka cluster using Strimzi Operator with required topics.

**Dependencies**: Phase 2 complete (namespaces, RBAC ready)

### 3.1 Strimzi Operator Installation

**Actions**:
1. Add Strimzi Helm repo:
   ```bash
   helm repo add strimzi https://strimzi.io/charts/
   ```
2. Install Strimzi Operator in `kafka` namespace:
   ```bash
   helm install strimzi strimzi/strimzi-kafka-operator \
     --namespace kafka \
     --set watchNamespaces="{kafka}"
   ```
3. Wait for operator pod Ready

**Validation**:
- `kubectl get pods -n kafka` shows strimzi-cluster-operator Running
- Strimzi CRDs installed (`kubectl get crd | grep strimzi`)

### 3.2 Kafka Cluster Deployment

**Actions**:
1. Create Kafka cluster manifest:
   ```yaml
   apiVersion: kafka.strimzi.io/v1beta2
   kind: Kafka
   metadata:
     name: todo-kafka
     namespace: kafka
   spec:
     kafka:
       version: 3.6.0
       replicas: 1
       listeners:
         - name: plain
           port: 9092
           type: internal
           tls: false
       storage:
         type: ephemeral
       config:
         offsets.topic.replication.factor: 1
         transaction.state.log.replication.factor: 1
         transaction.state.log.min.isr: 1
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
       resources:
         requests:
           memory: 512Mi
           cpu: 250m
         limits:
           memory: 1Gi
           cpu: 500m
   ```
2. Apply manifest and wait for cluster Ready

**Validation**:
- `kubectl get kafka -n kafka` shows todo-kafka Ready
- `kubectl get pods -n kafka` shows kafka-0 and zookeeper-0 Running

### 3.3 Topic Creation

**Actions**:
1. Create KafkaTopic for `task-events`:
   ```yaml
   apiVersion: kafka.strimzi.io/v1beta2
   kind: KafkaTopic
   metadata:
     name: task-events
     namespace: kafka
     labels:
       strimzi.io/cluster: todo-kafka
   spec:
     partitions: 3
     replicas: 1
     config:
       retention.ms: 604800000  # 7 days
   ```
2. Create KafkaTopic for `reminders` (1 partition for ordering)
3. Create KafkaTopic for `task-updates` (3 partitions)

**Validation**:
- `kubectl get kafkatopics -n kafka` shows all 3 topics
- Topics Ready status confirmed

### 3.4 Basic Event Validation

**Actions**:
1. Deploy temporary Kafka client pod
2. Produce test message to `task-events`
3. Consume test message to verify broker connectivity
4. Delete temporary pod

**Validation**:
- Test message successfully published and consumed
- Round-trip latency acceptable

---

## Phase 4: Dapr Installation & Component Planning

**Objective**: Install Dapr runtime and configure all required components.

**Dependencies**: Phase 3 complete (Kafka operational)

### 4.1 Dapr Installation

**Actions**:
1. Add Dapr Helm repo:
   ```bash
   helm repo add dapr https://dapr.github.io/helm-charts/
   ```
2. Install Dapr with custom values:
   ```bash
   helm install dapr dapr/dapr \
     --namespace dapr-system --create-namespace \
     --set global.ha.enabled=false \
     --set global.logAsJson=true \
     --set dapr_scheduler.enabled=true  # For Jobs API
   ```
3. Wait for all Dapr pods Ready

**Validation**:
- `kubectl get pods -n dapr-system` shows all pods Running
- dapr-sidecar-injector, dapr-operator, dapr-placement Ready
- dapr-scheduler Running (for Jobs API)

### 4.2 Pub/Sub Component (Kafka)

**Actions**:
1. Create Dapr pub/sub component:
   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Component
   metadata:
     name: pubsub-kafka
     namespace: todo-app
   spec:
     type: pubsub.kafka
     version: v1
     metadata:
       - name: brokers
         value: "todo-kafka-kafka-bootstrap.kafka.svc.cluster.local:9092"
       - name: consumerGroup
         value: "todo-app-consumer-group"
       - name: authRequired
         value: "false"
   ```
2. Apply component to `todo-app` namespace

**Validation**:
- Component shows in `kubectl get components -n todo-app`
- Dapr sidecar can connect to broker

### 4.3 State Store Component (PostgreSQL)

**Actions**:
1. Create Dapr state store component:
   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Component
   metadata:
     name: statestore
     namespace: todo-app
   spec:
     type: state.postgresql
     version: v1
     metadata:
       - name: connectionString
         secretKeyRef:
           name: db-credentials
           key: connection-string
       - name: tableName
         value: "dapr_state"
   ```
2. Apply component to `todo-app` namespace

**Validation**:
- Component shows in `kubectl get components -n todo-app`
- State save/retrieve test successful via Dapr API

### 4.4 Secret Store Component

**Actions**:
1. Create Dapr secret store component:
   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Component
   metadata:
     name: kubernetes-secrets
     namespace: todo-app
   spec:
     type: secretstores.kubernetes
     version: v1
     metadata: []
   ```
2. Apply component

**Validation**:
- Component available
- Application can retrieve secrets via Dapr

### 4.5 Service Invocation Configuration

**Actions**:
1. Document Dapr app-id naming convention:
   - `todo-backend` for backend service
   - `todo-frontend` for frontend
   - `recurring-worker`, `notification-worker`, etc.
2. Configure resiliency policies:
   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: todo-resiliency
     namespace: todo-app
   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           duration: 5s
           maxRetries: -1
       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s
           trip: consecutiveFailures >= 5
     targets:
       apps:
         todo-backend:
           retry: retryForever
           circuitBreaker: simpleCB
   ```

**Validation**:
- Resiliency policies applied
- Service invocation between test pods works

### 4.6 Jobs API Configuration

**Actions**:
1. Verify dapr-scheduler is running
2. Document Jobs API usage for reminder scheduling
3. Test job scheduling with sample reminder

**Validation**:
- Jobs can be scheduled and triggered
- Job history available

---

## Phase 5: Application Deployment on OKE

**Objective**: Deploy frontend, backend, and worker services with Dapr sidecars.

**Dependencies**: Phase 4 complete (Dapr operational)

### 5.1 Docker Image Build Process

**Actions**:
1. Build frontend image with multi-stage Dockerfile:
   - Stage 1: Build Next.js app
   - Stage 2: Production image with nginx
2. Build backend image with multi-stage Dockerfile:
   - Stage 1: Build FastAPI app
   - Stage 2: Production image with uvicorn
3. Build worker image (shared base with backend)
4. Tag images with git SHA and push to OCIR

**Validation**:
- Images build successfully
- Images pushed to OCIR
- Image sizes optimized

### 5.2 Backend Deployment

**Actions**:
1. Create Deployment manifest:
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: todo-backend
     namespace: todo-app
   spec:
     replicas: 1
     strategy:
       type: RollingUpdate
       rollingUpdate:
         maxUnavailable: 0
         maxSurge: 1
     selector:
       matchLabels:
         app: todo-backend
     template:
       metadata:
         labels:
           app: todo-backend
         annotations:
           dapr.io/enabled: "true"
           dapr.io/app-id: "todo-backend"
           dapr.io/app-port: "8000"
           dapr.io/enable-api-logging: "true"
       spec:
         containers:
           - name: backend
             image: <region>.ocir.io/<tenancy>/todo-backend:latest
             ports:
               - containerPort: 8000
             resources:
               requests:
                 memory: "256Mi"
                 cpu: "200m"
               limits:
                 memory: "512Mi"
                 cpu: "500m"
             livenessProbe:
               httpGet:
                 path: /health
                 port: 8000
               initialDelaySeconds: 30
               periodSeconds: 10
             readinessProbe:
               httpGet:
                 path: /ready
                 port: 8000
               initialDelaySeconds: 5
               periodSeconds: 5
         imagePullSecrets:
           - name: ocir-secret
   ```
2. Create Service (ClusterIP)
3. Apply manifests

**Validation**:
- Backend pod Running with 2 containers (app + dapr)
- Health endpoints responding
- Service DNS resolvable

### 5.3 Frontend Deployment

**Actions**:
1. Create Deployment manifest (similar to backend)
   - Dapr annotations for frontend
   - Port 3000 for Next.js
2. Create Service (ClusterIP)
3. Apply manifests

**Validation**:
- Frontend pod Running with Dapr sidecar
- Service accessible from within cluster

### 5.4 Worker Deployments

**Actions**:
1. Create recurring-worker Deployment:
   - Subscribes to `task-events` for task completion
   - Dapr app-id: `recurring-worker`
2. Create notification-worker Deployment:
   - Subscribes to `reminders`
   - Dapr app-id: `notification-worker`
3. Create audit-worker Deployment:
   - Subscribes to all topics
   - Dapr app-id: `audit-worker`
4. Create websocket-worker Deployment:
   - Subscribes to `task-updates`
   - Dapr app-id: `websocket-worker`

**Validation**:
- All worker pods Running with Dapr sidecars
- Workers successfully subscribe to topics

### 5.5 Ingress Routing

**Actions**:
1. Create Ingress resource:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: todo-ingress
     namespace: todo-app
     annotations:
       nginx.ingress.kubernetes.io/rewrite-target: /
   spec:
     ingressClassName: nginx
     rules:
       - host: todo.example.com  # or <ip>.nip.io
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: todo-frontend
                   port:
                     number: 3000
             - path: /api
               pathType: Prefix
               backend:
                 service:
                   name: todo-backend
                   port:
                     number: 8000
   ```
2. Apply ingress

**Validation**:
- Frontend accessible via public URL
- Backend API accessible via `/api` path
- Routing works correctly

### 5.6 Horizontal Pod Autoscaling

**Actions**:
1. Create HPA for backend:
   ```yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: todo-backend-hpa
     namespace: todo-app
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: todo-backend
     minReplicas: 1
     maxReplicas: 3
     metrics:
       - type: Resource
         resource:
           name: cpu
           target:
             type: Utilization
             averageUtilization: 70
   ```
2. Apply HPA

**Validation**:
- HPA shows in `kubectl get hpa -n todo-app`
- Scaling triggers on load test

---

## Phase 6: Event Flow Integration

**Objective**: Verify and configure all event-driven workflows.

**Dependencies**: Phase 5 complete (all services deployed)

### 6.1 Reminder Flow

**Actions**:
1. Configure backend to publish reminder events:
   - On task create with due_date → publish to `reminders`
   - Include scheduled_time, task_id, user_id in event
2. Configure notification-worker subscription:
   ```yaml
   # In notification-worker
   @app.subscribe(pubsub_name='pubsub-kafka', topic='reminders')
   async def handle_reminder(event):
       # Process reminder
   ```
3. Configure Dapr Jobs for delayed execution
4. Test end-to-end: Create task → reminder fires at due time

**Validation**:
- Event published on task creation
- Reminder processed at scheduled time
- No missed reminders

### 6.2 Recurring Task Flow

**Actions**:
1. Configure backend to publish completion events:
   - On task complete with recurrence → publish to `task-events`
   - Include recurrence_pattern, task template
2. Configure recurring-worker to:
   - Calculate next occurrence
   - Create new task via Dapr service invocation
3. Implement idempotency via Dapr state store
4. Test: Complete recurring task → new instance created

**Validation**:
- Event flow verified
- Next task created with correct date
- No duplicate tasks created

### 6.3 Audit Flow

**Actions**:
1. Configure backend to publish all CRUD events
2. Configure audit-worker to subscribe to all topics
3. Implement audit logging with correlation ID
4. Test: Various task operations → audit log entries

**Validation**:
- All events captured
- Audit entries include timestamp, user, action
- Correlation IDs traceable

### 6.4 Real-Time Sync Flow

**Actions**:
1. Configure backend to publish to `task-updates`
2. Configure websocket-worker to:
   - Consume updates
   - Broadcast to connected clients
3. Configure frontend WebSocket connection
4. Test: Update task → clients receive real-time update

**Validation**:
- Updates propagate within 5 seconds
- Multiple clients receive same update
- Connection recovery works

---

## Phase 7: CI/CD Pipeline Planning

**Objective**: Implement GitHub Actions workflows for automated build and deploy.

**Dependencies**: Phase 5 complete (services deployable)

### 7.1 GitHub Actions Workflow Structure

**Actions**:
1. Create `.github/workflows/ci.yaml`:
   - Trigger: push to any branch, pull requests
   - Jobs: lint, test, build images
   - Security scanning with Trivy
2. Create `.github/workflows/cd-dev.yaml`:
   - Trigger: push to main
   - Build, push to OCIR, deploy to OKE
3. Create `.github/workflows/cd-prod.yaml`:
   - Trigger: manual or tag push
   - Requires approval
   - Deploy to production namespace

### 7.2 OKE Authentication Setup

**Actions**:
1. Create GitHub Secrets:
   - `OCI_CLI_USER`
   - `OCI_CLI_TENANCY`
   - `OCI_CLI_FINGERPRINT`
   - `OCI_CLI_KEY_CONTENT`
   - `OCI_CLI_REGION`
   - `OKE_CLUSTER_ID`
2. Create workflow step to configure kubeconfig:
   ```yaml
   - name: Configure kubectl
     run: |
       oci ce cluster create-kubeconfig \
         --cluster-id ${{ secrets.OKE_CLUSTER_ID }} \
         --file $HOME/.kube/config \
         --region ${{ secrets.OCI_CLI_REGION }}
   ```

### 7.3 Docker Build & Push

**Actions**:
1. Create workflow steps for multi-arch builds (AMD64 + ARM64)
2. Configure OCIR login:
   ```yaml
   - name: Login to OCIR
     run: |
       docker login ${{ secrets.OCIR_ENDPOINT }} \
         -u '${{ secrets.OCI_TENANCY }}/${{ secrets.OCI_USERNAME }}' \
         -p '${{ secrets.OCI_AUTH_TOKEN }}'
   ```
3. Push images with SHA tags and `latest`

### 7.4 Deployment Automation

**Actions**:
1. Apply Kubernetes manifests via kubectl or Helm
2. Wait for rollout completion:
   ```yaml
   - name: Verify deployment
     run: |
       kubectl rollout status deployment/todo-backend -n todo-app --timeout=300s
       kubectl rollout status deployment/todo-frontend -n todo-app --timeout=300s
   ```
3. Run smoke tests after deployment
4. Rollback on failure

**Validation**:
- Pipeline runs on push to main
- Images built and pushed
- Deployment succeeds
- Rollback works on failure

---

## Phase 8: Monitoring & Logging Strategy

**Objective**: Implement observability for all services and event flows.

**Dependencies**: Phase 5 complete (services running)

### 8.1 Liveness & Readiness Probes

**Actions**:
1. Implement `/health` endpoint in all services:
   - Returns 200 if service is alive
   - Returns 503 if critical dependency down
2. Implement `/ready` endpoint:
   - Checks Dapr sidecar connectivity
   - Checks database connectivity (where applicable)
3. Configure probe timing:
   - Liveness: initialDelay 30s, period 10s
   - Readiness: initialDelay 5s, period 5s

**Validation**:
- Unhealthy pods restart automatically
- Unready pods removed from service

### 8.2 Centralized Logging

**Actions**:
1. Configure all services for JSON logging:
   - Include timestamp, level, message, correlation_id
   - Include Dapr trace headers
2. Configure OCI Logging Agent (or Loki):
   - Collect logs from all namespaces
   - Forward to OCI Logging service
3. Create log dashboards/searches

**Validation**:
- Logs queryable by correlation ID
- Distributed traces visible
- Error logs alertable

### 8.3 Metrics Collection

**Actions**:
1. Ensure Kubernetes Metrics Server installed
2. Expose Prometheus metrics from services (optional)
3. Configure Kafka consumer lag monitoring:
   - Use Strimzi metrics exporter
   - Alert on lag > threshold
4. Create metrics dashboards

**Validation**:
- `kubectl top pods` works
- HPA can access metrics
- Kafka lag observable

### 8.4 Event Flow Visibility

**Actions**:
1. Configure Kafka topic metrics
2. Implement dead letter queue monitoring
3. Create event flow dashboard:
   - Publish rate per topic
   - Consume rate per consumer group
   - Failed message count

**Validation**:
- Event flow end-to-end visible
- Failed events identifiable
- SLA compliance verifiable

---

## Phase 9: Security & Production Hardening

**Objective**: Apply security best practices and production hardening.

**Dependencies**: Phase 8 complete (monitoring in place)

### 9.1 RBAC Refinement

**Actions**:
1. Create least-privilege ClusterRoles
2. Create service-specific ServiceAccounts:
   - `todo-backend-sa` - state store, pub/sub access
   - `todo-worker-sa` - pub/sub consumer access
3. Remove default ServiceAccount privileges
4. Audit RBAC with `kubectl auth can-i`

**Validation**:
- Services have minimum required access
- Privilege escalation blocked

### 9.2 Network Policies

**Actions**:
1. Create default-deny policy:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: default-deny-all
     namespace: todo-app
   spec:
     podSelector: {}
     policyTypes:
       - Ingress
       - Egress
   ```
2. Create allow policies:
   - Ingress → frontend, backend
   - Backend → Kafka, PostgreSQL
   - Workers → Kafka
   - All pods → Dapr sidecar
3. Test network isolation

**Validation**:
- Unauthorized traffic blocked
- Required traffic allowed
- Kafka only accessible from app namespace

### 9.3 Resource Quotas (Enforcement)

**Actions**:
1. Verify resource quotas enforced
2. Set LimitRange defaults:
   - Default CPU: 100m request, 500m limit
   - Default Memory: 128Mi request, 512Mi limit
3. Test pod creation without resources

**Validation**:
- Quota enforcement working
- Default limits applied

### 9.4 Secret Management

**Actions**:
1. Audit all secrets in cluster
2. Verify no secrets in ConfigMaps
3. Verify Dapr secret store usage
4. Implement secret rotation procedure (document)

**Validation**:
- All sensitive data in Secrets
- Dapr secret store working
- No secrets in source control

### 9.5 Ingress Security (HTTPS)

**Actions**:
1. Create TLS secret with certificate:
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: todo-tls-secret
     namespace: todo-app
   type: kubernetes.io/tls
   data:
     tls.crt: <base64>
     tls.key: <base64>
   ```
2. Update Ingress for TLS:
   ```yaml
   spec:
     tls:
       - hosts:
           - todo.example.com
         secretName: todo-tls-secret
   ```
3. Configure HTTPS redirect
4. Add security headers

**Validation**:
- HTTPS working
- HTTP redirects to HTTPS
- Security headers present

---

## Validation Checkpoints Summary

| Phase | Checkpoint | Pass Criteria |
|-------|------------|---------------|
| 1 | OKE Cluster Ready | `kubectl get nodes` shows Ready |
| 2 | Ingress Working | External IP accessible |
| 3 | Kafka Ready | Topics created, test message success |
| 4 | Dapr Components Ready | Sidecar injection working, pub/sub test pass |
| 5 | App Deployed | All pods Running, frontend accessible |
| 6 | Events Flowing | All 4 workflows verified |
| 7 | CI/CD Working | Auto-deploy on push succeeds |
| 8 | Monitoring Active | Logs queryable, metrics available |
| 9 | Security Hardened | Network policies enforced, HTTPS working |

---

## Risk Mitigation

| Risk | Impact | Mitigation | Phase |
|------|--------|------------|-------|
| Always Free limits exceeded | Deployment fails | Monitor usage; single replica; efficient images | 1, 5 |
| Kafka ephemeral data loss | Events lost on restart | Accept for hackathon; document PV upgrade | 3 |
| Dapr sidecar injection fails | Pods won't start | Verify namespace labels; check operator logs | 4 |
| OCIR rate limits | Build failures | Cache base images; use ARM builds | 7 |
| Network policy too restrictive | Services can't communicate | Test incrementally; start with allow-all | 9 |

---

## Next Steps

After plan approval:
1. Run `/sp.tasks` to generate implementation task breakdown
2. Execute Phase 0 research tasks
3. Begin Phase 1 infrastructure provisioning
4. Iterate through phases with validation checkpoints
