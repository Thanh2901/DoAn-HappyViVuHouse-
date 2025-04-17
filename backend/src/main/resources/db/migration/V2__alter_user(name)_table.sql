CREATE COLLATION vietnamese (provider = 'icu', locale = 'vi-VN');
ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(255) COLLATE vietnamese;