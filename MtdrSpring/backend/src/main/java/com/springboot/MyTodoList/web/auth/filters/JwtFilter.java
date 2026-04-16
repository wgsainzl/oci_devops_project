package com.springboot.MyTodoList.web.auth.filters;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.MyTodoList.web.auth.jwt.JwtUtil;
import com.springboot.MyTodoList.web.config.PublicUrlConfig;
import com.springboot.MyTodoList.web.exception.ApiErrorResponse;
import com.springboot.MyTodoList.web.exception.customExtensions.TokenRevokedException;
import com.springboot.MyTodoList.web.exception.customExtensions.TokenValidationException;
import com.springboot.MyTodoList.web.features.user.userDetails.CustomUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ApplicationContext applicationContext;
    //    private final BlacklistService blacklistService;
    private final PublicUrlConfig publicUrlConfig;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return publicUrlConfig.isPublic(request);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws JwtException, TokenValidationException {
        try {
            Optional<String> tokenOpt = extractToken(request);
            if (tokenOpt.isEmpty()) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = tokenOpt.get();

//            // Check if token is blacklisted TODO
//            if (blacklistService.isBlacklisted(token)) {
//                throw new TokenRevokedException("Token has been revoked");
//            }

            processToken(token, request);

            // Add security headers
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("X-Frame-Options", "DENY");
            response.setHeader("X-XSS-Protection", "1; mode=block");

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {
            log.error("JWT Expired: {}", e.getMessage());
            setErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT Filter Error", e.getMessage());
        } catch (JwtException e) { // Catches other JwtException types (e.g., MalformedJwtException, SignatureException)
            log.error("JWT Error: {}", e.getMessage());
            setErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT Filter Error", e.getMessage());
        } catch (TokenValidationException | TokenRevokedException e) {
            // These are your custom exceptions, treat them similarly to JWT exceptions for authentication failures
            log.error("Token Validation/Revocation Error: {}", e.getMessage());
            setErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT Filter Error", e.getMessage());
        } catch (Exception e) {
            // Catch any other unexpected exceptions and return an internal server error
            log.error("Unhandled Exception in JwtFilter: {}", e.getMessage(), e);
            setErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, "Server Error", "An unexpected error occurred");
        }

    }

    private Optional<String> extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return Optional.of(header.substring(7));
        }
        return Optional.empty();
    }

    private void processToken(String token, HttpServletRequest request) {
        String username = jwtUtil.extractUsername(token);
        if (username == null) {
            throw new TokenValidationException("Username not found in token");
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = applicationContext.getBean(CustomUserDetailsService.class).loadUserByUsername(username);

            if (!jwtUtil.validateToken(token, userDetails)) {
                throw new TokenValidationException("Invalid JWT token");
            }

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("Authentication set for user: {}", username);
        }
    }


    private void setErrorResponse(HttpServletResponse response, HttpStatus status, String error, String message) {
        try {
            response.setStatus(status.value());
            response.setContentType("application/json");
            // Use your existing ApiErrorResponse structure for consistency
            ApiErrorResponse apiErrorResponse = ApiErrorResponse.of(status, error, message);
            objectMapper.writeValue(response.getWriter(), apiErrorResponse);
        } catch (IOException e) {
            log.error("Error writing error response to client", e);
        }
    }

}
