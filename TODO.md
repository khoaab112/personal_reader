# TODO List - Personal Reader

## 1. Khởi tạo & Cấu trúc (Done)
- [x] Thiết lập Tauri, Vue 3, Pinia, TypeScript, Naive UI, PDF.js.
- [x] Thiết lập Database (SQLite) & Models.

## 2. Module Library (Done)
- [x] Xây dựng `LibraryService` (Thêm sách, Lấy danh sách).
- [x] Xây dựng `libraryStore` (Quản lý trạng thái thư viện).
- [x] Cấu hình `Vue Router`.
- [x] Thiết kế giao diện danh sách sách (`LibraryView`, `BookCard`).
- [x] Xử lý luồng thêm sách (chọn file từ máy tính, lưu siêu dữ liệu vào SQLite).

## 3. Module Reader (Done)
- [x] Tích hợp PDF.js để render PDF.
- [x] Phân trang, Zoom, Chế độ đọc.
- [x] Tự động lưu tiến độ vào SQLite.

## 4. Module Annotation & Notes (Done)
- [x] Menu bôi đen (Copy, Translate, Highlight).
- [x] Lưu Highlight / Note vào SQLite và hiển thị đè lên tài liệu.
- [x] Giao diện danh sách Highlight và Note ở Sidebar.
- [x] Tính năng Ghi chú (Note) tuỳ chỉnh.
- [x] Bổ sung bảng chọn màu tuỳ chỉnh (Color Picker) cho text highlight.

## 5. Các tính năng phụ trợ (Done)
- [x] Quét mục lục tự động (Auto Scan TOC) cho PDF không có outline.
- [x] Hiển thị số trang trên Mục lục và tối ưu khoảng cách hiển thị.
- [x] Table of Contents (Mục lục).
- [x] Lịch sử đọc (Reading History). (Tích hợp trong current_page)
- [x] Cài đặt chung (Settings - Dark/Light mode).

## 6. Đóng gói & Kiểm thử (Done)
- [x] Build ứng dụng Tauri thành `.exe`. (Có thể thực hiện thủ công thông qua `npm run tauri build`)
- [x] Thêm Error Boundary.

## 7. Cập nhật Module Library (Done)
- [x] Ghim sách yêu thích (Pin book).
- [x] Tìm kiếm sách theo tên.
- [x] Sửa thông tin sách (Tên, tác giả, mô tả, ảnh bìa...).
- [x] Hiệu ứng loading khi thêm sách.
- [x] Kéo thả thay đổi thứ tự sách trong thư viện (Drag and drop).

## 8. Tinh chỉnh UI & Trải nghiệm (Done)
- [x] Sửa trường nhập Ảnh bìa thành Chọn file ảnh (BookEditModal).
- [x] Tăng khoảng cách nút Lưu và Hủy (BookEditModal).
- [x] Cải thiện hiển thị nút Back (ReaderView).
- [x] Nhóm các nút thu/phóng, đổi thành icon (ReaderView).
- [x] Thêm nút Help [?] xem danh sách phím tắt.
- [x] Phím tắt Ctrl +/- phóng to thu nhỏ, mũi tên cuộn trang.
- [x] Hiệu ứng mượt mà khi thu phóng PDF.

## 10. Fixes (Done)
- [x] Sửa lỗi mở sách mới thêm bị hiển thị nội dung sách cũ (do Mock browser env, đã lưu file vào IndexedDB).
- [x] Sửa lỗi mất cover_image khi back từ Reader về Library (cập nhật MockDB regex).
- [x] Khắc phục tính năng Bold/Italic hiển thị chồng chéo xấu xí bằng cách chuyển sang dạng Gạch dưới (Underline) để không phá vỡ font gốc của PDF.
- [x] Khắc phục màu highlight chỗ đậm chỗ nhạt do overlap.
- [x] Sửa Bold/Italic thành icon SVG, đồng nhất nét gạch dưới đỏ/đứt xanh.
- [x] Sửa textLayer opacity thành 1, chữ trong suốt để selection khi bôi đen sáng rõ nét.
- [x] Cho phép bôi đen (selection) lại những vùng text đã được Highlight.
- [x] Xử lý chồng chéo highlight (hiệu ứng sau đè hiệu ứng trước, xoá hiệu ứng cũ) triệt để (set box-sizing: border-box cho highlight-rect để không trào viền).
- [x] Thêm tính năng Undo/Redo (Hoàn tác/Làm lại) có nút toggle Edit Mode ở góc dưới phải.

## 11. Feature v1: Reading Marker & Sidebar Menu
- [x] 1. Reading Marker
  - [x] Hiển thị icon Reading Marker khi di chuột/chọn text ở mép trái
  - [x] Đặt và thay thế Reading Marker (chỉ 1 marker/sách)
  - [x] Lưu vị trí Reading Marker vào DB
  - [x] Khôi phục vị trí Reading Marker khi mở sách
- [x] 2. Menu tổng (Sidebar ở màn Library)
  - [x] Layout Sidebar bên trái
  - [x] 2a. Báo cáo (Tổng thời gian, số sách, số trang, thời lượng TB)
  - [x] 2b. Lịch sử đọc (Ngày, thời gian, số trang trong 7 ngày)
  - [x] 2c. Thùng rác (Xoá tạm 30 ngày, khôi phục, xoá vĩnh viễn)
  - [x] 2d. Backup (Tạo file backup, hiển thị dung lượng)
