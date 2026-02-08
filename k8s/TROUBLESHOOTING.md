# Troubleshooting Guide for Todo App Kubernetes Deployment

This guide provides solutions for common issues encountered when deploying and running the Todo App on Kubernetes.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Deployment Problems](#deployment-problems)
3. [Service Connectivity Issues](#service-connectivity-issues)
4. [Database Connection Problems](#database-connection-problems)
5. [Application Errors](#application-errors)
6. [Performance Issues](#performance-issues)
7. [Resource Problems](#resource-problems)
8. [Security Issues](#security-issues)
9. [Cleanup](#cleanup)

## Installation Issues

### Helm Command Not Found

**Problem**: `helm` command is not recognized.

**Solution**: Install Helm following the official documentation:
```bash
# On macOS
brew install helm

# On Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# On Windows (using Chocolatey)
choco install kubernetes-helm
```

### kubectl Command Not Found

**Problem**: `kubectl` command is not recognized.

**Solution**: Install kubectl:
```bash
# On macOS
brew install kubectl

# On Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# On Windows (using Chocolatey)
choco install kubernetes-cli
```

### Minikube Not Starting

**Problem**: Minikube fails to start or hangs.

**Solution**:
1. Check if another hypervisor is running (VirtualBox, VMware, Hyper-V)
2. Try starting with a different driver:
   ```bash
   minikube start --driver=docker
   # or
   minikube start --driver=hyperv  # Windows
   minikube start --driver=hyperkit  # macOS
   ```
3. Increase allocated resources:
   ```bash
   minikube start --cpus=4 --memory=8192 --disk-size=20g
   ```

## Deployment Problems

### Pods Stuck in Pending State

**Problem**: Pods remain in `Pending` state indefinitely.

**Diagnosis**:
```bash
kubectl describe pods -n todo-app
```

**Solutions**:
1. Check if you have sufficient resources:
   ```bash
   kubectl describe nodes
   ```
2. Check if PersistentVolumes are available (for PostgreSQL):
   ```bash
   kubectl get pv,pvc -n todo-app
   ```
3. Check if there are node selector or affinity constraints preventing scheduling:
   ```bash
   kubectl get pods -n todo-app -o yaml
   ```

### Pods in CrashLoopBackOff

**Problem**: Pods continuously crash and restart.

**Diagnosis**:
```bash
kubectl logs <pod-name> -n todo-app
kubectl describe pod <pod-name> -n todo-app
```

**Solutions**:
1. Check for missing environment variables or incorrect values
2. Verify database connection strings
3. Check if required secrets are available
4. Look for application-specific error messages in logs

### Helm Installation Failed

**Problem**: Helm install/upgrade command fails.

**Diagnosis**:
```bash
helm status <release-name> -n todo-app
```

**Solutions**:
1. Check if the namespace exists:
   ```bash
   kubectl get namespace todo-app
   ```
2. Verify chart validity:
   ```bash
   helm lint ../charts/<chart-name>
   ```
3. Check for resource conflicts:
   ```bash
   kubectl get all -n todo-app
   ```
4. Rollback to previous version if needed:
   ```bash
   helm rollback <release-name> -n todo-app
   ```

## Service Connectivity Issues

### Frontend Service Not Accessible

**Problem**: Cannot access the frontend application.

**Diagnosis**:
```bash
kubectl get svc -n todo-app
minikube ip
```

**Solutions**:
1. For NodePort services, access via `minikube ip` + NodePort:
   ```bash
   minikube service todo-frontend-svc -n todo-app --url
   ```
2. Check if the service is correctly configured:
   ```bash
   kubectl describe svc todo-frontend-svc -n todo-app
   ```
3. Verify that the deployment is running and pods are ready:
   ```bash
   kubectl get pods -n todo-app
   ```

### Backend API Not Reachable

**Problem**: Frontend cannot connect to backend API.

**Diagnosis**:
```bash
kubectl logs -l app.kubernetes.io/name=todo-frontend -n todo-app
kubectl get endpoints todo-backend-svc -n todo-app
```

**Solutions**:
1. Check if the backend service is running:
   ```bash
   kubectl get svc todo-backend-svc -n todo-app
   ```
2. Verify that the frontend is using the correct backend URL in environment variables
3. Check if there are network policies blocking the connection

### Database Connection Fails

**Problem**: Backend cannot connect to the database.

**Diagnosis**:
```bash
kubectl logs -l app.kubernetes.io/name=todo-backend -n todo-app
kubectl get svc todo-postgres-svc -n todo-app
```

**Solutions**:
1. Verify database service is running:
   ```bash
   kubectl get pods -l app.kubernetes.io/name=todo-postgres -n todo-app
   ```
2. Check if database credentials are correct in secrets:
   ```bash
   kubectl describe secret todo-postgres-secrets -n todo-app
   ```
3. Verify database connection string format in backend configuration

## Database Connection Problems

### PostgreSQL Pod in CrashLoopBackOff

**Problem**: PostgreSQL pod keeps crashing.

**Diagnosis**:
```bash
kubectl logs -l app.kubernetes.io/name=todo-postgres -n todo-app
kubectl describe pod -l app.kubernetes.io/name=todo-postgres -n todo-app
```

**Solutions**:
1. Check if PersistentVolume is available and bound:
   ```bash
   kubectl get pv,pvc -n todo-app
   ```
2. Verify database credentials in secrets
3. Check if there's an issue with the PostgreSQL configuration
4. Check if there's sufficient disk space

### Database Initialization Failure

**Problem**: Database doesn't initialize properly.

**Diagnosis**:
```bash
kubectl exec -it <postgres-pod> -n todo-app -- psql -U postgres -c "\l"
```

**Solutions**:
1. Check if the database name in the connection string matches the configured database
2. Verify that the database user has proper permissions
3. Look for initialization errors in PostgreSQL logs

## Application Errors

### Health Check Failures

**Problem**: Kubernetes reports health check failures.

**Diagnosis**:
```bash
kubectl describe pod <pod-name> -n todo-app
```

**Solutions**:
1. Check if the application is listening on the correct port
2. Verify that the health check endpoint is accessible
3. Adjust health check parameters (initial delay, timeout, etc.) in values.yaml

### API Key Issues

**Problem**: Application reports invalid or missing API keys.

**Diagnosis**:
```bash
kubectl describe secret todo-backend-secrets -n todo-app
kubectl logs -l app.kubernetes.io/name=todo-backend -n todo-app
```

**Solutions**:
1. Verify that secrets were created with correct values:
   ```bash
   kubectl delete secret todo-backend-secrets -n todo-app
   # Re-run prepare-secrets.sh with correct values
   ```
2. Check that the backend is correctly reading the secrets
3. Ensure API keys are valid and have necessary permissions

### Authentication Problems

**Problem**: Users cannot log in or authentication fails.

**Diagnosis**:
```bash
kubectl logs -l app.kubernetes.io/name=todo-backend -n todo-app
```

**Solutions**:
1. Verify that the auth secret is correctly set
2. Check if the auth URL is correctly configured
3. Ensure that the frontend is using the correct backend URL for auth requests

## Performance Issues

### Slow Response Times

**Problem**: Application responds slowly.

**Diagnosis**:
```bash
kubectl top pods -n todo-app
kubectl describe pod <slow-pod> -n todo-app
```

**Solutions**:
1. Increase resource limits in values.yaml:
   ```bash
   # Edit the resource section in values.yaml
   resources:
     limits:
       cpu: "1"
       memory: "1Gi"
     requests:
       cpu: "200m"
       memory: "512Mi"
   ```
2. Scale up deployments:
   ```bash
   kubectl scale deployment todo-backend --replicas=2 -n todo-app
   ```
3. Check for database performance issues

### High Memory Usage

**Problem**: Containers are using more memory than allocated.

**Solutions**:
1. Increase memory limits in values.yaml
2. Check for memory leaks in application logs
3. Monitor memory usage over time:
   ```bash
   kubectl top pods -n todo-app --containers
   ```

### High CPU Usage

**Problem**: Containers are using high CPU.

**Solutions**:
1. Increase CPU limits in values.yaml
2. Optimize application performance
3. Scale horizontally instead of vertically:
   ```bash
   kubectl scale deployment todo-frontend --replicas=2 -n todo-app
   ```

## Resource Problems

### Insufficient CPU/Memory

**Problem**: Pods fail to schedule due to insufficient resources.

**Diagnosis**:
```bash
kubectl describe nodes
kubectl describe pod <failed-pod> -n todo-app
```

**Solutions**:
1. Increase Minikube resources:
   ```bash
   minikube delete
   minikube start --cpus=4 --memory=8192 --disk-size=20g
   ```
2. Reduce resource requests in values.yaml
3. Remove unused resources from the cluster

### Persistent Volume Issues

**Problem**: PostgreSQL fails to start due to PV/PVC problems.

**Diagnosis**:
```bash
kubectl get pv,pvc -n todo-app
kubectl describe pvc <pvc-name> -n todo-app
```

**Solutions**:
1. Check if the storage class is available:
   ```bash
   kubectl get storageclass
   ```
2. For Minikube, ensure dynamic provisioning is enabled:
   ```bash
   minikube addons enable storage-provisioner
   ```
3. Manually create PV if dynamic provisioning fails

## Security Issues

### Permission Denied

**Problem**: Containers fail to start with permission errors.

**Solutions**:
1. Check if securityContext is properly configured in values.yaml
2. Verify that the container user has necessary permissions
3. Review security policies applied to the namespace

### Secret Not Found

**Problem**: Application fails because secrets are not available.

**Diagnosis**:
```bash
kubectl get secrets -n todo-app
```

**Solutions**:
1. Recreate secrets using prepare-secrets.sh
2. Verify secret names match what's referenced in deployments
3. Check if the service account has permission to access secrets

## Cleanup

### Removing the Deployment

To completely remove the deployment:

```bash
# Uninstall Helm releases
helm uninstall todo-frontend -n todo-app
helm uninstall todo-backend -n todo-app
helm uninstall todo-postgres -n todo-app
helm uninstall todo-app -n todo-app  # if using umbrella chart

# Remove namespace
kubectl delete namespace todo-app

# Clean up any remaining resources
kubectl delete pvc -l app.kubernetes.io/instance=todo-app -n todo-app
```

### Resetting Minikube

To reset Minikube completely:

```bash
minikube delete
minikube start --cpus=4 --memory=8192 --disk-size=20g
```

## Getting Help

If you encounter issues not covered in this guide:

1. Check the application logs:
   ```bash
   kubectl logs -l app.kubernetes.io/name=todo-frontend -n todo-app
   kubectl logs -l app.kubernetes.io/name=todo-backend -n todo-app
   kubectl logs -l app.kubernetes.io/name=todo-postgres -n todo-app
   ```

2. Describe problematic resources:
   ```bash
   kubectl describe <resource-type> <resource-name> -n todo-app
   ```

3. Check events for the namespace:
   ```bash
   kubectl get events -n todo-app --sort-by='.lastTimestamp'
   ```

4. Use AI-assisted tools if available:
   ```bash
   kubectl ai "explain why pods in todo-app namespace are failing"
   ```