package org.example.backend.service;

public interface MessageService {
    void Producer(String senderName, String receiverName);

    void Consumer(String senderName, String receiverName);
}
