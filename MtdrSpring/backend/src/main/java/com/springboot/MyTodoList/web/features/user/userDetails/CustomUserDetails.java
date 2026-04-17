package com.springboot.MyTodoList.web.features.user.userDetails;

import com.springboot.MyTodoList.web.features.role.Role;
import com.springboot.MyTodoList.web.features.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public record CustomUserDetails(
        User user,                      // Your JPA Entity (Database)
        Map<String, Object> attributes, // Oracle Claims (sub, email, etc.)
        OidcIdToken idToken             // The raw JWT from Oracle
) implements OidcUser, UserDetails {

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();

        // Map your DB Roles and Permissions into Spring Authorities
        for (Role role : user.getRoles()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
            role.getPermissions().forEach(p ->
                authorities.add(new SimpleGrantedAuthority(p.getName()))
            );
        }
        return authorities;
    }

    // --- UserDetails Methods ---
    @Override
    public String getPassword() { return null; } // JWT auth doesn't use passwords

    @Override
    public String getUsername() { return user.getEmail(); }

    // --- Required OidcUser Implementations ---

    @Override
    public Map<String, Object> getAttributes() { return attributes; }

    @Override
    public String getName() {
        // Oracle uniquely identifies users by 'sub' (the SCIM ID)
        return (String) attributes.get("sub");
    }

    @Override
    public OidcUserInfo getUserInfo() { return null; }

    @Override
    public OidcIdToken getIdToken() { return idToken; }

    @Override
    public Map<String, Object> getClaims() { return idToken.getClaims(); }

    public Object getUser() {
        return this.user;
    }
}