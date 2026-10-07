-- ============================================
-- To-Do Organizer Database Setup
-- Run this in XAMPP phpMyAdmin or MySQL CLI
-- ============================================

CREATE DATABASE IF NOT EXISTS todo_Organizer;
USE todo_Organizer;

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#2196f3',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SubFolders table
CREATE TABLE IF NOT EXISTS subfolders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folder_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subfolder_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    done TINYINT(1) NOT NULL DEFAULT 0,
    due VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subfolder_id) REFERENCES subfolders(id) ON DELETE CASCADE
);

