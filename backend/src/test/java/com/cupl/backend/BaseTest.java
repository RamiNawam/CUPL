package com.cupl.backend;

import com.cupl.backend.config.DataInitializer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class BaseTest {
    // Disable DataInitializer in tests to avoid conflicts
    @MockBean
    private DataInitializer dataInitializer;
}
