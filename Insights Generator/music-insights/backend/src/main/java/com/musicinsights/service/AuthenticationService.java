package com.musicinsights.service;

import com.musicinsights.model.AuthResponse;
import com.musicinsights.model.LoginRequest;

/**
 * Service interface for handling user authentication.
 */
public interface AuthenticationService {
    
    /**
     * Authenticate a user with the provided credentials.
     *
     * @param loginRequest The login request containing username and password
     * @return An authentication response with a JWT token if successful
     * @throws SecurityException if authentication fails
     */
    AuthResponse authenticate(LoginRequest loginRequest) throws SecurityException;
    
    /**
     * Validate a JWT token.
     *
     * @param token The JWT token to validate
     * @return The username if the token is valid
     * @throws SecurityException if the token is invalid
     */
    String validateToken(String token) throws SecurityException;

    /**
     * Issue a JWT for the specified username (without password verification).
     * Intended for use after external OAuth (e.g., Spotify) has authenticated the user.
     */
    String issueToken(String username);
}
