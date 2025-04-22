package org.example.backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.ElectricAndWaterResponse;
import org.example.backend.model.ElectricAndWater;
import org.example.backend.model.Room;
import org.example.backend.repository.ElectricAndWaterRepository;
import org.example.backend.service.ElectricAndWaterService;
import org.example.backend.service.RoomService;
import org.example.backend.utils.MapperUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;


@Service
@RequiredArgsConstructor
public class ElectricAndWaterServiceImpl implements ElectricAndWaterService {

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

//    @Override
//    public List<ElectricAndWaterResponse> getElectricByRoom(Long id) {
//        return electricAndWaterRepository.findByRoomId(id).stream().map(electricAndWater -> {
//            ElectricAndWaterResponse electricAndWaterResponse = new ElectricAndWaterResponse();
//            electricAndWaterResponse.setId(electricAndWater.getId());
//            electricAndWaterResponse.setName(electricAndWater.getName());
//            electricAndWaterResponse.setMonth(electricAndWater.getMonth());
//            electricAndWaterResponse.setLastMonthBlockOfWater(electricAndWater.getLastMonthBlockOfWater());
//            electricAndWaterResponse.setThisMonthBlockOfWater(electricAndWater.getThisMonthBlockOfWater());
//            electricAndWaterResponse.setMoneyEachBlockOfWater(electricAndWater.getMoneyEachBlockOfWater());
//            electricAndWaterResponse.setTotalMoneyOfWater(electricAndWater.getTotalMoneyOfWater());
//
//            electricAndWaterResponse.setLastMonthNumberOfElectric(electricAndWater.getLastMonthNumberOfElectric());
//            electricAndWaterResponse.setThisMonthNumberOfElectric(electricAndWater.getThisMonthNumberOfElectric());
//            electricAndWaterResponse.setMoneyEachNumberOfElectric(electricAndWater.getMoneyEachNumberOfElectric());
//            electricAndWaterResponse.setTotalMoneyOfElectric(electricAndWater.getTotalMoneyOfElectric());
//
//            electricAndWaterResponse.setRoom(roomService.getRoomById(electricAndWater.getRoom().getId()));
//            electricAndWaterResponse.setPaid(electricAndWater.isPaid());
//
//            return electricAndWaterResponse;
//        }).toList();
//    }

    public Page<ElectricAndWaterResponse> getAllElectricAndWater(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.title").ascending());
        return mapperUtils.convertToResponsePage(electricAndWaterRepository.searchElectricAndWaterByKeyWord(keyword, pageable), ElectricAndWaterResponse.class, pageable);
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
