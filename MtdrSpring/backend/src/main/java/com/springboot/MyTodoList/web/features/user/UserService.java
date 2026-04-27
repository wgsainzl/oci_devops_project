package com.springboot.MyTodoList.web.features.user;

import com.springboot.MyTodoList.web.exception.customExtensions.ResourceNotFoundException;
import com.springboot.MyTodoList.web.features.role.Role;
import com.springboot.MyTodoList.web.features.role.RoleService;
import com.springboot.MyTodoList.web.features.role.dto.RoleCreationRequestDTO;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;

    public UserService(UserRepository userRepository, RoleService roleService) {
        this.userRepository = userRepository;
        this.roleService = roleService;
    }

    public List<User> findAll() {
        List<User> users = userRepository.findAll();
        return users;
    }

    public ResponseEntity<User> getUserById(Long id) {
        Optional<User> userById = userRepository.findById(id);
        if (userById.isPresent()) {
            return new ResponseEntity<>(userById.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public Map<String, Object> getUserByTelegramId(String telegramId) {
        Optional<User> userOpt = userRepository.findByTelegramUserID(telegramId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            boolean isManager = user.getRoles().stream()
                    .anyMatch(role -> role.getName().equalsIgnoreCase("MANAGER") || role.getName().equalsIgnoreCase("ADMIN"));
            
            Map<String, Object> result = new HashMap<>();
            result.put("userId", user.getUserId());
            result.put("role", isManager ? "MANAGER" : "DEVELOPER");
            return result;
        }
        return null;
    }


    public boolean deleteUser(Long id) {
        try {
            userRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public User addUserToRepository(User user) {
        // Assign default role if no roles assigned
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            createDefaultUserIfNotPresent(user);
        }

        return userRepository.save(user);
    }


    @Transactional
    public User createNewUserFromOci(String ociUserId, String email, String name) {
        User newUser = new User(name, email, ociUserId);

        // Fetch or create the default role
        Role defaultRole = roleService.findByName("DEV")
                .orElseThrow();

        newUser.setRoles(Set.of(defaultRole));

        return userRepository.save(newUser);
    }

    private void createDefaultUserIfNotPresent(User user) {
        Set<Role> roles = new HashSet<>();
        roleService.findByName("DEV").ifPresentOrElse(roles::add, () -> roleService.createRole(new RoleCreationRequestDTO("User", "Basic user with read access", Set.of("TASK_READ"))));
        user.setRoles(roles);
    }

    public Map<String, Object> assignRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Role role = roleService.findByName(roleName).orElseThrow(() -> new NoSuchElementException("Role not found with name: " + roleName));

        if (user.getRoles().contains(role)) {
            throw new IllegalStateException("User already has the role: " + roleName);
        }

        user.getRoles().add(role);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Role " + roleName + " assigned to user " + user.getName());
        return response;

    }

    @Transactional
    public User createUnValidatedUser(User user, Set<String> roles) {
        // Assign default role if user data is missing
        createDefaultUserIfNotPresent(user);

        User createdUser = userRepository.save(user);

        boolean allCosmetic = roles == null || roles.isEmpty() || roles.stream()
                .map(roleService::findByName)
                .allMatch(role -> role.isPresent() && role.get().isCosmetic());

        if (allCosmetic) {
            // Assign default non-cosmetic "DEV" role
            Optional<Role> userRole = roleService.findByName("DEV");
            if (userRole.isEmpty()) {
                throw new IllegalStateException("Default 'User' role not found in the system.");
            }
            assignRoleToUser(user.getUserId(), userRole.get().getName());
        } else {
            // Assign all provided roles
            for (String roleName : roles) {
                assignRoleToUser(user.getUserId(), roleName);
            }
        }

        return createdUser;
    }

    public Optional<User> findByOciUserId(String ociSubjectID) {
        return userRepository.findByOciSubjectID(ociSubjectID);
    }

    public void updateEmail(User user, String email) {
        User updatedUser = userRepository.getUserByUserId(user.userId);
        updatedUser.setEmail(email);
        userRepository.save(updatedUser);
    }
}
