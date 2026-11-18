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

## Trang lấy mã nhanh cho người bán (`tools/ban-hang`)
Một trang riêng trên điện thoại/máy tính: bấm một nút là nhận **mã chưa phát tiếp theo (từ trên xuống dưới trong Sheet)**, kèm tin nhắn mẫu để chép gửi khách.

Cài một lần:
1. Dán lại toàn bộ `google-apps-script.gs` mới vào Apps Script, bấm 💾, rồi **Triển khai → Quản lý triển khai → ✏️ → Phiên bản mới → Triển khai** (giữ nguyên URL).
2. Tải lại trang Sheet, vào menu **Đại Dương → Đặt mật khẩu người bán**, đặt mật khẩu (từ 8 ký tự, khác mật khẩu Google). Mật khẩu này lưu trong Script Properties, **không nằm trong mã nguồn hay trên GitHub**.
3. Mở trang `https://nhanvision.github.io/app-da-nang/tools/ban-hang/` (sau khi đã đưa lên GitHub), nhập mật khẩu một lần, thêm vào Màn hình chính cho tiện.

Dùng hằng ngày:
- Ghi tên/Zalo khách (không bắt buộc) → bấm **Lấy mã 1 máy** hoặc **Lấy mã 2 máy** → **Chép tin nhắn gửi khách** rồi dán vào Zalo.
- Mã vừa lấy được ghi vào cột G của Sheet (tính là đã bán, trừ vào số suất ưu đãi). Lấy nhầm thì bấm **Huỷ lấy** ở danh sách để trả mã về kho.
- Mục "Mã đã phát gần đây" cho thấy mã nào khách đã kích hoạt, hạn dùng, đang dùng mấy máy. Khách đổi máy: bấm **Đặt lại máy**.
- Sắp hết mã: mở "Tạo thêm mã mới trong Sheet".

## Cùng một iPhone: Safari và app Màn hình chính
Trên iPhone/iPad, tab Safari và app thêm vào Màn hình chính lưu dữ liệu **tách biệt**, nên với server đó là hai "máy". Để khách không bị báo "mã đang dùng trên một máy khác" khi chỉ cài app lên Màn hình chính, app gửi thêm một **dấu vân tay** (loại máy, phiên bản iOS, kích thước màn hình, ngôn ngữ, múi giờ). Khi mã đã đủ máy mà có một máy cũ **cùng dấu vân tay**, máy mới được thay chỗ (tối đa 3 lần/mã, đếm ở cột H "Số lần chuyển máy"). Điện thoại khác hẳn (khác đời máy hoặc khác iOS) vẫn bị chặn.
- Cột E giờ ghi mỗi máy dạng `ID~dấu-vân-tay`. Mã đã kích hoạt trước đó chưa có dấu vân tay, máy đó nhập lại mã một lần là được bổ sung.
- Hai điện thoại **giống hệt đời máy và phiên bản iOS** vẫn có thể thay chỗ nhau (tối đa 3 lần), đây là đánh đổi để khách dễ dùng.

## Sao lưu tự động hằng tuần
Google Sheet này giữ toàn bộ mã và danh sách khách, nên nên có bản sao lưu.
1. Dán lại toàn bộ `google-apps-script.gs` mới, bấm 💾, rồi **Triển khai → Quản lý triển khai → ✏️ → Phiên bản mới → Triển khai**.
2. Tải lại trang Sheet, vào menu **Đại Dương → Bật sao lưu tự động hằng tuần**. Google hỏi quyền truy cập **Google Drive** lần đầu: chọn tài khoản → Nâng cao → "Đi tới… (không an toàn)" → Cho phép (đây là script của chính anh).
3. Xong: mỗi **sáng thứ Hai (khoảng 3 giờ)** script chép cả Sheet vào thư mục **"Đại Dương - Sao lưu mã kích hoạt"** trong Google Drive của anh, giữ **8 bản gần nhất** (cũ hơn tự vào thùng rác). Lần bật đầu tiên đã sao lưu một bản ngay để kiểm tra.
- Sao lưu ngay lúc cần (ví dụ trước khi sửa lớn): menu **Đại Dương → Sao lưu ngay bây giờ**. Tắt: **Tắt sao lưu hằng tuần**.
- Khôi phục: mở bản sao trong thư mục sao lưu, hoặc **Tệp → Tạo bản sao** từ bản đó. Nếu phải dùng Sheet khác thì cần triển khai script lại và đổi `ACTIVATE_URL` trong `game/config.js`.
- Cách khác cho chắc: thỉnh thoảng tải Sheet về máy (Tệp → Tải xuống → .xlsx) và cất cùng file khoá bí mật.

