package org.example.backend.service;

import org.example.backend.dto.CommentDTO;
import org.example.backend.dto.request.RoomRequest;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.dto.response.RoomResponse;
import org.example.backend.model.Room;
import org.example.backend.model.User;
import org.springframework.data.domain.Page;

import java.util.List;

public interface RoomService {
    MessageResponse addNewRoom(RoomRequest roomRequest);

    Page<RoomResponse> getRoomByRentaler(String title, Integer pageNo, Integer pageSize);

    RoomResponse getRoomById(Long id);

    Room getRoom(Long id);

    MessageResponse disableRoom(Long id);

    MessageResponse updateRoomInfo(Long id, RoomRequest roomRequest);

    Page<RoomResponse> getRentOfHome();

    MessageResponse checkoutRoom(Long id);

    MessageResponse isApproveRoom(Long id);

    MessageResponse removeRoom(Long id);

    String addComment(Long id, CommentDTO commentDTO);

    List<CommentDTO> getAllCommentRoom(Long id);

    Page<RoomResponse> getAllRoomForAdmin(String title,Boolean approve, Integer pageNo, Integer pageSize);

    Page<RoomResponse> getRoomByUserId(Long userId, Integer pageNo, Integer pageSize);

    List<RoomResponse> getRoomByUser(User user);

    Room updateRoom(Room room, Long id);

    Page<RoomResponse> getRoomRentalerByPriceDesc(String title, Integer pageNo, Integer pageSize);

    Page<RoomResponse> getRoomRentalerByPriceAsc(String title, Integer pageNo, Integer pageSize);

    Page<RoomResponse> getRoomRentalerByStatusDesc(String title, Integer pageNo, Integer pageSize);

    Page<RoomResponse> getRoomRentalerByStatusAsc(String title, Integer pageNo, Integer pageSize);

    Page<RoomResponse> getRoomRentalerByApproveAsc(String title, Integer pageNo, Integer pageSize);

    Page<RoomResponse> getRoomRentalerByApproveDesc(String title, Integer pageNo, Integer pageSize);
}
