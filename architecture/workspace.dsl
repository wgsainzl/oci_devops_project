workspace "TodoList Architecture" "Architecture of the TodoList application with Telegram Bot integration" {

    model {
        user = person "User" "A user of the TodoList application."
        
        todoSystem = softwareSystem "TodoList System" "Allows users to manage their to-do lists." {
            frontend = container "Web Frontend" "Provides the web interface for managing todos." "React/JavaScript" "Web Browser"
            telegramBot = container "Telegram Bot" "Provides a conversational interface to the TodoList system via Telegram." "Java / Python"
            apiApplication = container "Backend API" "Provides to-do list functionality via a JSON/HTTP API." "Spring Boot (Java)"
            database = container "Database" "Stores to-do items, users, and state." "Oracle Database" "Database"
        }
        
        telegram = softwareSystem "Telegram System" "External messaging platform." "External System"

        deploymentEnvironment "Production" {
            deploymentNode "OCI" "Oracle Cloud Infrastructure" {
                containerInstance frontend
                containerInstance telegramBot
                containerInstance apiApplication
                containerInstance database
            }
        }

        user -> frontend "Manages todos using"
        user -> telegramBot "Manages todos via Telegram"
        user -> telegram "Sends commands/messages via"
        telegram -> telegramBot "Webhook/Polling updates"
        
        frontend -> apiApplication "Makes API calls to" "JSON/HTTPS"
        telegramBot -> apiApplication "Makes API calls to" "JSON/HTTPS"
        apiApplication -> database "Reads from and writes to" "JDBC"
    }

    views {
        systemLandscape "SystemLandscape" {
            include *
            autoLayout
        }

        systemContext todoSystem "SystemContext" {
            include *
            autoLayout
        }

        container todoSystem "Containers" {
            include *
            autoLayout
        }

        component apiApplication "Components" {
            include *
            autoLayout
        }

        deployment todoSystem "Production" "DevelopmentDeployment" {
            include *
            autoLayout
        }
        
        dynamic todoSystem "CreateTodoUse" "Dynamic view showing how a user creates a Todo" {
            user -> frontend "1. Enters a new to-do item"
            frontend -> apiApplication "2. Posts the item to the API"
            apiApplication -> database "3. Saves the item to the database"
            database -> apiApplication "4. Returns status"
            apiApplication -> frontend "5. Returns success"
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
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "Database" {
                shape Cylinder
            }
            element "External System" {
                background #999999
                color #ffffff
            }
        }
    }
}
