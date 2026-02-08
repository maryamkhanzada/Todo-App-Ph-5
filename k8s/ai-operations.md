# AI-Assisted Operations Guide

This document outlines how to use AI-assisted DevOps tools for managing the Todo App deployment.

## Available AI Tools

### 1. kubectl-ai
AI-powered Kubernetes command-line interface that can help with:
- Generating kubectl commands based on natural language
- Explaining Kubernetes resources
- Troubleshooting deployments
- Scaling operations

### 2. Kagent
Kubernetes AI assistant for:
- Cluster health analysis
- Resource optimization insights
- Performance recommendations
- Anomaly detection

## Installation

### Installing kubectl-ai
```bash
# Install kubectl-ai plugin
curl -sL https://raw.githubusercontent.com/kaasops/kubectl-ai/main/install.sh | bash
```

### Installing Kagent
```bash
# Kagent installation varies by platform
# Follow the official documentation for installation
```

## Common Operations

### 1. Deployment Operations
```bash
# Deploy using natural language
kubectl ai "deploy todo-app from helm chart in todo-app namespace"

# Check deployment status
kubectl ai "show status of all pods in todo-app namespace"
```

### 2. Scaling Operations
```bash
# Scale frontend to 3 replicas
kubectl ai "scale todo-frontend deployment to 3 replicas in todo-app namespace"

# Auto-scale based on CPU
kubectl ai "create horizontal pod autoscaler for todo-backend with target CPU 70%"
```

### 3. Troubleshooting
```bash
# Diagnose failed pods
kubectl ai "analyze why pods in todo-app namespace are failing"

# Check resource usage
kubectl ai "show resource usage for todo-app deployments"
```

### 4. Service Operations
```bash
# Port forward to frontend
kubectl ai "port-forward todo-frontend service to localhost:3000"

# Get service endpoints
kubectl ai "get external IP for todo-frontend service"
```

## Best Practices

1. Always verify AI-generated commands before executing in production
2. Use AI tools to learn Kubernetes concepts and commands
3. Combine AI assistance with traditional monitoring tools
4. Document AI recommendations for future reference
5. Validate that AI-recommended best practices align with your organization's policies

## Fallback Procedures

If AI tools are unavailable, fall back to traditional kubectl commands:

```bash
# Traditional deployment
helm upgrade --install todo-app ../charts/todo-app --namespace todo-app

# Traditional scaling
kubectl scale deployment todo-frontend --replicas=3 -n todo-app

# Traditional troubleshooting
kubectl get pods -n todo-app
kubectl describe pod <pod-name> -n todo-app
kubectl logs <pod-name> -n todo-app
```

## Integration with Deployment Scripts

The deployment scripts can be enhanced with AI tools:

```bash
# Enhanced deployment script using AI
kubectl ai "apply namespace todo-app" && \
kubectl ai "upgrade helm chart todo-postgres in charts/todo-postgres with namespace todo-app" && \
kubectl ai "upgrade helm chart todo-backend in charts/todo-backend with namespace todo-app" && \
kubectl ai "upgrade helm chart todo-frontend in charts/todo-frontend with namespace todo-app"
```