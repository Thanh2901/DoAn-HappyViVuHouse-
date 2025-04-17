package org.example.backend.service;

import org.example.backend.dto.request.BlogStoreRequest;
import org.example.backend.dto.response.BlogStoreResponse;
import org.example.backend.dto.response.MessageResponse;
import org.springframework.data.domain.Page;

public interface BlogStoreService {
    MessageResponse saveBlog(BlogStoreRequest storeRequest);

    Page<BlogStoreResponse> getPageOfBlog(Integer pageNo, Integer pageSize);
}
