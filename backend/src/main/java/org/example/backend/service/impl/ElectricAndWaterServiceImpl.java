package org.example.backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.ElectricAndWaterResponse;
import org.example.backend.exception.BadRequestException;
import org.example.backend.model.ElectricAndWater;
import org.example.backend.model.Room;
import org.example.backend.repository.ElectricAndWaterRepository;
import org.example.backend.service.BaseService;
import org.example.backend.service.ElectricAndWaterService;
import org.example.backend.service.RoomService;
import org.example.backend.utils.MapperUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class ElectricAndWaterServiceImpl extends BaseService implements ElectricAndWaterService {

    private final ElectricAndWaterRepository electricAndWaterRepository;
    private final RoomService roomService;
    private final MapperUtils mapperUtils;

    @Override
    public ElectricAndWater saveElectric(ElectricAndWater electricAndWater) {
        electricAndWater.setPaid(false);
        int deviatedBlock = electricAndWater.getThisMonthBlockOfWater() - electricAndWater.getLastMonthBlockOfWater();
        int deviatedNumber = electricAndWater.getThisMonthNumberOfElectric() - electricAndWater.getLastMonthNumberOfElectric();
        BigDecimal totalMoneyOfWater = deviatedBlock > 0 ? electricAndWater.getMoneyEachBlockOfWater().multiply(BigDecimal.valueOf(deviatedBlock)) : BigDecimal.ZERO;
        BigDecimal totalMoneyOfElectric = deviatedNumber > 0 ? electricAndWater.getMoneyEachNumberOfElectric().multiply(BigDecimal.valueOf(deviatedNumber)) : BigDecimal.ZERO;
        electricAndWater.setTotalMoneyOfWater(totalMoneyOfWater);
        electricAndWater.setTotalMoneyOfElectric(totalMoneyOfElectric);

        return electricAndWaterRepository.save(electricAndWater);
    }

    @Override
    @Transactional
    public ElectricAndWater updateElectric(ElectricAndWater electricAndWater, Long id) {
        return electricAndWaterRepository.findById(id)
                .map(electricAndWater1 -> {
                    int deviatedBlock = electricAndWater.getThisMonthBlockOfWater() - electricAndWater.getLastMonthBlockOfWater();
                    int deviatedNumber = electricAndWater.getThisMonthNumberOfElectric() - electricAndWater.getLastMonthNumberOfElectric();
                    BigDecimal totalMoneyOfWater = deviatedBlock > 0 ? electricAndWater.getMoneyEachBlockOfWater().multiply(BigDecimal.valueOf(deviatedBlock)) : BigDecimal.ZERO;
                    BigDecimal totalMoneyOfElectric = deviatedNumber > 0 ? electricAndWater.getMoneyEachNumberOfElectric().multiply(BigDecimal.valueOf(deviatedNumber)) : BigDecimal.ZERO;

                    electricAndWater1.setRoom(electricAndWater.getRoom());
                    electricAndWater1.setMonth(electricAndWater.getMonth());
                    electricAndWater1.setName(electricAndWater.getName());

                    electricAndWater1.setLastMonthBlockOfWater(electricAndWater.getLastMonthBlockOfWater());
                    electricAndWater1.setThisMonthBlockOfWater(electricAndWater.getThisMonthBlockOfWater());
                    electricAndWater1.setMoneyEachBlockOfWater(electricAndWater.getMoneyEachBlockOfWater());
                    electricAndWater1.setTotalMoneyOfWater(totalMoneyOfWater);

                    electricAndWater1.setLastMonthNumberOfElectric(electricAndWater.getLastMonthNumberOfElectric());
                    electricAndWater1.setThisMonthNumberOfElectric(electricAndWater.getThisMonthNumberOfElectric());
                    electricAndWater1.setMoneyEachNumberOfElectric(electricAndWater.getMoneyEachNumberOfElectric());
                    electricAndWater1.setTotalMoneyOfElectric(totalMoneyOfElectric);
                    electricAndWater1.setPaid(electricAndWater.isPaid());

                    Room room = electricAndWater.getRoom();
                    room.setPublicElectricCost(totalMoneyOfElectric);
                    room.setWaterCost(totalMoneyOfWater);
                    roomService.updateRoom(room, room.getId());
                    return electricAndWaterRepository.save(electricAndWater1);
                })
                .orElseThrow(() -> new RuntimeException("Electric not found with id " + id));
    }

    public Page<ElectricAndWaterResponse> getAllElectricAndWater(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.title").ascending());
        return mapperUtils.convertToResponsePage(electricAndWaterRepository.searchElectricAndWaterByKeyWord(keyword, getUserId() ,pageable), ElectricAndWaterResponse.class, pageable);
    }

    @Override
    public Page<ElectricAndWaterResponse> getElectricAndWaterByFilter(String field, String order, String keyword, Integer pageNo, Integer pageSize) {
        // Validate input parameters
        if (field == null || field.trim().isEmpty()) {
            throw new IllegalArgumentException("Field cannot be null or empty");
        }
        if (pageNo == null || pageNo < 1) {
            pageNo = 1; // Default to page 1
        }
        if (pageSize == null || pageSize < 1) {
            pageSize = 10; // Default page size
        }
        // Convert to 0-based index for Spring Data
        int page = pageNo - 1;
        // Initialize pageable with sorting
        Pageable pageable = switch (order != null ? order.toLowerCase() : "") {
            case "asc" -> PageRequest.of(page, pageSize, Sort.by(field).ascending());
            case "desc" -> PageRequest.of(page, pageSize, Sort.by(field).descending());
            default ->
                // Default to unsorted if order is invalid
                    PageRequest.of(page, pageSize, Sort.by("room.title").ascending());
        };
        // Perform search and convert to response
        return mapperUtils.convertToResponsePage(
                electricAndWaterRepository.searchElectricAndWaterByKeyWord(keyword, getUserId() ,pageable),
                ElectricAndWaterResponse.class,
                pageable
        );
    }

    @Override
    public void deleteElectricAndWater(Long id) {
        Optional<ElectricAndWater> invoice = electricAndWaterRepository.findById(id);
        if (invoice.isEmpty()) {
            throw new BadRequestException("Invoice does not exist");
        }
        electricAndWaterRepository.delete(invoice.get());
    }

    @Override
    public ElectricAndWaterResponse getElectricAndWater(Long id) {
        return electricAndWaterRepository.findById(id)
                .map(electricAndWater -> {
                    ElectricAndWaterResponse electricAndWaterResponse = new ElectricAndWaterResponse();
                    electricAndWaterResponse.setId(electricAndWater.getId());
                    electricAndWaterResponse.setName(electricAndWater.getName());
                    electricAndWaterResponse.setMonth(electricAndWater.getMonth());
                    electricAndWaterResponse.setLastMonthBlockOfWater(electricAndWater.getLastMonthBlockOfWater());
                    electricAndWaterResponse.setThisMonthBlockOfWater(electricAndWater.getThisMonthBlockOfWater());
                    electricAndWaterResponse.setMoneyEachBlockOfWater(electricAndWater.getMoneyEachBlockOfWater());
                    electricAndWaterResponse.setTotalMoneyOfWater(electricAndWater.getTotalMoneyOfWater());

                    electricAndWaterResponse.setLastMonthNumberOfElectric(electricAndWater.getLastMonthNumberOfElectric());
                    electricAndWaterResponse.setThisMonthNumberOfElectric(electricAndWater.getThisMonthNumberOfElectric());
                    electricAndWaterResponse.setMoneyEachNumberOfElectric(electricAndWater.getMoneyEachNumberOfElectric());
                    electricAndWaterResponse.setTotalMoneyOfElectric(electricAndWater.getTotalMoneyOfElectric());

                    electricAndWaterResponse.setRoom(roomService.getRoomById(electricAndWater.getRoom().getId()));
                    electricAndWaterResponse.setPaid(electricAndWater.isPaid());
                    return electricAndWaterResponse;
                })
                .orElseThrow(() -> new RuntimeException("Electric not found with id " + id));
    }
}
