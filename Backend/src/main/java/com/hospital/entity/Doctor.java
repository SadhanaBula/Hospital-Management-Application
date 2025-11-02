package com.hospital.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer drId;

    private String name;
    private String email;
    private String password;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialization_id")
    @JsonIgnoreProperties("doctors") // 🟢 Prevent recursion: Specialization → Doctor → Specialization
    private Specialization specialization;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("doctor") // 🟢 Prevent recursion: Appointment → Doctor → Appointment
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("doctor") // 🟢 Prevent recursion: Prescription → Doctor → Prescription
    private List<Prescription> prescriptions;

    // Getters & Setters
    public Integer getDrId() { return drId; }
    public void setDrId(Integer drId) { this.drId = drId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Specialization getSpecialization() { return specialization; }
    public void setSpecialization(Specialization specialization) { this.specialization = specialization; }

    public List<Appointment> getAppointments() { return appointments; }
    public void setAppointments(List<Appointment> appointments) { this.appointments = appointments; }

    public List<Prescription> getPrescriptions() { return prescriptions; }
    public void setPrescriptions(List<Prescription> prescriptions) { this.prescriptions = prescriptions; }
}
