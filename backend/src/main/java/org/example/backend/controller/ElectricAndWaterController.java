package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.ElectricAndWaterResponse;
import org.example.backend.model.ElectricAndWater;
import org.example.backend.security.TokenProvider;
import org.example.backend.service.ElectricAndWaterService;
import org.example.backend.service.RoomService;
import org.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/electric-water")
@RequiredArgsConstructor
public class ElectricAndWaterController {

    private final ElectricAndWaterService electricAndWaterService;
    private final RoomService roomService;
    private final TokenProvider tokenProvider;
    private final UserService userService;

//    @GetMapping
//    public ResponseEntity<?> getAllElectric(@RequestParam int pageNo,
//                                            @RequestParam int pageSize,
//                                            @RequestParam(required = false, defaultValue = "") String keyword,
//                                            @RequestHeader("Authorization") String token) {
//        token = token.substring(7);
//        Long userId = tokenProvider.getUserIdFromToken(token);
//        List<RoomResponse> rooms = roomService.getRoomByUser(userService.getUserById(userId));
//        List<ElectricAndWaterResponse> electricAndWatersList = new ArrayList<>();
//
//        for (RoomResponse room : rooms) {
//            List<ElectricAndWaterResponse> electrics = electricAndWaterService.getElectricByRoom(room.getId());
//            electricAndWatersList.addAll(electrics);
//        }
//
//        // Sử dụng PageRequest để tạo Pageable
//        Pageable pageable = PageRequest.of(pageNo, pageSize);
//
//        // Kiểm tra nếu danh sách rỗng hoặc pageNo quá lớn
//        if (electricAndWatersList.isEmpty() || pageNo * pageSize > electricAndWatersList.size()) {
//            return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, electricAndWatersList.size()));
//        }
//
//        // Tạo danh sách phân trang từ electricAndWatersList
//        int start = (int) pageable.getOffset();
//        int end = Math.min((start + pageable.getPageSize()), electricAndWatersList.size());
//        List<ElectricAndWaterResponse> pagedElectrics = electricAndWatersList.subList(start, end);
//        Page<ElectricAndWaterResponse> page = new PageImpl<>(pagedElectrics, pageable, electricAndWatersList.size());
//        return ResponseEntity.ok(page);
//    }

    @GetMapping
    public ResponseEntity<?> getElectric(@RequestParam String keyword,
                                        @RequestParam Integer pageNo,
                                         @RequestParam Integer pageSize) {
        if (keyword != null) {
            keyword = URLDecoder.decode(keyword, StandardCharsets.UTF_8);
        }
        return ResponseEntity.ok(electricAndWaterService.getAllElectricAndWater(keyword, pageNo, pageSize));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createElectricAndWater(@RequestBody ElectricAndWater electricAndWater) {
        ElectricAndWater newElectricAndWater = electricAndWaterService.saveElectric(electricAndWater);
        return ResponseEntity.ok(newElectricAndWater);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateElectricAndWater(@RequestBody ElectricAndWater electricAndWater, @PathVariable Long id) {
        ElectricAndWater updatedElectricAndWater = electricAndWaterService.updateElectric(electricAndWater, id);
        return ResponseEntity.ok(updatedElectricAndWater);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getElectricAndWater(@PathVariable Long id) {
        ElectricAndWaterResponse electric = electricAndWaterService.getElectricAndWater(id);
        return ResponseEntity.ok(electric);
    }

    @GetMapping("/filter/")
    public ResponseEntity<?> getElectricAndWaterByFilter(@RequestParam String field,
                                                         @RequestParam String order,
                                                         @RequestParam String keyword,
                                                         @RequestParam Integer pageNo,
                                                         @RequestParam Integer pageSize) {
        return ResponseEntity.ok(electricAndWaterService.getElectricAndWaterByFilter(field, order, keyword, pageNo, pageSize));
    }
}

