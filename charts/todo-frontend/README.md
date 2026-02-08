# Todo Frontend Helm Chart

This chart deploys the Next.js frontend for the Todo App with AI Chatbot functionality.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+

## Installing the Chart

To install the chart with the release name `my-release`:

```bash
helm install my-release .
```

## Uninstalling the Chart

To uninstall the `my-release` deployment:

```bash
helm delete my-release
```

## Configuration

The following table lists the configurable parameters of the todo-frontend chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.repository` | Image repository | `todo-frontend` |
| `image.tag` | Image tag | `""` (defaults to appVersion) |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Service type | `NodePort` |
| `service.port` | Service port | `3000` |
| `resources.requests.cpu` | CPU requests | `100m` |
| `resources.requests.memory` | Memory requests | `256Mi` |
| `resources.limits.cpu` | CPU limits | `500m` |
| `resources.limits.memory` | Memory limits | `512Mi` |
| `env.NEXT_PUBLIC_API_URL` | Backend API URL | `"http://todo-backend-svc:8000"` |
| `env.NEXT_PUBLIC_BASE_URL` | Frontend base URL | `"http://localhost:3000"` |

## Accessing the Application

Once deployed, the frontend application will be accessible via NodePort. You can find the exposed port using:

```bash
kubectl get svc
```

Then access the application at `http://<minikube-ip>:<nodeport>`.