package com.musicinsights.config;

import org.glassfish.hk2.utilities.binding.AbstractBinder;

import com.musicinsights.service.AnalysisService;
import com.musicinsights.service.AuthenticationService;
import com.musicinsights.service.MusicService;
import com.musicinsights.service.impl.AnalysisServiceImpl;
import com.musicinsights.service.impl.AuthenticationServiceImpl;
import com.musicinsights.service.impl.MusicServiceImpl;

import javax.inject.Singleton;

/**
 * Application binder for dependency injection.
 */
public class ApplicationBinder extends AbstractBinder {
    @Override
    protected void configure() {
        // Bind services
        bind(AuthenticationServiceImpl.class).to(AuthenticationService.class).in(Singleton.class);
        bind(MusicServiceImpl.class).to(MusicService.class).in(Singleton.class);
        bind(AnalysisServiceImpl.class).to(AnalysisService.class).in(Singleton.class);
        
        // Bind configuration
        bind(ApplicationConfig.class).to(ApplicationConfig.class).in(Singleton.class);
    }
}
