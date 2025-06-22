-- Mavjud foydalanuvchilar uchun profile yaratish
INSERT INTO profiles (id, email, full_name)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)

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
    ('Работа', '#EF4444', '💼'),
    ('Учеба', '#10B981', '📚'),
    ('Спорт', '#F59E0B', '🏃'),
    ('Отдых', '#8B5CF6', '🎮'),
    ('Обед', '#6B7280', '🍽️'),
    ('Другое', '#3B82F6', '❓')
) AS category_data(name, color, icon)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c 
  WHERE c.user_id = u.id AND c.name = category_data.name
);
