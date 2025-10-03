package com.musicinsights.filter;

import com.musicinsights.config.ApplicationConfig;
import com.musicinsights.model.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.WeakKeyException;
import io.jsonwebtoken.io.DecodingException;
import org.glassfish.jersey.server.ContainerRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Priority;
import javax.inject.Inject;
import javax.ws.rs.Priorities;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import javax.ws.rs.ext.Provider;
import java.io.IOException;
import java.security.Principal;
import java.security.Key;
import java.util.List;
import io.jsonwebtoken.SignatureAlgorithm;
import javax.crypto.SecretKey;

/**
 * JWT Authentication Filter that validates the token from the Authorization header.
 */
@Provider
@Priority(Priorities.AUTHENTICATION)
public class AuthenticationFilter implements ContainerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);
    private static final String AUTHENTICATION_SCHEME = "Bearer";
    private static final String[] PUBLIC_PATHS = {
            "auth/login",
            "auth/register",
            "api-docs",
            "swagger.json",
            "swagger.yaml"
    };

    // The key is now non-final and assigned in the constructor
    private SecretKey key;

    @Inject
    public AuthenticationFilter(ApplicationConfig config) {
        try {
            // Decode the Base64 key provided by ApplicationConfig
            byte[] decodedSecret = Decoders.BASE64.decode(config.getJwtSecret());
            this.key = Keys.hmacShaKeyFor(decodedSecret);
            logger.info("AuthenticationFilter initialized using configured JWT secret.");
        } catch (DecodingException | WeakKeyException e) {
            logger.error("FATAL: AuthenticationFilter failed to initialize key from config ({}). Token validation will be unreliable.", e.getMessage());
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
    }

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(requestContext.getMethod())) {
            return;
        }

        String path = ((ContainerRequest) requestContext).getPath(true);
        if (isPublicPath(path)) {
            return;
        }

        String authorizationHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);

        if (!isTokenBasedAuthentication(authorizationHeader)) {
            abortWithUnauthorized(requestContext);
            return;
        }

        String token = authorizationHeader.substring(AUTHENTICATION_SCHEME.length()).trim();

        try {
            validateToken(token);
            setSecurityContext(requestContext, token);
        } catch (Exception e) {
            logger.error("Authentication error: {}", e.getMessage());
            abortWithUnauthorized(requestContext);
        }
    }

    private boolean isPublicPath(String path) {
        if (path == null) return false;
        String normalized = path.startsWith("/") ? path.substring(1) : path;
        for (String publicPath : PUBLIC_PATHS) {
            if (normalized.startsWith(publicPath)) {
                return true;
            }
        }
        return false;
    }

    private boolean isTokenBasedAuthentication(String authorizationHeader) {
        return authorizationHeader != null &&
                authorizationHeader.toLowerCase().startsWith(AUTHENTICATION_SCHEME.toLowerCase() + " ");
    }

    private void abortWithUnauthorized(ContainerRequestContext requestContext) {
        requestContext.abortWith(
                Response.status(Response.Status.UNAUTHORIZED)
                        .header("WWW-Authenticate", AUTHENTICATION_SCHEME)
                        .entity("Authentication required")
                        .build()
        );
    }

    private void validateToken(String token) throws Exception {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
        } catch (Exception e) {
            throw new Exception("Invalid or expired token", e);
        }
    }

    private void setSecurityContext(ContainerRequestContext requestContext, String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        String username = claims.getSubject();
        List<String> roles = claims.get("roles", List.class);

        final SecurityContext currentSecurityContext = requestContext.getSecurityContext();
        requestContext.setSecurityContext(new SecurityContext() {
            @Override
            public Principal getUserPrincipal() {
                return new UserPrincipal(username, roles);
            }

            @Override
            public boolean isUserInRole(String role) {
                return roles != null && roles.contains(role);
            }

            @Override
            public boolean isSecure() {
                return currentSecurityContext.isSecure();
            }

            @Override
            public String getAuthenticationScheme() {
                return AUTHENTICATION_SCHEME;
            }
        });
    }
}