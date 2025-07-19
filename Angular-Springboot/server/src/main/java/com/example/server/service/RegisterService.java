package com.example.server.service;

import com.example.server.entity.Register;

public interface RegisterService {
    Register findById(Long id);
    void updateUser(Long id, Register updatedUser);
}
