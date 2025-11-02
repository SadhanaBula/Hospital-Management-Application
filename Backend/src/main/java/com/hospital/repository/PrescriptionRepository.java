package com.hospital.repository;

import com.hospital.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {

    // Patient-based queries (Patient.pId)
    @Query("SELECT p FROM Prescription p LEFT JOIN FETCH p.doctor d LEFT JOIN FETCH p.appointment a WHERE p.pId = :patientId")
    List<Prescription> findByPatientPId(@Param("patientId") Integer patientId);

    // Find by patient ID with pagination
    @Query("SELECT p FROM Prescription p LEFT JOIN FETCH p.doctor d LEFT JOIN FETCH p.appointment a WHERE p.pId = :patientId ORDER BY p.date DESC")
    Page<Prescription> findByPatientPIdWithPagination(@Param("patientId") Integer patientId, Pageable pageable);

    // Additional queries for availability checking
    @Query("SELECT p FROM Prescription p WHERE p.doctor.drId = :doctorId AND p.date = :date")
    List<Prescription> findByDoctorDrIdAndDate(@Param("doctorId") Integer doctorId, @Param("date") LocalDate date);

    // Find by appointment ID with doctor details
    @Query("SELECT p FROM Prescription p LEFT JOIN FETCH p.doctor d WHERE p.apId = :appointmentId")
    List<Prescription> findByAppointmentIdWithDoctor(@Param("appointmentId") Integer appointmentId);

    // Find prescriptions by doctor (via appointment)
    @Query("SELECT p FROM Prescription p WHERE p.appointment.doctor.drId = :doctorId")
    List<Prescription> findByDoctorDrId(Integer doctorId);

    // Find prescriptions by appointment
    List<Prescription> findByAppointmentApId(Integer appointmentId);

    // Find prescriptions by appointment date
    @Query("SELECT p FROM Prescription p WHERE p.appointment.appointmentDate = :date")
    List<Prescription> findByDate(LocalDate date);  // <-- method name aligned with service

    // existsById is already provided by JpaRepository
}
