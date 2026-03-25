package com.ewaste.repository;

import com.ewaste.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    // Get all transactions of a user
    List<Transaction> findByUserId(Long userId);

    // Get all transactions sorted by newest first
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Integer userId);

    // Check if stripe session already exists
    boolean existsByStripeSessionId(String stripeSessionId);

    // Find transaction using stripe session id
    Optional<Transaction> findByStripeSessionId(String stripeSessionId);
}