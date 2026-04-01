-- TravelLens Recommendation System Schema Additions
-- MySQL Database - Backward Compatible Additions

USE travellens;

-- STEP 1: GLOBAL PLACE KNOWLEDGE (MASTER PLACES)
CREATE TABLE places_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    popularity_score FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_place (name, city)
);

-- STEP 2: LINK LOGGED PLACES TO REAL PLACES
ALTER TABLE places
ADD COLUMN master_place_id INT NULL,
ADD CONSTRAINT fk_places_master
FOREIGN KEY (master_place_id) REFERENCES places_master(id)
ON DELETE SET NULL;

-- STEP 3: PLACE SEMANTIC TAGS
CREATE TABLE place_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    place_id INT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    FOREIGN KEY (place_id) REFERENCES places_master(id) ON DELETE CASCADE,
    INDEX idx_tag (tag),
    INDEX idx_place (place_id)
);

-- STEP 4: USER INTEREST PROFILE (DERIVED DATA)
CREATE TABLE user_interest_profile (
    user_id INT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    weight FLOAT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tag),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_tag (tag)
);

-- STEP 5: VISIT TRACKING HELPER VIEW
CREATE VIEW user_visited_places AS
SELECT DISTINCT t.user_id, p.master_place_id
FROM places p
JOIN trips t ON p.trip_id = t.id
WHERE p.master_place_id IS NOT NULL;

-- STEP 6: EMBEDDING SYNC TRACKING
CREATE TABLE embedding_sync (
    ref_id INT NOT NULL,
    ref_type ENUM('place','user') NOT NULL,
    last_generated TIMESTAMP NULL,
    PRIMARY KEY (ref_id, ref_type)
);

-- Sample data for places_master (examples)
INSERT INTO places_master (name, city, category, description, popularity_score) VALUES 
('Baga Beach', 'Goa', 'Beach', 'Popular beach known for water sports and nightlife', 4.5),
('Fort Aguada', 'Goa', 'Historical Fort', '17th-century Portuguese fort with lighthouse', 4.2),
('Red Fort', 'Delhi', 'Historical Monument', 'UNESCO World Heritage Site, Mughal architecture', 4.7),
('India Gate', 'Delhi', 'Monument', 'War memorial arch on Rajpath', 4.6),
('Alleppey Backwaters', 'Kerala', 'Natural Attraction', 'Network of waterways and houseboat experiences', 4.8);

-- Sample tags for places
INSERT INTO place_tags (place_id, tag) VALUES 
(1, 'beach'), (1, 'nightlife'), (1, 'water_sports'), (1, 'crowded'),
(2, 'historical'), (2, 'views'), (2, 'photography'), (2, 'peaceful'),
(3, 'historical'), (3, 'architecture'), (3, 'heritage'), (3, 'crowded'),
(4, 'monument'), (4, 'photography'), (4, 'evening'), (4, 'crowded'),
(5, 'nature'), (5, 'peaceful'), (5, 'boating'), (5, 'scenic');

-- Update existing places to link with master places
UPDATE places SET master_place_id = 1 WHERE place_name = 'Baga Beach';
UPDATE places SET master_place_id = 2 WHERE place_name = 'Fort Aguada';
UPDATE places SET master_place_id = 3 WHERE place_name = 'Red Fort';
UPDATE places SET master_place_id = 4 WHERE place_name = 'India Gate';
UPDATE places SET master_place_id = 5 WHERE place_name = 'Alleppey Backwaters';

-- Initialize embedding sync tracking
INSERT INTO embedding_sync (ref_id, ref_type, last_generated) VALUES 
(1, 'place', NULL), (2, 'place', NULL), (3, 'place', NULL), (4, 'place', NULL), (5, 'place', NULL),
(1, 'user', NULL), (2, 'user', NULL);

ALTER TABLE trips MODIFY COLUMN travel_type VARCHAR(50) NOT NULL DEFAULT 'Solo';

ALTER TABLE hotels DROP COLUMN total_cost;
ALTER TABLE hotels ADD COLUMN total_cost DECIMAL(10,2) NOT NULL DEFAULT 0;
