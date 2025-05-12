-- Thêm cột is_active vào bảng camera
ALTER TABLE camera ADD COLUMN IF NOT EXISTS is_active BOOLEAN;

-- Cập nhật giá trị is_active = TRUE cho tất cả bản ghi hiện tại
UPDATE camera SET is_active = TRUE WHERE is_active IS NULL;

-- Thêm ràng buộc NOT NULL và giá trị mặc định TRUE
ALTER TABLE camera ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE camera ALTER COLUMN is_active SET DEFAULT TRUE;