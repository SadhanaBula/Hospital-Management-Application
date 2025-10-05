package com.hospital.repository;

import com.hospital.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {

    // Custom query to find admin by email
    Optional<Admin> findByEmail(String email);
}
