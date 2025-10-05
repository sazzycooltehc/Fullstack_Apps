package com.musicinsights.service.impl;

import com.musicinsights.config.ApplicationConfig;
import com.musicinsights.service.MusicService;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.util.*;

/**
 * Implementation of the MusicService interface.
 * Handles music-related operations and communicates with the Python analytics service.
 */
public class MusicServiceImpl implements MusicService {
    private static final Logger logger = LoggerFactory.getLogger(MusicServiceImpl.class);
    
    private final ApplicationConfig config;
    private final Client httpClient;
    private final Gson gson;
    
    @Inject
    public MusicServiceImpl(ApplicationConfig config) {
        this.config = config;
        this.httpClient = ClientBuilder.newClient();
        this.gson = new Gson();
    }
    
    @Override
    public Map<String, Object> analyzeTrackById(String trackId) {
        logger.info("Analyzing track by ID: {}", trackId);
        // For demo purposes, generate analysis based on ID
        return generateMockAnalysis("track_" + trackId);
    }
    
    @Override
    public List<Map<String, Object>> searchTracks(String query) {
        logger.info("Searching for tracks with query: {}", query);
        
        try {
            String pythonServiceUrl = config.getPythonServiceUrl();
            WebTarget target = httpClient.target(pythonServiceUrl)
                    .path("/analyze/search")
                    .queryParam("q", query);
            
            Response response = target.request(MediaType.APPLICATION_JSON).get();
            
            if (response.getStatus() == 200) {
                String jsonResponse = response.readEntity(String.class);
                Type listType = new TypeToken<List<Map<String, Object>>>(){}.getType();
                return gson.fromJson(jsonResponse, listType);
            } else {
                logger.error("Failed to search tracks. Status: {}", response.getStatus());
                return getMockSearchResults(query);
            }
        } catch (Exception e) {
            logger.error("Error searching tracks: {}", e.getMessage());
            return getMockSearchResults(query);
        }
    }
    
    @Override
    public Map<String, Object> getTrackDetails(String trackId) {
        logger.info("Getting track details for ID: {}", trackId);
        
        // For demo purposes, return mock data
        Map<String, Object> track = new HashMap<>();
        track.put("id", trackId);
        track.put("title", "Sample Track " + trackId);
        track.put("artist", "Sample Artist");
        track.put("album", "Sample Album");
        track.put("year", 2023);
        track.put("duration", "3:45");
        track.put("genre", Arrays.asList("Pop", "Electronic"));
        
        return track;
    }
    
    @Override
    public Map<String, Object> analyzeAudio(InputStream fileStream, String fileName, 
                                           long fileSize, String contentType) {
        logger.info("Analyzing audio file: {} (size: {} bytes)", fileName, fileSize);
        
        File tempFile = null;
        try {
            // Save the uploaded file temporarily
            tempFile = File.createTempFile("upload_", "_" + fileName);
            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = fileStream.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
            }
            
            // For demo purposes, return mock analysis data
            // In production, send to Python service for real analysis
            return generateMockAnalysis(fileName);
            
        } catch (Exception e) {
            logger.error("Error analyzing audio file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to analyze audio file", e);
        } finally {
            // Clean up temporary file
            if (tempFile != null && tempFile.exists()) {
                try {
                    Files.delete(tempFile.toPath());
                } catch (Exception e) {
                    logger.warn("Failed to delete temporary file: {}", tempFile.getAbsolutePath());
                }
            }
        }
    }
    
    @Override
    public List<Map<String, Object>> getSimilarTracks(String trackId) {
        logger.info("Getting similar tracks for ID: {}", trackId);
        
        List<Map<String, Object>> similarTracks = new ArrayList<>();
        
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> track = new HashMap<>();
            track.put("id", "similar_" + i);
            track.put("name", "Similar Track " + i);
            track.put("artist", "Similar Artist " + i);
            track.put("album", "Similar Album " + i);
            track.put("match", 0.95 - (i * 0.1));
            similarTracks.add(track);
        }
        
        return similarTracks;
    }
    
    @Override
    public Map<String, Object> analyzeFromUrl(String url) {
        logger.info("Analyzing track from URL: {}", url);
        
        try {
            String pythonServiceUrl = config.getPythonServiceUrl();
            WebTarget target = httpClient.target(pythonServiceUrl)
                    .path("/analyze/url");
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("url", url);
            
            Response response = target.request(MediaType.APPLICATION_JSON)
                    .post(Entity.json(requestBody));
            
            if (response.getStatus() == 200) {
                String jsonResponse = response.readEntity(String.class);
                Type mapType = new TypeToken<Map<String, Object>>(){}.getType();
                return gson.fromJson(jsonResponse, mapType);
            } else {
                logger.error("Failed to analyze URL. Status: {}", response.getStatus());
                return generateMockAnalysis("url_track");
            }
        } catch (Exception e) {
            logger.error("Error analyzing URL: {}", e.getMessage());
            return generateMockAnalysis("url_track");
        }
    }
    
    // Helper methods
    
    private List<Map<String, Object>> getMockSearchResults(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> track = new HashMap<>();
            track.put("id", String.valueOf(i));
            track.put("title", query + " - Track " + i);
            track.put("artist", "Artist " + i);
            track.put("album", "Album " + i);
            track.put("year", 2020 + i);
            track.put("duration", String.format("%d:%02d", 3 + (i % 3), 15 + (i * 10)));
            results.add(track);
        }
        
        return results;
    }
    
    private Map<String, Object> generateMockAnalysis(String filename) {
        Random random = new Random();
        
        // Generate mock audio features
        Map<String, Object> audioFeatures = new HashMap<>();
        audioFeatures.put("duration", 180 + random.nextInt(240));
        audioFeatures.put("tempo", 80 + random.nextInt(100));
        audioFeatures.put("key", getRandomKey());
        audioFeatures.put("mode", random.nextBoolean() ? "major" : "minor");
        audioFeatures.put("time_signature", 4);
        audioFeatures.put("energy", 0.1 + random.nextDouble() * 0.9);
        audioFeatures.put("danceability", 0.1 + random.nextDouble() * 0.9);
        audioFeatures.put("valence", 0.1 + random.nextDouble() * 0.9);
        audioFeatures.put("acousticness", random.nextDouble());
        audioFeatures.put("instrumentalness", random.nextDouble() * 0.8);
        audioFeatures.put("liveness", random.nextDouble() * 0.3);
        audioFeatures.put("speechiness", random.nextDouble() * 0.5);
        audioFeatures.put("loudness", -30 - random.nextDouble() * 20);
        
        // Generate similar tracks
        List<Map<String, Object>> similarTracks = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            Map<String, Object> track = new HashMap<>();
            track.put("name", "Similar Track " + (i + 1));
            track.put("artist", "Similar Artist " + (i + 1));
            track.put("album", "Similar Album " + (i + 1));
            track.put("match", 0.6 + random.nextDouble() * 0.4);
            similarTracks.add(track);
        }
        
        // Sort by match percentage
        similarTracks.sort((a, b) -> 
            Double.compare((Double) b.get("match"), (Double) a.get("match")));
        
        // Create the main analysis result
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("title", filename.replaceAll("\\.[^.]+$", "").replace("_", " "));
        analysis.put("artist", getRandomArtist());
        analysis.put("album", "Album " + (char) ('A' + random.nextInt(26)));
        analysis.put("genre", getRandomGenres());
        analysis.put("year", 1990 + random.nextInt(35));
        
        int durationSec = (int) audioFeatures.get("duration");
        analysis.put("duration", String.format("%d:%02d", durationSec / 60, durationSec % 60));
        analysis.put("popularity", 30 + random.nextInt(71));
        analysis.put("audioFeatures", audioFeatures);
        analysis.put("similarTracks", similarTracks);
        
        return analysis;
    }
    
    private String getRandomKey() {
        String[] keys = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"};
        return keys[new Random().nextInt(keys.length)];
    }
    
    private String getRandomArtist() {
        String[] artists = {"The Beatles", "Michael Jackson", "Queen", "Taylor Swift", 
                           "Kendrick Lamar", "Daft Punk", "Hans Zimmer", "Nirvana"};
        return artists[new Random().nextInt(artists.length)];
    }
    
    private List<String> getRandomGenres() {
        String[][] genreSets = {
            {"Rock", "Classic Rock", "Progressive Rock"},
            {"Pop", "Dance Pop", "Electropop"},
            {"Hip-Hop", "Rap", "Trap"},
            {"Jazz", "Fusion", "Smooth Jazz"},
            {"Electronic", "House", "Techno"},
            {"Classical", "Orchestral", "Piano"}
        };
        String[] selected = genreSets[new Random().nextInt(genreSets.length)];
        return Arrays.asList(selected);
    }
}
