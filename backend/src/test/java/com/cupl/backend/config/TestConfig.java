package com.cupl.backend.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class TestConfig {
    // This configuration disables DataInitializer in tests
    // by providing a no-op implementation
    @Bean
    @Primary
    public DataInitializer testDataInitializer() {
        return new DataInitializer(null, null, null, null, null, null) {
            @Override
            public void run(String... args) {
                // No-op for tests
            }
        };
    }
}
