package org.example.backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.CommentDTO;
import org.example.backend.dto.request.AssetRequest;
import org.example.backend.dto.request.RoomRequest;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.dto.response.RoomResponse;
import org.example.backend.enums.LockedStatus;
import org.example.backend.enums.RoomStatus;
import org.example.backend.exception.BadRequestException;
import org.example.backend.model.*;
import org.example.backend.repository.*;
import org.example.backend.service.BaseService;
import org.example.backend.service.FileStorageService;
import org.example.backend.service.RoomService;
import org.example.backend.utils.MapperUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomServiceImpl extends BaseService implements RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final FileStorageService fileStorageService;
    private final RoomMediaRepository roomMediaRepository;
    private final CategoryRepository categoryRepository;
    private final AssetRepository assetRepository;
    private final CommentRepository commentRepository;
    private final MapperUtils mapperUtils;

    @Override
    public MessageResponse addNewRoom(RoomRequest roomRequest) {
        Location location = locationRepository.
                findById(roomRequest.getLocationId()).orElseThrow(() -> new BadRequestException("Thành phố chưa tồn tại."));
        Category category = categoryRepository.findById(roomRequest.getCategoryId())
                .orElseThrow(() -> new BadRequestException("Danh mục không tồn tại"));

        Room room = new Room(
                roomRequest.getTitle(),
                roomRequest.getDescription(),
                roomRequest.getPrice(),
                roomRequest.getLatitude(),
                roomRequest.getLongitude(),
                roomRequest.getAddress(),
                getUsername(),
                getUsername(),
                location,
                category,
                getUser(),
                roomRequest.getStatus(),
                roomRequest.getWaterCost(),
                roomRequest.getPublicElectricCost(),
                roomRequest.getInternetCost());
        roomRepository.save(room);

        for (MultipartFile file : roomRequest.getFiles()) {
            String fileName = fileStorageService.storeFile(file);
            RoomMedia roomMedia = new RoomMedia();
            roomMedia.setFiles(fileName);
            roomMedia.setRoom(room);
            roomMediaRepository.save(roomMedia);
        }

        for (AssetRequest asset: roomRequest.getAssets()) {
            Asset a = new Asset();
            a.setRoom(room);
            a.setName(asset.getName());
            a.setNumber(asset.getNumber());
            assetRepository.save(a);
        }
        return MessageResponse.builder().message("Thêm tin phòng thành công").build();
    }


    // default sort
    @Override
    public Page<RoomResponse> getRoomByRentaler(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("title").ascending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
    }

    @Override
    public RoomResponse getRoomById(Long id) {
        return mapperUtils.convertToResponse(roomRepository.findById(id).orElseThrow(() ->
                new BadRequestException("Phòng trọ này không tồn tại.")), RoomResponse.class);
    }

    @Override
    public Room getRoom(Long id) {
        return mapperUtils.convertToEntity(roomRepository.findById(id).orElseThrow(() ->
                new BadRequestException("Phòng trọ này không tồn tại.")), Room.class);
    }

    @Override
    public MessageResponse disableRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Thông tin phòng không tồn tại."));
        room.setIsLocked(LockedStatus.DISABLE);
        roomRepository.save(room);
        return MessageResponse.builder().message("Bài đăng của phòng đã được ẩn đi.").build();
    }

    @Override
    @Transactional
    public MessageResponse updateRoomInfo(Long id, RoomRequest roomRequest) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Thông tin phòng không tồn tại."));
        Location location = locationRepository.
                findById(roomRequest.getLocationId()).orElseThrow(() -> new BadRequestException("Thành phố chưa tồn tại."));
        Category category = categoryRepository.findById(roomRequest.getCategoryId())
                .orElseThrow(() -> new BadRequestException("Danh mục không tồn tại"));
        room.setUpdatedBy(getUsername());
        room.setTitle(roomRequest.getTitle());
        room.setDescription(roomRequest.getDescription());
        room.setPrice(roomRequest.getPrice());
        room.setLatitude(roomRequest.getLatitude());
        room.setLongitude(roomRequest.getLongitude());
        room.setAddress(roomRequest.getAddress());
        room.setUpdatedBy(getUsername());
        room.setLocation(location);
        room.setCategory(category);
        room.setStatus(roomRequest.getStatus());
        room.setWaterCost(roomRequest.getWaterCost());
        room.setPublicElectricCost(roomRequest.getPublicElectricCost());
        room.setInternetCost(roomRequest.getInternetCost());
        roomRepository.save(room);

        if (Objects.nonNull(roomRequest.getFiles())) {
            roomMediaRepository.deleteAllByRoom(room);
            for (MultipartFile file : roomRequest.getFiles()) {
                String fileName = fileStorageService.storeFile(file);
                RoomMedia roomMedia = new RoomMedia();
                roomMedia.setFiles(fileName);
                roomMedia.setRoom(room);
                roomMediaRepository.save(roomMedia);
            }
        }

        assetRepository.deleteAllByRoom(room);
        for (AssetRequest asset: roomRequest.getAssets()) {
            Asset a = new Asset();
            a.setRoom(room);
            a.setName(asset.getName());
            a.setNumber(asset.getNumber());
            assetRepository.save(a);
        }
        return MessageResponse.builder().message("Cập nhật thông tin thành công").build();
    }

    @Override
    public Page<RoomResponse> getRentOfHome() {
        Pageable pageable = PageRequest.of(0,100);
        return mapperUtils.convertToResponsePage(roomRepository.getAllRentOfHome( getUserId(), pageable), RoomResponse.class, pageable);
    }

    @Override
    public MessageResponse checkoutRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Phòng không còn tồn tại"));
        room.setStatus(RoomStatus.CHECKED_OUT);
        roomRepository.save(room);
        return MessageResponse.builder().message("Trả phòng và xuất hóa đơn thành công.").build();
    }

    @Override
    public MessageResponse isApproveRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Phòng không còn tồn tại"));
        if (room.getIsApprove().equals(Boolean.TRUE)) {
            throw new BadRequestException("Phòng đã được phê duyệt");
        } else {
            room.setIsApprove(Boolean.TRUE);
        }
        roomRepository.save(room);
        return MessageResponse.builder().message("Phê duyệt tin phòng thành công.").build();
    }

    @Override
    public MessageResponse removeRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Phòng không còn tồn tại"));
        if(Boolean.TRUE.equals(room.getIsRemove())){
            throw new BadRequestException("Bài đăng đã bị gỡ");
        }
        room.setIsRemove(Boolean.TRUE);
        roomRepository.save(room);
        return MessageResponse.builder().message("Bài đăng đã bị gỡ thành công").build();
    }

    @Override
    public String addComment(Long id, CommentDTO commentDTO) {
        try {
            Room room = roomRepository.findById(commentDTO.getRoom_id()).orElseThrow(() -> new BadRequestException("Phòng không còn tồn tại"));
            User user = userRepository.findById(id).orElseThrow(() -> new BadRequestException("Người dùng không tồn tại"));
            Rate rate = new Rate();
            rate.setRating(commentDTO.getRateRating());
            rate.setUser(user);
            rate.setRoom(room);
            Comment comment = new Comment(commentDTO.getContent(), user, room, rate);
            commentRepository.save(comment);
            return "Thêm bình luận thành công";
        } catch (Exception e) {
            return "Thêm bình luận thất bại";
        }
    }

    @Override
    public List<CommentDTO> getAllCommentRoom(Long id) {
        Room room = roomRepository.findById(id).get();
        return mapperUtils.convertToEntityList(room.getComments(), CommentDTO.class);
    }

    @Override
    public Page<RoomResponse> getAllRoomForAdmin(String title, Boolean approve, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);

        Page<Room> rooms = roomRepository.searchingRoomForAdmin(title, approve, pageable);
        log.info("Số lượng phòng tìm thấy: {}", rooms.getTotalElements());
        for (Room room : rooms) {
            log.info("Room ID: {}, isApprove: {}, type: {}",
                    room.getId(),
                    room.getIsApprove(),
                    (room.getIsApprove() != null ? room.getIsApprove().getClass().getName() : "null"));
        }

        return mapperUtils.convertToResponsePage(rooms, RoomResponse.class, pageable);
    }

    @Override
    public Page<RoomResponse> getRoomByUserId(Long userId, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoomForCustomer(null,null,null, userId, pageable), RoomResponse.class, pageable);
    }

    @Override
    public List<RoomResponse> getRoomByUser(User user) {
        return roomRepository.findByUser(user).stream().map(room -> mapperUtils.convertToResponse(room, RoomResponse.class)).toList();
    }

    @Override
    public Room updateRoom(Room room, Long id) {
        return roomRepository.findById(id)
                .map(room1 -> {
                    room1.setTitle(room.getTitle());
                    room1.setDescription(room.getDescription());
                    room1.setPrice(room.getPrice());
                    room1.setLatitude(room.getLatitude());
                    room1.setLongitude(room.getLongitude());
                    room1.setAddress(room.getAddress());
                    room1.setUpdatedBy(getUsername());
                    room1.setLocation(room.getLocation());
                    room1.setCategory(room.getCategory());
                    room1.setStatus(room.getStatus());
                    room1.setWaterCost(room.getWaterCost());
                    room1.setPublicElectricCost(room.getPublicElectricCost());
                    room1.setInternetCost(room.getInternetCost());
                    return roomRepository.save(room1);
                })
                .orElseThrow(() -> new BadRequestException("Phòng không tồn tại"));
    }

    // get room rentaler order by price desc
    @Override
    public Page<RoomResponse> getRoomRentalerByPriceDesc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("price").descending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
    }


    // get room rentaler order by price asc
    @Override
    public Page<RoomResponse> getRoomRentalerByPriceAsc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("price").ascending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
    }

    // priority: status: DA THUE
    @Override
    public Page<RoomResponse> getRoomRentalerByStatusDesc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("status").descending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
    }

    // priority: status: CHUA THUE
    @Override
    public Page<RoomResponse> getRoomRentalerByStatusAsc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("status").ascending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
    }

    // priority: isApprove: CHUA DUYET
    @Override
    public Page<RoomResponse> getRoomRentalerByApproveAsc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("is_approve").ascending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
    }

    // priority: isApprove: DA DUYET
    @Override
    public Page<RoomResponse> getRoomRentalerByApproveDesc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("is_approve").descending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
    }

//    private List<RoomResponse> sortRooms(List<RoomResponse> rooms, String typeSort) {
//        if ("Thời gian: Mới đến cũ".equals(typeSort)) {
//            rooms.sort(Comparator.comparing(RoomResponse::getCreatedAt).reversed());
//        } else if ("Thời gian: Cũ đến mới".equals(typeSort)) {
//            rooms.sort(Comparator.comparing(RoomResponse::getCreatedAt));
//        } else if ("Giá: Thấp đến cao".equals(typeSort)) {
//            rooms.sort(Comparator.comparing(RoomResponse::getPrice));
//        } else if ("Giá: Cao đến thấp".equals(typeSort)) {
//            rooms.sort(Comparator.comparing(RoomResponse::getPrice).reversed());
//        }
//
//        return rooms;
//    }

    private User getUser() {
        return userRepository.findById(getUserId()).orElseThrow(() -> new BadRequestException("Người dùng không tồn tại"));
    }
}
