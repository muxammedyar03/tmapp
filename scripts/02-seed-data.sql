-- Insert default categories for new users (this would typically be done via a trigger or application logic)
-- For demo purposes, we'll create some sample categories
INSERT INTO categories (user_id, name, color, icon) VALUES
  (auth.uid(), 'Ish', '#EF4444', '💼'),
  (auth.uid(), 'O''qish', '#10B981', '📚'),
  (auth.uid(), 'Sport', '#F59E0B', '🏃'),
  (auth.uid(), 'Dam olish', '#8B5CF6', '🎮'),
  (auth.uid(), 'Boshqa', '#6B7280', '📝')
ON CONFLICT DO NOTHING;
