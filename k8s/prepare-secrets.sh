#!/bin/bash

# Script to prepare secrets for the Todo App deployment

NAMESPACE="todo-app"

echo "Preparing secrets for Todo App in namespace: $NAMESPACE"

# Create the namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Create backend secrets
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: todo-backend-secrets
  namespace: $NAMESPACE
type: Opaque
data:
  cohere-api-key: $(echo -n "${COHERE_API_KEY:-your-cohere-api-key}" | base64)
  better-auth-secret: $(echo -n "${BETTER_AUTH_SECRET:-your-better-auth-secret}" | base64)
EOF

# Create postgres secrets
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: todo-postgres-secrets
  namespace: $NAMESPACE
type: Opaque
data:
  postgres-password: $(echo -n "${POSTGRES_PASSWORD:-password}" | base64)
EOF

echo "Secrets prepared successfully!"
echo "Note: For production, ensure you provide secure values for API keys and passwords."
echo "Example: COHERE_API_KEY='your-key' BETTER_AUTH_SECRET='your-secret' POSTGRES_PASSWORD='secure-pass' ./prepare-secrets.sh"