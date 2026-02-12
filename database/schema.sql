-- TravelLens Database Schema
-- MySQL Database

CREATE DATABASE IF NOT EXISTS travellens;
USE travellens;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    trip_name VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10, 2) NOT NULL,
    travel_type ENUM('Solo', 'Family', 'Friends') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Places table
CREATE TABLE places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    place_name VARCHAR(255) NOT NULL,
    category ENUM('Beach', 'Fort', 'Museum', 'Temple', 'Mountain', 'Park', 'Restaurant', 'Shopping', 'Entertainment', 'Historical', 'Other') NOT NULL,
    rating DECIMAL(2, 1) CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- Hotels table
CREATE TABLE hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    hotel_name VARCHAR(255) NOT NULL,
    cost_per_night DECIMAL(10, 2) NOT NULL,
    nights INT NOT NULL,
    total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (cost_per_night * nights) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- Expenses table
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    category ENUM('Transport', 'Food', 'Stay', 'Activities', 'Shopping', 'Other') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- Insert sample data for testing
INSERT INTO users (name, email, password_hash) VALUES 
('Vagvedi', 'vagvedikinikar@gmail.com', 'hashed_password_1'),
('Jane Smith', 'jane@example.com', 'hashed_password_2');

INSERT INTO trips (user_id, trip_name, destination, start_date, end_date, budget, travel_type) VALUES 
(1, 'Goa Beach Vacation', 'Goa, India', '2024-12-01', '2024-12-05', 25000.00, 'Friends'),
(1, 'Delhi Heritage Tour', 'Delhi, India', '2024-10-15', '2024-10-18', 18000.00, 'Solo'),
(2, 'Kerala Backwaters', 'Kerala, India', '2024-11-20', '2024-11-25', 30000.00, 'Family');

INSERT INTO places (trip_id, place_name, category, rating, notes) VALUES 
(1, 'Baga Beach', 'Beach', 4.5, 'Beautiful beach with great nightlife'),
(1, 'Fort Aguada', 'Fort', 4.2, 'Historic Portuguese fort with amazing views'),
(2, 'Red Fort', 'Historical', 4.7, 'Mughal architecture masterpiece'),
(2, 'India Gate', 'Historical', 4.6, 'Iconic monument with great atmosphere'),
(3, 'Alleppey Backwaters', 'Beach', 4.8, 'Serene houseboat experience');

INSERT INTO hotels (trip_id, hotel_name, cost_per_night, nights) VALUES 
(1, 'Taj Resort & Convention Centre', 8000.00, 4),
(2, 'The Lalit New Delhi', 6000.00, 3),
(3, 'Kumarakom Lake Resort', 9000.00, 5);

INSERT INTO expenses (trip_id, category, amount, description) VALUES 
(1, 'Transport', 5000.00, 'Flight to Goa'),
(1, 'Food', 8000.00, 'Restaurants and local cuisine'),
(1, 'Activities', 4000.00, 'Water sports and sightseeing'),
(1, 'Shopping', 3000.00, 'Souvenirs and local items'),
(2, 'Transport', 3000.00, 'Train to Delhi'),
(2, 'Food', 4500.00, 'Street food and restaurants'),
(2, 'Activities', 2500.00, 'Museum entries and tours'),
(3, 'Transport', 8000.00, 'Flight to Kerala'),
(3, 'Food', 6000.00, 'Traditional Kerala cuisine'),
(3, 'Stay', 5000.00, 'Additional accommodation costs');
