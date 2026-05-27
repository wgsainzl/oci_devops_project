package com.springboot.MyTodoList.web.features.team;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TeamService {
    @Autowired
    private TeamRepository teamRepository;

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Optional<Team> getTeamById(int id){
        return teamRepository.findById(id);
    }

    public Team createTeam(Team team){
        return teamRepository.save(team);
    }

    public Team updateTeam(int id, Team teamDetails){
        Optional<Team> existingData = teamRepository.findById(id);
        if(existingData.isPresent()){
            Team existingTeam = existingData.get();
            if (teamDetails.getTeamName() != null) { existingTeam.setTeamName(teamDetails.getTeamName());}
            if (teamDetails.getManagerId() != null) { existingTeam.setManagerId(teamDetails.getManagerId());}
            if (teamDetails.getDescription() != null) { existingTeam.setDescription(teamDetails.getDescription());}
            return teamRepository.save(existingTeam);
        }
        return null;
    }


    public boolean deleteSprint(int id){
        if (teamRepository.existsById(id)){
            teamRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
