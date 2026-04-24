package com.springboot.MyTodoList.web.security;

import com.springboot.MyTodoList.web.auth.filters.JwtFilter;
import com.springboot.MyTodoList.web.auth.jwt.JwtUtil;
import com.springboot.MyTodoList.web.auth.oci.OciOidcUserService;
import com.springboot.MyTodoList.web.features.user.userDetails.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfiguration {

    private final OciOidcUserService ociOidcUserService; // Your existing service
    private final JwtUtil jwtUtil; // Your JwtUtil

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter jwtFilter, InMemoryClientRegistrationRepository clientRegistrationRepository) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/login**", "/error**", "/oauth2/**").permitAll()
                        // Telegram bot calls these without a browser session or JWT
                        .requestMatchers("/summary-jobs", "/summary-jobs/**", "/tasks/summary", "/tasks/summary/**")
                        .permitAll()
                        .anyRequest().authenticated())

                .oauth2Login(oauth -> oauth.
                        userInfoEndpoint(userInfo -> userInfo
                                .oidcUserService(ociOidcUserService))
                        .successHandler((request, response, authentication) -> {
                            // 1. Get the user from the authentication object
                            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

                            // 2. Generate internal JWT using your JwtUtil
                            String token = jwtUtil.generateAccessToken(userDetails.getUsername());

                            // 3. Redirect to Vite with the token in the query string
                            // Your React app should catch this in the URL
                            response.sendRedirect("http://localhost:3000/oauth2/redirect?token=" + token);
                        }))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .logout(logout -> logout
                        .logoutSuccessHandler(oidcLogoutSuccessHandler(clientRegistrationRepository))
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                );


        return http.build();
    }

    private LogoutSuccessHandler oidcLogoutSuccessHandler(ClientRegistrationRepository clientRegistrationRepository) {
        OidcClientInitiatedLogoutSuccessHandler oidcLogoutSuccessHandler =
                new OidcClientInitiatedLogoutSuccessHandler(clientRegistrationRepository);

        // After Oracle logs the user out, where should they go?
        // This URL must be registered in your OCI Console as a "Post-Logout Redirect URI"
        oidcLogoutSuccessHandler.setPostLogoutRedirectUri("http://localhost:3000/login");

        return oidcLogoutSuccessHandler;
    }
}
