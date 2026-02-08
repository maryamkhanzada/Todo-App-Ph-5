# Kubernetes Deployment Guide for AI Todo Chatbot

This guide provides comprehensive instructions for deploying the AI Todo Chatbot application on a local Kubernetes cluster using Minikube and Helm Charts.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Deployment Steps](#detailed-deployment-steps)
4. [Configuration](#configuration)
5. [Troubleshooting](#troubleshooting)
6. [Operations](#operations)
7. [Validation](#validation)

## Prerequisites

Before deploying the application, ensure you have the following tools installed:

- [Minikube](https://minikube.sigs.k8s.io/docs/start/) (v1.20+)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (v1.20+)
- [Helm](https://helm.sh/docs/intro/install/) (v3.2.0+)
- [Docker](https://docs.docker.com/get-docker/) (v20.10+)

### Optional AI Tools

- [kubectl-ai](https://github.com/kaasops/kubectl-ai) for AI-assisted Kubernetes operations
- Kagent for AI-powered cluster analysis (installation varies by platform)

Verify your setup:

```bash
minikube version
kubectl version --client
helm version
docker --version
```

Start Minikube with sufficient resources:

```bash
minikube start --cpus=4 --memory=8192 --disk-size=20g
```

## Quick Start

For a quick deployment of the complete application:

1. Navigate to the k8s directory:
   ```bash
   cd k8s
   ```

2. Make scripts executable:
   ```bash
   chmod +x *.sh
   ```

3. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

4. Access the frontend:
   ```bash
   minikube service todo-frontend-svc -n todo-app --url
   ```

## Detailed Deployment Steps

### 1. Environment Preparation

First, ensure Minikube is running with adequate resources:

```bash
minikube start --cpus=4 --memory=8192 --disk-size=20g
```

Enable required Minikube addons:

```bash
minikube addons enable ingress
minikube addons enable metrics-server
```

### 2. Building Container Images

Navigate to the docker directory and build the container images:

```bash
cd docker
chmod +x build-images.sh
./build-images.sh
```

Alternatively, you can build with a specific version:

```bash
./build-images.sh v1.0.0
```

### 3. Preparing Secrets

Set your API keys and secrets as environment variables:

```bash
export COHERE_API_KEY="your-cohere-api-key"
export BETTER_AUTH_SECRET="your-better-auth-secret"
export POSTGRES_PASSWORD="your-secure-password"
```

Prepare the Kubernetes secrets:

```bash
cd ../k8s
./prepare-secrets.sh
```

### 4. Deploying Individual Components

You can deploy each component separately:

```bash
# Deploy PostgreSQL
helm upgrade --install todo-postgres ../charts/todo-postgres --namespace todo-app --create-namespace --wait

# Deploy Backend
helm upgrade --install todo-backend ../charts/todo-backend --namespace todo-app --wait

# Deploy Frontend
helm upgrade --install todo-frontend ../charts/todo-frontend --namespace todo-app --wait
```

Or deploy using the umbrella chart:

```bash
helm upgrade --install todo-app ../charts/todo-app --namespace todo-app --create-namespace --wait
```

### 5. Verifying the Deployment

Check the status of all resources:

```bash
kubectl get pods,services,deployments -n todo-app
```

## Configuration

### Helm Chart Configuration

Each component can be configured using values in the respective `values.yaml` files:

#### Frontend Configuration
- `service.type`: Service type (NodePort, LoadBalancer, ClusterIP)
- `service.port`: Port to expose
- `resources`: CPU and memory limits/requests
- `env`: Environment variables for the frontend

#### Backend Configuration
- `service.type`: Service type (should typically remain ClusterIP)
- `service.port`: Port to expose
- `resources`: CPU and memory limits/requests
- `env`: Environment variables for the backend

#### PostgreSQL Configuration
- `service.type`: Service type (should typically remain ClusterIP)
- `service.port`: Port to expose
- `resources`: CPU and memory limits/requests
- `postgresql.auth`: Authentication configuration

### Custom Configuration

To customize the deployment, create a custom values file:

```yaml
# custom-values.yaml
todo-frontend:
  resources:
    requests:
      cpu: 200m
      memory: 512Mi
    limits:
      cpu: 1
      memory: 1Gi
  service:
    type: LoadBalancer

todo-backend:
  resources:
    requests:
      cpu: 200m
      memory: 512Mi
    limits:
      cpu: 1
      memory: 1Gi

todo-postgres:
  resources:
    requests:
      cpu: 300m
      memory: 1Gi
    limits:
      cpu: 1.5
      memory: 2Gi
  persistence:
    size: 16Gi
```

Deploy with custom values:

```bash
helm upgrade --install todo-app ../charts/todo-app --namespace todo-app -f custom-values.yaml
```

## Troubleshooting

### Common Issues

#### 1. Pods stuck in Pending state
- Check if you have sufficient resources allocated to Minikube
- Verify PersistentVolume availability for PostgreSQL

#### 2. Service not accessible
- Ensure you're using the correct NodePort when accessing via Minikube
- Check if the service type matches your access method

#### 3. Database connection failures
- Verify that PostgreSQL is running and ready
- Check that database credentials are correctly configured in secrets

#### 4. API key errors
- Ensure all required API keys are set in the backend secrets
- Verify that API keys are valid and have the necessary permissions

### Diagnostic Commands

Check pod status:
```bash
kubectl get pods -n todo-app
kubectl describe pod <pod-name> -n todo-app
kubectl logs <pod-name> -n todo-app
```

Check service connectivity:
```bash
kubectl get svc -n todo-app
minikube service todo-frontend-svc -n todo-app --url
```

Check deployment status:
```bash
kubectl get deployments -n todo-app
kubectl rollout status deployment/todo-frontend -n todo-app
kubectl rollout status deployment/todo-backend -n todo-app
kubectl rollout status deployment/todo-postgres -n todo-app
```

### Validation

Run the validation script to verify the deployment:

```bash
./validate-deployment.sh
```

## Operations

### Scaling Applications

Scale frontend to 2 replicas:
```bash
kubectl scale deployment todo-frontend --replicas=2 -n todo-app
```

Scale backend with HPA (Horizontal Pod Autoscaler):
```bash
kubectl autoscale deployment todo-backend --cpu-percent=70 --min=1 --max=5 -n todo-app
```

### Updating Applications

Update with new image tag:
```bash
helm upgrade todo-frontend ../charts/todo-frontend --namespace todo-app --set image.tag=v1.1.0
```

Rollback to previous version:
```bash
helm rollback todo-frontend -n todo-app
```

### Backup and Restore

For PostgreSQL backups, use the following approach:

```bash
# Create backup
kubectl exec -it $(kubectl get pods -n todo-app -l app.kubernetes.io/name=todo-postgres -o jsonpath='{.items[0].metadata.name}') -n todo-app -- pg_dump -U postgres -d todo_db > backup.sql

# Restore from backup
kubectl cp backup.sql <pod-name>:/tmp/backup.sql -n todo-app
kubectl exec -it <pod-name> -n todo-app -- psql -U postgres -d todo_db -f /tmp/backup.sql
```

## Validation

The deployment can be validated using the provided validation script:

```bash
./validate-deployment.sh
```

The validation includes:
- Checking that all pods are running and healthy
- Verifying service configurations (NodePort for frontend, ClusterIP for backend/database)
- Ensuring proper number of ready replicas
- Testing backend health endpoint
- Validating Helm releases

### Success Criteria

A successful deployment will have:
- All pods in "Running" state
- Services properly configured (NodePort for frontend, ClusterIP for others)
- At least 1 ready replica for each deployment
- Backend health endpoint returning HTTP 200
- All Helm releases installed successfully

## AI-Assisted Operations

This deployment supports AI-assisted operations using kubectl-ai and Kagent. See [AI Operations Guide](ai-operations.md) for detailed instructions.

### Example AI Commands

```bash
# Deploy using natural language
kubectl ai "deploy todo-app from helm chart in todo-app namespace"

# Scale based on demand
kubectl ai "scale todo-backend to 3 replicas if CPU usage is above 70%"

# Troubleshoot issues
kubectl ai "explain why pods in todo-app namespace are failing"
```

## Security Considerations

- API keys are stored in Kubernetes secrets
- Network policies can be enabled to restrict traffic between services
- Database connections use secure protocols
- Applications run as non-root users where possible

## Resource Requirements

- **Minikube**: At least 4 CPUs, 8GB RAM, 20GB disk space
- **Pod Resources**:
  - Frontend: 100m CPU request / 500m CPU limit, 256Mi memory request / 512Mi memory limit
  - Backend: 100m CPU request / 500m CPU limit, 256Mi memory request / 512Mi memory limit
  - PostgreSQL: 200m CPU request / 1 CPU limit, 512Mi memory request / 1Gi memory limit

## Next Steps

1. Configure domain and SSL certificates for production use
2. Set up monitoring and alerting
3. Implement backup and disaster recovery procedures
4. Configure CI/CD pipelines for automated deployments
5. Set up proper logging aggregation