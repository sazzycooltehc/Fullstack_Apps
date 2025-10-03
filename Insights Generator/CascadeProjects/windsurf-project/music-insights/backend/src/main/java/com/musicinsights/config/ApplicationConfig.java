package com.musicinsights.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import javax.annotation.PostConstruct;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Application configuration class that loads properties from application.properties.
 */
@Singleton
public class ApplicationConfig {
    private static final Logger logger = LoggerFactory.getLogger(ApplicationConfig.class);
    private static final String CONFIG_FILE = "/application.properties";
    
    private final Properties properties = new Properties();
    
    // Configuration keys
    public static final String JWT_SECRET = "jwt.secret";
    public static final String JWT_EXPIRATION_MS = "jwt.expiration.ms";
    public static final String PYTHON_SERVICE_URL = "python.service.url";
    
    @PostConstruct
    public void init() {
        try (InputStream input = getClass().getResourceAsStream(CONFIG_FILE)) {
            if (input == null) {
                logger.warn("Unable to find {}", CONFIG_FILE);
                return;
            }
            properties.load(input);
            logger.info("Loaded application configuration from {}", CONFIG_FILE);
        } catch (IOException e) {
            logger.error("Error loading application configuration", e);
        }
    }
    
    public String getProperty(String key) {
        return properties.getProperty(key);
    }
    
    public String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }
    
    public String getJwtSecret() {
        return getProperty(JWT_SECRET, "MWYyZDFlMmU2N2RmNGYzNmQ3YTM0Njk2YzFhMjg5YjQ=");
    }
    
    public long getJwtExpirationMs() {
        String rawValue = getProperty(JWT_EXPIRATION_MS, "3600000"); // 1 hour default
        if (rawValue.contains("#")) {
            rawValue = rawValue.substring(0, rawValue.indexOf("#"));
        }
        
        try {
            return Long.parseLong(rawValue.trim()); 
        } catch (NumberFormatException e) {
            logger.error("Failed to parse JWT Expiration time from config. Using default of 3600000 ms.", e);
            return 3600000;
        }
    }
    
    public String getPythonServiceUrl() {
        return getProperty(PYTHON_SERVICE_URL, "http://localhost:8000");
    }
}
