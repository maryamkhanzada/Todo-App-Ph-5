#!/bin/bash

# Validation script for Todo App deployment

NAMESPACE="todo-app"
TIMEOUT=300  # 5 minutes timeout

echo "Starting validation of Todo App deployment in namespace: $NAMESPACE"

# Function to check if pods are running
check_pods() {
    echo "Checking if all pods are running and healthy..."
    local count=0
    while [ $count -lt $TIMEOUT ]; do
        local not_ready=$(kubectl get pods -n $NAMESPACE --no-headers | awk '$3 != "Running" {print $0}' | wc -l)
        if [ "$not_ready" -eq 0 ]; then
            echo "✓ All pods are running"
            return 0
        fi

        echo "Waiting for pods to be ready... ($count/$TIMEOUT)"
        sleep 5
        ((count += 5))
    done

    echo "✗ Timeout waiting for pods to be ready"
    kubectl get pods -n $NAMESPACE
    return 1
}

# Function to check services
check_services() {
    echo "Checking services..."
    local frontend_svc=$(kubectl get svc todo-frontend-svc -n $NAMESPACE --no-headers -o custom-columns=":spec.type" 2>/dev/null)
    local backend_svc=$(kubectl get svc todo-backend-svc -n $NAMESPACE --no-headers -o custom-columns=":spec.type" 2>/dev/null)
    local postgres_svc=$(kubectl get svc todo-postgres-svc -n $NAMESPACE --no-headers -o custom-columns=":spec.type" 2>/dev/null)

    if [ -n "$frontend_svc" ] && [ "$frontend_svc" = "NodePort" ]; then
        echo "✓ Frontend service is NodePort"
    else
        echo "✗ Frontend service is not NodePort: $frontend_svc"
        return 1
    fi

    if [ -n "$backend_svc" ] && [ "$backend_svc" = "ClusterIP" ]; then
        echo "✓ Backend service is ClusterIP"
    else
        echo "✗ Backend service is not ClusterIP: $backend_svc"
        return 1
    fi

    if [ -n "$postgres_svc" ] && [ "$postgres_svc" = "ClusterIP" ]; then
        echo "✓ Postgres service is ClusterIP"
    else
        echo "✗ Postgres service is not ClusterIP: $postgres_svc"
        return 1
    fi

    echo "✓ All services are configured correctly"
    return 0
}

# Function to check deployments
check_deployments() {
    echo "Checking deployments..."
    local frontend_replicas=$(kubectl get deployment todo-frontend -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
    local backend_replicas=$(kubectl get deployment todo-backend -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
    local postgres_replicas=$(kubectl get deployment todo-postgres -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')

    if [ "$frontend_replicas" -gt 0 ]; then
        echo "✓ Frontend deployment has $frontend_replicas ready replica(s)"
    else
        echo "✗ Frontend deployment has 0 ready replicas"
        return 1
    fi

    if [ "$backend_replicas" -gt 0 ]; then
        echo "✓ Backend deployment has $backend_replicas ready replica(s)"
    else
        echo "✗ Backend deployment has 0 ready replicas"
        return 1
    fi

    if [ "$postgres_replicas" -gt 0 ]; then
        echo "✓ Postgres deployment has $postgres_replicas ready replica(s)"
    else
        echo "✗ Postgres deployment has 0 ready replicas"
        return 1
    fi

    return 0
}

# Function to test connectivity
test_connectivity() {
    echo "Testing service connectivity..."

    # Test if we can access the backend health endpoint
    echo "Testing backend health endpoint..."
    local backend_pod=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=todo-backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    if [ -n "$backend_pod" ]; then
        # Try to curl the health endpoint from inside the pod
        local health_status=$(kubectl exec $backend_pod -n $NAMESPACE -- curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "error")
        if [ "$health_status" = "200" ]; then
            echo "✓ Backend health check passed (HTTP $health_status)"
        else
            echo "✗ Backend health check failed (HTTP $health_status)"
            return 1
        fi
    else
        echo "? Could not test backend connectivity - no backend pod found"
    fi

    return 0
}

# Function to validate Helm releases
validate_helm_releases() {
    echo "Validating Helm releases..."

    local releases=$(helm list -n $NAMESPACE | grep -E "(todo-frontend|todo-backend|todo-postgres)" | wc -l)
    if [ "$releases" -ge 3 ]; then
        echo "✓ Found $releases Helm releases in $NAMESPACE namespace"
        helm list -n $NAMESPACE
    else
        echo "✗ Expected at least 3 Helm releases, found $releases"
        helm list -n $NAMESPACE
        return 1
    fi

    return 0
}

# Run all checks
echo "Running validation checks..."
echo "============================"

if ! check_pods; then
    echo "✗ Pod check failed"
    exit 1
fi

if ! check_services; then
    echo "✗ Service check failed"
    exit 1
fi

if ! check_deployments; then
    echo "✗ Deployment check failed"
    exit 1
fi

if ! test_connectivity; then
    echo "✗ Connectivity test failed"
    exit 1
fi

if ! validate_helm_releases; then
    echo "✗ Helm release validation failed"
    exit 1
fi

echo ""
echo "🎉 All validation checks passed!"
echo "✅ Todo App deployment is successful and operational"
echo ""
echo "To access the frontend application:"
echo "  minikube service todo-frontend-svc -n $NAMESPACE --url"
echo ""
echo "To view all resources:"
echo "  kubectl get all -n $NAMESPACE"
echo ""
echo "To check logs:"
echo "  kubectl logs -l app.kubernetes.io/name=todo-backend -n $NAMESPACE"