// Thông tin bán hàng hiển thị trong trang bố mẹ. Anh sửa các dòng dưới cho đúng thông tin của mình.
const SHOP = {
  // Giá đang bán + ưu đãi. Khi hết 20 khách đầu: đặt price '168.000đ (dùng 1 năm)', amount 168000, priceOriginal '' và promoNote ''.
  price: '49.000đ (dùng 1 năm)',          // giá đang bán
  priceOriginal: '168.000đ',      // giá gốc, hiện gạch ngang khi đang ưu đãi (để '' nếu không giảm giá)
  promoNote: 'Ưu đãi cho 20 khách đầu tiên',   // dòng ưu đãi (để '' khi hết ưu đãi)
  promoTotal: 20,                 // số suất ưu đãi; trang giới thiệu tự hiện "Còn X/20 suất" (đếm từ Google Sheet) và tự về giá gốc khi hết
  priceOriginalAmount: 168000,    // số tiền giá gốc (dùng cho mã QR khi hết ưu đãi)
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
