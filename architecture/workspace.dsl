workspace "TodoList Architecture" "Architecture of the TodoList application with Telegram Bot integration" {

    model {
        admin = person "Admin" "System administrator"
        manager = person "Manager" "Team manager"
        developer = person "Developer" "Team member/developer"
        autoJob = person "Auto Summary Job" "Automated reporting script" "Robot"
        
        telegram = softwareSystem "Telegram System" "External messaging platform." "External System"
        aiApi = softwareSystem "AI API" "External AI provider (DeepSeek/Gemini)." "External System"

        todoSystem = softwareSystem "TodoList System" "Allows users to manage their to-do lists." {
            
            webApplication = container "Web Application" "Serves the web UI and provides the core API." "Spring Boot (Java) + React" {
                taskManagement = component "Task Management Service" "Handles CRUD operations for tasks." "Spring Bean"
                identityAccess = component "Identity & Access Service" "Centralized authorization and role management." "Spring Security Module"
                dashboard = component "Dashboard Service" "Handles read-heavy queries and metrics aggregation." "Spring Bean"
                aiSummary = component "AI Summary Service" "Integrates with AI APIs and provides automated task insights." "Spring Bean"
            }
            
            telegramBot = container "Telegram Bot" "Provides a conversational interface to the TodoList system via Telegram." "Java / Python"
            rabbitMq = container "Message Broker" "Handles asynchronous event distribution." "RabbitMQ"
            database = container "Database" "Stores to-do items, users, and audit states." "Oracle Database (ATP)" "Database"
        }
        
        deploymentEnvironment "Production" {
            deploymentNode "Internet" "Public Internet" {
                userNode = infrastructureNode "Users" "External users accessing the system via browser"
                telegramWebhookNode = infrastructureNode "Telegram Webhook" "Telegram platform sending updates to the bot"
            }

            deploymentNode "OCI Cloud" "Oracle Cloud Infrastructure" {
                deploymentNode "OCI Core Services" "Managed OCI Services" {
                    loadBalancerNode = infrastructureNode "OCI Load Balancer" "Receives public HTTPS traffic and routes it to the Web Application pod"
                }

                deploymentNode "OCI Kubernetes Engine (OKE)" "Managed Kubernetes Cluster" {
                    deploymentNode "Web Application Pod" "Kubernetes Pod" {
                        webAppInst = containerInstance webApplication
                    }
                    deploymentNode "Telegram Bot Pod" "Kubernetes Pod" {
                        telegramBotInst = containerInstance telegramBot
                    }
                    deploymentNode "RabbitMQ Pod" "Kubernetes Pod" {
                        rabbitMqInst = containerInstance rabbitMq
                    }
                }

                deploymentNode "Oracle ATP" "Autonomous Transaction Processing — Managed DB Service" {
                    dbInst = containerInstance database
                }
            }

            // Only infrastructure node relationships are allowed here
            userNode -> loadBalancerNode "Sends HTTPS requests" "HTTPS"
            loadBalancerNode -> webAppInst "Routes traffic to" "HTTP"
            telegramWebhookNode -> telegramBotInst "Sends webhook updates to" "HTTPS"
        }

        // --- Relationships ---
        
        admin -> webApplication "Manages system users & roles via" "HTTPS"
        manager -> webApplication "Views cross-team dashboards via" "HTTPS"
        developer -> webApplication "Manages personal tasks via" "HTTPS"
        autoJob -> webApplication "Triggers AI summaries" "HTTPS"
        
        admin -> telegramBot "Issues administrator commands via Telegram"
        manager -> telegramBot "Checks team summaries via Telegram"
        developer -> telegramBot "Manages tasks via Telegram"
        
        telegram -> telegramBot "Sends Webhook / Long Polling updates to"
        
        admin -> telegram "Sends commands via"
        manager -> telegram "Sends commands via"
        developer -> telegram "Sends commands via"
        
        webApplication -> database "Reads from and writes to" "JDBC"
        telegramBot -> webApplication "Makes API calls to" "JSON/HTTP"
        
        telegramBot -> rabbitMq "Publishes events to" "AMQP"
        rabbitMq -> telegramBot "Sends events to" "AMQP"
        webApplication -> rabbitMq "Consumes operations from" "AMQP"
        
        webApplication -> aiApi "Requests summaries via" "JSON/HTTPS"
        telegramBot -> aiApi "Analyses commands via" "JSON/HTTPS"
        
        taskManagement -> database "Reads/writes tasks"
        identityAccess -> database "Reads users/roles"
        dashboard -> database "Reads team metrics"
        aiSummary -> aiApi "Generates insights via API"
    }

    views {
        systemLandscape "SystemLandscape" {
            include admin manager developer autoJob
            include telegram aiApi todoSystem
            autoLayout
        }

        systemContext todoSystem "SystemContext" {
            include admin manager developer autoJob
            include todoSystem
            include telegram aiApi
            autoLayout
        }

        container todoSystem "Containers" {
            include *
            autoLayout
        }

        component webApplication "Components" {
            include *
            autoLayout
        }

        deployment todoSystem "Production" "DeploymentDiagram" {
            include *
            autoLayout tb
        }
        
        dynamic todoSystem "CreateTaskFlow" "Dynamic view showing how a Developer creates a Task via Web UI" {
            developer -> webApplication "1. Submits new task details via browser"
            webApplication -> database "2. Saves task to database"
            database -> webApplication "3. Returns transaction status"
            webApplication -> developer "4. Displays success confirmation"
            autoLayout
        }

        dynamic todoSystem "AutoSummaryFlow" "Dynamic view showing how the Auto Job requests a summary" {
            autoJob -> webApplication "1. Triggers summary generation endpoint"
            webApplication -> aiApi "2. Formats prompt and sends to AI"
            aiApi -> webApplication "3. Returns generated summary"
            webApplication -> database "4. Stores generated summary"
            webApplication -> rabbitMq "5. Emits summary available event"
            rabbitMq -> telegramBot "6. Notifies bot to message managers"
            autoLayout
        }

        styles {
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "Person" {
                shape Person
                background #08427b
                color #ffffff
            }
            element "Robot" {
                shape Robot
                background #20875e
                color #ffffff
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "Component" {
                background #85bbf0
                color #000000
            }
            element "Database" {
                shape Cylinder
            }
            element "External System" {
                background #999999
                color #ffffff
            }
            element "Infrastructure Node" {
                shape RoundedBox
                background #e6e6e6
                color #000000
            }
        }
    }
}