package org.example.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "electric_and_water")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ElectricAndWater extends AbstractEntity<Long>{

    private String name;

    private int month;

    private int lastMonthNumberOfElectric;

    private int thisMonthNumberOfElectric;

    private int lastMonthBlockOfWater;

    private int thisMonthBlockOfWater;

    private BigDecimal moneyEachNumberOfElectric;

    private BigDecimal moneyEachBlockOfWater;

    private BigDecimal totalMoneyOfElectric;

    private BigDecimal totalMoneyOfWater;

    private boolean paid;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;
}
