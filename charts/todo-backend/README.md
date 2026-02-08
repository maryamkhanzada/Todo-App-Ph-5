# Todo Backend Helm Chart

This chart deploys the FastAPI backend for the Todo App with AI Chatbot functionality.

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

The following table lists the configurable parameters of the todo-backend chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.repository` | Image repository | `todo-backend` |
| `image.tag` | Image tag | `""` (defaults to appVersion) |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Service type | `ClusterIP` |
| `service.port` | Service port | `8000` |
| `resources.requests.cpu` | CPU requests | `100m` |
| `resources.requests.memory` | Memory requests | `256Mi` |
| `resources.limits.cpu` | CPU limits | `500m` |
| `resources.limits.memory` | Memory limits | `512Mi` |
| `env.DATABASE_URL` | Database connection URL | `"postgresql://postgres:password@todo-postgres-svc:5432/todo_db"` |
| `env.COHERE_API_KEY` | Cohere API key | `""` |
| `env.BETTER_AUTH_SECRET` | Better Auth secret | `""` |
| `env.BETTER_AUTH_URL` | Better Auth URL | `"http://localhost:8000"` |

## Secrets

The backend chart creates a secret to store sensitive information like API keys. You will need to provide the actual values for these secrets when deploying the chart:

```bash
helm install my-release . \
  --set env.COHERE_API_KEY='your-cohere-api-key' \
  --set env.BETTER_AUTH_SECRET='your-better-auth-secret'
```