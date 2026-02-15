# Feature Specification: OKE Infrastructure with Dapr & Kafka Event Architecture

**Feature Branch**: `005-oke-dapr-kafka-infra`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "Design complete OKE infrastructure with Dapr and Kafka for Todo app deployment to Oracle Cloud"

---

## Overview

Transform the existing Todo application from a standalone web application into a production-grade, scalable, event-driven cloud-native system deployed on Oracle Kubernetes Engine (OKE). This specification covers infrastructure design, Kafka-based event architecture, Dapr sidecar integration, CI/CD pipelines, and observability.

**Scope Boundaries**:
- **In Scope**: OKE cluster design, Kafka deployment, Dapr integration, CI/CD, monitoring, security
- **Out of Scope**: Application-level feature changes, other cloud providers
- **Constraint**: Must be Oracle Cloud Always Free compatible where possible

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - DevOps Engineer Deploys Application to OKE (Priority: P1)

A DevOps engineer needs to deploy the existing Todo application to Oracle Kubernetes Engine with proper namespace isolation, resource management, and ingress routing.

**Why this priority**: Core infrastructure must exist before any event-driven capabilities. Without a functioning Kubernetes deployment, nothing else works.

**Independent Test**: Can be fully tested by deploying frontend and backend pods to OKE and verifying the application is accessible via the load balancer.

**Acceptance Scenarios**:

1. **Given** a configured OKE cluster with VCN and node pools, **When** deployment manifests are applied, **Then** all pods reach Ready state within 5 minutes
2. **Given** a running deployment, **When** a user accesses the application URL, **Then** the frontend loads and can communicate with the backend
3. **Given** resource limits are configured, **When** pods are scheduled, **Then** they respect CPU and memory constraints
4. **Given** an ingress configuration, **When** traffic arrives at the load balancer, **Then** it is correctly routed to frontend or backend based on path

---

### User Story 2 - Backend Service Publishes Events via Dapr (Priority: P2)

When a task is created, updated, or completed in the backend service, the action is published as an event through Dapr pub/sub (abstracting Kafka) without direct Kafka client dependencies in the application code.

**Why this priority**: Event publishing is the foundation for all asynchronous workflows. Other services consume these events.

**Independent Test**: Can be tested by creating a task and verifying the event appears on the appropriate Kafka topic via Dapr subscription.

**Acceptance Scenarios**:

1. **Given** a task creation request, **When** the backend processes it, **Then** a `task-created` event is published to the `task-events` topic
2. **Given** a task with a due date, **When** the task is saved, **Then** a reminder event is published to the `reminders` topic
3. **Given** Dapr sidecar is running alongside the backend, **When** an event is published, **Then** no direct Kafka client code is invoked in the application
4. **Given** Kafka is temporarily unavailable, **When** an event publish fails, **Then** Dapr retries according to configured policy

---

### User Story 3 - Worker Service Consumes Events for Recurring Tasks (Priority: P3)

A worker service subscribes to task completion events and automatically creates the next instance of recurring tasks based on the recurrence pattern.

**Why this priority**: Demonstrates event-driven architecture value by automating recurring task generation without user intervention.

**Independent Test**: Complete a recurring task and verify a new task instance is created with the correct next due date.

**Acceptance Scenarios**:

1. **Given** a recurring task is marked complete, **When** the event is consumed by the worker service, **Then** a new task instance is created with the next occurrence date
2. **Given** the worker service is scaled to multiple replicas, **When** events are consumed, **Then** each event is processed exactly once (no duplicates)
3. **Given** event processing fails, **When** the worker service retries, **Then** idempotency is maintained

---

### User Story 4 - Notification Service Sends Task Reminders (Priority: P3)

The notification service consumes reminder events from Kafka and processes scheduled reminders for tasks approaching their due dates.

**Why this priority**: Delivers user value through proactive reminders, showcasing event-driven notification capabilities.

**Independent Test**: Create a task with a due date and verify a reminder event is processed when the scheduled time arrives.

**Acceptance Scenarios**:

1. **Given** a task with a due date, **When** the reminder time arrives, **Then** the notification service processes the reminder event
2. **Given** the Dapr Jobs API schedules reminders, **When** a scheduled job fires, **Then** the corresponding reminder is sent
3. **Given** a task is deleted before reminder time, **When** the reminder job would fire, **Then** no notification is sent

---

### User Story 5 - CI/CD Pipeline Deploys Changes Automatically (Priority: P2)

When code is pushed to the main branch, GitHub Actions builds container images, pushes them to the container registry, and deploys to OKE automatically.

**Why this priority**: Automation is essential for consistent, repeatable deployments and developer productivity.

**Independent Test**: Push a commit and verify the new image is deployed to the cluster within the pipeline execution time.

**Acceptance Scenarios**:

1. **Given** a commit to the main branch, **When** the CI/CD pipeline runs, **Then** Docker images are built and pushed to the registry
2. **Given** images are pushed, **When** deployment step runs, **Then** Kubernetes manifests are applied to OKE
3. **Given** a failed deployment, **When** rollout verification fails, **Then** the pipeline reports failure and does not proceed
4. **Given** feature branch commits, **When** CI runs, **Then** images are built but not deployed to production

---

### User Story 6 - Operations Team Monitors System Health (Priority: P3)

Operations staff can observe system health through liveness/readiness probes, centralized logging, and basic metrics for all services including Kafka event flow.

**Why this priority**: Essential for production readiness, troubleshooting, and ensuring SLA compliance.

**Independent Test**: Simulate a pod failure and verify it is detected, logged, and automatically restarted.

**Acceptance Scenarios**:

1. **Given** services are running, **When** liveness probes are checked, **Then** healthy pods return success
2. **Given** a service becomes unhealthy, **When** liveness probe fails, **Then** Kubernetes restarts the pod
3. **Given** events flow through Kafka, **When** operators check metrics, **Then** they can see message counts and consumer lag
4. **Given** an error occurs in any service, **When** logs are queried, **Then** the error with context is visible in centralized logging

---

### Edge Cases

- What happens when Kafka cluster is unavailable? *Dapr retries with exponential backoff; application remains responsive for synchronous operations*
- What happens when a node pool scales down during deployment? *Pods are rescheduled to available nodes; rolling update strategy prevents downtime*
- What happens when container registry is unreachable during deployment? *Pipeline fails fast with clear error; previous deployment remains active*
- How does the system handle network partition between services? *Dapr service invocation retries; circuit breaker prevents cascade failures*
- What happens if PostgreSQL state store is unavailable? *State operations fail gracefully; Dapr returns appropriate errors; service continues for stateless operations*

---

## Requirements *(mandatory)*

### Part A - OKE Cluster Infrastructure Requirements

#### A.1 Network Architecture

- **FR-A01**: Infrastructure MUST define a Virtual Cloud Network (VCN) with CIDR block appropriate for Kubernetes networking (minimum /16)
- **FR-A02**: Infrastructure MUST create public subnet for load balancer and ingress components
- **FR-A03**: Infrastructure MUST create private subnet(s) for worker nodes
- **FR-A04**: Infrastructure MUST configure security lists allowing necessary traffic between subnets and to/from internet
- **FR-A05**: Infrastructure MUST configure NAT gateway for private subnet egress

#### A.2 Cluster Configuration

- **FR-A06**: OKE cluster MUST be configured for Always Free tier compatibility where possible (flexible shapes, minimal OCPU)
- **FR-A07**: Node pool MUST specify Ampere A1 (ARM) or AMD E4.Flex shapes for cost efficiency
- **FR-A08**: Node pool MUST define minimum resource allocation (2 OCPU, 8GB RAM per node minimum for Kafka workloads)
- **FR-A09**: Cluster MUST support kubectl authentication via OCI CLI token
- **FR-A10**: Cluster MUST be configured with Kubernetes RBAC enabled

#### A.3 Load Balancer & Ingress

- **FR-A11**: Infrastructure MUST deploy an ingress controller (NGINX or OCI-native)
- **FR-A12**: Load balancer MUST be provisioned in public subnet with external IP
- **FR-A13**: Ingress MUST route `/` and `/app/*` to frontend service
- **FR-A14**: Ingress MUST route `/api/*` to backend service
- **FR-A15**: Ingress configuration MUST support TLS termination (HTTPS-ready)

### Part B - Kubernetes Application Deployment Requirements

#### B.1 Namespace & Structure

- **FR-B01**: Deployment MUST create dedicated namespaces: `todo-app` (application), `kafka` (messaging), `dapr-system` (Dapr runtime), `monitoring` (observability)
- **FR-B02**: Each service deployment MUST include resource requests and limits
- **FR-B03**: Deployments MUST use rolling update strategy with maxUnavailable=0 for zero-downtime updates

#### B.2 Service Configuration

- **FR-B04**: Frontend service MUST be exposed as ClusterIP with ingress routing
- **FR-B05**: Backend service MUST be exposed as ClusterIP with ingress routing
- **FR-B06**: Worker services MUST be exposed as ClusterIP (internal only)
- **FR-B07**: All application pods MUST have Dapr sidecar annotations for injection

#### B.3 Scaling

- **FR-B08**: Backend deployment MUST have Horizontal Pod Autoscaler based on CPU utilization (target 70%)
- **FR-B09**: Worker deployments MUST scale based on Kafka consumer lag (when metrics available)
- **FR-B10**: Minimum replicas MUST be 1 for cost efficiency; maximum 3 for Always Free constraints

### Part C - Kafka Deployment Requirements (Strimzi)

#### C.1 Operator & Cluster

- **FR-C01**: Kafka deployment MUST use Strimzi Operator installed in `kafka` namespace
- **FR-C02**: Kafka cluster MUST be configured with ephemeral storage (no persistent volume requirement for Always Free)
- **FR-C03**: Kafka cluster MUST have 1 broker minimum (hackathon/cost mode)
- **FR-C04**: Kafka MUST configure internal listeners only (no external access)
- **FR-C05**: Zookeeper MUST be deployed with single replica for minimal resource usage

#### C.2 Topics

- **FR-C06**: Topic `task-events` MUST be created with 3 partitions for parallel processing
- **FR-C07**: Topic `reminders` MUST be created with 1 partition (order matters for scheduling)
- **FR-C08**: Topic `task-updates` MUST be created with 3 partitions for real-time sync
- **FR-C09**: All topics MUST have replication factor of 1 (single broker mode)

#### C.3 Producer/Consumer Mapping

- **FR-C10**: Backend service MUST be configured as producer for `task-events` and `reminders` topics
- **FR-C11**: Worker service MUST be configured as consumer for `task-events` topic
- **FR-C12**: Notification service MUST be configured as consumer for `reminders` topic
- **FR-C13**: WebSocket service MUST be configured as consumer for `task-updates` topic
- **FR-C14**: Audit service MUST be configured as consumer for all topics

### Part D - Dapr Integration Requirements

#### D.1 Runtime

- **FR-D01**: Dapr MUST be installed in `dapr-system` namespace via Helm
- **FR-D02**: All application services MUST have Dapr sidecar injection enabled
- **FR-D03**: Dapr MUST be configured with appropriate log level (info for production, debug for troubleshooting)

#### D.2 Pub/Sub Component

- **FR-D04**: Dapr pub/sub component MUST abstract Kafka with component type `pubsub.kafka`
- **FR-D05**: Applications MUST NOT contain direct Kafka client library dependencies
- **FR-D06**: Pub/sub component MUST configure appropriate consumer group per service

#### D.3 State Store Component

- **FR-D07**: Dapr state store MUST integrate with PostgreSQL for stateful operations
- **FR-D08**: State store MUST be used for idempotency keys and processing state

#### D.4 Service Invocation

- **FR-D09**: Service-to-service communication MUST use Dapr service invocation (not direct HTTP)
- **FR-D10**: Service invocation MUST include retry policies

#### D.5 Jobs API

- **FR-D11**: Dapr Jobs API MUST be configured for scheduled reminder processing
- **FR-D12**: Jobs MUST support delayed execution for future reminders

#### D.6 Secret Store

- **FR-D13**: Dapr secret store MUST integrate with Kubernetes Secrets
- **FR-D14**: Sensitive configuration (database credentials, API keys) MUST be retrieved via Dapr secret store

### Part E - Event-Driven Workflow Requirements

#### E.1 Reminder Flow

- **FR-E01**: When a task with due date is created, backend MUST publish reminder event with scheduled time
- **FR-E02**: Dapr Jobs API MUST schedule reminder for specified time
- **FR-E03**: When scheduled time arrives, notification service MUST receive and process reminder

#### E.2 Recurring Task Flow

- **FR-E04**: When a recurring task is completed, backend MUST publish `task-completed` event with recurrence metadata
- **FR-E05**: Worker service MUST consume event and calculate next occurrence
- **FR-E06**: Worker service MUST create new task instance via Dapr service invocation to backend

#### E.3 Audit Flow

- **FR-E07**: All task events (create, update, delete, complete) MUST be consumed by audit service
- **FR-E08**: Audit service MUST log events with timestamp, user, action, and entity details

#### E.4 Real-Time Sync Flow

- **FR-E09**: Task updates MUST be published to `task-updates` topic
- **FR-E10**: WebSocket service MUST consume updates and broadcast to connected clients
- **FR-E11**: Clients MUST receive updates asynchronously without polling

### Part F - CI/CD Pipeline Requirements (GitHub Actions)

#### F.1 Build Stage

- **FR-F01**: Pipeline MUST build Docker images for frontend, backend, and worker services
- **FR-F02**: Images MUST be tagged with git commit SHA and `latest` for main branch
- **FR-F03**: Build MUST fail if tests do not pass

#### F.2 Registry

- **FR-F04**: Images MUST be pushed to Oracle Cloud Container Registry (OCIR)
- **FR-F05**: Registry authentication MUST use OCI CLI credentials stored as GitHub Secrets

#### F.3 Deployment

- **FR-F06**: Deployment MUST authenticate to OKE using kubeconfig from OCI CLI
- **FR-F07**: Deployment MUST apply Kubernetes manifests using kubectl or Helm
- **FR-F08**: Deployment MUST wait for rollout completion and verify pod health
- **FR-F09**: Failed rollout MUST trigger pipeline failure with notification

#### F.4 Branch Strategy

- **FR-F10**: Main branch pushes MUST trigger full build and deploy
- **FR-F11**: Feature branch pushes MUST trigger build only (no deploy)
- **FR-F12**: Pull requests MUST trigger build and run integration tests

### Part G - Monitoring & Logging Requirements

#### G.1 Health Probes

- **FR-G01**: All services MUST define liveness probes (HTTP or TCP health check)
- **FR-G02**: All services MUST define readiness probes (dependency health check)
- **FR-G03**: Probe intervals MUST be configured appropriately (10s liveness, 5s readiness)

#### G.2 Logging

- **FR-G04**: All services MUST output structured JSON logs to stdout
- **FR-G05**: Logs MUST include correlation ID for distributed tracing
- **FR-G06**: Centralized logging MUST aggregate logs from all pods (Loki, OCI Logging, or similar)

#### G.3 Metrics

- **FR-G07**: Basic metrics (CPU, memory, pod count) MUST be available via Kubernetes metrics server
- **FR-G08**: Kafka consumer lag MUST be observable for scaling decisions
- **FR-G09**: Event flow metrics (publish rate, consume rate) SHOULD be tracked

#### G.4 Event Visibility

- **FR-G10**: Operators MUST be able to verify events flow from producers to consumers
- **FR-G11**: Dead letter queues MUST be monitored for failed event processing

### Part H - Security & Hardening Requirements

#### H.1 RBAC

- **FR-H01**: Kubernetes RBAC MUST limit service accounts to minimum required permissions
- **FR-H02**: CI/CD service account MUST have only deployment permissions

#### H.2 Network Policies

- **FR-H03**: Network policies MUST restrict pod-to-pod communication to required paths
- **FR-H04**: Only ingress controller MUST accept external traffic
- **FR-H05**: Kafka MUST only be accessible from application namespace

#### H.3 Resource Management

- **FR-H06**: Resource quotas MUST be defined per namespace to prevent resource exhaustion
- **FR-H07**: Limit ranges MUST enforce minimum and maximum container resources

#### H.4 Secret Management

- **FR-H08**: All secrets MUST be stored in Kubernetes Secrets (not ConfigMaps or environment variables)
- **FR-H09**: Secrets MUST be accessed via Dapr secret store component
- **FR-H10**: No secrets MUST be committed to source control

#### H.5 Ingress Security

- **FR-H11**: Ingress MUST be configured for HTTPS with valid TLS certificate
- **FR-H12**: HTTP traffic MUST redirect to HTTPS
- **FR-H13**: Security headers (HSTS, X-Content-Type-Options, etc.) MUST be configured

---

### Key Entities

- **OKE Cluster**: Managed Kubernetes cluster in Oracle Cloud; contains node pools, networking configuration
- **Node Pool**: Group of worker nodes with defined shape (OCPU/RAM); hosts application pods
- **Kafka Cluster**: Strimzi-managed Kafka deployment; contains brokers and Zookeeper
- **Topic**: Kafka message channel; partitioned for parallel processing
- **Dapr Component**: Configuration defining external system integration (pub/sub, state store, secrets)
- **Deployment**: Kubernetes workload definition; specifies pod templates, replicas, update strategy
- **Ingress**: Traffic routing configuration; maps external URLs to internal services
- **Pipeline**: GitHub Actions workflow; automates build, test, and deployment

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application is accessible via public URL and responds within 2 seconds under normal load
- **SC-002**: Pod restart on failure occurs within 30 seconds of liveness probe failure
- **SC-003**: Events published by backend are consumed by worker services within 5 seconds (99th percentile)
- **SC-004**: Zero-downtime deployments achieve 0 failed requests during rollout
- **SC-005**: CI/CD pipeline completes build and deploy within 10 minutes for typical changes
- **SC-006**: System handles 100 concurrent users without performance degradation
- **SC-007**: All services recover automatically after transient Kafka unavailability (up to 5 minutes)
- **SC-008**: 100% of task actions are captured in audit log
- **SC-009**: Recurring task next instance is created within 10 seconds of completion
- **SC-010**: Container resource usage stays within defined limits under normal operation

---

## Assumptions

1. **Oracle Cloud Account**: An Oracle Cloud account with Always Free tier access is available
2. **Domain/DNS**: A domain or subdomain is available for ingress configuration (can use nip.io for testing)
3. **GitHub Repository**: The application source code is hosted on GitHub with Actions enabled
4. **Container Images**: Frontend and backend applications are containerized with working Dockerfiles
5. **PostgreSQL**: A PostgreSQL instance is available (can be OCI Autonomous Database or self-hosted)
6. **Network Quotas**: OCI tenancy has sufficient network resource quotas for VCN, load balancer
7. **ARM Compatibility**: Application containers are compatible with ARM architecture (Ampere A1) or AMD shapes are used

---

## Dependencies

- Oracle Cloud Infrastructure account with OKE service enabled
- GitHub repository with Actions configured
- OCI CLI installed and configured for local development
- kubectl installed for cluster management
- Helm installed for Dapr and Strimzi deployment
- Domain or subdomain for production deployment (optional for development)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Always Free resource limits insufficient | Cannot run all services | Prioritize core services; use minimal replicas; consider paid tier for Kafka |
| Kafka ephemeral storage data loss | Event loss on broker restart | Accept for hackathon; document persistent storage upgrade path |
| Dapr learning curve | Delayed implementation | Provide comprehensive component YAML examples; leverage Dapr documentation |
