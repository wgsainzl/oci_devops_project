
package com.springboot.MyTodoList.web.features.team;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.rabbitmq.client.RpcClient.Response;

@Controller
@RequestMapping("/api/teams")
public class TeamController {
    @Autowired
    TeamService teamService;

    @Autowired
    private com.springboot.MyTodoList.web.features.task.TaskService taskService;

    @Autowired
    private com.springboot.MyTodoList.web.features.sprint.SprintService sprintService;

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
    public ResponseEntity<List<com.springboot.MyTodoList.web.features.sprint.Sprint>> getSprintsByTeamId(@PathVariable int id){
        return ResponseEntity.ok(sprintService.getSprintsByTeamId(id));
    }

    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<com.springboot.MyTodoList.web.features.task.Task>> getTasksByTeamId(@PathVariable int id){
        return ResponseEntity.ok(taskService.getTasksByTeamId(id));
    } 

    @GetMapping("/{teamId}/sprints/{sprintId}/tasks")
    public ResponseEntity<List<com.springboot.MyTodoList.web.features.task.Task>> getTaskByTeamAndSprintId(@PathVariable int teamId, @PathVariable int sprintId){
        return ResponseEntity.ok(taskService.getTasksByTeamAndSprint(sprintId, teamId));
    }

}