package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.service.ContractService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/contract")
@RequiredArgsConstructor
public class ContractController {
    private final ContractService contractService;

    @PostMapping
    private ResponseEntity<?> addContract(@RequestParam String name,
                                          @RequestParam Long roomId,
                                          @RequestParam String nameOfRent,
                                          @RequestParam Long numOfPeople,
                                          @RequestParam String phone,
                                          @RequestParam String deadlineContract,
                                          @RequestParam List<MultipartFile> files) {
        return ResponseEntity.ok(contractService.addContract(name,roomId,nameOfRent, numOfPeople, phone,deadlineContract,files));
    }


    @GetMapping
    private ResponseEntity<?> getAllContract(@RequestParam(required = false) String keyword,
                                             @RequestParam Integer pageNo,
                                             @RequestParam Integer pageSize) {
        if (keyword != null) {
            keyword = URLDecoder.decode(keyword, StandardCharsets.UTF_8);
        }
        return ResponseEntity.ok(contractService.getAllContractOfRentaler(keyword, pageNo, pageSize));
    }

    @GetMapping("/customer")
    private ResponseEntity<?> getAllContractForCustomer(
            @RequestParam(required = false) String phone,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getAllContractOfCustomer( phone ,pageNo, pageSize));
    }

    // get contract order by price asc
    @GetMapping("/filter/price-asc")
    private ResponseEntity<?> getAllContractForFilterPriceAsc(@RequestParam(required = false) String keyword,
                                                              @RequestParam Integer pageNo,
                                                              @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getAllContractForFilterPriceAsc(keyword, pageNo, pageSize));
    }

    // get contract order by price asc
    @GetMapping("/filter/price-desc")
    private ResponseEntity<?> getAllContractForFilterPriceDesc(@RequestParam(required = false) String keyword,
                                                              @RequestParam Integer pageNo,
                                                              @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getAllContractForFilterPriceDesc(keyword, pageNo, pageSize));
    }


    @GetMapping("/{id}")
    private ResponseEntity<?> getContractById(@PathVariable Long id){
        return ResponseEntity.ok(contractService.getContractById(id));
    }

    @PutMapping("/{id}")
    private ResponseEntity<?> updateContractInfo(@PathVariable Long id,
                                                 @RequestParam String name,
                                                 @RequestParam Long roomId,
                                                 @RequestParam String nameOfRent,
                                                 @RequestParam Long numOfPeople,
                                                 @RequestParam String phone,
                                                 @RequestParam String deadlineContract,
                                                 @RequestParam List<MultipartFile> files) {
        return ResponseEntity.ok(contractService.editContractInfo(id, name, roomId, nameOfRent,numOfPeople, phone, deadlineContract, files));
    }

    // get contract order by water cost, public electric cost and internet cost asc
    @GetMapping("/filter/additional-fee-asc")
    public ResponseEntity<?> getContractByAdditionalFeeAsc(@RequestParam(required = false) String keyword,
                                                           @RequestParam Integer pageNo,
                                                           @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractByAdditionalFeeAsc(keyword, pageNo, pageSize));
    }

    // get contract order by water cost, public electric cost and internet cost desc
    @GetMapping("/filter/additional-fee-desc")
    public ResponseEntity<?> getContractByAdditionalFeeDesc(@RequestParam(required = false) String keyword,
                                                           @RequestParam Integer pageNo,
                                                           @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractByAdditionalFeeDesc(keyword, pageNo, pageSize));
    }

    // get contract order by deadline contract asc
    @GetMapping("/filter/time-asc")
    public ResponseEntity<?> getContractByTimeAsc(@RequestParam(required = false) String keyword,
                                                  @RequestParam Integer pageNo,
                                                  @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractByTimeAsc(keyword, pageNo, pageSize));
    }

    // get contract order by deadline contract desc
    @GetMapping("/filter/time-desc")
    public ResponseEntity<?> getContractByTimeDesc(@RequestParam(required = false) String keyword,
                                                  @RequestParam Integer pageNo,
                                                  @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractByTimeDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA THUE (HIRED) default title asc
    @GetMapping("/filter/status/hired/title-asc")
    public ResponseEntity<?> getContractHiredByTitleAsc(@RequestParam(required = false) String keyword,
                                                @RequestParam Integer pageNo,
                                                @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractHiredByTitleAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA THUE (HIRED) default title asc
    @GetMapping("/filter/status/hired/title-desc")
    public ResponseEntity<?> getContractHiredByTitleDesc(@RequestParam(required = false) String keyword,
                                                @RequestParam Integer pageNo,
                                                @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractHiredByTitleDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA THUE (HIRED) default title asc
    @GetMapping("/filter/status/hired/price-asc")
    public ResponseEntity<?> getContractHiredByPriceAsc(@RequestParam(required = false) String keyword,
                                                         @RequestParam Integer pageNo,
                                                         @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractHiredByPriceAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA THUE (HIRED) default title desc
    @GetMapping("/filter/status/hired/price-desc")
    public ResponseEntity<?> getContractHiredByPriceDesc(@RequestParam(required = false) String keyword,
                                                        @RequestParam Integer pageNo,
                                                        @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractHiredByPriceDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA THUE (HIRED) default time asc
    @GetMapping("/filter/status/hired/time-asc")
    public ResponseEntity<?> getContractHiredByTimeAsc(@RequestParam(required = false) String keyword,
                                                         @RequestParam Integer pageNo,
                                                         @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractHiredByTimeAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA THUE (HIRED) default time asc
    @GetMapping("/filter/status/hired/time-desc")
    public ResponseEntity<?> getContractHiredByTimeDesc(@RequestParam(required = false) String keyword,
                                                       @RequestParam Integer pageNo,
                                                       @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractHiredByTimeDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: CHUA THUE (ROOM_RENT) default title asc
    @GetMapping("/filter/status/room_rent/title-asc")
    public ResponseEntity<?> getContractRoomRentByTitleAsc(@RequestParam(required = false) String keyword,
                                                         @RequestParam Integer pageNo,
                                                         @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractRoomRentByTitleAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: CHUA THUE (ROOM_RENT) default title desc
    @GetMapping("/filter/status/room_rent/title-desc")
    public ResponseEntity<?> getContractRoomRentByTitleDesc(@RequestParam(required = false) String keyword,
                                                           @RequestParam Integer pageNo,
                                                           @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractRoomRentByTitleDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: CHUA THUE (ROOM_RENT) default price asc
    @GetMapping("/filter/status/room_rent/price-asc")
    public ResponseEntity<?> getContractRoomRentByPriceAsc(@RequestParam(required = false) String keyword,
                                                            @RequestParam Integer pageNo,
                                                            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractRoomRentByPriceAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: CHUA THUE (ROOM_RENT) default price desc
    @GetMapping("/filter/status/room_rent/price-desc")
    public ResponseEntity<?> getContractRoomRentByPriceDesc(@RequestParam(required = false) String keyword,
                                                           @RequestParam Integer pageNo,
                                                           @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractRoomRentByPriceDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: CHUA THUE (ROOM_RENT) default time asc
    @GetMapping("/filter/status/room_rent/time-asc")
    public ResponseEntity<?> getContractRoomRentByTimeAsc(@RequestParam(required = false) String keyword,
                                                            @RequestParam Integer pageNo,
                                                            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractRoomRentByTimeAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: CHUA THUE (ROOM_RENT) default time desc
    @GetMapping("/filter/status/room_rent/time-desc")
    public ResponseEntity<?> getContractRoomRentByTimeDesc(@RequestParam(required = false) String keyword,
                                                          @RequestParam Integer pageNo,
                                                          @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractRoomRentByTimeDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA TRA PHONG (CHECKED_OUT) default title asc
    @GetMapping("/filter/status/checked_out/title-asc")
    public ResponseEntity<?> getContractCheckedOutByTitleAsc(@RequestParam(required = false) String keyword,
                                                            @RequestParam Integer pageNo,
                                                            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractCheckedOutByTitleAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA TRA PHONG (CHECKED_OUT) default title desc
    @GetMapping("/filter/status/checked_out/title-desc")
    public ResponseEntity<?> getContractCheckedOutByTitleDesc(@RequestParam(required = false) String keyword,
                                                             @RequestParam Integer pageNo,
                                                             @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractCheckedOutByTitleDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA TRA PHONG (CHECKED_OUT) default price asc
    @GetMapping("/filter/status/checked_out/price-asc")
    public ResponseEntity<?> getContractCheckedOutByPriceAsc(@RequestParam(required = false) String keyword,
                                                              @RequestParam Integer pageNo,
                                                              @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractCheckedOutByPriceAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA TRA PHONG (CHECKED_OUT) default price desc
    @GetMapping("/filter/status/checked_out/price-desc")
    public ResponseEntity<?> getContractCheckedOutByPriceDesc(@RequestParam(required = false) String keyword,
                                                             @RequestParam Integer pageNo,
                                                             @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractCheckedOutByPriceDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA TRA PHONG (CHECKED_OUT) default time asc
    @GetMapping("/filter/status/checked_out/time-asc")
    public ResponseEntity<?> getContractCheckedOutByTimeAsc(@RequestParam(required = false) String keyword,
                                                              @RequestParam Integer pageNo,
                                                              @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractCheckedOutByTimeAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA TRA PHONG (CHECKED_OUT) default time desc
    @GetMapping("/filter/status/checked_out/time-desc")
    public ResponseEntity<?> getContractCheckedOutByTimeDesc(@RequestParam(required = false) String keyword,
                                                            @RequestParam Integer pageNo,
                                                            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractCheckedOutByTimeDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA THUE (HIRED) default additional fee asc
    @GetMapping("/filter/status/hired/additional-fee-asc")
    public ResponseEntity<?> getContractHiredByAdditionalFeeAsc(@RequestParam(required = false) String keyword,
                                                                @RequestParam Integer pageNo,
                                                                @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractHiredByAdditionalFeeAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: DA THUE (HIRED) default additional fee desc
    @GetMapping("/filter/status/hired/additional-fee-desc")
    public ResponseEntity<?> getContractHiredByAdditionalFeeDesc(@RequestParam(required = false) String keyword,
                                                                @RequestParam Integer pageNo,
                                                                @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractHiredByAdditionalFeeDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: CHUA THUE (ROOM_RENT) default additional fee asc
    @GetMapping("/filter/status/room_rent/additional-fee-asc")
    public ResponseEntity<?> getContractRoomRentByAdditionalFeeAsc(@RequestParam(required = false) String keyword,
                                                                 @RequestParam Integer pageNo,
                                                                 @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractRoomRentByAdditionalFeeAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: CHUA THUE (ROOM_RENT) default additional fee desc
    @GetMapping("/filter/status/room_rent/additional-fee-desc")
    public ResponseEntity<?> getContractRoomRentByAdditionalFeeDesc(@RequestParam(required = false) String keyword,
                                                                   @RequestParam Integer pageNo,
                                                                   @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractRoomRentByAdditionalFeeDesc(keyword, pageNo, pageSize));
    }

    // get contract by status: TRA PHONG (CHECKED_OUT) default additional fee asc
    @GetMapping("/filter/status/checked_out/additional-fee-asc")
    public ResponseEntity<?> getContractCheckedOutByAdditionalFeeAsc(@RequestParam(required = false) String keyword,
                                                                    @RequestParam Integer pageNo,
                                                                    @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractCheckedOutByAdditionalFeeAsc(keyword, pageNo, pageSize));
    }

    // get contract by status: TRA PHONG (CHECKED_OUT) default additional fee desc
    @GetMapping("/filter/status/checked_out/additional-fee-desc")
    public ResponseEntity<?> getContractCheckedOutByAdditionalFeeDesc(@RequestParam(required = false) String keyword,
                                                                     @RequestParam Integer pageNo,
                                                                     @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractCheckedOutByAdditionalFeeDesc(keyword, pageNo, pageSize));
    }

    // get contract by name (TEN HOP DONG)
    @GetMapping("/filter/name-asc")
    public ResponseEntity<?> getContractByNameAsc(@RequestParam(required = false) String keyword,
                                                  @RequestParam Integer pageNo,
                                                  @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractByNameAsc(keyword, pageNo, pageSize));
    }

    // get contract by name (TEN HOP DONG)
    @GetMapping("/filter/name-desc")
    public ResponseEntity<?> getContractByNameDesc(@RequestParam(required = false) String keyword,
                                                  @RequestParam Integer pageNo,
                                                  @RequestParam Integer pageSize) {
        return ResponseEntity.ok(contractService.getContractByNameDesc(keyword, pageNo, pageSize));
    }


}

