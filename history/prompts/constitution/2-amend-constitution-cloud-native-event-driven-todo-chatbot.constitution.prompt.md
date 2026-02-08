---
id: 2
title: "amend-constitution-cloud-native-event-driven-todo-chatbot"
stage: constitution
date_iso: "2026-02-06"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "cloud-native-event-driven-platform"
branch: "main"
user: "user"
command: "sp.constitution"
labels: ["constitution", "cloud-native", "event-driven", "dapr", "kafka", "todo-chatbot", "microservices"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - ".specify/memory/constitution.md"
tests_yaml: []
---

# Prompt History Record

## Command
`sp.constitution`

## Date
2026-02-06

## Prompt Text
```
Project Title

Phase V: Advanced Cloud-Native, Event-Driven Todo Chatbot Platform

Role & Responsibility

You are an Autonomous Senior Cloud Architect + Platform Engineer Agent working under the Agentic Dev Stack workflow.
You must not write any manual code.
All implementation must be done through planning, task decomposition, and agent-driven code generation.

Objective

Design, implement, and deploy a production-grade, cloud-native, event-driven Todo Chatbot system with advanced functionality using:

Kubernetes (Minikube → Cloud)

Dapr (Distributed Application Runtime)

Kafka (Event Streaming)

CI/CD via GitHub Actions

The system must first run locally on Minikube, then be deployed to a production Kubernetes cluster on Azure AKS / Google GKE / Oracle OKE.

Development Methodology (MANDATORY)

Strictly follow the Agentic Dev Stack workflow:

Write a complete technical specification

Generate an implementation plan

Break the plan into atomic tasks

Implement each task using agent-based code generation (Claude Code)

Iterate and refine based on validation results

🚫 Manual coding is not allowed
✅ The evaluation will focus on process, prompts, task breakdown, and iterations

PART A – Advanced Application Features
Advanced-Level Features

Recurring Tasks (event-driven)

Due Dates & Scheduled Reminders

Event-based notifications

Intermediate-Level Features

Task Priorities

Tags & Labels

Search, Filter, and Sort

Real-time task updates

Event-Driven Architecture (Kafka Mandatory)

Implement Kafka-based asynchronous communication for all major workflows:

Kafka Topics

task-events → Task lifecycle events

reminders → Due-date and scheduled reminders

task-updates → Real-time sync across clients

Core Event Use Cases

Reminder & Notification System

Recurring Task Engine

Activity & Audit Logging

Real-Time Multi-Client Synchronization

Kafka must be abstracted through Dapr Pub/Sub, ensuring zero Kafka client code inside services.

PART B – Local Deployment (Minikube)
Local Infrastructure Requirements

Kubernetes via Minikube

Dapr installed on Minikube

Kafka running inside K8s (Strimzi / Redpanda)

Dapr Capabilities (FULL USAGE REQUIRED)

Pub/Sub (Kafka abstraction)

State Management

Service Invocation

Bindings (Cron / Jobs API)

Secrets Management

Validation Criteria

All services run with Dapr sidecars

Events flow correctly via Kafka

No tight coupling between services

PART C – Cloud Deployment (Production Grade)

Deploy the same system to one cloud provider:

Supported Options

Azure AKS (Preferred for enterprise)

Google GKE

Oracle OKE (Always Free – Recommended for learning)

Cloud Requirements

Kubernetes cluster creation

kubectl configured

Deployment using Helm charts from Phase IV

Dapr installed and configured

Kafka via:

Redpanda Cloud (Serverless Free Tier) OR

Confluent Cloud OR

Self-hosted Kafka using Strimzi

CI/CD & Observability
CI/CD

GitHub Actions pipeline

Automated build & deploy

Kubernetes manifests validation

Monitoring & Logging

Centralized logging

Basic metrics (pod health, event flow)

Architectural Constraints

All services must communicate via Dapr

No direct Kafka or DB client libraries inside app code

Loose coupling & microservices-first design

Infrastructure must be cloud-portable

Expected Outp
```

## Response Text
Updated the project constitution to reflect the advanced cloud-native, event-driven Todo Chatbot platform requirements. The new constitution version 2.0.0 includes:

- Major update from basic Kubernetes deployment to cloud-native architecture with Dapr and Kafka
- Addition of new principles for Dapr, Event-Driven Architecture, Microservices, Cloud Deployment, CI/CD, and Observability
- Updated tech stack enforcement to include Dapr, Kafka, and event-driven patterns
- Revised Phase-Aware Implementation to reflect the new cloud-native requirements
- Enhanced security rules for distributed systems with Dapr secrets and mTLS
- Updated success criteria to include Dapr integration, event-driven architecture, and cloud deployment validation

The constitution now properly guides the implementation of the advanced cloud-native, event-driven Todo Chatbot platform with proper Dapr abstraction over Kafka, microservices architecture, and cloud-native deployment patterns.

## Outcome
The project constitution has been successfully updated to version 2.0.0 to align with the requirements for the Advanced Cloud-Native, Event-Driven Todo Chatbot Platform. The updated constitution will guide the implementation of Dapr, Kafka, and cloud-native deployment patterns while maintaining security and best practices.

## Evaluation
The constitution update successfully captures all the requirements from the user input, including the technology stack (Kubernetes, Dapr, Kafka), architectural patterns (event-driven, microservices), and deployment requirements (local Minikube, cloud AKS/GKE/OKE). The version was incremented from 1.2.0 to 2.0.0 as this represents a major architectural shift from basic Kubernetes deployment to a sophisticated cloud-native, event-driven platform.