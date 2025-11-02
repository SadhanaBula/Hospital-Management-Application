package com.hospital.service;

import com.hospital.entity.Prescription;
import com.hospital.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Override
    public Prescription createPrescription(Prescription prescription) {
        // Set the current date if not provided
        if (prescription.getDate() == null) {
            prescription.setDate(LocalDate.now());
        }
        
        // Set default status if not provided
        if (prescription.getStatus() == null) {
            prescription.setStatus("Active");
        }
        
        // Ensure patient ID is set from patient relationship if not set directly
        if (prescription.getPatient() != null && prescription.getPId() == null) {
            prescription.setPId(prescription.getPatient().getpId());
        }
        
        // Ensure appointment ID is set from appointment relationship if not set directly
        if (prescription.getAppointment() != null && prescription.getApId() == null) {
            prescription.setApId(prescription.getAppointment().getApId());
        }
        
        System.out.println("Creating prescription: " + prescription);
        return prescriptionRepository.save(prescription);
    }

    @Override
    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    @Override
    public Optional<Prescription> getPrescriptionById(Integer id) {
        return prescriptionRepository.findById(id);
    }

    @Override
    public Prescription updatePrescription(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }

    @Override
    public void deletePrescription(Integer id) {
        prescriptionRepository.deleteById(id);
    }

    @Override
    public List<Prescription> getPrescriptionsByDoctor(Integer doctorId) {
        return prescriptionRepository.findByDoctorDrId(doctorId);
    }

    @Override
    public List<Prescription> getPrescriptionsByPatient(Integer patientId) {
        System.out.println("Fetching prescriptions for patient ID: " + patientId);
        List<Prescription> prescriptions = prescriptionRepository.findByPatientPId(patientId);
        System.out.println("Found " + prescriptions.size() + " prescriptions for patient ID: " + patientId);
        if (!prescriptions.isEmpty()) {
            System.out.println("First prescription details: " + prescriptions.get(0));
        }
        return prescriptions;
    }

    @Override
    public List<Prescription> getPrescriptionsByAppointment(Integer appointmentId) {
        return prescriptionRepository.findByAppointmentApId(appointmentId);
    }

    @Override
    public List<Prescription> getPrescriptionsByDate(LocalDate date) {
        return prescriptionRepository.findByDate(date);
    }

    @Override
    public boolean existsById(Integer id) {
        return prescriptionRepository.existsById(id);
    }
}
