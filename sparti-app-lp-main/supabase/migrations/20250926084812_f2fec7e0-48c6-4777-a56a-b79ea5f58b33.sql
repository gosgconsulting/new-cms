-- Move the "Top 7 frozen yogurt spots in Singapore" article back to draft status
UPDATE blog_posts 
SET status = 'draft', 
    published_at = NULL, 
    updated_at = NOW()
WHERE id = 'd4ffb207-66ef-45c1-a02a-af16657a343e' 
AND title = 'Top 7 frozen yogurt spots in Singapore';