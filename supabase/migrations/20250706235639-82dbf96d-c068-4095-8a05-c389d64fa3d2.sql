-- Create profiles and roles for any existing users (without email column)
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all existing auth users
    FOR user_record IN 
        SELECT id, email, raw_user_meta_data
        FROM auth.users 
    LOOP
        -- Create profile if it doesn't exist
        INSERT INTO public.profiles (user_id, display_name)
        VALUES (
            user_record.id, 
            COALESCE(user_record.raw_user_meta_data->>'display_name', split_part(user_record.email, '@', 1))
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Create default student role if no role exists
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_record.id, 'student')
        ON CONFLICT (user_id) DO NOTHING;
        
    END LOOP;
END $$;

-- Update the trigger function correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (user_id) DO UPDATE SET
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name);
    
    -- Create default student role
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't block user creation
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();