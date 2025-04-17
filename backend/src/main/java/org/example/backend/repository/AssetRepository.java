package org.example.backend.repository;

import org.example.backend.model.Asset;
import org.example.backend.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    void deleteAllByRoom(Room room);
}
