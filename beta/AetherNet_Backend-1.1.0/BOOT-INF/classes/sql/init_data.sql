-- AetherNet 校园互助平台初始化数据

-- 初始化分类数据
INSERT INTO tb_categories (category_name, category_code, sort_order) VALUES
('二手交易', 'secondhand', 1),
('代拿服务', 'delivery', 2),
('拼车出行', 'carpool', 3),
('学习交流', 'study', 4),
('其他', 'others', 5);

-- 初始化一些常用标签
INSERT INTO tb_tags (tag_name, post_count) VALUES
('二手书籍', 0),
('电子产品', 0),
('代取快递', 0),
('拼车', 0),
('学习资料', 0),
('生活用品', 0),
('运动健身', 0),
('兼职实习', 0);