-- Mavjud foydalanuvchilar uchun profile yaratish
INSERT INTO profiles (id, email, full_name)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Mavjud foydalanuvchilar uchun default kategoriyalar yaratish
INSERT INTO categories (user_id, name, color, icon)
SELECT 
  u.id,
  category_data.name,
  category_data.color,
  category_data.icon
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('Ish', '#EF4444', '💼'),
    ('O''qish', '#10B981', '📚'),
    ('Sport', '#F59E0B', '🏃'),
    ('Dam olish', '#8B5CF6', '🎮'),
    ('Boshqa', '#6B7280', '📝')
) AS category_data(name, color, icon)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c 
  WHERE c.user_id = u.id AND c.name = category_data.name
);
