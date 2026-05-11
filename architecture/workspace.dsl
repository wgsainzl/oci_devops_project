workspace "MyTodoList" "Architecture model for the MyTodoList DevOps project." {
  model {
    admin = person "Admin" "System administrator with full access to manage teams and settings."
    manager = person "Manager" "Plans work and manages teams in the dashboard."
    developer = person "Developer" "Works on assigned tasks and tracks progress."
    telegramUser = person "Telegram User" "Interacts with the system via the Telegram bot."

    mtdr = softwareSystem "MyTodoList" "Task management and DevOps dashboard for teams."

    telegram = softwareSystem "Telegram Platform" "External messaging platform for bot interactions." "External"
    gemini = softwareSystem "Gemini API" "External AI service used for summaries." "External"

    web = container mtdr "Web UI" "Single-page application for tasks and dashboards." "React + Vite"
    api = container mtdr "Backend API" "Spring Boot REST API for tasks, users, and dashboards." "Spring Boot"
    bot = container mtdr "Telegram Bot Service" "Handles Telegram bot commands and notifications." "Spring Boot"
    database = container mtdr "Task Database" "Stores tasks, users, roles, and activity." "Oracle Database" "Database"
    rabbitmq = container mtdr "RabbitMQ Broker" "Message broker for asynchronous processing." "RabbitMQ"

    authController = component api "Auth Controller" "Handles login and token refresh endpoints." "Spring MVC"
    taskController = component api "Task Controller" "Handles CRUD endpoints for tasks." "Spring MVC"
    userController = component api "User Controller" "Manages users and roles." "Spring MVC"
    dashboardController = component api "Dashboard Controller" "Serves dashboard metrics." "Spring MVC"

    authService = component api "Auth Service" "Validates credentials and issues tokens." "Spring Security"
    taskService = component api "Task Service" "Applies task workflows and validation." "Service Layer"
    userService = component api "User Service" "Manages users and role assignments." "Service Layer"
    dashboardService = component api "Dashboard Service" "Builds aggregated dashboard metrics." "Service Layer"

    repositories = component api "JPA Repositories" "Persists data in Oracle DB." "Spring Data JPA"
    messaging = component api "RabbitMQ Integration" "Publishes and consumes async task events." "Spring AMQP"
    geminiClient = component api "Gemini Client" "Calls Gemini for AI summaries." "HTTP Client"

    admin -> mtdr "Manages tasks and teams"
    manager -> mtdr "Plans work and reviews progress"
    developer -> mtdr "Tracks assigned tasks"
    telegramUser -> mtdr "Uses the system via Telegram"

    mtdr -> telegram "Uses Telegram Bot API" "HTTPS"
    mtdr -> gemini "Requests AI summaries" "HTTPS"

    admin -> web "Manages tasks and teams" "HTTPS"
    manager -> web "Plans work and reviews progress" "HTTPS"
    developer -> web "Tracks assigned tasks" "HTTPS"
    telegramUser -> telegram "Sends bot commands" "HTTPS"

    web -> api "Reads/writes tasks and dashboards" "JSON/HTTPS"
    bot -> api "Reads/writes tasks" "JSON/HTTP"
    api -> web "Returns responses" "JSON/HTTPS"
    api -> bot "Returns responses" "JSON/HTTP"
    api -> database "Reads/writes data" "JDBC"
    api -> rabbitmq "Publishes/consumes task events" "AMQP"
    bot -> telegram "Uses Bot API" "HTTPS"
    telegram -> bot "Delivers bot updates" "HTTPS"
    bot -> gemini "Requests summaries" "HTTPS"
    api -> gemini "Generates summaries" "HTTPS"
    telegram -> telegramUser "Sends responses" "HTTPS"

    web -> authController "Authenticates users" "HTTPS"
    web -> taskController "Manages tasks" "HTTPS"
    web -> dashboardController "Loads dashboard data" "HTTPS"
    web -> userController "Manages users" "HTTPS"

    authController -> authService "Delegates auth logic"
    taskController -> taskService "Delegates task workflows"
    userController -> userService "Delegates user workflows"
    dashboardController -> dashboardService "Delegates dashboard workflows"

    authService -> repositories "Reads/writes user data"
    taskService -> repositories "Reads/writes task data"
    userService -> repositories "Reads/writes user data"
    dashboardService -> repositories "Reads aggregates"

    taskService -> messaging "Publishes task events"
    dashboardService -> geminiClient "Generates summaries"
    geminiClient -> gemini "Calls Gemini API" "HTTPS"
    repositories -> database "Reads/writes" "JDBC"
    messaging -> rabbitmq "Uses AMQP" "AMQP"

    deploymentEnvironment "Production" {
      deploymentNode "OCI OKE Cluster" "Kubernetes cluster" "Oracle Cloud Infrastructure" {
        deploymentNode "Kubernetes Namespace: mtdrworkshop" "Namespace hosting the workloads." "Kubernetes" {
          deploymentNode "todolistapp-springboot deployment" "Spring Boot workload" "Kubernetes Deployment" {
            containerInstance api
            containerInstance web
          }
          deploymentNode "telegram-bot deployment" "Telegram bot workload" "Kubernetes Deployment" {
            containerInstance bot
          }
        }
      }
      deploymentNode "Oracle Autonomous Database" "Managed Oracle DB" "Oracle Cloud" {
        containerInstance database
      }
      deploymentNode "RabbitMQ Broker" "Message broker" "RabbitMQ" {
        containerInstance rabbitmq
      }
    }
  }

  views {
    systemLandscape landscape {
      include *
      autolayout lr
    }

    systemContext mtdr context {
      include *
      autolayout lr
    }

    container mtdr containers {
      include *
      autolayout lr
    }

    component api apiComponents {
      include *
      autolayout lr
    }

    deployment mtdr production {
      environment "Production"
      include *
      autolayout lr
    }

    dynamic mtdr "Create task via web UI" {
      manager -> web "Creates task"
      web -> api "POST /tasks"
      api -> database "Insert task"
      api -> web "Task created response"
      autolayout lr
    }

    dynamic mtdr "Create task via Telegram bot" {
      telegramUser -> telegram "Sends /newtask"
      telegram -> bot "Delivers message"
      bot -> api "POST /tasks"
      api -> database "Insert task"
      api -> bot "Task created response"
      bot -> telegram "Reply"
      telegram -> telegramUser "Confirmation"
      autolayout lr
    }

    styles {
      element "Person" {
        shape person
        background #08427b
        color #ffffff
      }
      element "Software System" {
        shape roundedbox
        background #1168bd
        color #ffffff
      }
      element "Container" {
        shape roundedbox
        background #438dd5
        color #ffffff
      }
      element "Database" {
        shape cylinder
      }
      element "External" {
        background #999999
        color #ffffff
      }
    }
  }

  configuration {
    scope softwareSystem
  }
}
