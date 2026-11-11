# 📝 Đề Của Bố Mẹ

Ứng dụng mã nguồn mở giúp phụ huynh **tự ra đề bài cho con theo ý mình**.

## Tính năng (MVP)
- **Soạn đề**: tự viết câu hỏi (điền đáp án, trắc nghiệm, tự luận) hoặc **tạo nhanh** bài toán cộng/trừ/nhân/chia theo khoảng số tuỳ chọn.
- **Từ vựng tiếng Anh**: dán danh sách `english - nghĩa`, app tự tạo câu Anh→Việt, Việt→Anh, trắc nghiệm chọn nghĩa, điền chữ cái còn thiếu, sắp xếp chữ cái thành từ, hoặc nghe phát âm rồi viết lại từ (dùng giọng đọc có sẵn của trình duyệt). Nhiều nghĩa ngăn bằng `/`, nhập nghĩa nào cũng được chấm đúng.
- **Con làm bài**: làm trực tiếp trên màn hình, tự chấm điểm câu điền đáp án và trắc nghiệm.
- **Lịch sử điểm**: mỗi lần con nộp bài, điểm được tự lưu. Xem theo từng bé: số lần làm, điểm trung bình, biểu đồ 10 lần gần nhất, danh sách câu sai để ôn lại; xuất ra `.csv` mở được bằng Excel.
- **In đề**: xuất bản in / PDF, có bản kèm đáp án cho bố mẹ.
- **Kho đề**: lưu nhiều đề, nhân bản, xuất/nhập file `.json` để chia sẻ giữa các phụ huynh.
- Chạy **offline**, dữ liệu lưu trên trình duyệt (localStorage), không thu thập gì.

## Chạy thử
Không cần cài đặt. Mở `index.html` bằng trình duyệt, hoặc:

```bash
npx serve .
```

## Cấu trúc
```
index.html      giao diện
css/style.css   kiểu dáng + kiểu in
js/app.js       toàn bộ logic (vanilla JS, không phụ thuộc thư viện)
```

## Hướng phát triển
- Thêm bộ sinh đề: so sánh số, phân số, đổi đơn vị, điền từ tiếng Việt/tiếng Anh, chính tả.
- Chèn hình ảnh vào câu hỏi; trộn thứ tự câu/đáp án.
- Theo dõi tiến bộ của con theo thời gian, lịch sử điểm.
- PWA để cài lên điện thoại; đồng bộ qua file hoặc Git.

## Đóng góp
Mọi PR/ý tưởng đều được chào đón. Giữ code đơn giản, không thêm phụ thuộc nặng nếu không cần.

## Giấy phép
MIT — xem [LICENSE](LICENSE).
