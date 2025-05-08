package com.example.server;

import com.example.server.entity.User;
import com.example.server.repository.UserRepository;
import com.example.server.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.stream.Stream;

@SpringBootApplication
public class ServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServerApplication.class, args);
    }

    //	@Bean
//	CommandLineRunner init(UserRepository userRepository) {
//		return args -> {
//			Stream.of("John", "Julie", "Jennifer", "Helen", "Rachel").forEach(name -> {
//				User user = new User(name, name.toLowerCase() + "@domain.com");
//				userRepository.save(user);
//			});
//			userRepository.findAll().forEach(System.out::println);
//		};
//	}
    @Autowired
    private UserRepository userRepository;

    @Bean
    CommandLineRunner init(UserService userService) {
        // Create default users
        return args -> {
//            Stream.of("John", "Julie", "Jennifer", "Helen", "Rachel").forEach(name -> {
//                User user = new User(name, name.toLowerCase() + "@domain.com");
//                userRepository.save(user);
//            });
//            userRepository.findAll().forEach(System.out::println);

            // Get manual input from user
            userService.getUserInput();
        };
    }
}