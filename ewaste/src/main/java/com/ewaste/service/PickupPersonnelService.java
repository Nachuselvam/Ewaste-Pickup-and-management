package com.ewaste.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ewaste.model.dto.PickupPersonnelDTO;
import com.ewaste.model.User;
import com.ewaste.repository.UserRepository;
import com.ewaste.repository.EwasteRequestRepository;

@Service
public class PickupPersonnelService {

    private final UserRepository userRepo;
    private final EwasteRequestRepository requestRepo;

    public PickupPersonnelService(UserRepository userRepo,
                                  EwasteRequestRepository requestRepo) {
        this.userRepo = userRepo;
        this.requestRepo = requestRepo;
    }

    public List<PickupPersonnelDTO> getPickupPersonnelSorted(String requestAddress) {

        // Avoid null address
        if (requestAddress == null) {
            requestAddress = "";
        }

        List<User> pickupUsers = userRepo.findByRole("PICKUP");

        List<PickupPersonnelDTO> result = new ArrayList<>();

        for (User u : pickupUsers) {

            Long pending = requestRepo.countPendingRequests(Math.toIntExact(u.getId()));

            String address = u.getAddress() != null ? u.getAddress() : "";
            String email = u.getEmail() != null ? u.getEmail() : "";

            result.add(
                    new PickupPersonnelDTO(
                            Math.toIntExact(u.getId()),
                            u.getName(),
                            address,
                            pending,
                            email
                    )
            );
        }

        String finalRequestAddress = requestAddress.toLowerCase();

        result.sort((a, b) -> {

            boolean aMatch = finalRequestAddress.contains(
                    a.getAddress().toLowerCase()
            );

            boolean bMatch = finalRequestAddress.contains(
                    b.getAddress().toLowerCase()
            );

            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;

            return Long.compare(a.getPendingCount(), b.getPendingCount());
        });

        return result;
    }
}