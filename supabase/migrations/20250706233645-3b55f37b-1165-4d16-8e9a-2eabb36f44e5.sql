-- Helper function to create admin user after signup
-- Instructions: 
-- 1. Sign up a new user through the app with any email/password
-- 2. Find the user_id from auth.users table
-- 3. Run: INSERT INTO user_roles (user_id, role) VALUES ('your-user-id-here', 'admin');

-- Or use this function to make any user an admin by email:
CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS void AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Insert or update role to admin
    INSERT INTO user_roles (user_id, role) 
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;