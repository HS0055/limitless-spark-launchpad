-- Update the setup_demo_user function to work with current table structure
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
    
    -- Update role
    UPDATE user_roles SET role = user_role WHERE user_id = target_user_id;
    
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