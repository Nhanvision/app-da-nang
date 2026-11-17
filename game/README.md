# 🌊 Đại Dương Từ Vựng

Game ôn từ vựng tiếng Anh: đọc nghĩa tiếng Việt, **bấm vào con cá đang bơi mang đúng từ tiếng Anh** rồi qua từ tiếp theo.

- 3 cấp độ: Cơ bản (từ có hình emoji), Trung bình, Nâng cao (từ khó, dễ nhầm).
- Mỗi ván 10 từ, 3 mạng ❤️; chọn sai mất mạng. **Điểm theo thời gian**: đúng được 10 điểm + thưởng tốc độ tới 10 điểm (giảm dần về 0 sau 8 giây, có thanh thời gian), cộng thêm thưởng chuỗi đúng liên tiếp.
- Cấp Cơ bản cá bơi chậm cho bé nhỏ; Trung bình và Nâng cao bơi nhanh hơn một chút, khó hơn ở từ vựng.
- **Bảng điểm cao** (top 10 mỗi cấp, bé nhập tên; bố mẹ xoá được ở trang Admin). Hơn 250 từ mặc định.
- Trang giới thiệu bán hàng `gioi-thieu.html` có mã QR chuyển khoản VietQR tự điền số tiền + nội dung (Mã máy); cấu hình ở `config.js`.
- Tab **Học từ vựng**: thẻ nhớ (bấm để lật nghĩa, nghe phát âm) và danh sách từ trước khi chơi. Menu hiện số từ của từng cấp, gồm cả từ bố mẹ thêm.
- **Âm thanh hiệu ứng** tự tạo (đúng, đúng nhanh, sai, thắng, thua), bật/tắt được. **Ôn từ hay sai**: game ghi các từ bé chọn sai (sai +2, đúng liền mạch -1, về 0 là đã nhớ); nút "Ôn từ hay sai" ở menu chơi lại đúng các từ đó, tab Học có thẻ riêng cho chúng.
- Sau 12 giây chưa chọn, cá đúng sẽ phát sáng gợi ý.
- Đọc to từ đúng bằng giọng trình duyệt (tắt được); lưu điểm cao nhất từng cấp; cuối ván liệt kê từ cần ôn.

- **2 trang riêng**: `index.html` cho con chơi (không có lối vào cài đặt) và `admin.html` cho bố mẹ (mã PIN): dán danh sách `english - nghĩa` (mỗi dòng một từ; chấp nhận `-`, `=`, `:`, `|`) cho từng cấp; chọn trộn với từ mặc định hoặc chỉ dùng từ riêng (tối thiểu 4 từ). Có xuất/nhập file `.json` để chuyển danh sách giữa các máy. Lưu trên trình duyệt.

- **PWA**: cài lên màn hình chính điện thoại/máy tính, chơi offline (cần mở bằng https hoặc localhost, ví dụ GitHub Pages).

Chạy: mở `index.html` (trang con) hoặc `admin.html` (trang bố mẹ) hoặc `npx serve .`. Thêm từ: sửa mảng `WORDS` trong `data.js`.

## Bán bản đầy đủ (dùng thử + mã kích hoạt)
- Bản dùng thử: chỉ cấp Cơ bản với 10 từ đầu; cấp Trung bình/Nâng cao và nhập từ riêng bị khoá.
- Khách mở `admin.html`, lấy **Mã máy**, thanh toán, rồi nhận **mã kích hoạt** riêng cho máy đó, có hạn (mặc định 1 năm; công cụ tạo mã có tuỳ chọn ngày hết hạn hoặc không hết hạn). Hết hạn thì quay về bản dùng thử, từ riêng vẫn được giữ; gia hạn bằng mã mới.
- Người bán tạo mã bằng `tools/tao-ma/index.html` (cài được như app trên điện thoại): nạp file khoá bí mật một lần, đặt mật khẩu để lưu khoá (mã hoá AES-GCM) trên thiết bị, lần sau chỉ nhập mật khẩu + dán mã máy.
- Khoá bí mật tạo bằng `node tools/tao-khoa.mjs <file>`; **không commit** file này. Khoá công khai nằm ở `game/license-key.js`.
- Điền thông tin giá/Zalo/ngân hàng trong `game/config.js`.
