package org.example.backend.service;

import org.example.backend.dto.request.RequestRequest;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.dto.response.RequiredResponse;
import org.springframework.data.domain.Page;

public interface RequestService {
    Page<RequiredResponse> getRequestOfRentHome(String keyword, Integer pageNo, Integer pageSize);

    MessageResponse changeStatusOfRequest(Long id);

    RequiredResponse getRequest(Long id);

    Page<RequiredResponse> getRequestOfCustomer(String keyword, String phone, Integer pageNo, Integer pageSize);

    MessageResponse addRequest(RequestRequest request);

    Page<RequiredResponse> getRequestByTitleAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<RequiredResponse> getRequestByAnswerAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<RequiredResponse> getRequestByAnswerDesc(String keyword, Integer pageNo, Integer pageSize);
}
