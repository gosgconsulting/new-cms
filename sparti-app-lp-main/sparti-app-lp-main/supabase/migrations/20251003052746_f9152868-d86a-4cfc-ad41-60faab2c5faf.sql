-- Delete the old free plan (5 tokens/month) - keeping only free trial, starter, pro, and agency
DELETE FROM public.plans 
WHERE id = 'free';