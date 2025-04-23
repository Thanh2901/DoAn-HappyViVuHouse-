package org.example.backend.service;

import org.example.backend.dto.response.ElectricAndWaterResponse;
import org.example.backend.model.ElectricAndWater;
import org.springframework.data.domain.Page;

public interface ElectricAndWaterService {
    ElectricAndWater saveElectric(ElectricAndWater electricAndWater);

    ElectricAndWater updateElectric(ElectricAndWater electricAndWater, Long id);

//    List<ElectricAndWaterResponse> getElectricByRoom(Long id);

    ElectricAndWaterResponse getElectricAndWater(Long id);

    Page<ElectricAndWaterResponse> getAllElectricAndWater(String keyword, Integer pageNo, Integer pageSize);

    Page<ElectricAndWaterResponse> getElectricAndWaterByFilter(String field, String order, String keyword, Integer pageNo, Integer pageSize);
}
