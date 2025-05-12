package com.example.server.service;

import com.example.server.entity.Register;
import com.example.server.repository.RegisterRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RegisterServiceImpl implements RegisterService {

    @Autowired
    private RegisterRepository registerRepository;

    @Override
    public Register findById(Long id) {
        return registerRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Override
    public void updateUser(Long id, Register updatedUser) {
        Register existingUser = registerRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
        existingUser.setFirstName(updatedUser.getRegisterName());
        existingUser.setEmail(updatedUser.getRegisterEmail());
        registerRepository.save(existingUser);
    }
}
