package com.example.server.service;

import com.example.server.repository.RegisterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RegisterServiceImpl RegisterService {

    @Autowired
    private RegisterRepository registerRepository;

    @Override
    public register findById(Long id) {
        return userRepository.findById(id).map(UserDto::new).orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Override
    public void updateUser(Long id, UserDto userDto) {
        User existingUser = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
        existingUser.setFirstName(userDto.getFirstName());
        existingUser.setLastName(userDto.getLastName());
        existingUser.setEmail(userDto.getEmail());
        userRepository.save(existingUser);
    }
}
