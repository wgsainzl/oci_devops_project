import os
import re

dir_path = "MtdrSpring/telegram-bot/src/main/java/com/springboot/telegrambot"

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Change package names
    content = re.sub(
        r'package com\.springboot\.MyTodoList\.web\.util;',
        r'package com.springboot.telegrambot.util;',
        content
    )
    content = re.sub(
        r'package com\.springboot\.MyTodoList\.web\.config;',
        r'package com.springboot.telegrambot.config;',
        content
    )
    content = re.sub(
        r'package com\.springboot\.MyTodoList\.web\.features\.deepseek;',
        r'package com.springboot.telegrambot.deepseek;',
        content
    )

    # Fix imports
    content = re.sub(
        r'import com\.springboot\.MyTodoList\.web\.features\.task\.Task;',
        r'import com.springboot.telegrambot.dto.TaskDTO;\nimport com.springboot.telegrambot.dto.TaskStatus;',
        content
    )
    content = re.sub(
        r'import com\.springboot\.MyTodoList\.web\.features\.task\.TaskStatus;',
        r'',
        content
    )
    content = re.sub(
        r'import com\.springboot\.MyTodoList\.web\.features\.task\.TaskService;',
        r'import com.springboot.telegrambot.client.BackendServiceClient;',
        content
    )
    content = re.sub(r'\bTaskService\b', r'BackendServiceClient', content)
    content = re.sub(r'\btaskService\b', r'backendServiceClient', content)
    content = re.sub(r'\bTask(\s)', r'TaskDTO\1', content) # replacing Task with TaskDTO
    content = re.sub(r'<Task>', r'<TaskDTO>', content)
    
    # DeepSeek Config updates
    content = re.sub(
        r'import com\.springboot\.MyTodoList\.web\.features\.deepseek\.',
        r'import com.springboot.telegrambot.deepseek.',
        content
    )
    
    # other util imports
    content = re.sub(
        r'import com\.springboot\.MyTodoList\.web\.util\.',
        r'import com.springboot.telegrambot.util.',
        content
    )
    content = re.sub(
        r'import com\.springboot\.MyTodoList\.web\.config\.',
        r'import com.springboot.telegrambot.config.',
        content
    )

    # Some specifics handling methods:
    content = content.replace("backendServiceClient.updateTaskStatus(id, TaskStatus.DONE, null);", "backendServiceClient.updateTaskStatus(id, \"DONE\");")
    content = content.replace("backendServiceClient.updateTaskStatus(id, TaskStatus.BLOCKED, null);", "backendServiceClient.updateTaskStatus(id, \"BLOCKED\");")
    content = content.replace("backendServiceClient.deleteTaskItem(id);", "backendServiceClient.deleteTask(id);")
    content = content.replace(".setTaskService(", ".setBackendServiceClient(")
    content = content.replace("public BackendServiceClient getBackendServiceClient() { return backendServiceClient; }", "public BackendServiceClient getBackendServiceClient() { return backendServiceClient; }")
    content = content.replace("import com.springboot.telegrambot.client.BackendServiceClient;", "import com.springboot.telegrambot.client.BackendServiceClient;\nimport com.springboot.telegrambot.deepseek.DeepSeekService;")
    
    with open(filepath, 'w') as f:
        f.write(content)


for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith(".java"):
            process_file(os.path.join(root, file))

