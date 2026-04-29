package com.springboot.MyTodoList.web.features.sprint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sprints")
public class SprintController {

    @Autowired
    private SprintService sprintService;

    @Autowired
    private com.springboot.MyTodoList.web.features.task.TaskService taskService;

    @GetMapping
    public ResponseEntity<List<Sprint>> getAllSprints() {
        return ResponseEntity.ok(sprintService.getAllSprints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable int id) {
        return sprintService.getSprintById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody Sprint sprint) {
        Sprint createdSprint = sprintService.createSprint(sprint);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSprint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable int id, @RequestBody Sprint sprintDetails) {
        Sprint updatedSprint = sprintService.updateSprint(id, sprintDetails);
        if (updatedSprint != null) {
            return ResponseEntity.ok(updatedSprint);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable int id) {
        if (sprintService.deleteSprint(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    


    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<com.springboot.MyTodoList.web.features.task.Task>> getTasksForSprint(@PathVariable int id) {
        return ResponseEntity.ok(taskService.getTasksBySprintId(id));
    }
}