package com.ewaste.controller;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.ewaste.model.Transaction;
import com.ewaste.model.User;
import com.ewaste.model.Wallet;
import com.ewaste.repository.TransactionRepository;
import com.ewaste.repository.UserRepository;
import com.ewaste.repository.WalletRepository;
import com.ewaste.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PaymentController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // =========================================================
    // 1️⃣ CREATE CHECKOUT SESSION
    // =========================================================
    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> requestBody) {

        try {
            Integer userId = Integer.valueOf(requestBody.get("userId").toString());
            Integer requestId = requestBody.get("requestId") != null
                    ? Integer.valueOf(requestBody.get("requestId").toString())
                    : null;
            Double amount = Double.valueOf(requestBody.get("amount").toString());

            if (userId == null || amount == null) {
                return ResponseEntity.badRequest().body("userId and amount are required");
            }

            Stripe.apiKey = stripeSecretKey;

            // ✅ Create Stripe Session FIRST
            SessionCreateParams params =
                    SessionCreateParams.builder()
                            .setMode(SessionCreateParams.Mode.PAYMENT)
                            .setSuccessUrl("http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}")
                            .setCancelUrl("http://localhost:3000/payment-failed")
                            .addLineItem(
                                    SessionCreateParams.LineItem.builder()
                                            .setQuantity(1L)
                                            .setPriceData(
                                                    SessionCreateParams.LineItem.PriceData.builder()
                                                            .setCurrency("usd")
                                                            .setUnitAmount((long) (amount * 100))
                                                            .setProductData(
                                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                            .setName("E-waste Payment")
                                                                            .build()
                                                            )
                                                            .build()
                                            )
                                            .build()
                            )
                            .build();

            Session session = Session.create(params);

            if (session == null || session.getId() == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Stripe session creation failed");
            }

            // ✅ Save transaction AFTER session creation
            Transaction txn = new Transaction();
            txn.setUserId(userId);
            txn.setRequestId(requestId);
            txn.setAmount(amount);
            txn.setType("DEBIT");
            txn.setStatus("PENDING");
            txn.setStripeSessionId(session.getId());

            transactionRepository.save(txn);

            Map<String, String> response = new HashMap<>();
            response.put("checkoutUrl", session.getUrl());
            response.put("sessionId", session.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create checkout session",
                            "message", e.getMessage()));
        }
    }


    // =========================================================
    // 2️⃣ VERIFY PAYMENT
    // =========================================================
    @GetMapping("/verify-session")
    public ResponseEntity<?> verifySession(@RequestParam String sessionId) {

        try {
            Stripe.apiKey = stripeSecretKey;

            Session session = Session.retrieve(sessionId);

            if (!"paid".equals(session.getPaymentStatus())) {
                return ResponseEntity.badRequest().body("Payment not completed");
            }

            // ✅ Find transaction using stripeSessionId
            Optional<Transaction> optionalTx =
                    transactionRepository.findByStripeSessionId(sessionId);

            if (optionalTx.isEmpty()) {
                return ResponseEntity.badRequest().body("Transaction not found");
            }

            Transaction tx = optionalTx.get();

            if (!"PENDING".equals(tx.getStatus())) {
                return ResponseEntity.ok("Already processed");
            }

            Integer userId = tx.getUserId();
            Double amount = tx.getAmount();

            Wallet wallet = walletRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));

            // ✅ Add amount to wallet
            wallet.setBalance(wallet.getBalance() - amount);
            walletRepository.save(wallet);

            // ✅ Update transaction
            tx.setStatus("SUCCESS");
            transactionRepository.save(tx);

            // ✅ Send email
            User user = userRepository.findById(Long.valueOf(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));

            emailService.sendTemplateEmail(
                    user.getEmail(),
                    "Payment Successful",
                    "redeem-success",
                    Map.of(
                            "userName", user.getName(),
                            "amount", amount,
                            "balance", wallet.getBalance()
                    )
            );

            return ResponseEntity.ok("Payment Successful");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment verification failed",
                            "message", e.getMessage()));
        }
    }
}