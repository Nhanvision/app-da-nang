# Đồng bộ Sổ Chi Tiêu qua Google Sheet

Làm một lần (khoảng 5 phút). Dữ liệu nằm trong Google Sheet của chính bạn.

## 1. Tạo Sheet và dán mã
1. Vào <https://sheets.new> để tạo Google Sheet mới, đặt tên tuỳ ý (ví dụ "Sổ Chi Tiêu").
2. Menu **Tiện ích mở rộng → Apps Script**.
3. Xoá hết code mẫu, dán toàn bộ nội dung file `google-apps-script.gs`.
4. Sửa dòng `const SECRET = 'DOI-MA-NAY';` thành một chuỗi bí mật của bạn (ví dụ `mat-khau-dai-kho-doan-123`). **Nhớ chuỗi này.**
5. Bấm biểu tượng 💾 để lưu.

## 2. Triển khai thành Web App
1. Bấm **Triển khai → Tạo bản triển khai mới**.
2. Bấm bánh răng cạnh "Chọn loại" → chọn **Ứng dụng web**.
3. Điền:
   - **Thực thi dưới dạng:** Tôi (email của bạn)
   - **Người có quyền truy cập:** Bất kỳ ai
4. Bấm **Triển khai**, cho phép quyền khi Google hỏi (nếu hiện "Google chưa xác minh ứng dụng": **Nâng cao → Đi tới … (không an toàn)**; đây là script của chính bạn).
5. Sao chép **URL ứng dụng web** (kết thúc bằng `/exec`).

## 3. Nhập vào app
Mở app → tab **Cài đặt** → mục **Đồng bộ qua Google Sheet**:
- dán URL vào ô *Link Web App*,
- nhập chuỗi bí mật ở bước 1 vào ô *Mã bí mật*,
- bấm **Lưu & đồng bộ**.

Làm lại bước này trên mỗi thiết bị (điện thoại, máy tính) với **cùng link và cùng mã**.

## Lưu ý
- "Bất kỳ ai" nghĩa là ai biết link **và** mã bí mật mới đọc/ghi được dữ liệu. Đừng chia sẻ cả hai.
- Nếu sau này sửa code `.gs`: **Triển khai → Quản lý bản triển khai → ✏️ → Phiên bản mới → Triển khai** (link giữ nguyên).
- App vẫn chạy khi mất mạng, tự đồng bộ lại khi có mạng. Mỗi giao dịch/khoản xung đột thì bản sửa sau cùng thắng.
- Ngân sách và khoản định kỳ đồng bộ theo cả cụm: ai lưu sau cùng thì thắng.
- Không sửa tay sheet `GiaoDich` và `CaiDat` trừ khi bạn hiểu cột `u` (thời điểm sửa).
