package org.example.backend.repository;

import org.example.backend.model.ElectricAndWater;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElectricAndWaterRepository extends JpaRepository<ElectricAndWater, Long> {
    @Query("SELECT ew FROM ElectricAndWater ew WHERE ew.room.id= :roomId")
    List<ElectricAndWater> findByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT ew FROM ElectricAndWater ew " +
            "WHERE 1=1 " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "ew.room.title LIKE CONCAT('%', :keyword, '%') OR " +
            "ew.name LIKE CONCAT('%', :keyword, '%') OR " +
            "CAST(ew.month AS string) LIKE CONCAT('%', :keyword, '%'))")
    Page<ElectricAndWater> searchElectricAndWaterByKeyWord(@Param("keyword") String keyword,
                                        Pageable pageable);
}
