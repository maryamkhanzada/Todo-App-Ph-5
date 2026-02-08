# Data Model: Kubernetes Deployment for AI Todo Chatbot

## Overview
This document defines the data model for the Kubernetes deployment of the AI Todo Chatbot, focusing on Kubernetes resources and configuration entities.

## Kubernetes Resources

### Deployment
**Description**: Defines the desired state for application pods
**Fields**:
- name: Unique identifier for the deployment
- replicas: Number of desired pod instances
- selector: Labels to identify matching pods
- template: Pod template specification
- containers: List of container specifications
- resources: Resource requests and limits
- env: Environment variables
- imagePullPolicy: Policy for pulling container images

**Relationships**:
- One-to-many with Pods (creates and manages pods)

### Service
**Description**: Exposes applications to network traffic
**Fields**:
- name: Unique identifier for the service
- type: Service type (ClusterIP, NodePort, LoadBalancer)
- selector: Labels to identify target pods
- ports: List of port mappings
- clusterIP: Internal IP address (for ClusterIP services)

**Relationships**:
- Many-to-one with Deployments (routes traffic to deployment pods)

### Secret
**Description**: Stores sensitive information
**Fields**:
- name: Unique identifier for the secret
- type: Secret type (Opaque, kubernetes.io/tls, etc.)
- data: Base64 encoded sensitive data
- stringData: Plaintext sensitive data (encoded automatically)

**Relationships**:
- Many-to-many with Deployments (mounted as volumes or environment variables)

### ConfigMap
**Description**: Stores non-sensitive configuration data
**Fields**:
- name: Unique identifier for the configmap
- data: Key-value pairs of configuration data
- binaryData: Binary data

**Relationships**:
- Many-to-many with Deployments (mounted as volumes or environment variables)

### PersistentVolumeClaim
**Description**: Requests persistent storage
**Fields**:
- name: Unique identifier for the PVC
- accessModes: How the volume should be mounted
- resources.requests.storage: Minimum storage required
- storageClassName: Storage class to use

**Relationships**:
- One-to-one with PersistentVolume (bound to specific PV)

### StatefulSet
**Description**: Manages stateful applications
**Fields**:
- name: Unique identifier for the StatefulSet
- serviceName: Name of the service to govern
- replicas: Number of desired pod instances
- selector: Labels to identify matching pods
- template: Pod template specification

**Relationships**:
- One-to-many with Pods (creates and manages stateful pods)
- One-to-many with PersistentVolumeClaims (each pod gets dedicated storage)

## Container Images

### FrontendImage
**Description**: Container image for Next.js frontend application
**Fields**:
- name: Image repository name
- tag: Image version tag
- registry: Registry location
- digest: Image digest (for pinning)

### BackendImage
**Description**: Container image for FastAPI backend application
**Fields**:
- name: Image repository name
- tag: Image version tag
- registry: Registry location
- digest: Image digest (for pinning)

### DatabaseImage
**Description**: Container image for PostgreSQL database
**Fields**:
- name: Image repository name
- tag: Image version tag
- registry: Registry location
- digest: Image digest (for pinning)

## Helm Chart Components

### ChartDefinition
**Description**: Defines a Helm chart structure
**Fields**:
- name: Chart name
- version: Chart version
- appVersion: Application version
- description: Chart description
- apiVersion: Helm API version

### ValuesSchema
**Description**: Defines configurable parameters for a chart
**Fields**:
- image.repository: Container image repository
- image.tag: Container image tag
- image.pullPolicy: Image pull policy
- service.type: Service type
- service.port: Service port
- resources.limits.cpu: CPU limit
- resources.limits.memory: Memory limit
- resources.requests.cpu: CPU request
- resources.requests.memory: Memory request

### TemplateDefinition
**Description**: Defines Kubernetes resource templates
**Fields**:
- name: Template name
- path: Path within templates directory
- content: Template content with placeholders
- dependencies: Other templates this template depends on

## Environment Configuration

### EnvironmentVariable
**Description**: Defines application environment variables
**Fields**:
- name: Variable name
- value: Variable value
- valueFrom: Source of the value (secret, configmap, etc.)

### EnvironmentType
**Description**: Defines different environment configurations
**Fields**:
- name: Environment name (dev, staging, prod)
- overrides: Value overrides for this environment
- resources: Environment-specific resource allocations

## Network Configuration

### ServiceEndpoint
**Description**: Defines service endpoints for communication
**Fields**:
- name: Endpoint name
- protocol: Communication protocol (HTTP, HTTPS, TCP)
- port: Port number
- path: API path (for HTTP services)

### NetworkPolicyRule
**Description**: Defines network traffic rules
**Fields**:
- direction: Ingress or Egress
- protocol: Network protocol (TCP, UDP)
- port: Port number
- target: Destination or source
- allowed: Whether traffic is allowed

## Health Monitoring

### HealthCheck
**Description**: Defines container health checks
**Fields**:
- type: Liveness or Readiness probe
- httpGet.path: HTTP path to check
- httpGet.port: Port to check
- initialDelaySeconds: Delay before first check
- periodSeconds: Interval between checks
- timeoutSeconds: Timeout for each check
- failureThreshold: Failures before restart

## State Management

### PersistentStorage
**Description**: Defines persistent storage requirements
**Fields**:
- name: Storage name
- size: Required storage size
- accessMode: Access mode (ReadWriteOnce, ReadOnlyMany, etc.)
- storageClass: Storage class to use
- mountPath: Path to mount in container

### SessionManagement
**Description**: Defines session and state management
**Fields**:
- type: Session storage type (in-memory, database, external)
- ttl: Time-to-live for sessions
- encryption: Whether sessions are encrypted
- persistence: Whether sessions survive restarts