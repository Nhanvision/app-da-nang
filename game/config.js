// Thông tin bán hàng hiển thị trong trang bố mẹ. Anh sửa các dòng dưới cho đúng thông tin của mình.
const SHOP = {
  price: '49.000đ (dùng 1 năm)',          // ví dụ: '199.000đ (dùng 1 năm)'
  zalo: '0788 682 413',           // ví dụ: '0900 000 000'
  bank: 'MB Bank · 7276867687 · DANG NGOC NHAN',           // ví dụ: 'Vietcombank · 0123456789 · NGUYEN VAN A'
  note: 'Chuyển khoản rồi nhắn Zalo kèm ảnh chuyển khoản để nhận mã kích hoạt.',
  // Dùng cho mã QR chuyển khoản trên trang giới thiệu (gioi-thieu.html)
  bankCode: 'MB',                 // mã ngân hàng theo VietQR: MB, VCB, TCB, ACB, BIDV, TPB...
  account: '7276867687',
  accountName: 'DANG NGOC NHAN',
  amount: 49000
};
// Địa chỉ máy chủ kích hoạt (Google Apps Script). Xem tools/kich-hoat/HUONG-DAN.md để tạo và dán URL vào đây.
const ACTIVATE_URL = 'https://script.google.com/macros/s/AKfycbx2uCtu068uoQEJ4dKxrPhbC9n6i8XtPi_eZGnAc0A8Xi7SXmHWMJNJPPX-ebc0ajOnyg/exec';
