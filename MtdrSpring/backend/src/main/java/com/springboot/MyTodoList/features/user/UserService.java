package com.springboot.MyTodoList.features.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> findAll(){
        List<User> users = userRepository.findAll();
        return users;
    }

    public Optional<User> getUserById(int id){
        return userRepository.findById(id);
    }


    public User createUser(User newUser){
        return userRepository.save(newUser);
    }

    public boolean deleteUser(int id){
        if (userRepository.existsById(id)){
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }


   public User updateUser(int id, User updatedUser){
        Optional<User> existingData = userRepository.findById(id);
        if(existingData.isPresent()){
            User existingUser = existingData.get();
            if (updatedUser.getName() != null) existingUser.setName(updatedUser.getName()); // Also use getters!
            if (updatedUser.getEmail() != null) existingUser.setEmail(updatedUser.getEmail());
            
            // CORRECTED: Save the existingUser, not updatedUser
            return userRepository.save(existingUser); 
        } else {
            return null;
        }
    } 

}
