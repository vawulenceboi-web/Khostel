-- k-H Nigerian Student Hostel Platform - Complete Database Schema
-- Paste this entire script into your Supabase SQL Editor and run it
-- This will create all tables, relationships, and initial data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS hostels CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR,
    phone VARCHAR,
    role VARCHAR NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'agent', 'admin')),
    school_id VARCHAR,
    verified_status BOOLEAN DEFAULT false,
    business_reg_number VARCHAR, -- CAC number for agents
    profile_image VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Schools table
CREATE TABLE schools (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    state VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Locations table (hostel areas around schools)
CREATE TABLE locations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id VARCHAR NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL, -- e.g., "Westend", "Safari", "Chapel Road"
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Hostels table
CREATE TABLE hostels (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id VARCHAR NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Price in Naira
    price_type VARCHAR NOT NULL DEFAULT 'semester' CHECK (price_type IN ('semester', 'year')),
    room_type VARCHAR NOT NULL CHECK (room_type IN ('single', 'shared', 'self-contain')),
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    amenities JSONB DEFAULT '[]'::jsonb, -- Array of amenities
    availability BOOLEAN DEFAULT true,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Bookings table
CREATE TABLE bookings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hostel_id VARCHAR NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    preferred_date TIMESTAMP,
    preferred_time VARCHAR,
    message TEXT,
    status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'viewed', 'cancelled')),
    agent_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_locations_school_id ON locations(school_id);
CREATE INDEX idx_hostels_agent_id ON hostels(agent_id);
CREATE INDEX idx_hostels_location_id ON hostels(location_id);
CREATE INDEX idx_hostels_availability ON hostels(availability);
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_bookings_hostel_id ON bookings(hostel_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_school_id FOREIGN KEY (school_id) REFERENCES schools(id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hostels_updated_at BEFORE UPDATE ON hostels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Nigerian Universities
INSERT INTO schools (id, name, city, state) VALUES
('kwasu', 'Kwara State University', 'Malete', 'Kwara'),
('unilorin', 'University of Ilorin', 'Ilorin', 'Kwara'),
('oau', 'Obafemi Awolowo University', 'Ile-Ife', 'Osun'),
('ui', 'University of Ibadan', 'Ibadan', 'Oyo'),
('unn', 'University of Nigeria, Nsukka', 'Nsukka', 'Enugu'),
('uniben', 'University of Benin', 'Benin City', 'Edo'),
('unilag', 'University of Lagos', 'Lagos', 'Lagos'),
('abu', 'Ahmadu Bello University', 'Zaria', 'Kaduna'),
('unizik', 'Nnamdi Azikiwe University', 'Awka', 'Anambra'),
('futo', 'Federal University of Technology, Owerri', 'Owerri', 'Imo'),
('covenant', 'Covenant University', 'Ota', 'Ogun'),
('babcock', 'Babcock University', 'Ilishan-Remo', 'Ogun');

-- Insert Hostel Locations/Areas for each university
-- KWASU Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('kwasu', 'Westend', 8.9644, 4.7844),
('kwasu', 'Safari', 8.9654, 4.7854),
('kwasu', 'Chapel Road', 8.9634, 4.7834),
('kwasu', 'Tanke', 8.9624, 4.7824),
('kwasu', 'Gaa-Akanbi', 8.9674, 4.7864);

-- UNILORIN Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('unilorin', 'Tanke', 8.4799, 4.5418),
('unilorin', 'Fate Road', 8.4809, 4.5428),
('unilorin', 'Pipeline', 8.4789, 4.5408),
('unilorin', 'Sango', 8.4819, 4.5438);

-- OAU Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('oau', 'Lagere', 7.5248, 4.5648),
('oau', 'Asherifa', 7.5258, 4.5658),
('oau', 'Mayfair', 7.5238, 4.5638),
('oau', 'Oduduwa', 7.5268, 4.5668);

-- UI Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('ui', 'Bodija', 7.4347, 3.9097),
('ui', 'Sango', 7.4357, 3.9107),
('ui', 'Poly Road', 7.4337, 3.9087),
('ui', 'Ajibode', 7.4367, 3.9117);

-- UNN Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('unn', 'Nsukka Town', 6.8567, 7.3958),
('unn', 'Odenigbo', 6.8577, 7.3968),
('unn', 'Opi', 6.8557, 7.3948);

-- UNIBEN Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('uniben', 'Ekosodin', 6.4007, 5.6317),
('uniben', 'Osasogie', 6.4017, 5.6327),
('uniben', 'BDPA', 6.3997, 5.6307);

-- UNILAG Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('unilag', 'Akoka', 6.5158, 3.3898),
('unilag', 'Yaba', 6.5168, 3.3908),
('unilag', 'Bariga', 6.5148, 3.3888);

-- ABU Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('abu', 'Samaru', 11.1667, 7.6833),
('abu', 'Zaria City', 11.1677, 7.6843),
('abu', 'Sabon Gari', 11.1657, 7.6823);

-- UNIZIK Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('unizik', 'Ifite', 6.2442, 7.1142),
('unizik', 'Awka', 6.2452, 7.1152),
('unizik', 'Amansea', 6.2432, 7.1132);

-- FUTO Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('futo', 'Ihiagwa', 5.3978, 7.0278),
('futo', 'Owerri', 5.3988, 7.0288),
('futo', 'Nekede', 5.3968, 7.0268);

-- Covenant Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('covenant', 'Ota', 6.6833, 3.2000),
('covenant', 'Sango Ota', 6.6843, 3.2010),
('covenant', 'Canaan Land', 6.6823, 3.1990);

-- Babcock Areas
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
('babcock', 'Ilishan', 6.8833, 3.7167),
('babcock', 'Remo', 6.8843, 3.7177),
('babcock', 'Sagamu Road', 6.8823, 3.7157);

-- Create default admin user (password: admin123)
-- Note: This is a hashed version of 'admin123' using bcryptjs with 12 rounds
INSERT INTO users (email, password_hash, first_name, last_name, role, verified_status) VALUES
('admin@k-hostel.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzkt.95k5GS', 'Admin', 'User', 'admin', true);

-- Create sample verified agent for testing
INSERT INTO users (email, password_hash, first_name, last_name, role, school_id, verified_status, business_reg_number, phone) VALUES
('agent@k-hostel.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzkt.95k5GS', 'John', 'Agent', 'agent', 'kwasu', true, 'RC123456789', '+2348012345678');

-- Create sample student for testing
INSERT INTO users (email, password_hash, first_name, last_name, role, school_id, verified_status, phone) VALUES
('student@k-hostel.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzkt.95k5GS', 'Jane', 'Student', 'student', 'kwasu', true, '+2348087654321');

-- Get the agent ID for sample hostels
DO $$
DECLARE
    agent_uuid VARCHAR;
    westend_uuid VARCHAR;
    safari_uuid VARCHAR;
BEGIN
    -- Get agent ID
    SELECT id INTO agent_uuid FROM users WHERE email = 'agent@k-hostel.com';
    
    -- Get location IDs
    SELECT id INTO westend_uuid FROM locations WHERE name = 'Westend' AND school_id = 'kwasu';
    SELECT id INTO safari_uuid FROM locations WHERE name = 'Safari' AND school_id = 'kwasu';
    
    -- Insert sample hostels if agent and locations exist
    IF agent_uuid IS NOT NULL AND westend_uuid IS NOT NULL THEN
        INSERT INTO hostels (agent_id, location_id, title, description, price, price_type, room_type, images, amenities, availability, address) VALUES
        (agent_uuid, westend_uuid, 'Comfort Lodge - Westend', 'Modern hostel with excellent facilities in the heart of Westend area. Close to campus with easy access to transportation.', 150000, 'semester', 'single', 
         '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"]'::jsonb,
         '["WiFi", "Generator", "24/7 Water", "Security", "Parking", "Kitchen"]'::jsonb, true, 'No. 15 Westend Road, Malete, Kwara State'),
        
        (agent_uuid, westend_uuid, 'Royal Suites', 'Luxury accommodation with modern amenities. Perfect for students who want comfort and style.', 200000, 'semester', 'self-contain',
         '["https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"]'::jsonb,
         '["WiFi", "Air Conditioning", "Generator", "24/7 Water", "Security", "Laundry", "Parking"]'::jsonb, true, 'No. 8 Royal Avenue, Westend, Malete');
    END IF;
    
    IF agent_uuid IS NOT NULL AND safari_uuid IS NOT NULL THEN
        INSERT INTO hostels (agent_id, location_id, title, description, price, price_type, room_type, images, amenities, availability, address) VALUES
        (agent_uuid, safari_uuid, 'Safari Student Haven', 'Affordable and comfortable accommodation in Safari area. Great for budget-conscious students.', 120000, 'semester', 'shared',
         '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"]'::jsonb,
         '["WiFi", "Generator", "Water", "Security", "Common Kitchen", "Study Room"]'::jsonb, true, 'No. 22 Safari Road, Malete, Kwara State'),
        
        (agent_uuid, safari_uuid, 'Green Valley Lodge', 'Peaceful environment perfect for studying. Located in quiet part of Safari with good security.', 140000, 'semester', 'single',
         '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"]'::jsonb,
         '["WiFi", "Generator", "24/7 Water", "Security", "Garden", "Parking"]'::jsonb, true, 'No. 5 Green Valley Street, Safari, Malete');
    END IF;
END $$;

-- Create sample booking for testing
DO $$
DECLARE
    student_uuid VARCHAR;
    hostel_uuid VARCHAR;
BEGIN
    -- Get student and hostel IDs
    SELECT id INTO student_uuid FROM users WHERE email = 'student@k-hostel.com';
    SELECT id INTO hostel_uuid FROM hostels WHERE title = 'Comfort Lodge - Westend' LIMIT 1;
    
    -- Insert sample booking if both exist
    IF student_uuid IS NOT NULL AND hostel_uuid IS NOT NULL THEN
        INSERT INTO bookings (student_id, hostel_id, preferred_date, preferred_time, message, status) VALUES
        (student_uuid, hostel_uuid, NOW() + INTERVAL '3 days', '2:00 PM', 'I would like to inspect this hostel this weekend. Please let me know if the time works for you.', 'pending');
    END IF;
END $$;

-- Create Row Level Security (RLS) policies for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Anyone can create user accounts" ON users FOR INSERT WITH CHECK (true);

-- RLS Policies for hostels table
CREATE POLICY "Anyone can view available hostels" ON hostels FOR SELECT USING (availability = true);
CREATE POLICY "Agents can manage their own hostels" ON hostels FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.id = hostels.agent_id 
        AND users.role = 'agent'
        AND users.verified_status = true
    )
);
CREATE POLICY "Verified agents can create hostels" ON hostels FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'agent'
        AND users.verified_status = true
    )
);

-- RLS Policies for bookings table
CREATE POLICY "Students can view their own bookings" ON bookings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.id = bookings.student_id
    )
);
CREATE POLICY "Agents can view bookings for their hostels" ON bookings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN hostels h ON u.id = h.agent_id
        WHERE u.id = auth.uid()::text 
        AND h.id = bookings.hostel_id
        AND u.role = 'agent'
    )
);
CREATE POLICY "Students can create bookings" ON bookings FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'student'
    )
);
CREATE POLICY "Students and agents can update relevant bookings" ON bookings FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND (
            (users.role = 'student' AND users.id = bookings.student_id) OR
            (users.role = 'agent' AND EXISTS (
                SELECT 1 FROM hostels WHERE hostels.id = bookings.hostel_id AND hostels.agent_id = users.id
            ))
        )
    )
);

-- Public read access for schools and locations (no auth required)
CREATE POLICY "Anyone can view schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Anyone can view locations" ON locations FOR SELECT USING (true);

-- Create helpful views for common queries
CREATE VIEW hostel_details AS
SELECT 
    h.*,
    l.name as location_name,
    l.latitude as location_latitude,
    l.longitude as location_longitude,
    s.name as school_name,
    s.city as school_city,
    s.state as school_state,
    u.first_name as agent_first_name,
    u.last_name as agent_last_name,
    u.phone as agent_phone,
    u.verified_status as agent_verified
FROM hostels h
LEFT JOIN locations l ON h.location_id = l.id
LEFT JOIN schools s ON l.school_id = s.id
LEFT JOIN users u ON h.agent_id = u.id;

CREATE VIEW booking_details AS
SELECT 
    b.*,
    h.title as hostel_title,
    h.price as hostel_price,
    h.price_type as hostel_price_type,
    h.images as hostel_images,
    l.name as location_name,
    s.name as school_name,
    student.first_name as student_first_name,
    student.last_name as student_last_name,
    student.email as student_email,
    student.phone as student_phone,
    agent.first_name as agent_first_name,
    agent.last_name as agent_last_name,
    agent.phone as agent_phone
FROM bookings b
LEFT JOIN hostels h ON b.hostel_id = h.id
LEFT JOIN locations l ON h.location_id = l.id
LEFT JOIN schools s ON l.school_id = s.id
LEFT JOIN users student ON b.student_id = student.id
LEFT JOIN users agent ON h.agent_id = agent.id;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 k-H Database Schema Setup Complete!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Created Tables:';
    RAISE NOTICE '   - users (authentication & profiles)';
    RAISE NOTICE '   - schools (Nigerian universities)';
    RAISE NOTICE '   - locations (hostel areas)';
    RAISE NOTICE '   - hostels (property listings)';
    RAISE NOTICE '   - bookings (inspection scheduling)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Added Sample Data:';
    RAISE NOTICE '   - 12 Nigerian universities';
    RAISE NOTICE '   - 30+ hostel areas/locations';
    RAISE NOTICE '   - 4 sample hostels';
    RAISE NOTICE '   - 3 test user accounts';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Test Accounts Created:';
    RAISE NOTICE '   Admin: admin@k-hostel.com / admin123';
    RAISE NOTICE '   Agent: agent@k-hostel.com / admin123';
    RAISE NOTICE '   Student: student@k-hostel.com / admin123';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your k-H platform is ready to use!';
    RAISE NOTICE '   Visit your Next.js app and start testing.';
END $$;