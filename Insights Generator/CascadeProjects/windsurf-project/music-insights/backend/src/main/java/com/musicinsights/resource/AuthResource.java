package com.musicinsights.resource;

import com.musicinsights.model.AuthResponse;
import com.musicinsights.model.LoginRequest;
import com.musicinsights.service.AuthenticationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;

/**
 * REST API resource for authentication endpoints.
 */
@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {
    private static final Logger logger = LoggerFactory.getLogger(AuthResource.class);
    
    private final AuthenticationService authService;
    
    @Inject
    public AuthResource(AuthenticationService authService) {
        this.authService = authService;
    }
    
    /**
     * Login endpoint to authenticate users and generate JWT tokens.
     *
     * @param loginRequest The login credentials
     * @return Authentication response with JWT token
     */
    @POST
    @Path("/login")
    public Response login(LoginRequest loginRequest) {
        logger.info("Login attempt for user: {}", loginRequest.getUsername());
        
        try {
            // Validate input
            if (loginRequest.getUsername() == null || loginRequest.getUsername().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("Username is required"))
                        .build();
            }
            
            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("Password is required"))
                        .build();
            }
            
            // Authenticate user
            AuthResponse authResponse = authService.authenticate(loginRequest);
            
            logger.info("User logged in successfully: {}", loginRequest.getUsername());
            return Response.ok(authResponse).build();
            
        } catch (SecurityException e) {
            logger.error("Authentication failed: {}", e.getMessage());
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(createErrorResponse("Invalid credentials"))
                    .build();
        } catch (Exception e) {
            logger.error("Login error: {}", e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(createErrorResponse("An error occurred during login"))
                    .build();
        }
    }
    
    /**
     * Validate token endpoint.
     *
     * @param token The JWT token to validate
     * @return Validation result
     */
    @POST
    @Path("/validate")
    public Response validateToken(@HeaderParam("Authorization") String authHeader) {
        logger.info("Token validation request");
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("Invalid authorization header"))
                        .build();
            }
            
            String token = authHeader.substring("Bearer ".length()).trim();
            String username = authService.validateToken(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("username", username);
            
            return Response.ok(response).build();
            
        } catch (SecurityException e) {
            logger.error("Token validation failed: {}", e.getMessage());
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(createErrorResponse("Invalid or expired token"))
                    .build();
        } catch (Exception e) {
            logger.error("Token validation error: {}", e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(createErrorResponse("An error occurred during validation"))
                    .build();
        }
    }
    
    /**
     * Logout endpoint (for demo purposes, actual logout is handled client-side).
     *
     * @return Success response
     */
    @POST
    @Path("/logout")
    public Response logout() {
        logger.info("Logout request");
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        
        return Response.ok(response).build();
    }
    
    /**
     * Health check endpoint.
     *
     * @return Health status
     */
    @GET
    @Path("/health")
    public Response health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "authentication");
        response.put("timestamp", System.currentTimeMillis());
        
        return Response.ok(response).build();
    }
    
    // Helper methods
    
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return error;
    }
}
