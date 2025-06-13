package org.example.backend.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.example.backend.service.CsvExportService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Service
@Slf4j
public class CsvExportServiceImpl implements CsvExportService {
    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${csv.output.path}")
    private String csvOutputPath;

    private static final String QUERY = "SELECT * FROM room";

    @Scheduled(cron = "${csv.export.cron}") // Chạy lúc 15:26 mỗi ngày
    public void exportToCsv() {
        System.out.println("Starting CSV export at " + LocalDateTime.now());

        try {
            // Tạo thư mục nếu chưa tồn tại
            File file = new File(csvOutputPath);
            File parentDir = file.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
            }

            // Sử dụng OutputStreamWriter với mã hóa UTF-8
            try (Connection connection = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                 Statement statement = connection.createStatement();
                 ResultSet resultSet = statement.executeQuery(QUERY);
                 Writer csvWriter = new OutputStreamWriter(new FileOutputStream(csvOutputPath), StandardCharsets.UTF_8)) {

                // Thêm UTF-8 BOM để Excel nhận diện (tùy chọn)
                csvWriter.write("\uFEFF");

                // Viết header
                for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++) {
                    String header = resultSet.getMetaData().getColumnName(i);
                    csvWriter.append("\"").append(header).append("\"");
                    if (i < resultSet.getMetaData().getColumnCount()) csvWriter.append(",");
                }
                csvWriter.append("\n");

                // Viết dữ liệu
                while (resultSet.next()) {
                    for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++) {
                        String value = resultSet.getString(i) != null ? resultSet.getString(i) : "";
                        // Bao quanh giá trị bằng dấu nháy kép và thoát dấu nháy kép trong dữ liệu
                        value = "\"" + value.replace("\"", "\"\"") + "\"";
                        csvWriter.append(value);
                        if (i < resultSet.getMetaData().getColumnCount()) csvWriter.append(",");
                    }
                    csvWriter.append("\n");
                }

                System.out.println("CSV file exported successfully to " + csvOutputPath);

            }
        } catch (Exception e) {
            System.err.println("Error exporting CSV: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
