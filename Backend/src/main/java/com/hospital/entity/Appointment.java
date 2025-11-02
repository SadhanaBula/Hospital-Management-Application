package com.hospital.entity;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer apId;

    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String descript;
    private String status = "PENDING";
    private Integer cancelConfirm = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    @JsonIgnoreProperties({"appointments", "prescriptions", "specialization"}) // 🟢 Prevent recursion
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @JsonIgnoreProperties({"appointments"}) // 🟢 Prevent recursion
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

    @Override
    public String toString() {
        return "Appointment{" +
                "apId=" + apId +
                ", appointmentDate=" + appointmentDate +
                ", appointmentTime=" + appointmentTime +
                ", status='" + status + '\'' +
                ", patientId=" + (patient != null ? patient.getpId() : "null") +
                ", doctorId=" + (doctor != null ? doctor.getDrId() : "null") +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Appointment that = (Appointment) o;
        return Objects.equals(apId, that.apId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(apId);
    }
}
