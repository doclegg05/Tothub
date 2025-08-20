package com.tothub.timefold.controller;

import com.tothub.timefold.dto.SchedulingRequest;
import com.tothub.timefold.dto.SchedulingResponse;
import com.tothub.timefold.service.SchedulingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SchedulingController {

    private final SchedulingService schedulingService;

    @Autowired
    public SchedulingController(SchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    @PostMapping("/solve")
    public ResponseEntity<SchedulingResponse> solve(@Valid @RequestBody SchedulingRequest request) {
        try {
            SchedulingResponse response = schedulingService.solve(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            SchedulingResponse errorResponse = new SchedulingResponse(
                null, 0.0, "error", 0, 
                null, List.of("Error processing request: " + e.getMessage())
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Timefold Scheduling Service is running");
    }

    @GetMapping("/solver-status")
    public ResponseEntity<String> solverStatus() {
        return ResponseEntity.ok("Solver is ready");
    }
}
