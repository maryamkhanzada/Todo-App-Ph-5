# Infrastructure Documentation

## Overview

This directory contains all infrastructure-as-code for deploying the Todo application to Oracle Kubernetes Engine (OKE) with Dapr and Kafka event architecture.

## Directory Structure

```
infrastructure/
├── terraform/
│   └── oci/                    # OCI infrastructure (VCN, OKE, etc.)
├── k8s/
│   ├── namespaces/             # Kubernetes namespace definitions
│   ├── ingress/                # NGINX Ingress Controller config
│   ├── security/               # RBAC, quotas, network policies
│   ├── secrets/                # Secret templates (no values!)
│   ├── apps/                   # Application deployments
│   │   ├── backend/
│   │   ├── frontend/
│   │   └── workers/
│   ├── kafka/                  # Strimzi Kafka configuration
│   ├── dapr/                   # Dapr components
│   └── monitoring/             # Observability configuration
├── helm/
│   └── todo-app/               # Helm chart for the application
└── README.md                   # This file
```

## Prerequisites

Before deploying, ensure you have:

- [ ] OCI account with Always Free tier access
- [ ] OCI CLI installed and configured (`oci setup config`)
- [ ] kubectl installed (v1.28+)
- [ ] Helm installed (v3.x)
- [ ] Terraform installed (v1.5+)
- [ ] Docker installed for local image builds

## Quick Start

### 1. Provision OCI Infrastructure (Terraform)

```bash
# Navigate to Terraform directory
cd infrastructure/terraform/oci

# Copy and configure variables
cp ../terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your OCI credentials

# Initialize and apply
terraform init
terraform plan
terraform apply
```

### 2. Configure kubectl

```bash
# Get kubeconfig from OKE
oci ce cluster create-kubeconfig \
  --cluster-id <cluster-id> \
  --file ~/.kube/config \
  --region <region> \
  --token-version 2.0.0

# Verify access
kubectl get nodes
```

### 3. Deploy Base Infrastructure

```bash
# Create namespaces
kubectl apply -f infrastructure/k8s/namespaces/

# Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  -f infrastructure/k8s/ingress/nginx-values.yaml

# Wait for LoadBalancer IP
kubectl get svc -n ingress-nginx ingress-nginx-controller -w
```

### 4. Deploy Kafka (Strimzi)

```bash
# Install Strimzi operator
helm repo add strimzi https://strimzi.io/charts/
helm install strimzi strimzi/strimzi-kafka-operator \
  --namespace kafka \
  --set watchNamespaces="{kafka}"

# Wait for operator
kubectl wait --for=condition=ready pod \
  -l strimzi.io/kind=cluster-operator \
  -n kafka --timeout=300s

# Deploy Kafka cluster
kubectl apply -f infrastructure/k8s/kafka/kafka-cluster.yaml

# Wait for Kafka to be ready
kubectl wait kafka/todo-kafka --for=condition=Ready \
  --timeout=600s -n kafka

# Create topics
kubectl apply -f infrastructure/k8s/kafka/topics.yaml
```

### 5. Deploy Dapr

```bash
# Install Dapr
helm repo add dapr https://dapr.github.io/helm-charts/
helm install dapr dapr/dapr \
  --namespace dapr-system \
  --create-namespace \
  -f infrastructure/k8s/dapr/dapr-values.yaml

# Wait for Dapr
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/name=dapr \
  -n dapr-system --timeout=300s

# Deploy Dapr components
kubectl apply -f infrastructure/k8s/dapr/components/
```

### 6. Create Secrets

```bash
# Create secrets in todo-app namespace
kubectl create secret generic db-credentials \
  --namespace todo-app \
  --from-literal=connection-string='postgresql://user:pass@host:5432/db'

kubectl create secret generic jwt-secret \
  --namespace todo-app \
  --from-literal=secret-key='your-jwt-secret'

kubectl create secret generic cohere-api-key \
  --namespace todo-app \
  --from-literal=api-key='your-cohere-key'

# Create OCIR pull secret
kubectl create secret docker-registry ocir-secret \
  --namespace todo-app \
  --docker-server=<region>.ocir.io \
  --docker-username='<tenancy>/<username>' \
  --docker-password='<auth-token>'
```

### 7. Deploy Application

```bash
# Apply security configuration
kubectl apply -f infrastructure/k8s/security/resource-quotas.yaml
kubectl apply -f infrastructure/k8s/security/rbac.yaml

# Deploy backend and frontend
kubectl apply -f infrastructure/k8s/apps/backend/
kubectl apply -f infrastructure/k8s/apps/frontend/
kubectl apply -f infrastructure/k8s/apps/ingress.yaml

# Deploy workers
kubectl apply -f infrastructure/k8s/apps/workers/

# Verify deployment
kubectl get pods -n todo-app
```

### 8. Access Application

```bash
# Get ingress IP
INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "Application URL: http://${INGRESS_IP}/"
echo "API URL: http://${INGRESS_IP}/api"
```

## Deployment with Helm

Alternatively, use the Helm chart for deployment:

```bash
# Development
helm install todo-app infrastructure/helm/todo-app \
  -f infrastructure/helm/todo-app/values-dev.yaml \
  --namespace todo-app

# Production
helm install todo-app infrastructure/helm/todo-app \
  -f infrastructure/helm/todo-app/values-prod.yaml \
  --namespace todo-app
```

## CI/CD

GitHub Actions workflows are in `.github/workflows/`:

- `ci.yaml` - Build and test on all branches
- `cd-dev.yaml` - Deploy to development on push to main
- `cd-prod.yaml` - Deploy to production (manual trigger)

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `OCI_CLI_USER` | OCI user OCID |
| `OCI_CLI_TENANCY` | OCI tenancy OCID |
| `OCI_CLI_FINGERPRINT` | API key fingerprint |
| `OCI_CLI_KEY_CONTENT` | Private key content |
| `OCI_CLI_REGION` | OCI region (e.g., us-phoenix-1) |
| `OCI_TENANCY_NAMESPACE` | OCIR tenancy namespace |
| `OCI_USERNAME` | OCI username |
| `OCI_AUTH_TOKEN` | OCIR auth token |
| `OKE_CLUSTER_ID` | OKE cluster OCID |

## Rollback Procedures

### Application Rollback

```bash
# View rollout history
kubectl rollout history deployment/todo-backend -n todo-app

# Rollback to previous version
kubectl rollout undo deployment/todo-backend -n todo-app
kubectl rollout undo deployment/todo-frontend -n todo-app

# Rollback to specific revision
kubectl rollout undo deployment/todo-backend --to-revision=2 -n todo-app

# Verify rollback
kubectl rollout status deployment/todo-backend -n todo-app
```

### Terraform Rollback

```bash
# View state history
terraform state list

# Restore from backup
terraform state pull > current-state.json
# ... restore previous state
terraform state push previous-state.json
```

### Kafka Topic Recovery

```bash
# Topics are defined in code - reapply if needed
kubectl apply -f infrastructure/k8s/kafka/topics.yaml
```

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n todo-app

# Check pod logs
kubectl logs <pod-name> -n todo-app

# Check events
kubectl get events -n todo-app --sort-by='.lastTimestamp'
```

### Dapr Sidecar Issues

```bash
# Check Dapr sidecar logs
kubectl logs <pod-name> -c daprd -n todo-app

# Verify Dapr components
kubectl get components -n todo-app
```

### Kafka Connection Issues

```bash
# Check Kafka cluster status
kubectl get kafka -n kafka

# Check broker pods
kubectl get pods -n kafka -l strimzi.io/kind=Kafka

# Test Kafka connectivity
kubectl run kafka-client --rm -it \
  --image=confluentinc/cp-kafka:7.5.0 \
  --namespace kafka \
  -- kafka-topics --bootstrap-server todo-kafka-kafka-bootstrap:9092 --list
```

### Ingress Not Working

```bash
# Check ingress controller
kubectl get svc -n ingress-nginx

# Check ingress resource
kubectl describe ingress todo-ingress -n todo-app

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

## Monitoring

```bash
# Check resource usage
kubectl top pods -n todo-app

# Check HPA status
kubectl get hpa -n todo-app

# View structured logs
kubectl logs -n todo-app deployment/todo-backend -f | jq .
```

## Security Hardening

After initial deployment, apply network policies:

```bash
kubectl apply -f infrastructure/k8s/security/network-policies.yaml
```

For HTTPS, create TLS certificate and update ingress:

```bash
# Create TLS secret
kubectl create secret tls todo-tls-secret \
  --namespace todo-app \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key

# Update ingress
kubectl apply -f infrastructure/k8s/apps/ingress.yaml
```

## Resource Costs

Always Free tier considerations:
- 1 OKE cluster
- 2 Ampere A1 OCPUs, 8GB RAM
- 50GB boot volume
- 1 Flexible Load Balancer (10 Mbps)
- OCIR image storage

Monitor usage in OCI Console to avoid unexpected charges.

## Support

For issues:
1. Check troubleshooting section above
2. Review OKE documentation
3. Check Dapr/Strimzi documentation
4. Open GitHub issue
