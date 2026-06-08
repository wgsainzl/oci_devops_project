# ADR-0002: Microservices as the Primary Architecture Style

Date: 2026-05-12
Status: Accepted
Deciders: Juan Manuel Villalobos, Diego Ivan Rodriguez, Sebastian Alett Oliva Aranda, Mauricio Gael Villalobos Aguayo, Guillermo Sainz Lizárraga

---

## Context

MyTodoList is a chat-based task management system built for internal engineering teams. It exposes two channels — a Telegram bot and a React/TypeScript web UI — backed by a Java Spring Boot ecosystem and an Oracle ATP database. The system serves three human roles (Admin, Manager, Developer) and one automated actor (Auto Summary Job).

As the user base and data volume have grown, new quality attributes and constraints have driven the evolution of our architectural decisions:

- **Scalability**: The Telegram bot handles frequent, small, synchronous interactions, whereas the Web UI handles bulk data retrieval and heavy dashboard rendering. These require independent scaling.
- **Deployability**: Changes to the AI Auto Summary feature or bot conversational logic should not require redeploying the core Task Management or Dashboard systems.
- **Resilience**: A failure in the external DeepSeek API or the Telegram network adapter should not bring down the Web UI or core task management capabilities.

The team evaluated the following architecture styles to transition to:

- Monolithic (Current)
- Layered
- Microservices
- Event-driven
- Ports and adapters (hexagonal)
- Service-oriented (SOA)

To meet the new scale and independent deployment needs, we require an architecture that isolates business domains and deployment units.

---

## Decision

We adopt a **Microservices architecture** as the primary organizing style for the MyTodoList system.

The system is partitioned into independent, loosely coupled services aligned around business capabilities:

### Core Microservices
- **Task Management Service**: Handles CRUD operations for tasks. Owns the task schema.
- **Identity & Access Service (Permission Gate)**: Centralized authorization and role management. All other services consult this service for permission enforcement.
- **Dashboard Service**: Handles read-heavy queries and metrics aggregation, optimized for the Web UI.
- **AI Summary Service**: Handles calls to the DeepSeek API, constructs prompts, and processes asynchronous summary jobs.

### Edge / Gateway Services
- **Telegram Gateway**: An adapter service that handles Long Polling/Webhooks from Telegram, session management per user, and translates text into domain commands.
- **API Gateway (Web)**: Routes Web UI traffic to the appropriate backend microservices and handles token-based authentication.

### Shared Services / Data
- **Audit Logging Service**: Receives asynchronous events from other services to maintain an append-only record of every state-changing event.
- **Database Partitioning**: While we still use a single Oracle ATP instance, each microservice owns a logically isolated schema. Cross-schema joins are strictly forbidden; data sharing happens only via API calls or asynchronous events.

---

## Alternatives Considered

### Layered Monolith
Rejected. While the layered monolith (ADR-0001) provided good logical separation and was suitable for the initial team size, it does not allow us to scale the Telegram bot independently from the Web UI, nor does it allow independent deployments of the AI Service.

### Service-oriented (SOA)
Rejected. SOA typically relies on a heavy Enterprise Service Bus (ESB) and shared data models. We favor lightweight API Gateways or decentralized choreographies (dumb pipes, smart endpoints) over a monolithic ESB.

### Event-driven (Pure)
Partially applied but not selected as the primary style. While audit logging and AI summary processing will benefit from asynchronous events, the core user interactions (creating a task, asking for a summary via the bot) require immediate, synchronous request-response semantics.

---

## Consequences

### Positive
- **Independent Scalability**: The Telegram Gateway and Dashboard Service can scale out independently based on traffic spikes (e.g., end-of-week reporting or heavy bot usage).
- **Independent Deployability**: The AI Summary Service can be updated to handle new DeepSeek prompt changes without risking downtime for core task creation.
- **Resilience**: If the AI Summary Service crashes or the DeepSeek API rate limits are hit, the rest of the application remains fully functional.
- Fits seamlessly into containerized environments like OKE (Oracle Kubernetes Engine) which we are already deploying to.

### Negative
- **Operational Complexity**: Requires distributed logging, tracing (e.g., Jaeger/Zipkin), and robust monitoring to track a request that spans the API Gateway, Identity Service, and Task Service.
- **Data Consistency**: Because schemas are isolated, business transactions that cross service boundaries can no longer rely on simple ACID database transactions. We must adopt eventual consistency and distributed transaction patterns like Saga.
- **Deployment Overhead**: Requires maintaining multiple CI/CD pipelines and Kubernetes manifests for each independent service instead of a single artifact.
