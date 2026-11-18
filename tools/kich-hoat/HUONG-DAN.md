# Cài máy chủ kích hoạt (làm một lần, ~10 phút, miễn phí)

1. Vào https://sheets.google.com tạo **Google Sheet mới**, đặt tên "Đại Dương – Mã kích hoạt".
2. Menu **Tiện ích mở rộng → Apps Script**. Xoá hết mã mẫu, dán toàn bộ file `google-apps-script.gs` vào, bấm 💾.
3. Chọn hàm **setup** ở thanh trên rồi bấm **Chạy**. Lần đầu Google hỏi quyền: chọn tài khoản của anh → Nâng cao → "Đi tới… (không an toàn)" → Cho phép. (Đây là script của chính anh, chỉ đọc/ghi Sheet này.)
4. Bấm **Triển khai → Tuỳ chọn triển khai mới → Ứng dụng web**: *Thực thi với tư cách*: **Tôi**; *Ai có quyền truy cập*: **Bất kỳ ai** → Triển khai. Chép **URL ứng dụng web** (dạng `https://script.google.com/macros/s/.../exec`).
5. Dán URL đó vào `game/config.js` ở dòng `const ACTIVATE_URL = '...'`, rồi báo em để em kiểm tra và đưa lên mạng.
6. Quay lại Sheet, tải lại trang: có menu **Đại Dương → Tạo 20 mã mới**. Bấm là có mã ở cột A.

## Khi bán hàng
- Khách chuyển khoản → anh chép **một mã** ở cột A, gửi Zalo, ghi tên/Zalo khách vào cột G.
- Khách mở game, bấm 🔑, gõ mã. Hạn 1 năm tính từ lần kích hoạt đầu. Mỗi mã dùng cho **1 máy**. Nhà có 2 điện thoại: dùng menu **Đại Dương → Tạo 20 mã mới (2 máy…)**, hoặc sửa cột B của một mã đã có thành 2 (không cần cài lại script).
- **Khách đổi điện thoại / xoá app cài lại:** mã đang gắn với máy cũ nên máy mới sẽ báo "đã dùng đủ máy". Anh bấm vào một ô ở dòng của mã đó, chọn menu **Đại Dương → Đặt lại máy của mã đang chọn**, rồi bảo khách nhập lại mã. Hạn dùng không đổi.
- Muốn thu hồi một mã: sửa cột B thành 0.
- Khi sửa mã script sau này: Triển khai → **Quản lý triển khai** → sửa → Phiên bản mới (đừng tạo triển khai mới, URL sẽ đổi).

## Đếm "Còn X/20 suất ưu đãi" trên trang giới thiệu
- Số suất đã bán = số dòng trong Sheet có **ghi chú khách ở cột G** hoặc **đã kích hoạt** (cột D có hạn). Vì vậy khi gửi mã cho khách, anh nhớ ghi tên/Zalo khách vào cột G.
- Tổng số suất (20) và giá gốc đặt ở `game/config.js` (`promoTotal`, `priceOriginal`, `priceOriginalAmount`).
- Hết suất, trang giới thiệu **tự** về giá gốc 168.000đ và mã QR tự đổi số tiền.
- Để có tính năng này, sau khi cập nhật file `google-apps-script.gs` anh nhớ **Triển khai → Quản lý triển khai → ✏️ → Phiên bản mới → Triển khai**. Chưa cập nhật thì trang vẫn chạy, chỉ không hiện số suất.
