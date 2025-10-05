package com.musicinsights.filter;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.Provider;
import java.io.IOException;

/**
 * CORS (Cross-Origin Resource Sharing) filter to allow requests from different origins.
 */
@Provider
public class CorsFilter implements ContainerResponseFilter {
    
    @Override
    public void filter(ContainerRequestContext requestContext, 
                      ContainerResponseContext responseContext) throws IOException {
        
        MultivaluedMap<String, Object> headers = responseContext.getHeaders();
        
        // Allow all origins
        headers.add("Access-Control-Allow-Origin", "*");
        
        // Allow specific headers and methods
        headers.add("Access-Control-Allow-Headers", 
                   "origin, content-type, accept, authorization, X-Requested-With");
        headers.add("Access-Control-Allow-Credentials", "true");
        headers.add("Access-Control-Allow-Methods", 
                   "GET, POST, PUT, DELETE, OPTIONS, HEAD");
        
        // Allow preflight requests to be cached
        headers.add("Access-Control-Max-Age", "1209600");
        
        // Expose custom headers
        headers.add("Access-Control-Expose-Headers", "authorization, content-type");
    }
}
