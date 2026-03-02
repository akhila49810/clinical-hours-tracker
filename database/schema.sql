-- VOM Clinical Hours Tracker — MySQL Schema
-- Run this in your MySQL client to create the database manually (optional)
-- Sequelize will also auto-create these tables on first startup via sync()

CREATE DATABASE IF NOT EXISTS vom_clinical_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vom_clinical_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,
  role          ENUM('student', 'supervisor') NOT NULL DEFAULT 'student',
  studentId     VARCHAR(50)   DEFAULT NULL,
  department    VARCHAR(150)  DEFAULT NULL,
  createdAt     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clinical logs table
CREATE TABLE IF NOT EXISTS clinical_logs (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  studentId           INT           NOT NULL,
  supervisorId        INT           DEFAULT NULL,
  date                DATE          NOT NULL,
  department          VARCHAR(150)  NOT NULL,
  location            VARCHAR(255)  NOT NULL,
  hoursLogged         DECIMAL(4,1)  NOT NULL,
  patientEncounters   INT           DEFAULT 0,
  procedures          JSON          DEFAULT NULL,
  learningObjectives  TEXT          DEFAULT NULL,
  reflections         TEXT          DEFAULT NULL,
  status              ENUM('pending','approved','rejected','revision_requested') NOT NULL DEFAULT 'pending',
  supervisorFeedback  TEXT          DEFAULT NULL,
  reviewedAt          DATETIME      DEFAULT NULL,
  createdAt           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_student    FOREIGN KEY (studentId)   REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_supervisor FOREIGN KEY (supervisorId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_status (studentId, status),
  INDEX idx_status          (status),
  INDEX idx_department      (department)
);
