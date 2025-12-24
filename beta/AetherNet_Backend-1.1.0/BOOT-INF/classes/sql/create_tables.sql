-- AetherNet 校园互助平台数据库建表语句

-- 删除已存在的表（按依赖顺序）
DROP TABLE IF EXISTS tb_post_tags;
DROP TABLE IF EXISTS tb_post_images;
DROP TABLE IF EXISTS tb_favorites;
DROP TABLE IF EXISTS tb_reports;
DROP TABLE IF EXISTS tb_likes;
DROP TABLE IF EXISTS tb_comments;
DROP TABLE IF EXISTS tb_tasks;
DROP TABLE IF EXISTS tb_moderation_logs;
DROP TABLE IF EXISTS tb_posts;
DROP TABLE IF EXISTS tb_tags;
DROP TABLE IF EXISTS tb_categories;
DROP TABLE IF EXISTS tb_users;

-- 1. 用户表
CREATE TABLE tb_users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户唯一标识符',
    username VARCHAR(50) NOT NULL COMMENT '用户名，用于登录和显示',
    password VARCHAR(255) NOT NULL COMMENT '密码哈希值，采用安全加密算法存储',
    email VARCHAR(100) COMMENT '邮箱地址，用于账户验证和联系',
    student_id VARCHAR(20) NOT NULL COMMENT '学号，用于验证学生身份',
    role VARCHAR(20) NOT NULL DEFAULT 'student' COMMENT '用户角色，区分普通学生和管理员',
    avatar_url VARCHAR(255) COMMENT '用户头像图片链接',
    phone VARCHAR(20) COMMENT '手机号码，用于联系和验证',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '用户状态，1表示正常，0表示禁用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '用户注册时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '用户信息最后更新时间',
    
    UNIQUE KEY uk_student_id (student_id),
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email)
) COMMENT = '用户表';

-- 2. 分类表
CREATE TABLE tb_categories (
    category_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类唯一标识符',
    category_name VARCHAR(50) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(20) NOT NULL COMMENT '分类代码',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序序号',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    UNIQUE KEY uk_category_code (category_code)
) COMMENT = '分类表';

-- 3. 标签表
CREATE TABLE tb_tags (
    tag_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '标签唯一标识符',
    tag_name VARCHAR(30) NOT NULL COMMENT '标签名称，如"二手书籍"、"代取快递"等',
    post_count INT NOT NULL DEFAULT 0 COMMENT '使用该标签的帖子数量统计',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '标签创建时间',
    
    UNIQUE KEY uk_tag_name (tag_name)
) COMMENT = '标签表';

-- 4. 帖子表
CREATE TABLE tb_posts (
    post_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '帖子唯一标识符',
    title VARCHAR(100) NOT NULL COMMENT '帖子标题，简要概括内容',
    content TEXT NOT NULL COMMENT '帖子正文内容',
    user_id BIGINT NOT NULL COMMENT '发布者用户ID，关联用户表',
    category_id BIGINT NOT NULL COMMENT '帖子分类ID，关联分类表',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '帖子状态：''pending''(待审核)、''approved''(已通过)、''rejected''(已拒绝)、''deleted''(已删除)',
    view_count INT NOT NULL DEFAULT 0 COMMENT '帖子浏览次数统计',
    like_count INT NOT NULL DEFAULT 0 COMMENT '帖子点赞数统计',
    comment_count INT NOT NULL DEFAULT 0 COMMENT '帖子评论数统计',
    is_anonymous TINYINT NOT NULL DEFAULT 0 COMMENT '是否匿名发布，0表示否，1表示是',
    is_top TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶，0表示否，1表示是',
    is_featured TINYINT NOT NULL DEFAULT 0 COMMENT '是否精华帖，0表示否，1表示是',
    location VARCHAR(100) COMMENT '地理位置信息',
    contact_info VARCHAR(100) COMMENT '联系方式',
    ip_address VARCHAR(45) COMMENT '发布者IP地址',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '帖子发布时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '帖子最后更新时间',
    updated_by BIGINT COMMENT '最后更新者ID，关联用户表',
    
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_is_top (is_top),
    INDEX idx_like_count (like_count),
    INDEX idx_view_count (view_count)
) COMMENT = '帖子表';

-- 5. 任务表
CREATE TABLE tb_tasks (
    task_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '任务唯一标识符',
    title VARCHAR(100) NOT NULL COMMENT '任务标题，简要说明任务内容',
    description TEXT NOT NULL COMMENT '任务详细描述',
    publisher_id BIGINT NOT NULL COMMENT '任务发布者ID，关联用户表',
    assignee_id BIGINT COMMENT '任务接单者ID，关联用户表',
    reward DECIMAL(10,2) COMMENT '任务酬劳金额，单位为元',
    status VARCHAR(20) NOT NULL DEFAULT 'open' COMMENT '任务状态：''open''(开放中)、''in_progress''(进行中)、''completed''(已完成)、''cancelled''(已取消)',
    deadline DATETIME COMMENT '任务截止时间',
    location VARCHAR(100) COMMENT '任务地点',
    latitude DECIMAL(10,6) COMMENT '纬度',
    longitude DECIMAL(10,6) COMMENT '经度',
    contact_info VARCHAR(100) COMMENT '联系方式',
    completed_at DATETIME COMMENT '任务实际完成时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '任务创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '任务最后更新时间',
    
    INDEX idx_publisher_id (publisher_id),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT = '任务表';

-- 6. 评论表
CREATE TABLE tb_comments (
    comment_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论唯一标识符',
    post_id BIGINT NOT NULL COMMENT '所属帖子ID，关联帖子表',
    user_id BIGINT NOT NULL COMMENT '评论者用户ID，关联用户表',
    parent_id BIGINT COMMENT '父级评论ID，用于构建评论回复树结构',
    content TEXT NOT NULL COMMENT '评论内容',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '评论状态，1表示正常，0表示已删除',
    like_count INT NOT NULL DEFAULT 0 COMMENT '评论点赞数统计',
    reply_count INT NOT NULL DEFAULT 0 COMMENT '直接回复该评论的数量统计',
    ip_address VARCHAR(45) COMMENT '评论者IP地址',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论发布时间',
    
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_created_at (created_at)
) COMMENT = '评论表';

-- 7. 点赞表
CREATE TABLE tb_likes (
    like_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞记录唯一标识符',
    user_id BIGINT NOT NULL COMMENT '点赞用户ID，关联用户表',
    post_id BIGINT COMMENT '被点赞帖子ID，关联帖子表',
    comment_id BIGINT COMMENT '被点赞评论ID，关联评论表',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    
    UNIQUE KEY uk_user_post (user_id, post_id),
    UNIQUE KEY uk_user_comment (user_id, comment_id),
    INDEX idx_post_id (post_id),
    INDEX idx_comment_id (comment_id)
) COMMENT = '点赞表';

-- 8. 帖子标签关联表
CREATE TABLE tb_post_tags (
    post_id BIGINT NOT NULL COMMENT '帖子ID，关联帖子表',
    tag_id BIGINT NOT NULL COMMENT '标签ID，关联标签表',
    
    PRIMARY KEY (post_id, tag_id),
    INDEX idx_tag_id (tag_id)
) COMMENT = '帖子标签关联表';

-- 9. 帖子图片表
CREATE TABLE tb_post_images (
    image_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '图片唯一标识符',
    post_id BIGINT NOT NULL COMMENT '所属帖子ID，关联帖子表',
    image_url VARCHAR(255) NOT NULL COMMENT '图片链接地址',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '图片排序序号',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '图片上传时间',
    
    INDEX idx_post_id (post_id)
) COMMENT = '帖子图片表';

-- 10. 收藏表
CREATE TABLE tb_favorites (
    favorite_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏记录唯一标识符',
    user_id BIGINT NOT NULL COMMENT '收藏用户ID，关联用户表',
    post_id BIGINT NOT NULL COMMENT '被收藏帖子ID，关联帖子表',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    
    UNIQUE KEY uk_user_post (user_id, post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_post_id (post_id)
) COMMENT = '收藏表';

-- 11. 举报表
CREATE TABLE tb_reports (
    report_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '举报记录唯一标识符',
    reporter_id BIGINT NOT NULL COMMENT '举报用户ID，关联用户表',
    post_id BIGINT COMMENT '被举报帖子ID，关联帖子表',
    comment_id BIGINT COMMENT '被举报评论ID，关联评论表',
    reason VARCHAR(255) NOT NULL COMMENT '举报原因',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '举报状态：''pending''(待处理)、''processed''(已处理)、''dismissed''(已驳回)',
    handled_by BIGINT COMMENT '处理人ID，关联用户表（管理员）',
    handled_at DATETIME COMMENT '处理时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '举报时间',
    
    INDEX idx_reporter_id (reporter_id),
    INDEX idx_post_id (post_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_status (status)
) COMMENT = '举报表';

-- 12. 审核日志表
CREATE TABLE tb_moderation_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '审核日志唯一标识符',
    post_id BIGINT NOT NULL COMMENT '被审核的帖子ID，关联帖子表',
    moderator_id BIGINT COMMENT '审核员ID，关联用户表（若为系统自动审核则为空）',
    decision VARCHAR(20) NOT NULL COMMENT '审核决定：''approved''(通过) 或 ''rejected''(拒绝)',
    risk_level VARCHAR(10) NOT NULL DEFAULT 'low' COMMENT '风险等级评估：''low''(低风险)、''medium''(中风险)、''high''(高风险)',
    reason TEXT COMMENT '审核理由或备注信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '审核执行时间',
    
    INDEX idx_post_id (post_id),
    INDEX idx_moderator_id (moderator_id),
    INDEX idx_created_at (created_at)
) COMMENT = '审核日志表';

-- 添加外键约束
ALTER TABLE tb_posts ADD CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES tb_users(user_id);
ALTER TABLE tb_posts ADD CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES tb_categories(category_id);
ALTER TABLE tb_posts ADD CONSTRAINT fk_posts_updated_by FOREIGN KEY (updated_by) REFERENCES tb_users(user_id);

ALTER TABLE tb_tasks ADD CONSTRAINT fk_tasks_publisher FOREIGN KEY (publisher_id) REFERENCES tb_users(user_id);
ALTER TABLE tb_tasks ADD CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES tb_users(user_id);

ALTER TABLE tb_comments ADD CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES tb_posts(post_id);
ALTER TABLE tb_comments ADD CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES tb_users(user_id);
ALTER TABLE tb_comments ADD CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES tb_comments(comment_id);

ALTER TABLE tb_likes ADD CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES tb_users(user_id);
ALTER TABLE tb_likes ADD CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES tb_posts(post_id);
ALTER TABLE tb_likes ADD CONSTRAINT fk_likes_comment FOREIGN KEY (comment_id) REFERENCES tb_comments(comment_id);

ALTER TABLE tb_post_tags ADD CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id) REFERENCES tb_posts(post_id);
ALTER TABLE tb_post_tags ADD CONSTRAINT fk_post_tags_tag FOREIGN KEY (tag_id) REFERENCES tb_tags(tag_id);

ALTER TABLE tb_post_images ADD CONSTRAINT fk_post_images_post FOREIGN KEY (post_id) REFERENCES tb_posts(post_id);

ALTER TABLE tb_favorites ADD CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES tb_users(user_id);
ALTER TABLE tb_favorites ADD CONSTRAINT fk_favorites_post FOREIGN KEY (post_id) REFERENCES tb_posts(post_id);

ALTER TABLE tb_reports ADD CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES tb_users(user_id);
ALTER TABLE tb_reports ADD CONSTRAINT fk_reports_post FOREIGN KEY (post_id) REFERENCES tb_posts(post_id);
ALTER TABLE tb_reports ADD CONSTRAINT fk_reports_comment FOREIGN KEY (comment_id) REFERENCES tb_comments(comment_id);
ALTER TABLE tb_reports ADD CONSTRAINT fk_reports_handler FOREIGN KEY (handled_by) REFERENCES tb_users(user_id);

ALTER TABLE tb_moderation_logs ADD CONSTRAINT fk_moderation_logs_post FOREIGN KEY (post_id) REFERENCES tb_posts(post_id);
ALTER TABLE tb_moderation_logs ADD CONSTRAINT fk_moderation_logs_moderator FOREIGN KEY (moderator_id) REFERENCES tb_users(user_id);


-- 13. 敏感词表
CREATE TABLE tb_sensitive_words (
                                    word_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '敏感词唯一标识符',
                                    word VARCHAR(100) NOT NULL COMMENT '敏感词内容',
                                    violation_type VARCHAR(50) NOT NULL COMMENT '违规类型，如：政治、色情、辱骂、广告等',
                                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '敏感词创建时间',

                                    UNIQUE KEY uk_word (word),
                                    INDEX idx_violation_type (violation_type),
                                    INDEX idx_created_at (created_at)
) COMMENT = '敏感词表';