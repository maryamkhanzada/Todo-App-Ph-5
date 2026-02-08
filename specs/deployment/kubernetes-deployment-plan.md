# Deployment Plan: Phase III AI Todo Chatbot on Kubernetes

## Overview
This document outlines the detailed deployment plan for containerizing and deploying the existing Phase III AI Todo Chatbot (FastAPI backend + Next.js frontend) on a local Kubernetes cluster using Minikube and Helm Charts, fully leveraging AI-assisted DevOps tools.

## Deployment Architecture
- **Frontend**: Next.js application deployed as Deployment with NodePort Service
- **Backend**: FastAPI application deployed as Deployment with ClusterIP Service
- **Database**: PostgreSQL deployed as StatefulSet with PersistentVolume
- **AI Services**: Cohere API integration via environment variables
- **Networking**: Service-to-service communication via Kubernetes DNS

## Phase 1: Containerization Steps

### 1.1 Frontend Containerization
- **Objective**: Containerize the Next.js frontend application
- **Method**: Use Docker AI Agent (Gordon) if available, otherwise generate optimized Dockerfile
- **Steps**:
  1. Analyze Next.js application structure and dependencies
  2. Generate multi-stage Dockerfile with build and production stages
  3. Optimize base image selection (Node.js LTS Alpine)
  4. Implement proper layer caching for node_modules
  5. Run container as non-root user
  6. Expose port 3000 for Next.js application
  7. Build and tag image as `todo-frontend:v1.0.0`
  8. Perform security scanning
  9. Push to local registry if needed

### 1.2 Backend Containerization
- **Objective**: Containerize the FastAPI backend application
- **Method**: Use Docker AI Agent (Gordon) if available, otherwise generate optimized Dockerfile
- **Steps**:
  1. Analyze Python dependencies and FastAPI application
  2. Generate multi-stage Dockerfile with build and runtime stages
  3. Optimize base image selection (Python 3.11 slim)
  4. Implement proper layer caching for pip packages
  5. Run container as non-root user
  6. Expose port 8000 for FastAPI application
  7. Build and tag image as `todo-backend:v1.0.0`
  8. Perform security scanning
  9. Push to local registry if needed

### 1.3 Database Containerization
- **Objective**: Containerize PostgreSQL database for local deployment
- **Method**: Use official PostgreSQL image with custom initialization
- **Steps**:
  1. Use official PostgreSQL 15 image
  2. Configure persistent volume for data storage
  3. Initialize database with application schema
  4. Set up proper authentication and security
  5. Configure backup and recovery mechanisms

## Phase 2: Helm Chart Structure

### 2.1 Frontend Helm Chart (`charts/todo-frontend`)
```
todo-frontend/
├── Chart.yaml
├── values.yaml
├── README.md
├── templates/
│   ├── _helpers.tpl
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   ├── ingress.yaml
│   └── tests/
│       └── test-connection.yaml
└── .helmignore
```

**Key templates**:
- `deployment.yaml`: Frontend application deployment with resource requests/limits
- `service.yaml`: NodePort service exposing frontend on port 30000-32767
- `hpa.yaml`: Horizontal Pod Autoscaler for scaling frontend pods
- `ingress.yaml`: Ingress rule for external access (if ingress controller available)

### 2.2 Backend Helm Chart (`charts/todo-backend`)
```
todo-backend/
├── Chart.yaml
├── values.yaml
├── README.md
├── templates/
│   ├── _helpers.tpl
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── tests/
│       └── test-connection.yaml
└── .helmignore
```

**Key templates**:
- `deployment.yaml`: Backend application deployment with resource requests/limits
- `service.yaml`: ClusterIP service for internal communication
- `configmap.yaml`: Application configuration (database URLs, etc.)
- `secret.yaml`: Sensitive configuration (API keys, database passwords)
- `hpa.yaml`: Horizontal Pod Autoscaler for scaling backend pods

### 2.3 Database Helm Chart (`charts/postgresql`)
```
postgresql/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── _helpers.tpl
│   ├── statefulset.yaml
│   ├── service.yaml
│   ├── pvc.yaml
│   ├── configmap.yaml
│   └── secret.yaml
└── .helmignore
```

**Key templates**:
- `statefulset.yaml`: PostgreSQL StatefulSet with persistent storage
- `service.yaml`: Service for database access
- `pvc.yaml`: PersistentVolumeClaim for data persistence
- `secret.yaml`: Database credentials

### 2.4 Main Application Chart (`charts/todo-app`)
```
todo-app/
├── Chart.yaml
├── values.yaml
├── README.md
├── templates/
│   ├── NOTES.txt
│   └── _helpers.tpl
├── charts/
│   ├── todo-frontend/
│   ├── todo-backend/
│   └── postgresql/
└── .helmignore
```

**Purpose**: Umbrella chart that combines all components with proper inter-service communication

## Phase 3: Minikube Deployment Workflow

### 3.1 Pre-deployment Setup
1. **Verify Minikube Installation**:
   ```bash
   minikube version
   minikube status
   ```

2. **Start Minikube Cluster**:
   ```bash
   minikube start --cpus=4 --memory=8192 --disk-size=40g
   minikube addons enable ingress
   minikube addons enable metrics-server
   ```

3. **Configure Docker Environment**:
   ```bash
   eval $(minikube docker-env)
   ```

4. **Install Helm**:
   ```bash
   helm version
   ```

5. **Prepare Environment Variables**:
   - COHERE_API_KEY (from .env or Kubernetes Secret)
   - Database connection parameters
   - JWT secrets

### 3.2 Deployment Steps
1. **Build Container Images**:
   - Use Docker AI Agent (Gordon) to generate and build optimized images
   - Verify images are available in Minikube's Docker environment

2. **Create Kubernetes Namespace**:
   ```bash
   kubectl create namespace todo-app
   ```

3. **Create Secrets**:
   ```bash
   kubectl create secret generic todo-secrets \
     --from-literal=cohere-api-key=<your-cohere-key> \
     --from-literal=better-auth-secret=<your-auth-secret> \
     --namespace=todo-app
   ```

4. **Deploy Database First**:
   ```bash
   helm install postgresql ./charts/postgresql --namespace todo-app --wait
   ```

5. **Deploy Backend**:
   ```bash
   helm install backend ./charts/todo-backend --namespace todo-app --wait
   ```

6. **Deploy Frontend**:
   ```bash
   helm install frontend ./charts/todo-frontend --namespace todo-app --wait
   ```

7. **Deploy Complete Application** (Alternative approach):
   ```bash
   helm install todo-app ./charts/todo-app --namespace todo-app --create-namespace --wait
   ```

### 3.3 Post-deployment Configuration
1. **Configure Ingress** (if needed):
   ```bash
   minikube service frontend --namespace todo-app --url
   ```

2. **Set up Port Forwarding** (alternative access method):
   ```bash
   kubectl port-forward svc/frontend 3000:3000 --namespace todo-app
   kubectl port-forward svc/backend 8000:8000 --namespace todo-app
   ```

3. **Initialize Database Schema**:
   - Run database migrations if needed
   - Verify database connectivity from backend

## Phase 4: Validation Checks

### 4.1 Pre-deployment Validation
- [ ] Verify Minikube cluster is running
- [ ] Confirm Docker images are built and available
- [ ] Validate Helm charts with `helm lint`
- [ ] Check resource availability (CPU, memory, disk)
- [ ] Verify secrets are properly configured

### 4.2 Deployment Validation
- [ ] Confirm all pods are running and ready
- [ ] Verify services are accessible within cluster
- [ ] Check that deployments have correct replica counts
- [ ] Validate resource requests and limits are set
- [ ] Confirm health checks are passing

### 4.3 Functional Validation
- [ ] Access frontend via NodePort/Ingress
- [ ] Verify backend API endpoints are responsive
- [ ] Test database connectivity
- [ ] Confirm authentication flow works
- [ ] Validate AI chatbot functionality
- [ ] Test task CRUD operations
- [ ] Verify user isolation is maintained

### 4.4 AI DevOps Tool Validation
- [ ] Confirm Docker AI Agent (Gordon) was used for containerization
- [ ] Verify kubectl-ai was used for Kubernetes operations
- [ ] Validate Kagent was used for cluster analysis
- [ ] Confirm AI-assisted deployment processes worked correctly

## Phase 5: AI-Assisted Operations Integration

### 5.1 Docker AI Agent (Gordon) Usage
- [ ] Use Gordon to analyze and optimize Dockerfiles
- [ ] Leverage AI for base image selection and layer optimization
- [ ] Apply AI recommendations for security enhancements

### 5.2 kubectl-ai Integration
- [ ] Use kubectl-ai for resource inspection and troubleshooting
- [ ] Leverage AI for configuration validation
- [ ] Apply AI suggestions for performance optimization

### 5.3 Kagent Cluster Analysis
- [ ] Use Kagent for initial cluster health assessment
- [ ] Leverage AI for resource utilization analysis
- [ ] Apply AI recommendations for scaling and optimization

## Phase 6: Rollback and Recovery Plan

### 6.1 Rollback Procedures
- [ ] Document Helm rollback commands
- [ ] Verify rollback functionality works correctly
- [ ] Test data preservation during rollbacks

### 6.2 Recovery Procedures
- [ ] Document backup and restore procedures
- [ ] Test disaster recovery scenarios
- [ ] Validate data integrity after recovery

## Success Criteria
- [ ] Frontend accessible via Minikube URL
- [ ] Backend APIs respond correctly
- [ ] All pods are running and healthy
- [ ] Database connectivity established
- [ ] Authentication works properly
- [ ] Task operations functional
- [ ] Chatbot features operational
- [ ] Helm releases installed successfully
- [ ] AI DevOps tools actively used and documented
- [ ] Complete traceability for SDD and Agentic workflow
- [ ] Performance meets requirements
- [ ] Security controls properly implemented

## Next Steps
1. Execute containerization phase
2. Validate Helm charts
3. Perform deployment on Minikube
4. Execute validation checks
5. Document any issues and resolutions
6. Create operational runbook