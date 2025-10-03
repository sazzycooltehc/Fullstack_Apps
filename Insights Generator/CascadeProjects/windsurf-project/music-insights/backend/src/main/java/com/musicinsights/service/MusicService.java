package com.musicinsights.service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * Service interface for music-related operations.
 */
public interface MusicService {
    
    /**
     * Search for music tracks by query.
     *
     * @param query The search query
     * @return A list of matching tracks
     */
    List<Map<String, Object>> searchTracks(String query);
    
    /**
     * Get track details by ID.
     *
     * @param trackId The track ID
     * @return The track details
     */
    Map<String, Object> getTrackDetails(String trackId);
    
    /**
     * Analyze an audio file.
     *
     * @param fileStream The input stream of the audio file
     * @param fileName The name of the file
     * @param fileSize The size of the file in bytes
     * @param contentType The content type of the file
     * @return The analysis results
     */
    Map<String, Object> analyzeAudio(InputStream fileStream, String fileName, long fileSize, String contentType);
    
    /**
     * Get similar tracks based on a track ID.
     *
     * @param trackId The track ID
     * @return A list of similar tracks
     */
    List<Map<String, Object>> getSimilarTracks(String trackId);
    
    /**
     * Analyze a track from a URL.
     *
     * @param url The URL of the track
     * @return The analysis results
     */
    Map<String, Object> analyzeFromUrl(String url);

    /**
     * Analyze a track by its ID.
     *
     * @param trackId The track ID
     * @return The analysis results
     */
    Map<String, Object> analyzeTrackById(String trackId);
}
