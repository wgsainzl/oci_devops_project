# ADR-0001: Layered Architecture as the Primary Architecture Style

Date: 2026-04-02
Status: Accepted
Deciders: Juan Manuel Villalobos, Diego Ivan Rodriguez, Sebastian Alett Oliva Aranda, Mauricio Gael Villalobos Aguayo, Guillermo Sainz Lizárraga

---

## Context

MyTodoList is a chat-based task management system built for internal engineering teams. It exposes two channels — a Telegram bot and a React/TypeScript web UI — backed by a Java Spring Boot monolith and an Oracle ATP database. The system serves three human roles (Admin, Manager, Developer) and one automated actor (Auto Summary Job), each with distinct capabilities and data visibility rules.

Three quality attributes drive the architectural decisions for this system:

- **Accountability**: every state-changing action must be permanently recorded with actor identity, role, timestamp, and resulting state change.
- **Visibility**: authorized users must be able to quickly interpret the information they are entitled to see, scoped by role, without friction or unnecessary navigation.
- **Modifiability**: permission rules, workflow behaviors, and role-based capabilities must be isolatable from core bot logic so that changes to what a role can do are localized to a single, well-defined layer.

The team evaluated the following architecture styles before selecting a primary style:

- Monolithic
- Layered
- Domain-driven (domain partitioning)
- Event-driven
- Ports and adapters (hexagonal)
- Microservices
- Service-oriented (SOA)
- Space-based
- Pipeline

The system is a monolith in deployment terms. Within that monolith, an architecture style was needed to govern how components are organized, how responsibilities are separated, and how the system will evolve as permission rules and workflows change over time.

---

## Decision

We adopt a **layered architecture** as the primary organizing style for the MyTodoList monolith.

The system is partitioned into three horizontal layers, each with a clearly defined responsibility:

### Local layer (Presentation)
Contains the two channel adapters: the Telegram Adapter and the Web Adapter. Each adapter handles its own authentication method — Telegram uses Telegram ID, Web uses session tokens — and translates incoming requests into a format the rest of the system understands. This layer is the only layer that knows about channel-specific concerns. It does not contain business logic.

### Middle layer (Business Logic / Service)
Contains all business logic components:
- **Task Management** — handles all write operations on tasks: creation, editing, assignment, and blocker reporting.
- **Dashboard / Metrics** — handles all read operations on task data, scoped by role. Managers receive a full cross-team view; Developers receive only their personal data.
- **Account Management** — handles user creation and role/team assignment.
- **AI Service** — wraps the DeepSeek API call, constructs prompts from task context, and returns generated summaries.
- **Notification** — receives output from the AI Service and routes it to the appropriate delivery channel.

### Common layer (Shared Services / Data)
Contains components shared across all flows regardless of channel or role:
- **Permission Gate** — intercepts every request arriving from the Local layer and enforces role-based authorization before routing to any Middle layer component. Authentication is handled per-adapter; authorization is centralized here.
- **Audit Log** — append-only record of every state-changing event. Populated via a database trigger on task table writes, keeping Task Management fully decoupled from the audit concern.
- **Oracle ATP** — single shared database instance. Each domain owns its own tables (task tables, user/role tables, audit tables) within the same instance, enforcing domain boundaries at the schema level without requiring separate databases.

### External dependency
**DeepSeek API** sits outside the system boundary entirely. The AI Service calls it but does not own or control it.

---

## Alternatives Considered

### Microservices
Rejected. The team size (~5 developers), delivery timeline, and current scale do not justify the operational overhead of independently deployable services, inter-service networking, distributed tracing, and separate CI/CD pipelines per service. The Modifiability QA can be satisfied within a well-structured monolith.

### Ports and Adapters (Hexagonal)
Partially applied but not selected as the primary style. The Telegram and Web adapters do implement port-and-adapter semantics — they translate external input into internal commands without the core knowing which channel originated the request. However, a full hexagonal architecture would require defining explicit port interfaces for every external dependency, adding indirection overhead not justified at current scale.

### Event-driven
Partially applied but not selected as the primary style. A database trigger on task table writes drives audit log entries in an event-like pattern. A full event-driven architecture with a message bus was rejected because the system's interaction model is predominantly synchronous request-response, and introducing an async event bus would add complexity without meaningful benefit at current scale.

### Space-based
Rejected. The system does not require elastic horizontal scaling. The team size is approximately 20 users. Space-based architecture addresses high-concurrency and high-availability requirements that do not apply here.

### Pipeline
Rejected. The system is not a data transformation system. There is no sequential processing of data through independent transformation stages.

### Service-oriented (SOA)
Rejected for the same reasons as microservices. SOA introduces a service bus and contract-heavy inter-service communication that adds coordination overhead not justified at current scale.

---

## Consequences

### Positive
- The Modifiability QA is directly satisfied. The Permission Gate lives in the Common layer, isolated from both channel adapters and business logic components. Adding or changing a role permission requires modifying only the Permission Gate, touching no more than 2 modules and leaving the audit layer, channel adapters, and task logic untouched.
- The Accountability QA is directly satisfied. The Audit Log lives in the Common layer and is populated via a database trigger, making it a guaranteed side effect of every task table write rather than an application-level responsibility. Task Management cannot accidentally bypass it.
- The Visibility QA is directly satisfied. Role-based data scoping is enforced at the Dashboard/Metrics component in the Middle layer, keeping the presentation layer clean of business rules and the data layer clean of filtering logic.
- Clear separation of concerns makes onboarding new team members straightforward — each layer has a single, well-understood responsibility.
- The layered structure is compatible with a future migration toward domain-driven or microservices architecture if scale demands it, since domain boundaries are already respected at the schema level.

### Negative
- Higher degree of global coupling compared to domain partitioning. A change that spans layers (e.g. adding a new task field that affects presentation, business logic, and persistence) requires touching multiple layers.
- The Common layer can become a dumping ground for components that do not belong clearly to a single layer. Discipline is required to keep the Permission Gate and Audit Log as the only residents of Common and avoid accumulating unrelated shared logic there.
- Customization code for channel-specific behavior (e.g. Telegram message formatting vs. web UI rendering) may appear in multiple places as the system evolves, since both adapters live in the same Local layer without sub-isolation.