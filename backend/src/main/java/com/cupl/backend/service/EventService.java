package com.cupl.backend.service;

import com.cupl.backend.dto.EventRequest;
import com.cupl.backend.model.Event;
import com.cupl.backend.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final ImageService imageService;

    public EventService(EventRepository eventRepository, ImageService imageService) {
        this.eventRepository = eventRepository;
        this.imageService = imageService;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAllOrderByCreatedAtDesc();
    }

    public Event createEvent(EventRequest request) {
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDate(request.getDate());
        event.setLocation(request.getLocation());
        event.setDescription(request.getDescription());
        
        // Save image to filesystem if provided
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                String imagePath = imageService.saveBase64Image(request.getImage(), "events");
                event.setImage(imagePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save event image", e);
            }
        } else {
            event.setImage(null);
        }

        return eventRepository.save(event);
    }
}
