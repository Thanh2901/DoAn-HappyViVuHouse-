package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.BlogStoreRequest;
import org.example.backend.dto.response.BlogStoreResponse;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.exception.BadRequestException;
import org.example.backend.model.BlogStore;
import org.example.backend.model.Room;
import org.example.backend.model.User;
import org.example.backend.repository.BlogStoreRepository;
import org.example.backend.repository.RoomRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.BaseService;
import org.example.backend.service.BlogStoreService;
import org.example.backend.utils.MapperUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BlogStoreServiceImpl extends BaseService implements BlogStoreService {

    private final BlogStoreRepository blogStoreRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final MapperUtils mapperUtils;

    @Override
    public MessageResponse saveBlog(BlogStoreRequest storeRequest) {
        User customer = userRepository.findById(getUserId()).orElseThrow(()-> new BadRequestException("Tài khoản không tồn tại"));
        Room room = roomRepository.findById(storeRequest.getRoomId()).orElseThrow(()->new BadRequestException("Thông tin phòng khi không tồn tại"));
        Optional<BlogStore> blogStore = blogStoreRepository.findByRoomAndUser(room, customer);
        if (blogStore.isPresent()) {
            throw new BadRequestException("Bài đăng khi đã được lưu");
        }
        BlogStore blogStore1 = new BlogStore();
        blogStore1.setRoom(room);
        blogStore1.setUser(customer);
        blogStoreRepository.save(blogStore1);
        return MessageResponse.builder().message("Đã lưu bài thành công").build();
    }

    @Override
    public Page<BlogStoreResponse> getPageOfBlog(Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(blogStoreRepository.getPageOfBlogStore(getUserId(), pageable),BlogStoreResponse.class, pageable);
    }
}
