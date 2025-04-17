package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.RequestRequest;
import org.example.backend.service.RequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/request")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @GetMapping
    public ResponseEntity<?> getRequestOfRentHome(
            @RequestParam(required = false) String keyword,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(requestService.getRequestOfRentHome(keyword, pageNo, pageSize));
    }

    @GetMapping("/customer")
    public ResponseEntity<?> getRequestOfCustomer(@RequestParam String keyword,
                                                  @RequestParam String phone,
                                                  @RequestParam Integer pageNo,
                                                  @RequestParam Integer pageSize){
        return ResponseEntity.ok(requestService.getRequestOfCustomer(keyword, phone, pageNo, pageSize));
    }

    @PostMapping
    public ResponseEntity<?> addRequest(@RequestBody RequestRequest request) {
        return ResponseEntity.ok(requestService.addRequest(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getRequest(id));
    }

    @PostMapping("/{id}")
    public ResponseEntity<?> changeStatus(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.changeStatusOfRequest(id));
    }

    // get request order by isAnswer asc
    @GetMapping("/filter/answer-asc")
    public ResponseEntity<?> getRequestByAnswerAsc(
            @RequestParam(required = false) String keyword,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(requestService.getRequestByAnswerAsc(keyword, pageNo, pageSize));
    }

    // get request order by isAnswer desc
    @GetMapping("/filter/answer-desc")
    public ResponseEntity<?> getRequestByAnswerDesc(
            @RequestParam(required = false) String keyword,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(requestService.getRequestByAnswerDesc(keyword, pageNo, pageSize));
    }
}

