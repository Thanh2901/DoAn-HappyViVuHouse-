package org.example.backend.service;

import org.example.backend.dto.response.ContractResponse;
import org.example.backend.dto.response.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ContractService {
    MessageResponse addContract(String name, Long roomId, String nameRentHome,Long numOfPeople,String phone, String deadline, List<MultipartFile> files);

    Page<ContractResponse> getAllContractOfRentaler(String keyword, Integer pageNo, Integer pageSize);

    ContractResponse getContractById(Long id);

    MessageResponse editContractInfo(Long id, String name, Long roomId, String nameOfRent,Long numOfPeople,String phone, String deadlineContract, List<MultipartFile> files);

    Page<ContractResponse> getAllContractOfCustomer(String phone, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getAllContractForFilterPriceAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getAllContractForFilterPriceDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractByAdditionalFeeAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractByAdditionalFeeDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractByTimeAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractByTimeDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractHiredByTitleAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractHiredByTitleDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractHiredByPriceAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractHiredByPriceDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractRoomRentByTitleAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractRoomRentByTitleDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractRoomRentByPriceAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractRoomRentByPriceDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractCheckedOutByTitleAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractCheckedOutByTitleDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractCheckedOutByPriceAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractCheckedOutByPriceDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractHiredByTimeAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractHiredByTimeDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractRoomRentByTimeAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractRoomRentByTimeDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractCheckedOutByTimeAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse>  getContractCheckedOutByTimeDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractHiredByAdditionalFeeAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractHiredByAdditionalFeeDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractRoomRentByAdditionalFeeAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractRoomRentByAdditionalFeeDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractCheckedOutByAdditionalFeeAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractCheckedOutByAdditionalFeeDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractByNameAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<ContractResponse> getContractByNameDesc(String keyword, Integer pageNo, Integer pageSize);
}
