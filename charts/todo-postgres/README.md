# Todo Postgres Helm Chart

This chart deploys a PostgreSQL database for the Todo App.

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

The following table lists the configurable parameters of the todo-postgres chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.repository` | Image repository | `postgres` |
| `image.tag` | Image tag | `14` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Service type | `ClusterIP` |
| `service.port` | Service port | `5432` |
| `postgresql.auth.database` | Database name | `todo_db` |
| `postgresql.auth.postgresPassword` | PostgreSQL password | `password` |
| `postgresql.port` | PostgreSQL port | `5432` |
| `resources.requests.cpu` | CPU requests | `200m` |
| `resources.requests.memory` | Memory requests | `512Mi` |
| `resources.limits.cpu` | CPU limits | `1` |
| `resources.limits.memory` | Memory limits | `1Gi` |
| `persistence.enabled` | Enable persistence | `true` |
| `persistence.size` | Persistence size | `8Gi` |
| `persistence.storageClass` | Storage class | `""` |

## Persistence

The PostgreSQL chart provisions a PersistentVolume Claim. The storage size can be configured via the `persistence.size` parameter. Depending on your platform, you may need to adjust the `persistence.storageClass` parameter to match an available storage class.