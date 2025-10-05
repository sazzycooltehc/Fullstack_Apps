package com.musicinsights.resource;

import com.musicinsights.model.AuthResponse;
import com.musicinsights.model.LoginRequest;
import com.musicinsights.service.AuthenticationService;
import com.musicinsights.config.ApplicationConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Form;
import java.util.HashMap;
import java.util.Map;
import java.util.Base64;

/**
 * REST API resource for authentication endpoints.
 */
@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {
    private static final Logger logger = LoggerFactory.getLogger(AuthResource.class);
    
    private final AuthenticationService authService;
    private final ApplicationConfig config;
    private final Client httpClient = ClientBuilder.newClient();
    // In-memory store: spotify_user_id -> refresh_token
    private static final Map<String, String> SPOTIFY_REFRESH_TOKENS = new HashMap<>();
    
    @Inject
    public AuthResource(AuthenticationService authService, ApplicationConfig config) {
        this.authService = authService;
        this.config = config;
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
    
    // --- Spotify OAuth ---
    @GET
    @Path("/spotify/login")
    public Response spotifyLogin(@QueryParam("redirect") String redirectAfter) {
        String clientId = config.getSpotifyClientId();
        String redirectUri = config.getSpotifyRedirectUri();
        String scope = "user-read-email user-read-private user-top-read user-read-recently-played playlist-read-private user-library-read";        String state = redirectAfter != null ? redirectAfter : "";
        logger.info("Spotify login init - redirectUri from config: {}", redirectUri);

        String authorizeUrl = UriBuilder.fromUri("https://accounts.spotify.com/authorize")
                .queryParam("client_id", clientId)
                .queryParam("response_type", "code")
                .queryParam("redirect_uri", redirectUri)
                .queryParam("scope", scope)
                .queryParam("state", state)
                .build()
                .toString();

        logger.info("Redirecting to Spotify authorize URL: {}", authorizeUrl);

        return Response.seeOther(java.net.URI.create(authorizeUrl)).build();
    }

    @GET
    @Path("/spotify/callback")
    @Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_HTML})
    public Response spotifyCallback(@QueryParam("code") String code, @QueryParam("state") String state) {
        try {
            if (code == null || code.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("Missing authorization code"))
                        .build();
            }

            // Exchange code for tokens
            Form form = new Form()
                    .param("grant_type", "authorization_code")
                    .param("code", code)
                    .param("redirect_uri", config.getSpotifyRedirectUri());

            String basic = Base64.getEncoder().encodeToString((config.getSpotifyClientId() + ":" + config.getSpotifyClientSecret()).getBytes());

            Response tokenResp = httpClient.target("https://accounts.spotify.com/api/token")
                    .request(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Basic " + basic)
                    .post(Entity.entity(form, MediaType.APPLICATION_FORM_URLENCODED_TYPE));

            if (tokenResp.getStatus() != 200) {
                String errBody;
                try { errBody = tokenResp.readEntity(String.class); } catch (Exception ex) { errBody = "<no body>"; }
                logger.error("Spotify token exchange failed. Status: {} Body: {}", tokenResp.getStatus(), errBody);
                return Response.status(Response.Status.BAD_GATEWAY)
                        .entity(createErrorResponse("Spotify token exchange failed"))
                        .build();
            }

            Map tokenJson = tokenResp.readEntity(Map.class);
            String accessToken = (String) tokenJson.get("access_token");
            String refreshToken = (String) tokenJson.get("refresh_token");

            // Fetch user profile
            Response meResp = httpClient.target("https://api.spotify.com/v1/me")
                    .request(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + accessToken)
                    .get();

            if (meResp.getStatus() != 200) {
                logger.error("Spotify /me failed. Status: {}", meResp.getStatus());
                return Response.status(Response.Status.BAD_GATEWAY)
                        .entity(createErrorResponse("Failed to fetch Spotify profile"))
                        .build();
            }

            Map profile = meResp.readEntity(Map.class);
            String spotifyUserId = (String) profile.get("id");
            if (spotifyUserId == null || spotifyUserId.isEmpty()) {
                return Response.status(Response.Status.BAD_GATEWAY)
                        .entity(createErrorResponse("Invalid Spotify profile"))
                        .build();
            }

            if (refreshToken != null && !refreshToken.isEmpty()) {
                SPOTIFY_REFRESH_TOKENS.put(spotifyUserId, refreshToken);
            }

            String appJwt = authService.issueToken(spotifyUserId);

            if (state != null && !state.isEmpty()) {
                String redirectUrl = state + "#token=" + appJwt;
                return Response.seeOther(java.net.URI.create(redirectUrl)).build();
            }

            String html = "<!DOCTYPE html><html><body><script>" +
                    "(function(){" +
                    "  if(window.opener){window.opener.postMessage({type:'APP_JWT', token:'" + appJwt + "'}, '*'); window.close();}" +
                    "  else { document.write('Login successful. Copy this token: " + appJwt + "'); }" +
                    "})();" +
                    "</script></body></html>";
            return Response.ok(html, MediaType.TEXT_HTML).build();
        } catch (Exception e) {
            logger.error("Spotify callback error", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(createErrorResponse("Spotify callback processing failed"))
                    .build();
        }
    }

    @GET
    @Path("/spotify/token")
    public Response getUserSpotifyAccessToken(@HeaderParam("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(createErrorResponse("Missing bearer token"))
                        .build();
            }
            String appJwt = authHeader.substring("Bearer ".length()).trim();
            String spotifyUserId = authService.validateToken(appJwt);
            if (spotifyUserId == null || spotifyUserId.isEmpty()) {
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(createErrorResponse("Invalid app token"))
                        .build();
            }

            String refreshToken = SPOTIFY_REFRESH_TOKENS.get(spotifyUserId);
            if (refreshToken == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(createErrorResponse("No Spotify link for this user"))
                        .build();
            }

            Form form = new Form()
                    .param("grant_type", "refresh_token")
                    .param("refresh_token", refreshToken);

            String basic = Base64.getEncoder().encodeToString((config.getSpotifyClientId() + ":" + config.getSpotifyClientSecret()).getBytes());

            Response tokenResp = httpClient.target("https://accounts.spotify.com/api/token")
                    .request(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Basic " + basic)
                    .post(Entity.entity(form, MediaType.APPLICATION_FORM_URLENCODED_TYPE));

            if (tokenResp.getStatus() != 200) {
                String errBody;
                try { errBody = tokenResp.readEntity(String.class); } catch (Exception ex) { errBody = "<no body>"; }
                logger.error("Spotify refresh failed. Status: {} Body: {}", tokenResp.getStatus(), errBody);
                return Response.status(Response.Status.BAD_GATEWAY)
                        .entity(createErrorResponse("Failed to refresh Spotify token"))
                        .build();
            }

            Map tokenJson = tokenResp.readEntity(Map.class);
            Map<String, Object> out = new HashMap<>();
            out.put("access_token", tokenJson.get("access_token"));
            out.put("token_type", tokenJson.get("token_type"));
            out.put("expires_in", tokenJson.get("expires_in"));
            return Response.ok(out).build();
        } catch (Exception e) {
            logger.error("Error providing Spotify access token", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(createErrorResponse("Internal error"))
                    .build();
        }
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
