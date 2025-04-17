package org.example.backend.service.impl;

import jakarta.annotation.PreDestroy;
import jakarta.jms.*;
import lombok.RequiredArgsConstructor;
import org.example.backend.service.MessageService;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

import java.lang.IllegalStateException;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {
    private final JmsTemplate jmsTemplate;
    private final ConnectionFactory connectionFactory;
    private final Map<String, MessageConsumer> consumers = new ConcurrentHashMap<>();
    private final Map<String, Session> sessions = new ConcurrentHashMap<>();
    private final Map<String, Connection> connections = new ConcurrentHashMap<>();

    @Override
    public void Producer(String senderName, String receiverName) {
        jmsTemplate.send(receiverName, session -> {
            TextMessage message = session.createTextMessage("Hello from " + senderName + "!");
            message.setStringProperty("senderName", senderName);
            return message;
        });
    }

    @Override
    public void Consumer(String senderName, String receiverName) {
        if (!consumers.containsKey(receiverName)) {
            try {
                Connection connection = connectionFactory.createConnection();
                connection.start();
                Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
                Queue queue = session.createQueue(receiverName);
                MessageConsumer consumer = session.createConsumer(queue);

                if (consumer == null) {
                    throw new IllegalStateException("Failed to create MessageConsumer for " + receiverName);
                }

                consumer.setMessageListener(message -> {
                    try {
                        if (message instanceof TextMessage) {
                            String sender = message.getStringProperty("senderName");
                            String content = ((TextMessage) message).getText();
                            Date sentAt = new Date(message.getJMSTimestamp());
                            System.out.println("Received from " + sender + ": " + content + " (Sent at: " + sentAt + ")");
                        }
                    } catch (JMSException e) {
                        e.printStackTrace();
                    }
                });

                // Lưu trữ tài nguyên chỉ khi tất cả đều thành công
                consumers.put(receiverName, consumer);
                sessions.put(receiverName, session);
                connections.put(receiverName, connection);
            } catch (JMSException e) {
                e.printStackTrace();
                // Xử lý lỗi: có thể đóng các tài nguyên đã tạo nếu có
            }
        }
    }

    @PreDestroy
    public void cleanup() {
        consumers.forEach((key, consumer) -> {
            try {
                if (consumer != null) {
                    consumer.close();
                }
                Session session = sessions.get(key);
                if (session != null) {
                    session.close();
                }
                Connection connection = connections.get(key);
                if (connection != null) {
                    connection.close();
                }
            } catch (JMSException e) {
                e.printStackTrace();
            }
        });
        consumers.clear();
        sessions.clear();
        connections.clear();
    }
}
