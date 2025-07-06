-- Add unique constraint to user_roles table
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Create profiles and roles for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
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
        
        -- Create role if it doesn't exist  
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_record.id, 'student')
        ON CONFLICT (user_id) DO NOTHING;
        
    END LOOP;
END $$;

-- Update trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();