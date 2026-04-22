package com.springboot.MyTodoList.web.features.sprint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    public Optional<Sprint> getSprintById(int id) {
        return sprintRepository.findById(id);
    }

    public Sprint createSprint(Sprint sprint) {
        return sprintRepository.save(sprint);
    }

    public Sprint updateSprint(int id, Sprint sprintDetails) {
        Optional<Sprint> existingData = sprintRepository.findById(id);
        if (existingData.isPresent()) {
            Sprint existingSprint = existingData.get();
            if (sprintDetails.getSprintName() != null) existingSprint.setSprintName(sprintDetails.getSprintName());
            if (sprintDetails.getStartDate() != null) existingSprint.setStartDate(sprintDetails.getStartDate());
            if (sprintDetails.getEndDate() != null) existingSprint.setEndDate(sprintDetails.getEndDate());
            
            return sprintRepository.save(existingSprint);
        }
        return null;
    }

    public boolean deleteSprint(int id) {
        if (sprintRepository.existsById(id)) {
            sprintRepository.deleteById(id);
            return true;
        }
        return false;
    }
}