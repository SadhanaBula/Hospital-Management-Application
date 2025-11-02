package com.hospital.controller;

import com.hospital.entity.Doctor;
import com.hospital.service.DoctorService;
import com.hospital.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AnalyticsService analyticsService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorService.saveDoctor(doctor);
    }

    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @GetMapping("/{id}")
    public Doctor getDoctorById(@PathVariable Integer id) {
        return doctorService.getDoctorById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }

    @PutMapping("/{id}")
    public Doctor updateDoctor(@PathVariable Integer id, @RequestBody Doctor doctor) {
        if (!doctorService.existsById(id)) {
            throw new ResourceNotFoundException("Doctor not found with id: " + id);
        }
        doctor.setDrId(id);
        return doctorService.updateDoctor(doctor);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDoctor(@PathVariable Integer id) {
        if (!doctorService.existsById(id)) {
            throw new ResourceNotFoundException("Doctor not found with id: " + id);
        }
        doctorService.deleteDoctor(id);
    }

    @GetMapping("/specialization/{specializationId}")
    public List<Doctor> getDoctorsBySpecialization(@PathVariable Integer specializationId) {
        return doctorService.getDoctorsBySpecializationId(specializationId);
    }

    @GetMapping("/search")
    public List<Doctor> searchDoctorsByName(@RequestParam String name) {
        return doctorService.searchDoctorsByName(name);
    }

    @GetMapping("/email/{email}")
    public Doctor findByEmail(@PathVariable String email) {
        return doctorService.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with email: " + email));
    }

    @GetMapping("/{id}/stats")
    public Map<String, Object> getDoctorStats(@PathVariable Integer id) {
        return analyticsService.getDoctorStats(id);
    }

    @GetMapping("/{id}/patients/count")
    public Map<String, Long> getDoctorPatientCount(@PathVariable Integer id) {
        long count = doctorService.getPatientCount(id);
        return Map.of("patientCount", count);
    }

    // Custom Exception for 404
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) { super(message); }
    }
}
