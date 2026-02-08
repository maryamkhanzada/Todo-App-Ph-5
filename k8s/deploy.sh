#!/bin/bash

# Deployment script for Todo App on Kubernetes

set -e  # Exit immediately if a command exits with a non-zero status

NAMESPACE="todo-app"

echo "Starting deployment of Todo App to namespace: $NAMESPACE"

# Create the namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply the namespace configuration
kubectl apply -f namespace.yaml

# Prepare secrets
echo "Preparing secrets..."
./prepare-secrets.sh

echo "Deploying PostgreSQL..."
helm upgrade --install todo-postgres ../charts/todo-postgres --namespace $NAMESPACE --wait

echo "Deploying Backend..."
helm upgrade --install todo-backend ../charts/todo-backend --namespace $NAMESPACE --wait

echo "Deploying Frontend..."
helm upgrade --install todo-frontend ../charts/todo-frontend --namespace $NAMESPACE --wait

echo "Deploying using umbrella chart (optional - for coordinated deployment)..."
# Uncomment the next line if you want to deploy using the umbrella chart instead
# helm upgrade --install todo-app ../charts/todo-app --namespace $NAMESPACE --wait

echo "Checking deployment status..."
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get deployments -n $NAMESPACE

echo "Validating deployment..."
echo "Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=todo-app --timeout=300s -n $NAMESPACE || echo "Warning: Not all pods became ready within timeout"

echo "Checking service connectivity..."
kubectl get svc -n $NAMESPACE

echo "Deployment complete!"
echo "To access the frontend, use: minikube service todo-frontend-svc -n $NAMESPACE --url"
echo "To check logs: kubectl logs -l app.kubernetes.io/name=todo-backend -n $NAMESPACE"
echo "To check status: kubectl get all -n $NAMESPACE"