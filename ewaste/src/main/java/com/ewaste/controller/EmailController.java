package com.ewaste.controller;

import com.ewaste.service.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class EmailController {

    @Autowired
    private EmailService emailService;

    // ================== TEST TEMPLATE EMAIL ==================
    @GetMapping("/send-template-mail")
    public String sendTemplateMail(@RequestParam String to) {
        try {
            emailService.sendTemplateEmail(
                    to,
                    "Welcome to Ewaste System",
                    "welcome", // Thymeleaf template name in resources/templates/
                    Map.of("name", "Test User")
            );
            return "Template email sent successfully to " + to;
        } catch (MessagingException e) {
            e.printStackTrace();
            return "Failed to send template email: " + e.getMessage();
        }
    }
}
