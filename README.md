# Personal Reader

## Dự án này là gì?
Personal Reader là một ứng dụng đọc sách điện tử (PDF) cá nhân, được xây dựng bằng công nghệ web hiện đại (Vue 3, TypeScript, Vite) kết hợp với Tauri để đóng gói thành ứng dụng desktop. 

## Kiến trúc hệ thống (Architecture)
Dự án này **không sử dụng backend server truyền thống** (như Node.js, Python hay Cloud Database). Thay vào đó, nó hoạt động theo mô hình ứng dụng Desktop nội bộ (Local Desktop App):
- **Frontend (Giao diện người dùng):** Sử dụng Vue 3, TypeScript, Vite, và Naive UI.
- **Backend (Xử lý Core & Lưu trữ):** Được đảm nhiệm bởi **Tauri** (viết bằng ngôn ngữ Rust). Tauri giúp frontend giao tiếp trực tiếp với hệ điều hành, quản lý file system, và sử dụng database cục bộ (như SQLite) để lưu trữ thư viện sách và ghi chú. 
- *Lưu ý:* Khi chạy trên môi trường web preview, dữ liệu có thể được lưu trữ tạm thời (mock) thông qua IndexedDB/LocalStorage, nhưng khi build ra ứng dụng máy tính (Tauri), dữ liệu sẽ được lưu an toàn trên ổ cứng của bạn.

## Tại sao nó tồn tại?
Dự án được tạo ra nhằm cung cấp một công cụ đọc sách PDF nhẹ, mượt mà và tập trung vào trải nghiệm cá nhân hóa. Nó giúp người dùng quản lý thư viện sách, ghi chú, đánh dấu trang và theo dõi tiến độ đọc một cách dễ dàng và hoàn toàn ngoại tuyến.

## Nó làm được những gì?
- **Quản lý thư viện:** Thêm, sửa, xóa sách PDF trong thư viện cá nhân. Sắp xếp và tìm kiếm sách dễ dàng.
- **Tùy chỉnh ảnh bìa:** Hỗ trợ lấy ảnh bìa từ URL, tải lên từ máy tính, hoặc **trích xuất trực tiếp và cắt ảnh từ các trang của file PDF**.
- **Trải nghiệm đọc tối ưu:** Giao diện đọc sách rõ ràng, hỗ trợ phóng to/thu nhỏ, xem mục lục.
- **Ghi chú và Đánh dấu:** Cho phép highlight (đánh dấu) văn bản, thêm ghi chú cá nhân vào từng trang sách.
- **Lưu tiến độ đọc:** Tự động lưu vị trí trang đang đọc và lịch sử đọc sách.
- **Lưu trữ an toàn:** Toàn bộ dữ liệu thư viện, file sách và ghi chú được lưu trữ hoàn toàn trên thiết bị của bạn nhờ sức mạnh của hệ thống lưu trữ sandbox nội bộ.

## Tôi cần những gì để bắt đầu?
Để chạy và phát triển dự án, bạn cần cài đặt:
- **Node.js** (phiên bản 18+ khuyến nghị)
- **NPM** hoặc trình quản lý gói tương tự (Yarn, PNPM)
- **Rust** và **Cargo** (vì dự án sử dụng Tauri làm framework cho Desktop app)
- Các công cụ xây dựng của hệ điều hành tương ứng cho Tauri.

## Làm thế nào để sử dụng hoặc chạy nó?

1. **Tải mã nguồn:**
   ```bash
   git clone <đường dẫn repo>
   cd personal_reader
   ```

2. **Cài đặt các gói phụ thuộc (dependencies):**
   ```bash
   npm install
   ```

3. **Chạy ứng dụng trong môi trường phát triển (Development):**
   ```bash
   npm run tauri dev
   ```

4. **Xây dựng ứng dụng để sử dụng thực tế (Production):**
   ```bash
   npm run tauri build
   ```
   *File cài đặt sẽ được tạo ra trong thư mục `src-tauri/target/release/bundle`.*

## Nếu gặp vấn đề thì tìm thông tin ở đâu?
- Vấn đề liên quan đến giao diện và logic: Tham khảo tài liệu của [Vue 3](https://vuejs.org/) và [Naive UI](https://www.naiveui.com/).
- Vấn đề liên quan đến xử lý file PDF: Tham khảo tài liệu của [PDF.js](https://mozilla.github.io/pdf.js/).
- Vấn đề liên quan đến build desktop app hoặc tương tác với hệ điều hành: Tham khảo tài liệu của [Tauri](https://tauri.app/).
- Bạn có thể mở **Issue** trên kho mã nguồn (repository) để báo lỗi hoặc yêu cầu tính năng mới.

## Muốn đóng góp hoặc phát triển tiếp thì phải làm gì?
Chúng tôi luôn hoan nghênh mọi đóng góp từ cộng đồng! Quy trình cơ bản:
1. **Fork** dự án về tài khoản của bạn.
2. Tạo một **branch** mới cho tính năng hoặc bản vá lỗi (`git checkout -b feature/tinh-nang-moi`).
3. Thực hiện thay đổi, đảm bảo code tuân thủ TypeScript và không có lỗi biên dịch.
4. **Commit** thay đổi (`git commit -m 'Thêm tính năng trích xuất ảnh bìa'`).
5. **Push** lên branch đó (`git push origin feature/tinh-nang-moi`).
6. Tạo một **Pull Request** để chúng tôi xem xét và hợp nhất vào dự án chính.
