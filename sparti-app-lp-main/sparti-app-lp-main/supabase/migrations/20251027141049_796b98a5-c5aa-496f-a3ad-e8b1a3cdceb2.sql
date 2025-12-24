-- Update oliver@gosgconsulting.com to Enterprise plan with unlimited brands
UPDATE profiles 
SET 
  plan_id = 'enterprise',
  subscription_status = 'active',
  updated_at = now()
WHERE id = 'e7e16a8d-f7a6-4130-8075-f30355ec055c';
