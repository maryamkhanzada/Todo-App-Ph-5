# Kubernetes Deployment for AI Todo Chatbot

This directory contains all the necessary files and scripts to deploy the AI Todo Chatbot application on Kubernetes using Helm charts.

## Overview

The deployment consists of:
- **Frontend**: Next.js application (todo-frontend)
- **Backend**: FastAPI application with AI features (todo-backend)
- **Database**: PostgreSQL database (todo-postgres)

## Directory Structure

```
k8s/
├── namespace.yaml          # Namespace configuration
├── deploy.sh              # Main deployment script
├── prepare-secrets.sh     # Secrets preparation script
├── validate-deployment.sh # Deployment validation script
├── check-resources.sh     # Resource utilization checker
├── build-images.sh        # Docker image build script (in docker/)
├── DEPLOYMENT_GUIDE.md    # Comprehensive deployment guide
├── TROUBLESHOOTING.md     # Troubleshooting guide
├── ai-operations.md       # AI-assisted operations guide
└── ...                    # Additional configuration files
```

## Quick Start

1. **Prerequisites**: Ensure you have Minikube, kubectl, Helm, and Docker installed
2. **Start Minikube**:
   ```bash
   minikube start --cpus=4 --memory=8192 --disk-size=20g
   ```
3. **Navigate to k8s directory**:
   ```bash
   cd k8s
   chmod +x *.sh
   ```
4. **Build Docker images** (from docker directory):
   ```bash
   cd ../docker
   chmod +x build-images.sh
   ./build-images.sh
   ```
5. **Deploy the application**:
   ```bash
   cd ../k8s
   ./deploy.sh
   ```
6. **Access the application**:
   ```bash
   minikube service todo-frontend-svc -n todo-app --url
   ```

## Helm Charts

Located in the `charts/` directory:
- `todo-frontend/` - Frontend Next.js application chart
- `todo-backend/` - Backend FastAPI application chart
- `todo-postgres/` - PostgreSQL database chart
- `todo-app/` - Umbrella chart coordinating all components

## Configuration

- All components are configured via their respective `values.yaml` files
- Resource requests/limits are set according to specifications
- Environment variables are configured for proper service communication
- Health checks and readiness probes are implemented

## Validation

Run the validation script to verify your deployment:
```bash
./validate-deployment.sh
```

## Troubleshooting

Refer to [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions to common issues.

## AI-Assisted Operations

This deployment supports AI-assisted operations using kubectl-ai and Kagent. See [ai-operations.md](ai-operations.md) for more information.

## Security

- API keys and sensitive data are stored in Kubernetes secrets
- Network policies can be enabled to restrict traffic between services
- Applications run with minimal required privileges

## Next Steps

1. Set up monitoring and logging
2. Configure SSL certificates for production
3. Implement backup and disaster recovery
4. Set up CI/CD pipelines