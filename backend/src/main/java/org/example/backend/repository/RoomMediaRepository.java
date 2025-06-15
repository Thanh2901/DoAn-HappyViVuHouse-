package org.example.backend.repository;

import org.example.backend.model.Room;
import org.example.backend.model.RoomMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomMediaRepository extends JpaRepository<RoomMedia, Long> {
    void deleteAllByRoom(Room room);
    List<RoomMedia> findAllByRoom(Room room);
}
