# 🌊 Đại Dương Từ Vựng

Game ôn từ vựng tiếng Anh: đọc nghĩa tiếng Việt, **bấm vào con cá đang bơi mang đúng từ tiếng Anh** rồi qua từ tiếp theo.

- 3 cấp độ: Cơ bản (cá chậm, từ có hình emoji), Trung bình, Nâng cao (cá nhanh, từ khó).
- Mỗi ván 10 từ, 3 mạng ❤️; chọn sai mất mạng; đúng liên tiếp được điểm thưởng.
- Sau 12 giây chưa chọn, cá đúng sẽ phát sáng gợi ý.
- Đọc to từ đúng bằng giọng trình duyệt (tắt được); lưu điểm cao nhất từng cấp; cuối ván liệt kê từ cần ôn.

- **2 trang riêng**: `index.html` cho con chơi (không có lối vào cài đặt) và `admin.html` cho bố mẹ (mã PIN): dán danh sách `english - nghĩa` (mỗi dòng một từ; chấp nhận `-`, `=`, `:`, `|`) cho từng cấp; chọn trộn với từ mặc định hoặc chỉ dùng từ riêng (tối thiểu 4 từ). Lưu trên trình duyệt.

Chạy: mở `index.html` (trang con) hoặc `admin.html` (trang bố mẹ) hoặc `npx serve .`. Thêm từ: sửa mảng `WORDS` trong `data.js`.
