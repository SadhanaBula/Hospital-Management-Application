package com.hospital.controller;

import com.hospital.entity.Appointment;
import com.hospital.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    // DTO for updating status
    public static class UpdateStatusRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return appointmentService.createAppointment(appointment);
    }

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable Integer id) {
        return appointmentService.getAppointmentById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    @PutMapping("/{id}")
    public Appointment updateAppointment(@PathVariable Integer id, @RequestBody Appointment appointment) {
        appointment.setApId(id);
        return appointmentService.updateAppointment(appointment);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAppointment(@PathVariable Integer id) {
        appointmentService.deleteAppointment(id);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getAppointmentsByDoctor(@PathVariable Integer doctorId) {
        return appointmentService.getAppointmentsByDoctor(doctorId);
    }

    @GetMapping("/patient/{patientId}")
    public List<Appointment> getAppointmentsByPatient(@PathVariable Integer patientId) {
        return appointmentService.getAppointmentsByPatient(patientId);
    }

    @GetMapping("/status/{status}")
    public List<Appointment> getAppointmentsByStatus(@PathVariable String status) {
        return appointmentService.getAppointmentsByStatus(status);
    }

    @GetMapping("/date/{date}")
    public List<Appointment> getAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return appointmentService.getAppointmentsByDate(date.toString());
    }

    @PutMapping("/{id}/status")
    public Appointment updateAppointmentStatus(@PathVariable Integer id,
                                               @RequestBody UpdateStatusRequest request) {
        return appointmentService.updateStatus(id, request.getStatus());
    }

    @GetMapping("/doctor/{doctorId}/upcoming")
    public List<Appointment> getUpcomingAppointments(@PathVariable Integer doctorId) {
        return appointmentService.getUpcomingAppointments(doctorId);
    }

    @GetMapping("/doctor/{doctorId}/past")
    public List<Appointment> getPastAppointments(@PathVariable Integer doctorId) {
        return appointmentService.getPastAppointments(doctorId);
    }

    @GetMapping("/doctor/{doctorId}/today")
    public List<Appointment> getTodayAppointments(@PathVariable Integer doctorId) {
        return appointmentService.getTodayAppointments(doctorId);
    }

    // Custom Exception for 404
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) { super(message); }
    }
}
