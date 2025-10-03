package com.musicinsights.resource;

import com.musicinsights.service.MusicService;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST API resource for music analysis endpoints.
 */
@Path("/analyze")
@Produces(MediaType.APPLICATION_JSON)
public class MusicResource {
    private static final Logger logger = LoggerFactory.getLogger(MusicResource.class);
    
    private final MusicService musicService;
    
    // Maximum file size: 10MB
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    // Allowed audio file types
    private static final String[] ALLOWED_TYPES = {
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", 
        "audio/flac", "audio/m4a", "audio/aac"
    };
    
    @Inject
    public MusicResource(MusicService musicService) {
        this.musicService = musicService;
    }
    
    /**
     * Upload and analyze an audio file.
     *
     * @param fileInputStream The input stream of the uploaded file
     * @param fileMetaData The metadata of the uploaded file
     * @return Analysis results
     */
    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadAndAnalyze(
            @FormDataParam("file") InputStream fileInputStream,
            @FormDataParam("file") FormDataContentDisposition fileMetaData) {
        
        logger.info("File upload request: {}", fileMetaData != null ? fileMetaData.getFileName() : "unknown");
        
        try {
            // Validate file
            if (fileInputStream == null || fileMetaData == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("No file uploaded"))
                        .build();
            }
            
            String fileName = fileMetaData.getFileName();
            long fileSize = fileMetaData.getSize();
            String contentType = fileMetaData.getType();
            
            // Validate file size
            if (fileSize > MAX_FILE_SIZE) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("File size exceeds maximum limit of 10MB"))
                        .build();
            }
            
            // Validate file type
            if (!isValidAudioFile(fileName, contentType)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("Invalid file type. Only audio files are allowed"))
                        .build();
            }
            
            // Analyze the audio file
            Map<String, Object> analysis = musicService.analyzeAudio(
                    fileInputStream, fileName, fileSize, contentType);
            
            logger.info("File analyzed successfully: {}", fileName);
            return Response.ok(analysis).build();
            
        } catch (Exception e) {
            logger.error("Error analyzing uploaded file: {}", e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(createErrorResponse("Failed to analyze file: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Analyze a track by its ID.
     *
     * @param trackId The track ID
     * @return Analysis results
     */
    @GET
    @Path("/track/{trackId}/analyze")
    public Response analyzeTrackById(@PathParam("trackId") String trackId) {
        logger.info("Analyze track by ID: {}", trackId);

        try {
            if (trackId == null || trackId.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("Track ID is required"))
                        .build();
            }

            Map<String, Object> analysis = musicService.analyzeTrackById(trackId);
            return Response.ok(analysis).build();

        } catch (Exception e) {
            logger.error("Error analyzing track by ID: {}", e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(createErrorResponse("Failed to analyze track: " + e.getMessage()))
                    .build();
        }
    }
    
    /**
     * Search for music tracks.
     *
     * @param query The search query
     * @return List of matching tracks
     */
    @GET
    @Path("/search")
    public Response searchTracks(@QueryParam("q") String query) {
        logger.info("Search request: {}", query);
        
        try {
            if (query == null || query.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("Search query is required"))
                        .build();
            }
            
            List<Map<String, Object>> results = musicService.searchTracks(query);
            
            Map<String, Object> response = new HashMap<>();
            response.put("query", query);
            response.put("results", results);
            response.put("count", results.size());
            
            return Response.ok(response).build();
            
        } catch (Exception e) {
            logger.error("Error searching tracks: {}", e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(createErrorResponse("Failed to search tracks: " + e.getMessage()))
                    .build();
        }
    }
    
    /**
     * Analyze a track from a URL.
     *
     * @param request The request containing the URL
     * @return Analysis results
     */
    @POST
    @Path("/url")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response analyzeFromUrl(Map<String, String> request) {
        String url = request != null ? request.get("url") : null;
        logger.info("URL analysis request: {}", url);
        
        try {
            if (url == null || url.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("URL is required"))
                        .build();
            }
            
            // Validate URL format
            if (!isValidUrl(url)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("Invalid URL format"))
                        .build();
            }
            
            Map<String, Object> analysis = musicService.analyzeFromUrl(url);
            
            logger.info("URL analyzed successfully: {}", url);
            return Response.ok(analysis).build();
            
        } catch (Exception e) {
            logger.error("Error analyzing URL: {}", e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(createErrorResponse("Failed to analyze URL: " + e.getMessage()))
                    .build();
        }
    }
    
    /**
     * Get track details by ID.
     *
     * @param trackId The track ID
     * @return Track details
     */
    @GET
    @Path("/track/{trackId}")
    public Response getTrackDetails(@PathParam("trackId") String trackId) {
        logger.info("Get track details: {}", trackId);
        
        try {
            if (trackId == null || trackId.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("Track ID is required"))
                        .build();
            }
            
            Map<String, Object> track = musicService.getTrackDetails(trackId);
            
            return Response.ok(track).build();
            
        } catch (Exception e) {
            logger.error("Error getting track details: {}", e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(createErrorResponse("Failed to get track details: " + e.getMessage()))
                    .build();
        }
    }
    
    /**
     * Get similar tracks based on a track ID.
     *
     * @param trackId The track ID
     * @return List of similar tracks
     */
    @GET
    @Path("/similar/{trackId}")
    public Response getSimilarTracks(@PathParam("trackId") String trackId) {
        logger.info("Get similar tracks for: {}", trackId);
        
        try {
            if (trackId == null || trackId.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(createErrorResponse("Track ID is required"))
                        .build();
            }
            
            List<Map<String, Object>> similarTracks = musicService.getSimilarTracks(trackId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("trackId", trackId);
            response.put("similarTracks", similarTracks);
            response.put("count", similarTracks.size());
            
            return Response.ok(response).build();
            
        } catch (Exception e) {
            logger.error("Error getting similar tracks: {}", e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(createErrorResponse("Failed to get similar tracks: " + e.getMessage()))
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
        response.put("service", "music-analysis");
        response.put("timestamp", System.currentTimeMillis());
        
        return Response.ok(response).build();
    }
    
    // Helper methods
    
    private boolean isValidAudioFile(String fileName, String contentType) {
        if (fileName == null) {
            return false;
        }
        
        // Check file extension
        String lowerFileName = fileName.toLowerCase();
        boolean hasValidExtension = lowerFileName.endsWith(".mp3") || 
                                   lowerFileName.endsWith(".wav") ||
                                   lowerFileName.endsWith(".ogg") ||
                                   lowerFileName.endsWith(".flac") ||
                                   lowerFileName.endsWith(".m4a") ||
                                   lowerFileName.endsWith(".aac");
        
        // Check content type if available
        if (contentType != null) {
            for (String allowedType : ALLOWED_TYPES) {
                if (contentType.toLowerCase().contains(allowedType.toLowerCase())) {
                    return true;
                }
            }
        }
        
        return hasValidExtension;
    }
    
    private boolean isValidUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        
        // Basic URL validation
        String lowerUrl = url.toLowerCase();
        return lowerUrl.startsWith("http://") || lowerUrl.startsWith("https://");
    }
    
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return error;
    }
}
