# Monitoring Configuration

## Overview

This directory contains monitoring and observability configuration for the Todo application on OKE.

## Components

### 1. Metrics Server
- Pre-installed on OKE clusters
- Required for HPA (Horizontal Pod Autoscaler)
- Provides CPU/memory metrics via `kubectl top`

### 2. Structured Logging
All services output JSON-formatted logs with:
- `timestamp`: ISO 8601 format
- `level`: debug/info/warn/error
- `message`: Log message
- `correlation_id`: For distributed tracing
- `service`: Service name
- `dapr_trace_id`: Dapr trace header

### 3. Health Probes
All services implement:
- `/health` - Liveness probe (is the service alive?)
- `/ready` - Readiness probe (is the service ready to accept traffic?)

## Verification Commands

```bash
# Check metrics server
kubectl top nodes
kubectl top pods -n todo-app

# Check HPA status
kubectl get hpa -n todo-app

# View pod logs (structured JSON)
kubectl logs -n todo-app deployment/todo-backend -f | jq .

# Check pod health
kubectl get pods -n todo-app -o wide

# Describe pod for events
kubectl describe pod -n todo-app -l app=todo-backend
```

## Log Format Example

```json
{
  "timestamp": "2024-02-15T10:30:00.000Z",
  "level": "info",
  "message": "Task created successfully",
  "correlation_id": "abc-123-def-456",
  "service": "todo-backend",
  "user_id": "user-123",
  "task_id": "task-789",
  "dapr_trace_id": "00-abc123-def456-01"
}
```

## OCI Logging Integration

To send logs to OCI Logging Service:

1. Create a Log Group in OCI Console
2. Create a Custom Log
3. Install OCI Logging Agent on nodes
4. Configure agent to collect from `/var/log/containers/*.log`

## Kafka Monitoring

Monitor Kafka metrics via Strimzi:

```bash
# Check consumer lag
kubectl get kafkaconsumergroups -n kafka

# Check topic status
kubectl get kafkatopics -n kafka

# View Kafka metrics (if Prometheus is installed)
kubectl port-forward -n kafka svc/todo-kafka-kafka-0 9404:9404
curl http://localhost:9404/metrics
```

## Alerting Recommendations

| Metric | Warning | Critical |
|--------|---------|----------|
| Pod restarts | > 3 in 1h | > 5 in 1h |
| CPU utilization | > 70% | > 90% |
| Memory utilization | > 80% | > 95% |
| Kafka consumer lag | > 1000 | > 10000 |
| HTTP error rate | > 1% | > 5% |
| Response time (p95) | > 500ms | > 2000ms |

## Distributed Tracing

Dapr provides automatic tracing headers. To view traces:

1. Enable Zipkin in Dapr configuration
2. Deploy Zipkin (or use OCI APM)
3. Access Zipkin UI to view trace spans

```yaml
# Add to dapr-values.yaml
global:
  tracing:
    enabled: true
    exporterType: zipkin
    address: "http://zipkin.monitoring.svc:9411/api/v2/spans"
```
