package com.ewaste.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    // ------------------- FAQ with keywords -------------------
    private final Map<String[], String> faqKeywords = new LinkedHashMap<>() {{
        put(new String[]{"e-waste"}, "E-waste refers to discarded electronic devices like phones, laptops, TVs, etc.");
        put(new String[]{"recycle","e-waste"}, "Recycling prevents environmental pollution, saves resources, and promotes sustainability.");
        put(new String[]{"schedule","pickup"}, "Login, go to 'Request Pickup', fill the form, and submit.");
        put(new String[]{"pickup","free"}, "Yes, pickup is free of cost.");
        put(new String[]{"items","accepted"}, "We accept mobile phones, laptops, desktops, TVs, refrigerators, batteries, and other electronic items.");
        put(new String[]{"items","not","accepted"}, "We do not accept biohazard waste, chemicals, or non-electronic junk.");
        put(new String[]{"track","pickup","request"}, "Go to your dashboard → 'My Requests' → check status.");
        put(new String[]{"pending"}, "Your request has been received and is waiting for admin approval.");
        put(new String[]{"approved"}, "Your request has been approved and will be scheduled soon.");
        put(new String[]{"scheduled"}, "A pickup personnel has been assigned and a date/time is fixed.");
        put(new String[]{"completed"}, "Your pickup has been successfully completed.");
        put(new String[]{"rejected"}, "Your request was rejected. Please check reason or contact support.");
        put(new String[]{"cancel","pickup"}, "Yes, you can cancel before it is marked as 'Scheduled'.");
        put(new String[]{"reschedule","pickup"}, "Yes, rescheduling is possible before personnel visit.");
        put(new String[]{"pay","pickup"}, "No, pickup is completely free.");
        put(new String[]{"rewards","recycling"}, "Yes, users may receive points, certificates, or eco-badges.");
        put(new String[]{"otp","not","receive"}, "Check your spam folder or request OTP again.");
        put(new String[]{"verify","pickup","completion"}, "Pickup personnel will share OTP, enter it in app to confirm.");
        put(new String[]{"otp","invalid"}, "Request a new OTP or contact support.");
        put(new String[]{"someone","else","hand","over"}, "Yes, but OTP verification is required.");
        put(new String[]{"certificate","recycling"}, "Yes, certificates are issued for completed pickups.");
        put(new String[]{"data","safe","devices"}, "Please wipe personal data before handing over devices.");
        put(new String[]{"contact","support"}, "You can email support@ewaste.com or call our helpline.");
        put(new String[]{"history","pickups"}, "Go to Dashboard → My Requests → Completed.");
    }};

    // ------------------- Normalize text -------------------
    private String normalize(String text) {
        return text.toLowerCase().replaceAll("[^a-z0-9 ]", "");
    }

    // ------------------- Handle Chatbot Query -------------------
    @PostMapping
    public ResponseEntity<?> getAnswer(@RequestBody Map<String, String> body) {
        String question = body.get("question");
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("answer", "Please provide a question."));
        }

        String normalizedQuestion = normalize(question);

        // Match by keywords: ANY keyword matches (more forgiving)
        String answer = faqKeywords.entrySet().stream()
                .filter(entry -> {
                    for (String kw : entry.getKey()) {
                        if (normalizedQuestion.contains(normalize(kw))) {
                            return true;
                        }
                    }
                    return false;
                })
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse("❓ Sorry, I don’t have an answer for that. Please contact support.");

        return ResponseEntity.ok(Map.of("answer", answer));
    }
}
