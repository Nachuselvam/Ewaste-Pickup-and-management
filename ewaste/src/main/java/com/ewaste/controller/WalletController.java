package com.ewaste.controller;

import com.ewaste.model.Transaction;
import com.ewaste.model.Wallet;
import com.ewaste.repository.TransactionRepository;
import com.ewaste.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WalletController {

    @Autowired
    private WalletRepository walletRepo;

    @Autowired
    private TransactionRepository txnRepo;

    @GetMapping("/user/wallet/{userId}")
    public Wallet getWallet(@PathVariable Integer userId) {
        return walletRepo.findByUserId(userId)
                .orElse(new Wallet());
    }

    @GetMapping("/user/transactions/{userId}")
    public List<Transaction> getTransactions(@PathVariable Long userId) {
        return txnRepo.findByUserId(userId);
    }
}
