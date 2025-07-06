-- Helper functions to set up demo users
CREATE OR REPLACE FUNCTION setup_demo_user(user_email text, user_role app_role)
RETURNS text AS $$
DECLARE
    target_user_id uuid;
    result_message text;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RETURN 'User with email ' || user_email || ' not found. Please sign up first.';
    END IF;
    
    -- Update or insert role
    INSERT INTO user_roles (user_id, role) 
    VALUES (target_user_id, user_role)
    ON CONFLICT (user_id) 
    DO UPDATE SET role = user_role;
    
    -- Update profile with demo data
    IF user_role = 'admin' THEN
        UPDATE profiles SET 
            display_name = 'Admin User',
            bio = 'System administrator with full access to manage courses, users, and platform settings.'
        WHERE user_id = target_user_id;
        result_message = 'Admin user setup complete for ' || user_email;
    ELSE
        UPDATE profiles SET 
            display_name = 'Demo Student',
            bio = 'Demo student account for testing course enrollment and community features.'
        WHERE user_id = target_user_id;
        result_message = 'Demo student setup complete for ' || user_email;
    END IF;
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create sample course data (only callable by admin)
CREATE OR REPLACE FUNCTION create_sample_course(instructor_user_id uuid)
RETURNS uuid AS $$
DECLARE
    course_id uuid;
BEGIN
    -- Create a sample course
    INSERT INTO courses (
        instructor_id,
        title,
        description,
        category,
        level,
        price,
        is_published
    ) VALUES (
        instructor_user_id,
        'Introduction to Business Fundamentals',
        'Learn the core principles of business including marketing, finance, operations, and strategy. Perfect for beginners looking to understand how businesses work.',
        'Business',
        'beginner',
        99.99,
        true
    ) RETURNING id INTO course_id;
    
    -- Create sample lessons
    INSERT INTO lessons (course_id, title, description, order_index, is_published) VALUES
    (course_id, 'Business Basics', 'Understanding what makes a business successful', 1, true),
    (course_id, 'Marketing Fundamentals', 'How to reach and engage your target audience', 2, true),
    (course_id, 'Financial Planning', 'Managing money and understanding cash flow', 3, true),
    (course_id, 'Operations Management', 'Streamlining processes for efficiency', 4, false);
    
    RETURN course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;