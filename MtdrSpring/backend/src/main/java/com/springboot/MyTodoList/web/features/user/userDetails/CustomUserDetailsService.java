package com.springboot.MyTodoList.web.features.user.userDetails;

import com.springboot.MyTodoList.web.features.user.User;
import com.springboot.MyTodoList.web.features.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        // When loading from DB via JWT, we don't have the OIDC Token or Attributes
        // so we pass null/empty maps.
        return new CustomUserDetails(user, Map.of(), null);
    }
}