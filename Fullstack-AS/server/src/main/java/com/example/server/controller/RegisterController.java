package com.example.server.controller;

import com.example.server.entity.Register;
import com.example.server.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.server.repository.RegisterRepository;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class RegisterController {

    @Autowired
    private RegisterRepository registerRepository;

    @GetMapping("/registerdtls")
    public List<Register> getRegister() {
        return (List<Register>) registerRepository.findAll();
    }

    @PostMapping("/registerdtls")
    void addUser(@RequestBody Register register) {
        register = registerRepository.save(register); // Assign the persisted object back to user
        System.out.println("Saved ID: " + register.getRegisterId());
    }

}
