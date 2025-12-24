-- Update plan names to Starter/Pro/Agency
UPDATE plans SET name = 'Starter' WHERE id = 'starter';
UPDATE plans SET name = 'Starter' WHERE id = 'starter-yearly';
UPDATE plans SET name = 'Pro' WHERE id = 'professional';
UPDATE plans SET name = 'Pro' WHERE id = 'professional-yearly';
UPDATE plans SET name = 'Agency' WHERE id = 'enterprise';
UPDATE plans SET name = 'Agency' WHERE id = 'enterprise-yearly';
