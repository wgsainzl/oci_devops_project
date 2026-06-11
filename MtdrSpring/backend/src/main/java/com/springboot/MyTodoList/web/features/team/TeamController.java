
package com.springboot.MyTodoList.web.features.team;
import java.util.List;

import com.springboot.MyTodoList.web.features.sprint.Sprint;
import com.springboot.MyTodoList.web.features.sprint.SprintService;
import com.springboot.MyTodoList.web.features.task.Task;
import com.springboot.MyTodoList.web.features.task.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.springboot.MyTodoList.web.features.user.userDetails.CustomUserDetails;
import org.springframework.security.core.Authentication;

@Controller
@RequestMapping("/api/teams")
public class TeamController {
    final TeamService teamService;

    private final TaskService taskService;

    private final SprintService sprintService;

    public TeamController(TeamService teamService, TaskService taskService, SprintService sprintService) {
        this.teamService = teamService;
        this.taskService = taskService;
        this.sprintService = sprintService;
    }

    @GetMapping
    public ResponseEntity<List<Team>> getAllTeams(){
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable int id){
        return teamService.getTeamById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Team> createTeam(@RequestBody Team team){
        Team createdTeam = teamService.createTeam(team);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTeam);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Team> updateTeam(@PathVariable int id, @RequestBody Team team){
        Team updatedTeam = teamService.updateTeam(team.getTeamId(), team);
        if (updatedTeam != null){
            return ResponseEntity.ok(updatedTeam);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/sprints")
    public ResponseEntity<List<Sprint>> getSprintsByTeamId(@PathVariable int id){
        return ResponseEntity.ok(sprintService.getSprintsByTeamId(id));
    }

    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<Task>> getTasksByTeamId(@PathVariable int id){
        return ResponseEntity.ok(taskService.getTasksByTeamId(id));
    } 

    @GetMapping("/{teamId}/sprints/{sprintId}/tasks")
    public ResponseEntity<List<Task>> getTaskByTeamAndSprintId(@PathVariable int teamId, @PathVariable int sprintId){
        return ResponseEntity.ok(taskService.getTasksByTeamAndSprint(sprintId, teamId));
    }

}