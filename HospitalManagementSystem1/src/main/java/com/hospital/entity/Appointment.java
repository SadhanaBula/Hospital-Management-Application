package com.hospital.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer apId;

    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String descript;
    private String status = "PENDING";
    private Integer cancelConfirm = 0;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    // Getters & Setters
    public Integer getApId() { return apId; }
    public void setApId(Integer apId) { this.apId = apId; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }

    public String getDescript() { return descript; }
    public void setDescript(String descript) { this.descript = descript; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getCancelConfirm() { return cancelConfirm; }
    public void setCancelConfirm(Integer cancelConfirm) { this.cancelConfirm = cancelConfirm; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
}
