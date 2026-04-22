package com.springboot.MyTodoList.web.auth.oci;

import com.springboot.MyTodoList.web.features.user.User;
import com.springboot.MyTodoList.web.features.user.UserService;
import com.springboot.MyTodoList.web.features.user.userDetails.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
public class OciOidcUserService extends OidcUserService {
    private static final Logger logger = LoggerFactory.getLogger(OciOidcUserService.class);


    private final UserService userService;

    public OciOidcUserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser;
        try {
            oidcUser = super.loadUser(userRequest);
        } catch (Exception e) {
            // If it hits here, OCI's token didn't pass Spring's validation
            System.out.println("OIDC Validation Error: " + e.getMessage());
            throw e;
        }

        System.out.println("attributes:");
        System.out.println(oidcUser.getAttributes());

        try {
            String name = oidcUser.getAttribute("name");
            String ociUserId = oidcUser.getAttribute("user_ocid");
            String email = oidcUser.getAttribute("email");

            return userService.findByOciUserId(ociUserId)
                    .map(user -> {
                        if (!user.getEmail().equals(email)) {
                            userService.updateEmail(user, email);
                        }
                        return new CustomUserDetails(user, oidcUser.getAttributes(), oidcUser.getIdToken());
                    })
                    .orElseGet(() -> {
                        User newUser = userService.createNewUserFromOci(ociUserId, email, name);
                        return new CustomUserDetails(newUser, oidcUser.getAttributes(), oidcUser.getIdToken());
                    });
        } catch (Exception e) {
            // If it hits here, your Database/UserService logic failed
            logger.error("Database/JIT Error: {}", e.getMessage());
            throw new OAuth2AuthenticationException("Internal JIT Error: " + e.getMessage());
        }
    }
}