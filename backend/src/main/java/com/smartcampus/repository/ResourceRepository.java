package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.model.Resource;
//Repository interface for Resource entity, extends MongoRepository to provide CRUD operations
@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByType(Resource.ResourceType type);

    List<Resource> findByStatus(Resource.ResourceStatus status);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(int capacity);

    List<Resource> findByTypeAndStatus(Resource.ResourceType type, Resource.ResourceStatus status);
}
