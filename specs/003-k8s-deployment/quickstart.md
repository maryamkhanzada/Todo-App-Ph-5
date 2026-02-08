# Quickstart Guide: Kubernetes Deployment for AI Todo Chatbot

## Overview
This guide provides step-by-step instructions for deploying the AI Todo Chatbot to a local Kubernetes cluster using Minikube and Helm Charts.

## Prerequisites

### System Requirements
- Windows 10/11 with WSL2 or native Windows
- At least 8GB RAM (16GB recommended)
- 4 CPU cores
- 40GB free disk space
- Docker Desktop installed with Kubernetes enabled

### Required Tools
- Minikube v1.28+
- kubectl
- Helm v3+
- Docker AI Agent (Gordon) - if available
- kubectl-ai (AI-enhanced kubectl)
- Kagent (cluster analysis tool)

### Environment Setup
1. **Install Minikube**:
   ```bash
   choco install minikube kubernetes-cli helm
   # Or download from https://minikube.sigs.k8s.io/docs/start/
   ```

2. **Verify installations**:
   ```bash
   minikube version
   kubectl version --client
   helm version
   ```

3. **Start Minikube cluster**:
   ```bash
   minikube start --cpus=4 --memory=8192 --disk-size=40g
   minikube addons enable ingress
   minikube addons enable metrics-server
   ```

4. **Configure Docker for Minikube**:
   ```bash
   eval $(minikube docker-env)
   # Or run this in each terminal session where you build images
   ```

## Deployment Steps

### 1. Prepare the Environment
1. **Clone or navigate to the project directory**:
   ```bash
   cd D:\phase_2\frontend_todo_app
   ```

2. **Create namespace**:
   ```bash
   kubectl create namespace todo-app
   ```

3. **Prepare secrets** (update with your actual values):
   ```bash
   kubectl create secret generic todo-secrets \
     --from-literal=cohere-api-key="YOUR_COHERE_API_KEY" \
     --from-literal=better-auth-secret="YOUR_BETTER_AUTH_SECRET" \
     --from-literal=db-password="YOUR_DB_PASSWORD" \
     --namespace=todo-app
   ```

### 2. Containerization (Using AI Assistance)
1. **If Docker AI Agent (Gordon) is available**, use it to generate Dockerfiles:
   ```bash
   # Use Gordon to analyze and generate optimized Dockerfiles
   # Gordon will create frontend.Dockerfile and backend.Dockerfile
   ```

2. **If Gordon is not available**, create the Dockerfiles manually:
   - For frontend: Create `docker/frontend.Dockerfile`
   - For backend: Create `docker/backend.Dockerfile`

3. **Build container images**:
   ```bash
   # Frontend
   docker build -f docker/frontend.Dockerfile -t todo-frontend:v1.0.0 .

   # Backend
   docker build -f docker/backend.Dockerfile -t todo-backend:v1.0.0 .
   ```

### 3. Helm Chart Deployment
1. **Navigate to Helm charts directory**:
   ```bash
   cd charts
   ```

2. **Install PostgreSQL chart first**:
   ```bash
   helm install postgresql ./todo-postgres --namespace todo-app --wait
   ```

3. **Install backend chart**:
   ```bash
   helm install backend ./todo-backend --namespace todo-app --wait
   ```

4. **Install frontend chart**:
   ```bash
   helm install frontend ./todo-frontend --namespace todo-app --wait
   ```

5. **Or install using the umbrella chart**:
   ```bash
   helm install todo-app ./todo-app --namespace todo-app --create-namespace --wait
   ```

### 4. Verification
1. **Check all pods are running**:
   ```bash
   kubectl get pods --namespace=todo-app
   ```

2. **Check all services are available**:
   ```bash
   kubectl get services --namespace=todo-app
   ```

3. **Access the frontend**:
   ```bash
   minikube service frontend --namespace todo-app --url
   # Or check NodePort
   kubectl get service frontend --namespace todo-app
   ```

### 5. Using AI-Assisted Operations

#### With kubectl-ai
1. **Get deployment status**:
   ```bash
   kubectl-ai "show me the status of all deployments in the todo-app namespace"
   ```

2. **Scale frontend pods**:
   ```bash
   kubectl-ai "scale the frontend deployment to 3 replicas in todo-app namespace"
   ```

3. **Debug issues**:
   ```bash
   kubectl-ai "what's wrong with the backend pod if it's not starting?"
   ```

#### With Kagent
1. **Analyze cluster health**:
   ```bash
   # Run Kagent to analyze cluster resources and performance
   kagent analyze --namespace todo-app
   ```

2. **Get optimization recommendations**:
   ```bash
   # Get recommendations for resource optimization
   kagent recommend --namespace todo-app
   ```

## Troubleshooting

### Common Issues

1. **Pods stuck in Pending state**:
   - Check resource requests exceed cluster capacity
   - Verify PersistentVolume availability
   - Use: `kubectl describe pod <pod-name> --namespace todo-app`

2. **Service not accessible**:
   - Verify NodePort range (30000-32767)
   - Check firewall settings
   - Use: `minikube service list`

3. **Database connection issues**:
   - Verify secrets are properly created
   - Check environment variables in backend deployment
   - Use: `kubectl logs <backend-pod-name> --namespace todo-app`

### Helpful Commands

1. **View logs**:
   ```bash
   kubectl logs -f deployment/backend --namespace todo-app
   kubectl logs -f deployment/frontend --namespace todo-app
   ```

2. **Port forward for testing**:
   ```bash
   kubectl port-forward service/frontend 3000:3000 --namespace todo-app
   kubectl port-forward service/backend 8000:8000 --namespace todo-app
   ```

3. **Check configuration**:
   ```bash
   kubectl get configmaps --namespace todo-app
   kubectl get secrets --namespace todo-app
   ```

## Cleanup

1. **Uninstall all Helm releases**:
   ```bash
   helm uninstall frontend --namespace todo-app
   helm uninstall backend --namespace todo-app
   helm uninstall postgresql --namespace todo-app
   ```

2. **Delete namespace**:
   ```bash
   kubectl delete namespace todo-app
   ```

3. **Stop Minikube**:
   ```bash
   minikube stop
   ```

## Next Steps

1. **Customize values** in Helm charts for your specific needs
2. **Set up monitoring** with Prometheus and Grafana
3. **Configure ingress** for proper domain routing
4. **Implement CI/CD** pipeline for automated deployments
5. **Set up proper logging** aggregation and analysis