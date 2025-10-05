package com.musicinsights.model;

import java.security.Principal;
import java.util.List;

/**
 * Represents an authenticated user principal with roles.
 */
public class UserPrincipal implements Principal {
    
    private final String username;
    private final List<String> roles;
    
    public UserPrincipal(String username, List<String> roles) {
        this.username = username;
        this.roles = roles;
    }
    
    @Override
    public String getName() {
        return username;
    }
    
    public List<String> getRoles() {
        return roles;
    }
    
    public boolean isUserInRole(String role) {
        return roles != null && roles.contains(role);
    }
}
