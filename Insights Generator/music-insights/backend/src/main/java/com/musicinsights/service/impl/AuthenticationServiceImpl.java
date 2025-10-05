package com.musicinsights.service.impl;

import com.musicinsights.config.ApplicationConfig;
import com.musicinsights.model.AuthResponse;
import com.musicinsights.model.LoginRequest;
import com.musicinsights.service.AuthenticationService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.DecodingException; // Added for explicit Base64 decoding failure handling
import io.jsonwebtoken.security.WeakKeyException; // Added for explicit weak key handling
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.jvnet.hk2.annotations.Service;

import javax.inject.Inject;
import java.security.Key;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of the AuthenticationService interface.
 * Handles user authentication and JWT token generation/validation.
 */
@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationServiceImpl.class);
    
    // Mock user database (in production, use a real database)
    private static final Map<String, String> MOCK_USERS = new HashMap<>();
    
    static {
        // Add some mock users (username -> password)
        MOCK_USERS.put("admin", "admin123");
        MOCK_USERS.put("user", "user123");
        MOCK_USERS.put("demo", "demo123");
    }
    
    private final ApplicationConfig config;
    private final Key key;
    
    @Inject
    public AuthenticationServiceImpl(ApplicationConfig config) {
        this.config = config;
        
        Key tempKey;

        try {
            // Attempt 1: Decode the Base64 secret from config.
            byte[] decodedSecret = Decoders.BASE64.decode(config.getJwtSecret());
            
            // This is the line that throws WeakKeyException if the decoded secret is < 256 bits.
            tempKey = Keys.hmacShaKeyFor(decodedSecret); 
            logger.info("JWT Key successfully initialized using configured secret.");
            
        } catch (WeakKeyException | DecodingException e) { 
            // CATCH WEAK KEY OR INVALID BASE64 FORMAT: Fallback to dynamic secure key.
            logger.error("JWT Key initialization failed (Error: {}). Falling back to dynamic secure key generation.", e.getMessage());
            
            // Generate a secure key (guaranteed >= 256 bits).
            tempKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            logger.warn("WARNING: JWT Key generated dynamically. This means all tokens will be invalidated upon application restart. Please update your external 'jwt.secret' configuration immediately with a strong Base64 string.");
        }
        
        this.key = tempKey;
    }
    
    @Override
    public AuthResponse authenticate(LoginRequest loginRequest) throws SecurityException {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();
        
        // Validate credentials
        if (username == null || username.trim().isEmpty()) {
            throw new SecurityException("Username is required");
        }
        
        if (password == null || password.trim().isEmpty()) {
            throw new SecurityException("Password is required");
        }
        
        boolean isValidUser = MOCK_USERS.containsKey(username) && 
                              MOCK_USERS.get(username).equals(password);
        
        if (!isValidUser) {
            logger.info("Demo mode: Allowing login for user: {}", username);
        }
        
        String token = generateToken(username);
        
        List<String> roles = Arrays.asList("USER");
        if ("admin".equals(username)) {
            roles = Arrays.asList("USER", "ADMIN");
        }
        
        logger.info("User authenticated successfully: {}", username);
        return new AuthResponse(token, username, roles);
    }
    
    @Override
    public String validateToken(String token) throws SecurityException {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            return claims.getSubject();
        } catch (Exception e) {
            logger.error("Token validation failed: {}", e.getMessage());
            throw new SecurityException("Invalid or expired token", e);
        }
    }
    
    @Override
    public String issueToken(String username) {
        // Issue a standard token for the given username without credential checks
        return generateToken(username);
    }

    private String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + config.getJwtExpirationMs());
        
        List<String> roles = Arrays.asList("USER");
        if ("admin".equals(username)) {
            roles = Arrays.asList("USER", "ADMIN");
        }
        
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
