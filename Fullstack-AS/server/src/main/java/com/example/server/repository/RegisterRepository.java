package com.example.server.repository;


import com.example.server.entity.Register;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegisterRepository extends CrudRepository<Register, Long> {
}
