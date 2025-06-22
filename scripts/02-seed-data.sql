-- Insert default categories for new users (this would typically be done via a trigger or application logic)
-- For demo purposes, we'll create some sample categories
INSERT INTO categories (user_id, name, color, icon) VALUES
  (auth.uid(), 'Работа', '#EF4444', '💼'),
  (auth.uid(), 'Учеба', '#10B981', '📚'),
  (auth.uid(), 'Спорт', '#F59E0B', '🏃'),
  (auth.uid(), 'Отдых', '#8B5CF6', '🎮'),
  (auth.uid(), 'Обед', '#6B7280', '🍽️')
  (auth.ui()), 'Другое', '#3B82F6', '❓')
