package com.ewaste.repository;

import com.ewaste.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Integer userId);
}

