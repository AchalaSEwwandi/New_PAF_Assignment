package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    // ─── Get All Resources ─────────────────────────────────────────────────────

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // ─── Get By ID ─────────────────────────────────────────────────────────────

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    // ─── Create Resource ───────────────────────────────────────────────────────

    public Resource createResource(ResourceRequest dto) {
        Resource resource = new Resource();
        mapDtoToEntity(dto, resource);
        resource.setCreatedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());
        return resourceRepository.save(resource);
    }

    // ─── Update Resource ───────────────────────────────────────────────────────

    public Resource updateResource(String id, ResourceRequest dto) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
        mapDtoToEntity(dto, existing);
        existing.setUpdatedAt(LocalDateTime.now());
        return resourceRepository.save(existing);
    }

    // ─── Delete Resource ───────────────────────────────────────────────────────

    public void deleteResource(String id) {
        // verify exists first
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException(id);
        }
        resourceRepository.deleteById(id);
    }

    // ─── Search Resources ──────────────────────────────────────────────────────

    public List<Resource> searchResources(String type, String location, Integer minCapacity, String status, String search) {

        // If all params are null return everything
        if (type == null && location == null && minCapacity == null && status == null && search == null) {
            return resourceRepository.findAll();
        }

        List<Resource> results = resourceRepository.findAll();

        if (type != null && !type.equalsIgnoreCase("ALL")) {
            Resource.ResourceType resourceType = Resource.ResourceType.valueOf(type.toUpperCase());
            results = results.stream()
                    .filter(r -> r.getType() == resourceType)
                    .toList();
        }

        if (location != null && !location.isEmpty()) {
            String lowerLocation = location.toLowerCase();
            results = results.stream()
                    .filter(r -> (r.getLocation() != null && r.getLocation().toLowerCase().contains(lowerLocation)) ||
                                 (r.getBuilding() != null && r.getBuilding().toLowerCase().contains(lowerLocation)))
                    .toList();
        }

        if (minCapacity != null) {
            results = results.stream()
                    .filter(r -> r.getCapacity() >= minCapacity)
                    .toList();
        }

        if (status != null && !status.equalsIgnoreCase("ALL")) {
            Resource.ResourceStatus resourceStatus = Resource.ResourceStatus.valueOf(status.toUpperCase());
            results = results.stream()
                    .filter(r -> r.getStatus() == resourceStatus)
                    .toList();
        }

        if (search != null && !search.isEmpty()) {
            String query = search.toLowerCase();
            results = results.stream()
                    .filter(r -> (r.getName() != null && r.getName().toLowerCase().contains(query)) ||
                                 (r.getLocation() != null && r.getLocation().toLowerCase().contains(query)) ||
                                 (r.getBuilding() != null && r.getBuilding().toLowerCase().contains(query)) ||
                                 (r.getType() != null && r.getType().toString().toLowerCase().contains(query)) ||
                                 (r.getDescription() != null && r.getDescription().toLowerCase().contains(query)))
                    .toList();
        }

        return results;
    }

    // ─── Private Helper ────────────────────────────────────────────────────────

    private void mapDtoToEntity(ResourceRequest dto, Resource resource) {
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setBuilding(dto.getBuilding());
        resource.setFloor(dto.getFloor());
        resource.setStatus(dto.getStatus());
        resource.setDescription(dto.getDescription());
        resource.setAmenities(dto.getAmenities());
        resource.setAvailabilityWindows(dto.getAvailabilityWindows());
    }
}
