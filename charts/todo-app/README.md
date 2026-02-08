# Todo App Helm Chart

This is an umbrella chart that deploys the complete Todo App with AI Chatbot functionality, including the frontend, backend, and PostgreSQL database.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+

## Dependencies

This chart has the following dependencies:
- todo-frontend
- todo-backend
- todo-postgres

These dependencies are managed in the `Chart.yaml` file.

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

The following table lists the configurable parameters of the todo-app chart and their default values.

### Todo Frontend Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `todo-frontend.enabled` | Enable frontend deployment | `true` |
| `todo-frontend.service.type` | Service type for frontend | `NodePort` |
| `todo-frontend.service.port` | Service port for frontend | `3000` |
| `todo-frontend.resources.requests.cpu` | CPU requests for frontend | `100m` |
| `todo-frontend.resources.requests.memory` | Memory requests for frontend | `256Mi` |
| `todo-frontend.resources.limits.cpu` | CPU limits for frontend | `500m` |
| `todo-frontend.resources.limits.memory` | Memory limits for frontend | `512Mi` |

### Todo Backend Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `todo-backend.enabled` | Enable backend deployment | `true` |
| `todo-backend.service.type` | Service type for backend | `ClusterIP` |
| `todo-backend.service.port` | Service port for backend | `8000` |
| `todo-backend.resources.requests.cpu` | CPU requests for backend | `100m` |
| `todo-backend.resources.requests.memory` | Memory requests for backend | `256Mi` |
| `todo-backend.resources.limits.cpu` | CPU limits for backend | `500m` |
| `todo-backend.resources.limits.memory` | Memory limits for backend | `512Mi` |

### Todo Postgres Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `todo-postgres.enabled` | Enable postgres deployment | `true` |
| `todo-postgres.service.type` | Service type for postgres | `ClusterIP` |
| `todo-postgres.service.port` | Service port for postgres | `5432` |
| `todo-postgres.resources.requests.cpu` | CPU requests for postgres | `200m` |
| `todo-postgres.resources.requests.memory` | Memory requests for postgres | `512Mi` |
| `todo-postgres.resources.limits.cpu` | CPU limits for postgres | `1` |
| `todo-postgres.resources.limits.memory` | Memory limits for postgres | `1Gi` |
| `todo-postgres.postgresql.auth.database` | Database name | `todo_db` |
| `todo-postgres.postgresql.auth.postgresPassword` | PostgreSQL password | `password` |

## Values

All default values are located in the `values.yaml` file.