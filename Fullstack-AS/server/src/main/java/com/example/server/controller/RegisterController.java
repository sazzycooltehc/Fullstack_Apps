package com.example.server.controller;

import com.example.server.entity.Register;
import com.example.server.service.RegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.server.repository.RegisterRepository;

import java.util.List;

@RestController
@RequestMapping("/register")
@CrossOrigin(origins = "http://localhost:4200")
public class RegisterController {

    @Autowired
    private RegisterRepository registerRepository;
    private RegisterService registerService;

    @GetMapping("/{id}")
    public ResponseEntity<Register> getUserById(@PathVariable Long id) {
        return new ResponseEntity<>(registerService.findById(id), HttpStatus.OK);
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Register updatedUser) {
        registerService.updateUser(id, updatedUser);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
