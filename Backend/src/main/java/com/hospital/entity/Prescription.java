package com.hospital.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "medicine")
    private String medicine;
    
    @Column(name = "advice")
    private String advice;
    
    @Column(name = "remark")
    private String remark;
    
    @Column(name = "status")
    private String status = "Active";
    
    @Column(name = "created_at")
    private LocalDate date = LocalDate.now();
    
    @Column(name = "p_id")
    private Integer pId;
    
    @Column(name = "ap_id")
    private Integer apId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    @JsonIgnoreProperties({"appointments", "prescriptions", "specialization"})
    // 🟢 Prevent infinite recursion: Doctor → Prescription → Doctor ...
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @JsonIgnoreProperties({"appointments", "prescriptions"})
    // 🟢 Prevent infinite recursion: Patient → Prescription → Patient ...
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    @JsonIgnoreProperties({"doctor", "patient"})
    // 🟢 Prevent recursion: Appointment → Prescription → Appointment ...
    private Appointment appointment;

    // Getters & Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }
    
    public String getMedicine() { return medicine; }
    public void setMedicine(String medicine) { this.medicine = medicine; }
    
    public String getAdvice() { return advice; }
    public void setAdvice(String advice) { this.advice = advice; }
    
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Integer getPId() { return pId; }
    public void setPId(Integer pId) { this.pId = pId; }
    
    public Integer getApId() { return apId; }
    public void setApId(Integer apId) { this.apId = apId; }
    
    @Override
    public String toString() {
        return "Prescription{" +
                "id=" + id +
                ", medicine='" + medicine + '\'' +
                ", advice='" + advice + '\'' +
                ", remark='" + remark + '\'' +
                ", status='" + status + '\'' +
                ", date=" + date +
                ", pId=" + pId +
                ", apId=" + apId +
                ", doctorId=" + (doctor != null ? doctor.getDrId() : null) +
                '}';
    }
}
