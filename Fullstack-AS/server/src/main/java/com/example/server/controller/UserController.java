package com.example.server.controller;

import com.example.server.entity.User;
import com.example.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    // standard constructors

    @Autowired
    private UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return (List<User>) userRepository.findAll();
    }

    @PostMapping("/users")
    void addUser(@RequestBody User user) {
        userRepository.save(user);
    }

    @DeleteMapping("/delete")
    void deleteUser(@RequestBody User user) {
        Long userId = user.getId();
        if (userRepository.existsById(userId)) {
            userRepository.deleteById(userId);
            System.out.println("Deleted user with ID: " + userId);
        } else {
            System.out.println("User with ID " + userId + " not found.");
        }
    }


}
