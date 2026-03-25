package com.ewaste.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ewaste.model.dto.PickupPersonnelDTO;
import com.ewaste.service.PickupPersonnelService;

@RestController
@RequestMapping("/api/pickup-personnel")
@CrossOrigin
public class PickupPersonnelController {

    private final PickupPersonnelService service;

    public PickupPersonnelController(PickupPersonnelService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PickupPersonnelDTO>> getPickupPersonnel(
            @RequestParam String address) {

        List<PickupPersonnelDTO> list =
                service.getPickupPersonnelSorted(address);

        return ResponseEntity.ok(list);
    }
}