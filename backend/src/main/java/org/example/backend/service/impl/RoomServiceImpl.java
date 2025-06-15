package org.example.backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.CommentDTO;
import org.example.backend.dto.request.AssetRequest;
import org.example.backend.dto.request.RoomRequest;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.dto.response.RoomResponse;
import org.example.backend.enums.*;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

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
    private final ConfigurationRepository configurationRepository;
    private final TransactionRepository transactionRepository;
    private final MapperUtils mapperUtils;

    @Override
    public MessageResponse addNewRoom(RoomRequest roomRequest) {
        Optional<Room> existedRoom = roomRepository.findByLatitudeAndLongitude(roomRequest.getLatitude(), roomRequest.getLongitude());
        if (existedRoom.isPresent() && existedRoom.get().getTitle().equals(roomRequest.getTitle()) && existedRoom.get().getUser() == getUser()) {
            throw new BadRequestException("Room already exists");
        }

        Location location = locationRepository.
                findById(roomRequest.getLocationId()).orElseThrow(() -> new BadRequestException("City does not exist."));
        Category category = categoryRepository.findById(roomRequest.getCategoryId())
                .orElseThrow(() -> new BadRequestException("Category does not exist"));

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
                roomRequest.getRoomType(),
                roomRequest.getWaterCost(),
                roomRequest.getPublicElectricCost(),
                roomRequest.getInternetCost());

        Room savedRoom = roomRepository.save(room);

        // Lấy phí từ Configuration
        BigDecimal totalAmount;
        BigDecimal adminFee;
        String postingFeeKey = room.getType() == RoomType.VIP ? "VIP_POSTING_FEE" : "REGULAR_POSTING_FEE";
        String adminFeeKey = room.getType() == RoomType.VIP ? "VIP_ADMIN_FEE" : "REGULAR_ADMIN_FEE";

        Optional<Configuration> postingFeeConfig = configurationRepository
                .findByKey(postingFeeKey);
        if(postingFeeConfig.isEmpty()) throw new BadRequestException("Posting fee not exists");
        Optional<Configuration> adminFeeConfig = configurationRepository
                .findByKey(adminFeeKey);
        if(adminFeeConfig.isEmpty()) throw new BadRequestException("Admin fee not exists");

        totalAmount = new BigDecimal(postingFeeConfig.get().getValue());
        adminFee = new BigDecimal(adminFeeConfig.get().getValue());

        // Tạo Transaction
        Transaction transaction = new Transaction();
        transaction.setUser(getUser());
        transaction.setRoom(savedRoom);
        transaction.setTotalAmount(totalAmount);
        transaction.setAdminFee(adminFee);
        transaction.setStatus(TransactionStatus.PENDING);
        transactionRepository.save(transaction);

        // Lưu RoomMedia
        if (Objects.nonNull(roomRequest.getFiles()) && !roomRequest.getFiles().isEmpty()) {
            for (MultipartFile file : roomRequest.getFiles()) {
                String fileName = fileStorageService.storeFile(file);
                RoomMedia roomMedia = new RoomMedia();
                roomMedia.setFiles(fileName);
                roomMedia.setRoom(savedRoom);
                roomMediaRepository.save(roomMedia);
            }
        }

        // Lưu Assets
        if (Objects.nonNull(roomRequest.getAssets()) && !roomRequest.getAssets().isEmpty()) {
            for (AssetRequest asset : roomRequest.getAssets()) {
                Asset a = new Asset();
                a.setRoom(savedRoom);
                a.setName(asset.getName());
                a.setNumber(asset.getNumber());
                assetRepository.save(a);
            }
        }

        return MessageResponse.builder().message("Room added successfully, awaiting approval").build();
    }

    // default sort
    @Override
    public Page<RoomResponse> getRoomByRentaler(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("title").ascending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
        return mapperUtils.convertToResponsePage(result, RoomResponse.class, pageable);
    }

    @Override
    public RoomResponse getRoomById(Long id) {
        return mapperUtils.convertToResponse(roomRepository.findById(id).orElseThrow(() ->
                new BadRequestException("This room does not exist.")), RoomResponse.class);
    }

    @Override
    public Room getRoom(Long id) {
        return mapperUtils.convertToEntity(roomRepository.findById(id).orElseThrow(() ->
                new BadRequestException("This room does not exist.")), Room.class);
    }

    @Override
    public MessageResponse disableRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Room information does not exist."));
        room.setIsLocked(LockedStatus.DISABLE);
        roomRepository.save(room);
        return MessageResponse.builder().message("Room post has been hidden.").build();
    }

    @Override
    @Transactional
    public MessageResponse updateRoomInfo(Long id, RoomRequest roomRequest) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Room information does not exist."));
        Location location = locationRepository.findById(roomRequest.getLocationId())
                .orElseThrow(() -> new BadRequestException("City does not exist."));
        Category category = categoryRepository.findById(roomRequest.getCategoryId())
                .orElseThrow(() -> new BadRequestException("Category does not exist"));

        room.setUpdatedBy(getUsername());
        room.setTitle(roomRequest.getTitle());
        room.setDescription(roomRequest.getDescription());
        room.setPrice(roomRequest.getPrice());
        room.setLatitude(roomRequest.getLatitude());
        room.setLongitude(roomRequest.getLongitude());
        room.setAddress(roomRequest.getAddress());
        room.setLocation(location);
        room.setCategory(category);
        room.setStatus(roomRequest.getStatus());
        room.setWaterCost(roomRequest.getWaterCost());
        room.setPublicElectricCost(roomRequest.getPublicElectricCost());
        room.setInternetCost(roomRequest.getInternetCost());

        // Kiểm tra và cập nhật roomType chỉ cho ADMIN
        RoomType newRoomType = roomRequest.getRoomType();
        if (newRoomType != null) { // Chỉ kiểm tra nếu roomType được gửi lên
            if (room.getType() == null || !room.getType().equals(newRoomType)) {
                User currentUser = getUser();
                log.info("Current user roles: {}", currentUser.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
                boolean isAdmin = currentUser.getRoles().stream()
                        .anyMatch(role -> role.getName().equals(RoleName.ROLE_ADMIN));
                log.info("Is admin: {}", isAdmin);
                if (!isAdmin) {
                    throw new BadRequestException("You don't have permission to update the room type");
                }
                room.setType(newRoomType);
                updateTransactionForRoomTypeChange(room);
            }
        } else {
            // Nếu không gửi roomType, giữ nguyên giá trị cũ
            room.setType(room.getType()); // Không thay đổi nếu không cung cấp
        }

        log.info("Updating room (ID: {}) with roomType: {}", id, roomRequest.getRoomType());

        try {
            roomRepository.save(room);
            log.info("Room (ID: {}) updated successfully with roomType: {}", id, room.getType());

            // Xử lý roomMedia
            if (Objects.nonNull(roomRequest.getFiles()) && !roomRequest.getFiles().isEmpty()) {
                roomMediaRepository.deleteAllByRoom(room);
                for (MultipartFile file : roomRequest.getFiles()) {
                    String fileName = fileStorageService.storeFile(file);
                    RoomMedia roomMedia = new RoomMedia();
                    roomMedia.setFiles(fileName);
                    roomMedia.setRoom(room);
                    roomMediaRepository.save(roomMedia);
                }
            } else if (roomRequest.getExistingMedia() != null && !roomRequest.getExistingMedia().isEmpty()) {
                List<String> existingFileNames = roomRequest.getExistingMedia();
                List<RoomMedia> currentMedia = roomMediaRepository.findAllByRoom(room);
                List<String> currentFileNames = currentMedia.stream().map(RoomMedia::getFiles).toList();

                currentMedia.forEach(media -> {
                    if (!existingFileNames.contains(media.getFiles())) {
                        roomMediaRepository.delete(media);
                    }
                });

                for (String fileName : existingFileNames) {
                    if (!currentFileNames.contains(fileName)) {
                        RoomMedia roomMedia = new RoomMedia();
                        roomMedia.setFiles(fileName);
                        roomMedia.setRoom(room);
                        roomMediaRepository.save(roomMedia);
                    }
                }
            }

            assetRepository.deleteAllByRoom(room);
            if (Objects.nonNull(roomRequest.getAssets()) && !roomRequest.getAssets().isEmpty()) {
                for (AssetRequest asset : roomRequest.getAssets()) {
                    Asset a = new Asset();
                    a.setRoom(room);
                    a.setName(asset.getName());
                    a.setNumber(asset.getNumber());
                    assetRepository.save(a);
                }
            }
        } catch (Exception e) {
            log.error("Error updating room (ID: {}): {}", id, e.getMessage());
            throw new BadRequestException("Failed to update room: " + e.getMessage());
        }

        return MessageResponse.builder().message("Room information updated successfully").build();
    }

    // Phương thức mới để xử lý thay đổi roomType và tạo transaction
    private void updateTransactionForRoomTypeChange(Room room) {
        String postingFeeKey = room.getType() == RoomType.VIP ? "VIP_POSTING_FEE" : "REGULAR_POSTING_FEE";
        String adminFeeKey = room.getType() == RoomType.VIP ? "VIP_ADMIN_FEE" : "REGULAR_ADMIN_FEE";

        Optional<Configuration> postingFeeConfig = configurationRepository.findByKey(postingFeeKey);
        if (postingFeeConfig.isEmpty()) throw new BadRequestException("Posting fee not exists");
        Optional<Configuration> adminFeeConfig = configurationRepository.findByKey(adminFeeKey);
        if (adminFeeConfig.isEmpty()) throw new BadRequestException("Admin fee not exists");

        BigDecimal totalAmount = new BigDecimal(postingFeeConfig.get().getValue());
        BigDecimal adminFee = new BigDecimal(adminFeeConfig.get().getValue());

            // Tạo transaction mới với trạng thái PENDING
            log.info("room id " + room.getId());
            Optional<Transaction> transaction = transactionRepository.getPendingTransactionByRoomId(room.getId());
            if (transaction.isEmpty()) {
                throw new BadRequestException("Transaction does not exist");
            }
            transaction.get().setUser(getUser());
            transaction.get().setRoom(room);
            transaction.get().setTotalAmount(totalAmount);
            transaction.get().setAdminFee(adminFee);
            transaction.get().setStatus(TransactionStatus.PENDING);
            transactionRepository.save(transaction.get());

            room.setIsApprove(Boolean.FALSE);
            roomRepository.save(room);

        log.info("New transaction created for room (ID: {}) with roomType: {} and totalAmount: {}", room.getId(), room.getType(), totalAmount);
    }

    @Override
    public Page<RoomResponse> getRentOfHome() {
        Pageable pageable = PageRequest.of(0, 100);
        return mapperUtils.convertToResponsePage(roomRepository.getAllRentOfHomeForContract(getUserId(), pageable), RoomResponse.class, pageable);
    }

    @Override
    public MessageResponse checkoutRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Room does not exist"));
        room.setStatus(RoomStatus.CHECKED_OUT);
        roomRepository.save(room);
        return MessageResponse.builder().message("Room checked out and invoice generated successfully.").build();
    }

    @Override
    public MessageResponse isApproveRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Room does not exist"));
        Optional<Transaction> transaction = transactionRepository.getPendingTransactionByRoomId(id);
        if (transaction.isEmpty()) {
            throw new BadRequestException("Transaction does not exist");
        }
        if (room.getIsApprove().equals(Boolean.TRUE)) {
            throw new BadRequestException("Room has already been approved");
        }

        // Cập nhật trạng thái Room
        room.setIsApprove(true);
        roomRepository.save(room);

        transaction.get().setStatus(TransactionStatus.SUCCESS);
        transactionRepository.save(transaction.get());

        return MessageResponse.builder().message("Room approved successfully.").build();
    }

    @Transactional
    public MessageResponse completeTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new BadRequestException("Transaction does not exist"));
        if (transaction.getStatus() == TransactionStatus.SUCCESS) {
            throw new BadRequestException("Transaction has already been completed");
        }
        if (transaction.getStatus() == TransactionStatus.FAILED) {
            throw new BadRequestException("Cannot complete a failed transaction");
        }

        // Cập nhật trạng thái giao dịch
        transaction.setStatus(TransactionStatus.SUCCESS);
        transactionRepository.save(transaction);

        return MessageResponse.builder().message("Transaction completed successfully").build();
    }

    @Transactional
    public MessageResponse failTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new BadRequestException("Transaction does not exist"));
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new BadRequestException("Transaction is not in pending state");
        }
        transaction.setStatus(TransactionStatus.FAILED);
        transactionRepository.save(transaction);
        return MessageResponse.builder().message("Transaction marked as failed").build();
    }

    @Override
    public MessageResponse removeRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Room does not exist"));
        if (Boolean.TRUE.equals(room.getIsRemove())) {
            throw new BadRequestException("Post has already been removed");
        }
        room.setIsRemove(Boolean.TRUE);
        roomRepository.save(room);
        return MessageResponse.builder().message("Post removed successfully").build();
    }

    @Override
    public String addComment(Long id, CommentDTO commentDTO) {
        try {
            Room room = roomRepository.findById(commentDTO.getRoom_id()).orElseThrow(() -> new BadRequestException("Room does not exist"));
            User user = userRepository.findById(id).orElseThrow(() -> new BadRequestException("User does not exist"));
            Rate rate = new Rate();
            rate.setRating(commentDTO.getRateRating());
            rate.setUser(user);
            rate.setRoom(room);
            Comment comment = new Comment(commentDTO.getContent(), user, room, rate);
            commentRepository.save(comment);
            return "Comment added successfully";
        } catch (Exception e) {
            return "Failed to add comment";
        }
    }

    @Override
    public List<CommentDTO> getAllCommentRoom(Long id) {
        Optional<Room> room = roomRepository.findById(id);
        if (room.isEmpty()) {
            throw new BadRequestException("Room does not exist");
        }
        return mapperUtils.convertToEntityList(room.get().getComments(), CommentDTO.class);
    }

    @Override
    public Page<RoomResponse> getAllRoomForAdmin(String title, Boolean approve, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);

        Page<Room> rooms = roomRepository.searchingRoomForAdmin(title, approve, pageable);
        log.info("Number of rooms found: {}", rooms.getTotalElements());
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
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoomForCustomer(null, null, null, userId, pageable), RoomResponse.class, pageable);
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
                .orElseThrow(() -> new BadRequestException("Room does not exist"));
    }

    // get room rentaler order by price desc
    @Override
    public Page<RoomResponse> getRoomRentalerByPriceDesc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("price").descending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
    }

    // get room rentaler order by price asc
    @Override
    public Page<RoomResponse> getRoomRentalerByPriceAsc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("price").ascending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
    }

    // priority: status: DA THUE
    @Override
    public Page<RoomResponse> getRoomRentalerByStatusDesc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("status").descending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
    }

    // priority: status: CHUA THUE
    @Override
    public Page<RoomResponse> getRoomRentalerByStatusAsc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("status").ascending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
    }

    // priority: isApprove: CHUA DUYET
    @Override
    public Page<RoomResponse> getRoomRentalerByApproveAsc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("is_approve").ascending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
    }

    // priority: isApprove: DA DUYET
    @Override
    public Page<RoomResponse> getRoomRentalerByApproveDesc(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("is_approve").descending());
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId(), pageable), RoomResponse.class, pageable);
    }

    @Override
    public Page<RoomResponse> getRentOfHomeBill() {
        Pageable pageable = PageRequest.of(0, 100);
        return mapperUtils.convertToResponsePage(roomRepository.getAllRentOfHomeForBill(getUserId(), pageable), RoomResponse.class, pageable);
    }

    private User getUser() {
        return userRepository.findById(getUserId()).orElseThrow(() -> new BadRequestException("User does not exist"));
    }
}