package com.musicinsights;

import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.util.Properties;

public class Main {
    private static final Logger logger = LoggerFactory.getLogger(Main.class);
    
    // Base URI the Grizzly HTTP server will listen on
    public static final String BASE_URI = "http://localhost:8084/api";
    
    /**
     * Starts Grizzly HTTP server exposing JAX-RS resources defined in this application.
     * @return Grizzly HTTP server.
     */
    public static HttpServer startServer() {
        // Create a resource config that scans for JAX-RS resources and providers
        final ResourceConfig rc = new ResourceConfig()
                .packages("com.musicinsights.resource")
                .register(new com.musicinsights.config.ApplicationBinder())
                .register(com.musicinsights.filter.AuthenticationFilter.class)
                .register(com.musicinsights.filter.CorsFilter.class)
                .register(MultiPartFeature.class);
        
        // Create and start a new instance of grizzly http server
        return GrizzlyHttpServerFactory.createHttpServer(URI.create(BASE_URI), rc);
    }
    
    /**
     * Main method.
     * @param args Command line arguments.
     * @throws IOException If there is an error starting the server.
     */
    public static void main(String[] args) throws IOException {
        // Load application properties
        Properties props = new Properties();
        try {
            props.load(Main.class.getClassLoader().getResourceAsStream("application.properties"));
            logger.info("Application properties loaded successfully");
        } catch (IOException e) {
            logger.error("Error loading application.properties", e);
            throw new RuntimeException("Failed to load application properties", e);
        }
        
        // Start the server
        final HttpServer server = startServer();
        logger.info("Jersey app started with WADL available at {}application.wadl\n" +
                "Hit enter to stop it...", BASE_URI);
        
        // Add shutdown hook
        Runtime.getRuntime().addShutdownHook(new Thread(server::shutdownNow));
        
        // Keep the server running until user presses enter
        System.in.read();
        server.shutdown();
    }
}
