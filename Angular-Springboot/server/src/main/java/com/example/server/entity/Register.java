package com.example.server.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "\"register\"")
public class Register {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private long id;
    private String name;
    private String email;
    private String address;
    private String createdON;

    public Register() {
        this.name = "";
        this.email = "";
        this.address = null;
        this.createdON = "";
    }

    public Register(String name, String email, String address, String createdON) {
        this.name = name;
        this.email = email;
        this.address = address;
        this.createdON = createdON;
    }

    public long getRegisterId() {
        return id;
    }

    public String getRegisterName() {
        return name;
    }

    public String getRegisterEmail() {
        return email;
    }

    public String getRegisterAddress() {
        return address;
    }

    public String getCreatedON() {
        return createdON;
    }

    @Override
    public String toString() {
        return "User{" + "id=" + id + ", name=" + name + ", email=" + email + '}';
    }

    public void setId(long l) {
        this.id = id;
    }

    public void setFirstName(String firstName) {
        this.name = firstName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

}
