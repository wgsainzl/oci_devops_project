package com.springboot.MyTodoList.web.features.task;

import com.springboot.MyTodoList.web.features.task.dto.TaskDTO;
import com.springboot.MyTodoList.web.features.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskControllerMockTest {

    @Mock
    private TaskService taskService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskController taskController;

    @Test
    void crearTareaDesdeTelegram() throws Exception {
        Task nuevaTarea = new Task();
        nuevaTarea.setTitle("Crear evidencia Sprint 3");
        nuevaTarea.setDescription("Tarea creada desde prueba con Mockito");
        nuevaTarea.setStatus(TaskStatus.TODO);
        nuevaTarea.setPriority(TaskPriority.MEDIUM);
        nuevaTarea.setDueDate(OffsetDateTime.parse("2026-05-17T23:59:00Z"));
        nuevaTarea.setEstimatedHours(2.0);

        Task tareaCreada = new Task();
        tareaCreada.setTitle("Crear evidencia Sprint 3");
        tareaCreada.setDescription("Tarea creada desde prueba con Mockito");
        tareaCreada.setStatus(TaskStatus.TODO);
        tareaCreada.setPriority(TaskPriority.MEDIUM);
        tareaCreada.setDueDate(OffsetDateTime.parse("2026-05-17T23:59:00Z"));
        tareaCreada.setEstimatedHours(2.0);

        when(taskService.createTaskFromTelegram(any(Task.class), eq("1337")))
                .thenReturn(tareaCreada);

        ResponseEntity<TaskDTO> response =
                taskController.addToDoItemFromTelegram(nuevaTarea, "1337");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().title()).isEqualTo("Crear evidencia Sprint 3");
        assertThat(response.getBody().status()).isEqualTo("TODO");

        verify(taskService, times(1))
                .createTaskFromTelegram(any(Task.class), eq("1337"));
    }
}
