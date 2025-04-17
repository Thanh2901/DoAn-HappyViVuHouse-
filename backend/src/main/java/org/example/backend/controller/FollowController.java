package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.FollowRequest;
import org.example.backend.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping
    public ResponseEntity<?> followAgents(@RequestBody FollowRequest followRequest){
        return ResponseEntity.ok(followService.addFollow(followRequest));
    }

    @GetMapping
    public ResponseEntity<?> getAllAgents(@RequestParam Integer pageNo,
                                          @RequestParam Integer pageSize) {
        return ResponseEntity.ok(followService.getAllFollowOfCustomer(pageNo, pageSize));
    }
}
