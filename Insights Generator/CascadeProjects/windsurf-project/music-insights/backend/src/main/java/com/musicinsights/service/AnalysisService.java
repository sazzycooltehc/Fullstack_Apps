package com.musicinsights.service;

import java.util.Map;

/**
 * Service interface for analyzing music and audio files.
 */
public interface AnalysisService {
    
    /**
     * Analyze audio features from the given data.
     *
     * @param audioData The audio data to analyze
     * @return A map containing the analysis results
     */
    Map<String, Object> analyzeAudioFeatures(byte[] audioData);
    
    /**
     * Extract metadata from the audio file.
     *
     * @param audioData The audio data to extract metadata from
     * @return A map containing the extracted metadata
     */
    Map<String, Object> extractMetadata(byte[] audioData);
    
    /**
     * Get genre predictions for the audio.
     *
     * @param audioData The audio data to analyze
     * @return A map containing genre predictions with confidence scores
     */
    Map<String, Double> predictGenre(byte[] audioData);
    
    /**
     * Get mood/emotion predictions for the audio.
     *
     * @param audioData The audio data to analyze
     * @return A map containing mood predictions with confidence scores
     */
    Map<String, Double> predictMood(byte[] audioData);
    
    /**
     * Get similar tracks based on audio features.
     *
     * @param audioData The audio data to find similar tracks for
     * @param limit Maximum number of similar tracks to return
     * @return A list of similar tracks with similarity scores
     */
    Map<String, Object> findSimilarTracks(byte[] audioData, int limit);
}
