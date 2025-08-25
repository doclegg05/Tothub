
DO $$ 
BEGIN
  -- Add missing health information columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'children' AND column_name = 'medical_conditions') THEN
    ALTER TABLE children ADD COLUMN medical_conditions text[] DEFAULT '{}'::text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'children' AND column_name = 'blood_type') THEN
    ALTER TABLE children ADD COLUMN blood_type text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'children' AND column_name = 'primary_physician') THEN
    ALTER TABLE children ADD COLUMN primary_physician text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'children' AND column_name = 'current_medications') THEN
    ALTER TABLE children ADD COLUMN current_medications text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'children' AND column_name = 'dietary_restrictions') THEN
    ALTER TABLE children ADD COLUMN dietary_restrictions text[] DEFAULT '{}'::text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'children' AND column_name = 'food_allergies') THEN
    ALTER TABLE children ADD COLUMN food_allergies text[] DEFAULT '{}'::text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'children' AND column_name = 'special_care_instructions') THEN
    ALTER TABLE children ADD COLUMN special_care_instructions text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'children' AND column_name = 'physical_limitations') THEN
    ALTER TABLE children ADD COLUMN physical_limitations text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'children' AND column_name = 'emergency_medical_authorization') THEN
    ALTER TABLE children ADD COLUMN emergency_medical_authorization boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'children' AND column_name = 'epi_pen_required') THEN
    ALTER TABLE children ADD COLUMN epi_pen_required boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'children' AND column_name = 'inhaler_required') THEN
    ALTER TABLE children ADD COLUMN inhaler_required boolean DEFAULT false;
  END IF;
END $$;
