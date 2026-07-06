# Changelog - Personal Reader

## Ngày 02/07/2026

### 1. Khởi tạo cấu trúc dự án (Step 1)
- **Các file đã tạo/sửa**:
  - `package.json`: Chuyển đổi từ React sang Vue 3, thêm Tauri CLI, Pinia, Vue Router, Naive UI, PDF.js.
  - `vite.config.ts`: Cấu hình build cho Vue và chuẩn bị cho Tauri.
  - `tsconfig.json`: Bật Strict Mode, cấu hình module cho Vue.
  - `index.html`: Cập nhật điểm neo `#app` và trỏ tới `main.ts`.
  - `src/main.ts`: Điểm khởi chạy Vue 3 + Pinia.
  - `src/App.vue`: Component gốc.
  - `Log.md`: Tạo file theo dõi tiến độ theo yêu cầu.
- **Các file đã xóa**:
  - `src/App.tsx`, `src/main.tsx` (Gỡ bỏ template React cũ).
- **Chức năng đã hoàn thành**:
  - Dọn dẹp môi trường cũ.
  - Cài đặt thành công stack công nghệ cơ sở: Vue 3 + Pinia + Naive UI.
- **Việc còn lại**:
  - Setup chi tiết cấu trúc thư mục (modules, core).
  - Thiết kế cấu trúc bảng Database (SQLite).
- **Ghi chú**:
  - Môi trường Sandbox hiện tại không có trình biên dịch Rust (Cargo) nên không thể build trực tiếp file `.exe`. 
  - Toàn bộ code sẽ được viết CHUẨN kiến trúc Tauri + Vue 3. Trong quá trình dev ở đây, chúng ta sẽ mô phỏng trên giao diện Web. Khi hoàn thành, bạn chỉ cần tải source code về máy tính cá nhân (chạy Windows) và sử dụng `npm run tauri dev` hoặc `npm run tauri build` để tạo file cài đặt.

### 2. Thiết kế Database và Cấu trúc Core (Step 2)
- **Ngày thực hiện**: 02/07/2026
- **Các file đã tạo**:
  - `src/core/models/Database.types.ts`: Chứa các Interface định nghĩa cấu trúc dữ liệu cho TypeScript (Book, Annotation, Note, ReadingHistory, Bookmark, TableOfContent, Setting).
  - `src/core/database/migrations.ts`: Chứa mã SQL DDL (CREATE TABLE) thiết lập schema ban đầu cho SQLite.
  - `src/core/database/DatabaseService.ts`: Chứa class Singleton `DatabaseService` bọc (wrap) `@tauri-apps/plugin-sql` để giao tiếp với file SQLite ở Local (personal_reader.db).
- **Chức năng đã hoàn thành**:
  - Phân tích và thiết kế Model dựa trên yêu cầu VI (Yêu cầu kiến trúc dữ liệu).
  - Cài đặt liên kết khóa ngoại (Foreign Key) CASCADE để đảm bảo dữ liệu (highlight, notes) liên quan sẽ tự xóa nếu sách bị xóa, tránh rác dữ liệu.
  - Viết API nội bộ (DatabaseService) hỗ trợ chạy an toàn (không crash) khi dev trên browser.
- **Việc còn lại**:
### 3. Thiết kế Module Library (Quản lý sách) (Step 3)
- **Ngày thực hiện**: 02/07/2026
- **Các file đã tạo**:
  - `TODO.md`: Thiết lập bản kế hoạch công việc và theo dõi task.
  - `src/router/index.ts`: Khởi tạo Vue Router để điều hướng trang.
  - `src/core/utils/fileSystem.ts`: Hàm bọc API gọi hộp thoại chọn file, tương thích ngược giữa Tauri (`@tauri-apps/plugin-dialog`) và mock File Input trên Browser.
  - `src/modules/Library/services/LibraryService.ts`: Chứa logic thao tác CSDL SQLite (Lấy danh sách sách, Thêm sách).
  - `src/modules/Library/store/libraryStore.ts`: Store (Pinia) chứa State quản lý sách trong thư viện.
  - `src/modules/Library/components/BookCard.vue`: UI hiển thị 1 cuốn sách.
  - `src/modules/Library/views/LibraryView.vue`: UI giao diện thư viện chính.
- **Các file đã sửa**:
  - `src/App.vue`, `src/main.ts`: Thay thế nội dung placeholder bằng `router-view`.
  - `package.json`: Cài đặt thêm `@tauri-apps/plugin-dialog`.
  - `LOG.md` (Đổi tên từ `Log.md`).
- **Chức năng đã hoàn thành**:
  - Màn hình thư viện cơ bản.
  - Chức năng thêm sách (lưu metadata xuống SQLite).
  - Khởi tạo kiến trúc module cho Library.
- **Việc còn lại**:
  - Thiết kế Module Reader (Hiển thị PDF).
- **Ghi chú**:
  - `LibraryService` gọi SQLite bằng query thô đúng theo format Tauri SQL plugin.
  - Do chưa build Tauri nên khi bạn click "Thêm sách" trên Web, nó sẽ mở hộp thoại input file của HTML làm mock giả lập, đảm bảo bạn vẫn test luồng dữ liệu được.

### 4. Thiết kế Module Reader (Hiển thị PDF) (Step 4)
- **Ngày thực hiện**: 02/07/2026
- **Các file đã tạo**:
  - `src/modules/Reader/services/ReaderService.ts`: Xử lý việc lấy metadata của sách từ SQLite và cập nhật `current_page` (Tiến độ đọc).
  - `src/modules/Reader/store/readerStore.ts`: Pinia Store để giữ State của trình đọc (Zoom, Current Page, Total Pages).
  - `src/modules/Reader/components/PDFViewer.vue`: Component dùng `pdfjs-dist` và thẻ `<canvas>` để render nội dung PDF.
  - `src/modules/Reader/views/ReaderView.vue`: Màn hình đọc sách (gồm thanh Toolbar chuyển trang, thu/phóng).
- **Các file đã sửa**:
  - `src/router/index.ts`: Kích hoạt route `/reader/:id`.
  - `src/modules/Library/components/BookCard.vue`: Lệnh `click` trên Card giờ đây chuyển hướng Router sang màn hình Reader.
  - `TODO.md`: Cập nhật checklist dự án.
- **Chức năng đã hoàn thành**:
  - Xây dựng ReaderView độc lập hoàn toàn.
  - Tích hợp thành công `pdfjs-dist` (hỗ trợ load Web Worker từ vite bằng `?url`).
  - Hỗ trợ Phóng to, Thu nhỏ, Chuyển trang (Render qua HTML5 Canvas).
  - Tự động lưu tiến độ đọc (Auto Save current_page xuống SQLite khi lật trang).
- **Việc còn lại**:
  - Thiết kế Module Annotation & Notes (Bôi đen văn bản, Ghi chú).
- **Ghi chú**:
  - Trong môi trường DEV Web Sandbox, ứng dụng không có quyền đọc file thực trong máy người dùng, vì vậy Viewer đang sử dụng 1 file PDF Mock (Tracemonkey PDF) từ URL public để thay thế khi Render. Đối với Tauri Build, `convertFileSrc` hoặc `asset://` sẽ được sử dụng để đọc file gốc.

### 5. Thiết kế Module Annotation (Highlight & Text Selection) (Step 5)
- **Ngày thực hiện**: 02/07/2026
- **Các file đã tạo**:
  - `src/modules/Annotation/services/AnnotationService.ts`: CRUD xử lý Insert/Delete dữ liệu cho Highlight và Note.
  - `src/modules/Annotation/store/annotationStore.ts`: Pinia Store quản lý state mảng Annotations và Notes của cuốn sách hiện tại.
  - `src/modules/Annotation/components/SelectionMenu.vue`: Popup Menu nổi khi người dùng bôi đen chữ (hỗ trợ Copy, Translate, Search, Highlight 4 màu).
  - `src/modules/Annotation/components/HighlightLayer.vue`: Lớp layer `.highlight-rect` render các box màu hiển thị đè lên tài liệu dựa vào tọa độ đã lưu (bounding client rects).
- **Các file đã sửa**:
  - `src/modules/Reader/components/PDFViewer.vue`: Bổ sung tính năng `TextLayer` của PDF.js, lồng ghép `SelectionMenu` và `HighlightLayer` vào chung 1 `.page-container`.
  - `src/modules/Reader/views/ReaderView.vue`: Truyền `bookId` xuống `PDFViewer` để trigger load Highlight khi sách mở.
  - `TODO.md`: Cập nhật checklist.
- **Chức năng đã hoàn thành**:
  - Bôi đen chọn văn bản.
  - Gọi Menu Copy/Search/Translate/Highlight.
  - Lưu Highlight xuống SQLite qua DatabaseService.
  - Render Highlight đè lên chữ sau khi lưu.
- **Việc còn lại**:
  - Thiết kế Sidebar (Ngăn kéo) để hiển thị danh sách các Highlight, cho phép click để chuyển nhanh tới trang.
  - Tạo Popup Ghi chú tự do (Notes).
- **Ghi chú**:
  - Tọa độ Highlight được tính toán tương đối (relative) so với `.page-container` và được scale theo trình duyệt. 
  - (Tùy chọn tương lai) Cần xử lý debounce ResizeObserver để scale lại mảng box khi người dùng zoom (hoặc dùng % thay vì px nếu muốn responsive tối đa).

### 6. Giao diện Sidebar - Danh sách Highlight & Notes (Step 6)
- **Ngày thực hiện**: 02/07/2026
- **Các file đã tạo**:
  - `src/modules/Annotation/components/AnnotationSidebar.vue`: Hiển thị danh sách Highlight và Note (dạng tab), cho phép chuyển trang khi nhấn và xóa phần tử.
  - `src/modules/Annotation/components/NoteDialog.vue`: Modal nhập nội dung ghi chú.
- **Các file đã sửa**:
  - `src/modules/Annotation/services/AnnotationService.ts`: Thêm method `deleteNote`.
  - `src/modules/Annotation/store/annotationStore.ts`: Thêm action `addNote` và `removeNote`.
  - `src/modules/Annotation/components/SelectionMenu.vue`: Thêm nút "Note" và emit sự kiện `addNote`.
  - `src/modules/Reader/components/PDFViewer.vue`: Emit sự kiện `addNote` từ SelectionMenu.
  - `src/modules/Reader/views/ReaderView.vue`: Tích hợp `AnnotationSidebar` (thành giao diện Flex 2 cột) và `NoteDialog` modal, liên kết logic tạo và theo dõi Note.
- **Chức năng đã hoàn thành**:
  - Nút thêm Note xuất hiện trong popup SelectionMenu khi bôi đen.
  - Dialog nhập nội dung và lưu vào database.
  - Sidebar hiển thị cả 2 tab Highlights & Notes cho cuốn sách đang mở.
  - Click vào note/highlight trong sidebar sẽ nhảy đến đúng trang.
  - Xóa ghi chú/highlight từ sidebar.
- **Việc còn lại**:
  - Table of Contents (Mục lục).

### 7. Các tính năng phụ trợ (Mục lục, Cấu hình giao diện) (Step 7)
- **Ngày thực hiện**: 02/07/2026
- **Các file đã tạo**:
  - `src/modules/Settings/store/settingsStore.ts`: Quản lý trạng thái Dark mode, lưu vào `localStorage`.
- **Các file đã sửa**:
  - `src/modules/Reader/store/readerStore.ts`: Thêm state `outline` lưu trữ mục lục.
  - `src/modules/Reader/components/PDFViewer.vue`: Thêm logic đọc `getOutline()` và parse `dest` để chuyển đổi tọa độ destination sang số trang `resolveDestination`. 
  - `src/modules/Annotation/components/AnnotationSidebar.vue`: Bổ sung Tab "Mục lục" và render cấu trúc cây của mục lục, thiết lập CSS tương thích biến màu sắc để hỗ trợ Dark Mode.
  - `src/modules/Reader/views/ReaderView.vue`: Chuyển xử lý nhảy trang và binding events từ PDFViewer.
  - `src/modules/Library/views/LibraryView.vue`: Bổ sung nút chuyển đổi Giao diện Tối/Sáng trên Header.
  - `src/App.vue`: Bọc ứng dụng trong thẻ `<n-config-provider>` với `darkTheme` và toggle class `dark`.
- **Chức năng đã hoàn thành**:
  - Load và hiển thị Mục Lục (Table of Contents) ngay khi mở PDF.
  - Click vào mục lục để chuyển trang.
  - Chuyển đổi Dark Mode/Light Mode.
- **Việc còn lại**:
  - Hoàn thiện và build Tauri (nếu cần ở bước tiếp theo).

### 8. Tối ưu hoá & Đóng gói (Step 8)
- **Ngày thực hiện**: 02/07/2026
- **Các file đã tạo**:
  - `src/components/AppGlobalError.vue`: Global Error Boundary component cho Vue để bắt các lỗi không mong muốn ở cấp ứng dụng.
- **Các file đã sửa**:
  - `src/App.vue`: Tích hợp Error Boundary bọc quanh router-view.
- **Chức năng đã hoàn thành**:
  - Tích hợp Error Boundary để tăng tính ổn định của ứng dụng.
  - Cập nhật TODO list báo hiệu đã hoàn thành toàn bộ flow.
### 9. Cập nhật Module Library (Tính năng mở rộng) (Step 9)
- **Ngày thực hiện**: 02/07/2026
- **Các file đã tạo**:
  - `src/modules/Library/components/BookEditModal.vue`: Modal để người dùng chỉnh sửa thông tin sách (tên, tác giả, thể loại, mô tả, năm xuất bản, URL ảnh bìa).
- **Các file đã sửa**:
  - `src/core/database/migrations.ts`: Cập nhật schema, thêm các lệnh `ALTER TABLE` cho `is_pinned`, `author`, `genre`, `published_year`, `description`, `cover_image`, `sort_order`.
  - `src/core/models/Database.types.ts`: Cập nhật interface `Book` với các trường dữ liệu mới.
  - `src/core/database/DatabaseService.ts`: Cập nhật logic catch-error cho quá trình migration (để bỏ qua lỗi nếu cột đã tồn tại), mở rộng Mock DB support cho updateBook và pinBook.
  - `src/modules/Library/services/LibraryService.ts`: Bổ sung map trường dữ liệu mới vào thao tác INSERT, thêm phương thức `updateBook`.
  - `src/modules/Library/store/libraryStore.ts`: Viết thêm action `updateBook`, `togglePin`, `updateOrder`, hỗ trợ thuộc tính loading và biến tìm kiếm `searchQuery`. Sắp xếp sách theo trạng thái ghim, thứ tự người dùng kéo thả, rồi mới đến ngày tạo.
  - `src/modules/Library/components/BookCard.vue`: Thêm UI và emits cho ghim sách, sửa sách và ảnh bìa.
  - `src/modules/Library/views/LibraryView.vue`: Bổ sung thanh tìm kiếm (Naïve UI Input), tích hợp `vuedraggable` để hỗ trợ kéo thả sắp xếp danh sách sách, hiển thị loading khi đang xử lý thêm sách, liên kết Form chỉnh sửa (BookEditModal).
- **Chức năng đã hoàn thành**:
  - Ghim sách (hiển thị lên đầu danh sách và highlight ghim vàng).
  - Tìm kiếm sách theo tựa đề hoặc tên tác giả.
  - Nhập metadata (tên sách, tác giả, mô tả...) khi vừa import hoặc sửa file hiện tại.
  - Hiệu ứng loading lúc thêm sách.
  - Kéo thả các cuốn sách để đổi thứ tự tùy chỉnh.

### 10. Tinh chỉnh UI & Trải nghiệm (Step 10)
- **Ngày thực hiện**: 02/07/2026
- **Các file đã sửa**:
  - `src/modules/Library/components/BookEditModal.vue`: Thay đổi trường `URL Ảnh bìa` thành Chọn file ảnh `<input type="file" accept="image/*">`, hỗ trợ base64 tự động. Điều chỉnh khoảng cách giữa nút Hủy và Lưu.
  - `src/modules/Reader/views/ReaderView.vue`: Sửa giao diện nút Back thành nút outline với icon mũi tên rõ ràng. Nhóm các nút thu phóng (Zoom) bằng `n-button-group` và dùng icon (+/-). Bổ sung nút nổi trợ giúp `[?]` góc dưới bên phải hiện danh sách phím tắt.
  - Thêm tính năng phím tắt `Ctrl +` (hoặc Cmd +), `Ctrl -`, `Ctrl 0` và phím mũi tên để thao tác phóng to / thu nhỏ và chuyển trang không cần chuột.
  - `src/modules/Reader/components/PDFViewer.vue`: Thêm CSS `transition: width 0.25s ease-out, height 0.25s ease-out;` để giúp việc phóng to / thu nhỏ mượt mà hơn.
- **Chức năng đã hoàn thành**:
  - Tối ưu hóa UI/UX các phần Library và Reader theo yêu cầu.
  - Tăng tốc độ thao tác qua bàn phím (Phím tắt).

### 12. Fixes Review (Step 12)
- **Ngày thực hiện**: 02/07/2026
- **Các file đã sửa**:
  - `src/core/utils/sandboxFileStore.ts`: Tạo helper lưu file (Blob/File) vào IndexedDB để tái sử dụng trong môi trường Mock (giải quyết lỗi đọc sai nội dung sách).
  - `src/core/utils/fileSystem.ts`: Cập nhật `selectBookFile` lưu file vào IndexedDB.
  - `src/modules/Reader/views/ReaderView.vue`: Đọc blob `fileUrl` từ IndexedDB thay vì link github PDF giả mạo.
  - `src/core/database/DatabaseService.ts`: Sửa lỗi regex check Update Mock DB query gây ra việc ảnh bìa và metadata bị mất sau khi quay về trang thư viện.
  - `src/modules/Reader/components/PDFViewer.vue`: Bỏ CSS override hiển thị `.textLayer`. Vì PDF render font dạng fixed canvas, việc hiển thị `span` đè lên sẽ gây sai lệch font chữ hoàn toàn. Trả lại `.textLayer` dạng `opacity: 0.2` nguyên thủy để người dùng chọn chữ.
  - `src/modules/Annotation/components/HighlightLayer.vue`: Fix lỗi màu highlight bị sậm khi có nhiều rect chồng lên nhau (do getClientRects) bằng cách: Sử dụng Solid Color thay vì rgba, và đẩy `mix-blend-mode: multiply` lên thẻ container `.highlight-layer` bao ngoài thay vì từng `.highlight-rect`. 
  - Đổi tính năng "Tô đậm" (Bold) thành "Gạch dưới đỏ" (Thick Red Underline) và "In nghiêng" (Italic) thành "Gạch đứt xanh" (Dashed Blue Underline). Đây là cách chuẩn để Note PDF mà không làm nát font chữ gốc.
- **Chức năng đã hoàn thành**:
  - Vá lỗi hiển thị sai file.
  - Vá lỗi mất metadata.
  - Cải thiện hiển thị Highlight, mượt mà và đồng nhất màu sắc.
  - Nâng cấp mergeRects gom nhóm line tốt hơn, chống gãy khúc nét gạch.
  - Làm đậm SelectionMenu UI, đổ bóng nổi bật, thêm icon Google Search - Cải thiện hiển thị Highlight, mượt mà và đồng nhất màu sắc. Translate chuẩn.
  - Đổi màu selection text đậm hơn (#60a5fa).
  - Nét đứt (italic) dùng linear-gradient để nhỏ và dày đặc hơn.
  - Cho phép chọn lại vùng text đã được highlight (tắt pointer-events trên highlight-rect).
  - Khắc phục lỗi trào viền nét đậm (đặt box-sizing: border-box) giúp xử lý mượt mà khi các highlight đè lên nhau (hiệu ứng sau xoá hiệu ứng trước) thông qua việc dùng background color trắng với mix-blend-mode multiply.
  - Đổi tên Công cụ thành Tools, đưa nút ẩn Tools vào trong thanh tiêu đề của Sidebar và hiện một Sidebar Tab nhỏ khi ẩn.
  - Thêm bảng màu (Color Picker) cho text highlight để người dùng có thể chọn các màu tuỳ chỉnh thay vì chỉ các màu mặc định.
  - Thêm tính năng Auto Scan TOC (Quét mục lục tự động) cho các PDF không đánh dấu sẵn Outline (quét chữ, toạ độ dòng để tìm số trang).
  - Hiển thị số trang trên mỗi item của mục lục, đồng thời giảm khoảng cách (padding, gap) giữa các item để danh sách gọn gàng hơn.
  - Sửa Bold/Italic thành icon gạch dưới, làm đậm và sắc nét.
  - Làm nổi bật màu selection text.
  - Thêm tính năng Undo/Redo (Hoàn tác/Làm lại) có nút toggle Edit Mode ở góc dưới phải.
  - Xử lý Bold/Italic an toàn, thẩm mỹ (chuyển sang Underline) không phá layout font PDF.
- **Việc còn lại**:
  - Hoàn tất mọi tính năng yêu cầu.







