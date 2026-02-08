#!/bin/bash

# Script to check resource utilization of the Todo App deployment

NAMESPACE="todo-app"

echo "Checking resource utilization for Todo App in namespace: $NAMESPACE"

# Check if kubectl top is available
if ! command -v kubectl top &> /dev/null; then
    echo "Warning: kubectl top plugin not available. Please install metrics-server:"
    echo "  minikube addons enable metrics-server"
    echo "Skipping resource utilization check."
    exit 0
fi

echo ""
echo "=== Resource Utilization Summary ==="
echo ""

echo "Pod Resource Usage:"
kubectl top pods -n $NAMESPACE

echo ""
echo "Node Resource Usage:"
kubectl top nodes

echo ""
echo "Detailed Pod Information:"
kubectl describe pods -n $NAMESPACE

echo ""
echo "Resource Quotas (if configured):"
kubectl describe quota -n $NAMESPACE 2>/dev/null || echo "No resource quotas configured"

echo ""
echo "=== Resource Compliance Check ==="
echo ""

# Check if resources are within acceptable ranges
echo "Checking resource compliance..."

# Get resource requests and limits from deployments
FRONTEND_CPU_LIMIT=$(kubectl get deployment todo-frontend -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].resources.limits.cpu}' 2>/dev/null)
FRONTEND_MEM_LIMIT=$(kubectl get deployment todo-frontend -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].resources.limits.memory}' 2>/dev/null)
BACKEND_CPU_LIMIT=$(kubectl get deployment todo-backend -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].resources.limits.cpu}' 2>/dev/null)
BACKEND_MEM_LIMIT=$(kubectl get deployment todo-backend -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].resources.limits.memory}' 2>/dev/null)
POSTGRES_CPU_LIMIT=$(kubectl get deployment todo-postgres -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].resources.limits.cpu}' 2>/dev/null)
POSTGRES_MEM_LIMIT=$(kubectl get deployment todo-postgres -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].resources.limits.memory}' 2>/dev/null)

echo "Deployed Resource Limits:"
echo "  Frontend - CPU: $FRONTEND_CPU_LIMIT, Memory: $FRONTEND_MEM_LIMIT"
echo "  Backend - CPU: $BACKEND_CPU_LIMIT, Memory: $BACKEND_MEM_LIMIT"
echo "  Postgres - CPU: $POSTGRES_CPU_LIMIT, Memory: $POSTGRES_MEM_LIMIT"

# Compare with specification requirements
echo ""
echo "Specification Requirements vs Actual:"
echo "  Frontend: 500m CPU limit, 512Mi memory limit"
echo "  Backend: 500m CPU limit, 512Mi memory limit"
echo "  Postgres: 1 CPU limit, 1Gi memory limit"

echo ""
echo "=== Recommendations ==="
echo ""

# Get current resource usage
FRONTEND_CPU_USAGE=$(kubectl top pod -n $NAMESPACE -l app.kubernetes.io/name=todo-frontend --no-headers 2>/dev/null | awk '{print $2}' | head -1)
FRONTEND_MEM_USAGE=$(kubectl top pod -n $NAMESPACE -l app.kubernetes.io/name=todo-frontend --no-headers 2>/dev/null | awk '{print $3}' | head -1)
BACKEND_CPU_USAGE=$(kubectl top pod -n $NAMESPACE -l app.kubernetes.io/name=todo-backend --no-headers 2>/dev/null | awk '{print $2}' | head -1)
BACKEND_MEM_USAGE=$(kubectl top pod -n $NAMESPACE -l app.kubernetes.io/name=todo-backend --no-headers 2>/dev/null | awk '{print $3}' | head -1)
POSTGRES_CPU_USAGE=$(kubectl top pod -n $NAMESPACE -l app.kubernetes.io/name=todo-postgres --no-headers 2>/dev/null | awk '{print $2}' | head -1)
POSTGRES_MEM_USAGE=$(kubectl top pod -n $NAMESPACE -l app.kubernetes.io/name=todo-postgres --no-headers 2>/dev/null | awk '{print $3}' | head -1)

echo "Current Resource Usage:"
echo "  Frontend - CPU: $FRONTEND_CPU_USAGE, Memory: $FRONTEND_MEM_USAGE"
echo "  Backend - CPU: $BACKEND_CPU_USAGE, Memory: $BACKEND_MEM_USAGE"
echo "  Postgres - CPU: $POSTGRES_CPU_USAGE, Memory: $POSTGRES_MEM_USAGE"

echo ""
echo "Analysis:"
if [[ "$FRONTEND_CPU_USAGE" =~ ^[0-9]+ ]] && [[ "$FRONTEND_CPU_LIMIT" =~ ^([0-9]+)m?$ ]]; then
    USAGE=${BASH_REMATCH[0]}
    LIMIT=${BASH_REMATCH[1]}
    if [ "$USAGE" -lt $((LIMIT * 70 / 100)) ]; then
        echo "  - Frontend CPU usage is low, consider reducing limits if consistently underutilized"
    elif [ "$USAGE" -gt $((LIMIT * 90 / 100)) ]; then
        echo "  - Frontend CPU usage is high, consider increasing limits if performance issues occur"
    fi
fi

if [[ "$BACKEND_CPU_USAGE" =~ ^[0-9]+ ]] && [[ "$BACKEND_CPU_LIMIT" =~ ^([0-9]+)m?$ ]]; then
    USAGE=${BASH_REMATCH[0]}
    LIMIT=${BASH_REMATCH[1]}
    if [ "$USAGE" -lt $((LIMIT * 70 / 100)) ]; then
        echo "  - Backend CPU usage is low, consider reducing limits if consistently underutilized"
    elif [ "$USAGE" -gt $((LIMIT * 90 / 100)) ]; then
        echo "  - Backend CPU usage is high, consider increasing limits if performance issues occur"
    fi
fi

if [[ "$POSTGRES_CPU_USAGE" =~ ^[0-9]+ ]] && [[ "$POSTGRES_CPU_LIMIT" =~ ^([0-9]+)m?$ ]]; then
    USAGE=${BASH_REMATCH[0]}
    LIMIT=${BASH_REMATCH[1]}
    if [ "$USAGE" -lt $((LIMIT * 70 / 100)) ]; then
        echo "  - Postgres CPU usage is low, consider reducing limits if consistently underutilized"
    elif [ "$USAGE" -gt $((LIMIT * 90 / 100)) ]; then
        echo "  - Postgres CPU usage is high, consider increasing limits if performance issues occur"
    fi
fi

echo ""
echo "Resource utilization check completed!"
echo "For more detailed analysis, use: kubectl describe nodes"