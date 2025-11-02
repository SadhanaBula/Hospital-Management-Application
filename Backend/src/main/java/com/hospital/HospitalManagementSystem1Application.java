package com.hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
@RestController
public class HospitalManagementSystem1Application {

    private final DataSource dataSource;

    public HospitalManagementSystem1Application(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public static void main(String[] args) {
        SpringApplication.run(HospitalManagementSystem1Application.class, args);
    }

    @GetMapping("/api/test/db")
    public String testDatabase() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            
            // Check if prescription table exists
            boolean tableExists = false;
            ResultSet rs = conn.getMetaData().getTables(null, null, "prescription", null);
            if (rs.next()) {
                tableExists = true;
            }
            
            if (!tableExists) {
                return "Error: Prescription table does not exist in the database.";
            }
            
            // Get table structure
            List<String> columns = new ArrayList<>();
            rs = stmt.executeQuery("DESCRIBE prescription");
            while (rs.next()) {
                columns.add(rs.getString("Field") + " " + rs.getString("Type") + 
                           ("NO".equals(rs.getString("Null")) ? " NOT NULL" : "") +
                           (rs.getString("Default") != null ? " DEFAULT " + rs.getString("Default") : ""));
            }
            
            return "Database connection successful!\n\nPrescription table structure:\n" + 
                   String.join("\n", columns);
                    
        } catch (SQLException e) {
            return "Database connection failed: " + e.getMessage();
        }
    }
}
