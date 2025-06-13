package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.ContractResponse;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.enums.LockedStatus;
import org.example.backend.enums.RoomStatus;
import org.example.backend.exception.BadRequestException;
import org.example.backend.model.Contract;
import org.example.backend.model.Room;
import org.example.backend.repository.ContractRepository;
import org.example.backend.repository.RoomRepository;
import org.example.backend.service.BaseService;
import org.example.backend.service.ContractService;
import org.example.backend.service.FileStorageService;
import org.example.backend.utils.MapperUtils;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl extends BaseService implements ContractService {

    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    private final FileStorageService fileStorageService;
    private final MapperUtils mapperUtils;

    @Override
    public MessageResponse addContract(String name, Long roomId, String nameRentHome, Long numOfPeople, String phone, String deadline, List<MultipartFile> files) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng đã không tồn tại"));
        if (room.getIsLocked().equals(LockedStatus.DISABLE)) {
            throw new BadRequestException("Phòng đã bị khóa");
        }

        String file = fileStorageService.storeFile(files.get(0)).replace("photographer/files/", "");
        Contract contract = new Contract(name,"http://localhost:8080/document/" +file, nameRentHome, deadline , getUsername(), getUsername(), room);
        contract.setPhone(phone);
        contract.setNumOfPeople(numOfPeople);
        contractRepository.save(contract);

        room.setStatus(RoomStatus.HIRED);
        roomRepository.save(room);
        return MessageResponse.builder().message("Thêm hợp đồng mới thành công").build();
    }

    @Override
    public Page<ContractResponse> getAllContractOfRentaler(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.title").ascending());
        return mapperUtils.convertToResponsePage(contractRepository.searchContractsByKeyword(keyword, getUserId(), pageable), ContractResponse.class, pageable);
    }

    @Override
    public ContractResponse getContractById(Long id) {
        return mapperUtils.convertToResponse(contractRepository.findById(id).orElseThrow(() -> new BadRequestException("Hợp đồng không tồn tại!")), ContractResponse.class);
    }

    @Override
    public MessageResponse editContractInfo(Long id, String name, Long roomId, String nameOfRent, Long numOfPeople, String phone, String deadlineContract, List<MultipartFile> files) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng đã không tồn tại"));
        if (room.getIsLocked().equals(LockedStatus.DISABLE)) {
            throw new BadRequestException("Phòng đã bị khóa");
        }

        Contract contract = contractRepository.findById(id).orElseThrow(() -> new BadRequestException("Hợp đồng không tồn tại!"));
        contract.setDeadlineContract(LocalDateTime.parse(deadlineContract));
        contract.setRoom(room);
        contract.setName(name);
        contract.setPhone(phone);
        contract.setNumOfPeople(numOfPeople);
        if (Objects.nonNull(files.get(0))) {
            String file = fileStorageService.storeFile(files.get(0)).replace("photographer/files/", "");
            contract.setFiles("http://localhost:8080/document/"+file);
        }
        contract.setNameOfRent(nameOfRent);
        contractRepository.save(contract);
        return MessageResponse.builder().message("Cập nhật hợp đồng thành công.").build();
    }

    @Override
    public Page<ContractResponse> getAllContractOfCustomer(String phone, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(contractRepository.searchContractsByPhone(phone,pageable),ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getAllContractForFilterPriceAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.price").ascending());
        return mapperUtils.convertToResponsePage(contractRepository.searchContractsByKeyword(keyword, getUserId(), pageable), ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getAllContractForFilterPriceDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.price").descending());
        return mapperUtils.convertToResponsePage(contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable), ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractByAdditionalFeeAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        // Define sorting by multiple properties
        Sort sort = Sort.by(
                Sort.Order.asc("room.waterCost"),
                Sort.Order.asc("room.publicElectricCost"),
                Sort.Order.asc("room.internetCost")
        );
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        return mapperUtils.convertToResponsePage(contractRepository.searchContractsByKeyword(keyword, getUserId(),pageable), ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractByAdditionalFeeDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        // Define sorting by multiple properties
        Sort sort = Sort.by(
                Sort.Order.desc("room.waterCost"),
                Sort.Order.desc("room.publicElectricCost"),
                Sort.Order.desc("room.internetCost")
        );
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        return mapperUtils.convertToResponsePage(contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable), ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractByTimeAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("deadlineContract").ascending());
        return mapperUtils.convertToResponsePage(contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable), ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractByTimeDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("deadlineContract").descending());
        return mapperUtils.convertToResponsePage(contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable), ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractHiredByTitleAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.title").ascending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.HIRED.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractHiredByTitleDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.title").descending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.HIRED.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractHiredByPriceAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.price").ascending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.HIRED.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractHiredByPriceDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.price").descending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.HIRED.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractRoomRentByTitleAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.title").ascending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.ROOM_RENT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractRoomRentByTitleDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.title").descending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.ROOM_RENT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractRoomRentByPriceAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.price").ascending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.ROOM_RENT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractRoomRentByPriceDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.price").descending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.ROOM_RENT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractCheckedOutByTitleAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.title").ascending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.CHECKED_OUT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractCheckedOutByTitleDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.title").descending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.CHECKED_OUT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractCheckedOutByPriceAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.price").ascending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.CHECKED_OUT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractCheckedOutByPriceDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.price").descending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.CHECKED_OUT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractHiredByTimeAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("deadlineContract").ascending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.HIRED.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractHiredByTimeDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("deadlineContract").descending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.HIRED.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractRoomRentByTimeAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("deadlineContract").ascending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.ROOM_RENT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractRoomRentByTimeDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("deadlineContract").descending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.ROOM_RENT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractCheckedOutByTimeAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("deadlineContract").ascending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.CHECKED_OUT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractCheckedOutByTimeDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("deadlineContract").descending());

        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);

        // Filter contracts where room.status = 'CHECKED_OUT'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.CHECKED_OUT.equals(contract.getRoom().getStatus()))
                .collect(Collectors.toList());

        // Create a new Page with filtered results
        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        // Convert to ContractResponse
        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractHiredByAdditionalFeeAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        // Define sorting by multiple properties
        Sort sort = Sort.by(
                Sort.Order.asc("room.waterCost"),
                Sort.Order.asc("room.publicElectricCost"),
                Sort.Order.asc("room.internetCost")
        );
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);
        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.HIRED.equals(contract.getRoom().getStatus()))
                .toList();

        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractHiredByAdditionalFeeDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        // Define sorting by multiple properties
        Sort sort = Sort.by(
                Sort.Order.desc("room.waterCost"),
                Sort.Order.desc("room.publicElectricCost"),
                Sort.Order.desc("room.internetCost")
        );
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);
        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.HIRED.equals(contract.getRoom().getStatus()))
                .toList();

        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractRoomRentByAdditionalFeeAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        // Define sorting by multiple properties
        Sort sort = Sort.by(
                Sort.Order.asc("room.waterCost"),
                Sort.Order.asc("room.publicElectricCost"),
                Sort.Order.asc("room.internetCost")
        );
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);
        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.ROOM_RENT.equals(contract.getRoom().getStatus()))
                .toList();

        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractRoomRentByAdditionalFeeDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        // Define sorting by multiple properties
        Sort sort = Sort.by(
                Sort.Order.desc("room.waterCost"),
                Sort.Order.desc("room.publicElectricCost"),
                Sort.Order.desc("room.internetCost")
        );
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);
        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.ROOM_RENT.equals(contract.getRoom().getStatus()))
                .toList();

        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractCheckedOutByAdditionalFeeAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        // Define sorting by multiple properties
        Sort sort = Sort.by(
                Sort.Order.asc("room.waterCost"),
                Sort.Order.asc("room.publicElectricCost"),
                Sort.Order.asc("room.internetCost")
        );
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);
        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.CHECKED_OUT.equals(contract.getRoom().getStatus()))
                .toList();

        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractCheckedOutByAdditionalFeeDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        // Define sorting by multiple properties
        Sort sort = Sort.by(
                Sort.Order.desc("room.waterCost"),
                Sort.Order.desc("room.publicElectricCost"),
                Sort.Order.desc("room.internetCost")
        );
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        // Fetch contracts from repository
        Page<Contract> contractPage = contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable);
        // Filter contracts where room.status = 'HIRED'
        List<Contract> filteredContracts = contractPage.getContent().stream()
                .filter(contract -> RoomStatus.CHECKED_OUT.equals(contract.getRoom().getStatus()))
                .toList();

        Page<Contract> filteredPage = new PageImpl<>(
                filteredContracts,
                pageable,
                filteredContracts.size() // Total elements after filtering
        );

        return mapperUtils.convertToResponsePage(filteredPage, ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractByNameAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("name").ascending());
        return mapperUtils.convertToResponsePage(contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable), ContractResponse.class, pageable);
    }

    @Override
    public Page<ContractResponse> getContractByNameDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("name").ascending());
        return mapperUtils.convertToResponsePage(contractRepository.searchContractsByKeyword(keyword, getUserId() ,pageable), ContractResponse.class, pageable);
    }
}