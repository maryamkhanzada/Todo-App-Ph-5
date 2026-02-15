# Quickstart: OKE Deployment Guide

**Feature**: 005-oke-dapr-kafka-infra
**Date**: 2026-02-15

---

## Prerequisites

Before starting, ensure you have:

- [ ] Oracle Cloud account with Always Free credits
- [ ] OCI CLI installed and configured
- [ ] kubectl v1.28+
- [ ] Helm v3.x
- [ ] Terraform v1.5+
- [ ] Docker installed
- [ ] GitHub account with repository access

---

## Quick Deployment (30 minutes)

### Step 1: Clone and Configure (5 min)

```bash
# Clone repository
git clone <repo-url>
cd frontend_todo_app

# Copy environment template
cp infrastructure/terraform/terraform.tfvars.example infrastructure/terraform/terraform.tfvars

# Edit with your OCI details
vim infrastructure/terraform/terraform.tfvars
```

### Step 2: Provision OCI Infrastructure (10 min)

```bash
cd infrastructure/terraform/oci

# Initialize Terraform
terraform init

# Review plan
terraform plan

# Apply infrastructure
terraform apply -auto-approve

# Get kubeconfig
oci ce cluster create-kubeconfig \
  --cluster-id $(terraform output -raw cluster_id) \
  --file $HOME/.kube/config

# Verify cluster access
kubectl get nodes
```

### Step 3: Install Base Components (5 min)

```bash
# Create namespaces
kubectl apply -f infrastructure/k8s/namespaces/

# Install NGINX Ingress
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  -f infrastructure/k8s/ingress/nginx-values.yaml

# Wait for LoadBalancer IP
kubectl get svc -n ingress-nginx -w
```

### Step 4: Deploy Kafka (5 min)

```bash
# Install Strimzi Operator
helm repo add strimzi https://strimzi.io/charts/
helm install strimzi strimzi/strimzi-kafka-operator \
  --namespace kafka

# Deploy Kafka cluster
kubectl apply -f infrastructure/k8s/kafka/kafka-cluster.yaml

# Create topics
kubectl apply -f infrastructure/k8s/kafka/topics.yaml

# Wait for Kafka ready
kubectl wait kafka/todo-kafka --for=condition=Ready --timeout=300s -n kafka
```

### Step 5: Install Dapr (3 min)

```bash
# Install Dapr
helm repo add dapr https://dapr.github.io/helm-charts/
helm install dapr dapr/dapr \
  --namespace dapr-system --create-namespace \
  -f infrastructure/k8s/dapr/dapr-values.yaml

# Deploy Dapr components
kubectl apply -f infrastructure/k8s/dapr/components/
```

### Step 6: Deploy Application (5 min)

```bash
# Create secrets (update with real values)
kubectl create secret generic db-credentials \
  --from-literal=connection-string='<postgres-connection-string>' \
  -n todo-app

kubectl create secret generic ocir-secret \
  --docker-server=<region>.ocir.io \
  --docker-username='<tenancy>/<username>' \
  --docker-password='<auth-token>' \
  -n todo-app

# Deploy application
kubectl apply -f infrastructure/k8s/apps/

# Wait for pods
kubectl get pods -n todo-app -w
```

### Step 7: Configure Ingress (2 min)

```bash
# Get LoadBalancer IP
export LB_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Apply ingress (update host with nip.io)
sed "s/todo.example.com/${LB_IP}.nip.io/" infrastructure/k8s/apps/ingress.yaml | kubectl apply -f -

# Test access
curl http://${LB_IP}.nip.io
```

---

## Verification

### Check All Pods Running

```bash
# All namespaces
kubectl get pods -A | grep -E '(todo-app|kafka|dapr-system)'
```

Expected output:
```
dapr-system    dapr-operator-xxx        1/1   Running
dapr-system    dapr-placement-xxx       1/1   Running
dapr-system    dapr-scheduler-xxx       1/1   Running
dapr-system    dapr-sidecar-injector-xxx  1/1   Running
kafka          strimzi-cluster-operator-xxx  1/1   Running
kafka          todo-kafka-kafka-0       1/1   Running
kafka          todo-kafka-zookeeper-0   1/1   Running
todo-app       todo-frontend-xxx        2/2   Running
todo-app       todo-backend-xxx         2/2   Running
```

### Verify Dapr Sidecar Injection

```bash
kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{range .spec.containers[*]}{.name}{","}{end}{"\n"}{end}'
```

Should show 2 containers per pod (app + daprd).

### Test Kafka Topics

```bash
kubectl get kafkatopics -n kafka
```

Expected:
```
NAME            CLUSTER      PARTITIONS   REPLICATION FACTOR
task-events     todo-kafka   3            1
reminders       todo-kafka   1            1
task-updates    todo-kafka   3            1
```

### Test Application

```bash
# Frontend
curl -s http://${LB_IP}.nip.io | head -20

# Backend health
curl -s http://${LB_IP}.nip.io/api/health
```

---

## Troubleshooting

### Pod Not Starting

```bash
# Check events
kubectl describe pod <pod-name> -n <namespace>

# Check logs
kubectl logs <pod-name> -n <namespace> -c <container>

# For Dapr sidecar logs
kubectl logs <pod-name> -n <namespace> -c daprd
```

### Dapr Sidecar Not Injecting

```bash
# Verify namespace label
kubectl get namespace todo-app -o jsonpath='{.metadata.labels}'

# Should include: dapr.io/enabled: "true"
# If not:
kubectl label namespace todo-app dapr.io/enabled=true
```

### Kafka Connection Issues

```bash
# Check Kafka broker status
kubectl get kafka -n kafka

# Check broker logs
kubectl logs todo-kafka-kafka-0 -n kafka

# Test connectivity from app namespace
kubectl run kafka-test --rm -it --image=confluentinc/cp-kafkacat -n todo-app -- \
  kafkacat -b todo-kafka-kafka-bootstrap.kafka:9092 -L
```

### Ingress Not Routing

```bash
# Check ingress status
kubectl describe ingress todo-ingress -n todo-app

# Check NGINX controller logs
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

---

## Cleanup

```bash
# Delete application
kubectl delete -f infrastructure/k8s/apps/

# Delete Dapr
helm uninstall dapr -n dapr-system
kubectl delete -f infrastructure/k8s/dapr/components/

# Delete Kafka
kubectl delete -f infrastructure/k8s/kafka/
helm uninstall strimzi -n kafka

# Delete Ingress
helm uninstall ingress-nginx -n ingress-nginx

# Delete namespaces
kubectl delete -f infrastructure/k8s/namespaces/

# Destroy OCI infrastructure
cd infrastructure/terraform/oci
terraform destroy -auto-approve
```

---

## Common Operations

### Scale Application

```bash
kubectl scale deployment todo-backend --replicas=2 -n todo-app
```

### Update Application

```bash
# Build and push new image
docker build -t <region>.ocir.io/<tenancy>/todo-backend:v1.1.0 backend/
docker push <region>.ocir.io/<tenancy>/todo-backend:v1.1.0

# Update deployment
kubectl set image deployment/todo-backend backend=<region>.ocir.io/<tenancy>/todo-backend:v1.1.0 -n todo-app

# Watch rollout
kubectl rollout status deployment/todo-backend -n todo-app
```

### View Logs

```bash
# Stream all backend logs
kubectl logs -f -l app=todo-backend -n todo-app --all-containers

# View specific worker
kubectl logs -f deployment/recurring-worker -n todo-app -c recurring-worker
```

### Check Resource Usage

```bash
kubectl top pods -n todo-app
kubectl top nodes
```

---

## Next Steps

1. **Set up CI/CD**: Configure GitHub Actions using `.github/workflows/`
2. **Enable HTTPS**: Add TLS certificate and update ingress
3. **Configure monitoring**: Set up OCI Logging or Prometheus
4. **Test event flows**: Verify all Dapr pub/sub workflows
5. **Apply security**: Enable network policies and RBAC
