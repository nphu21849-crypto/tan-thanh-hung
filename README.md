# Tân Thành Hưng — website

Website đa trang chạy bằng Node.js tích hợp sẵn, sẵn sàng mở thành project trong Antigravity. Không cần cài package ngoài.

## Chạy thử trong Antigravity

1. Tải file ZIP của project và giải nén.
2. Mở thư mục `tan-thanh-hung` trong Antigravity.
3. Mở Terminal tích hợp và chạy `npm start`.
4. Mở địa chỉ `http://localhost:4173` trong trình duyệt.

Hoặc mở trực tiếp `index.html` để xem giao diện; chạy qua `npm start` sẽ hoạt động ổn định hơn cho các trang chi tiết có tham số URL.

## Nội dung

- `index.html`, `about.html`, `products.html`, `services.html`, `projects.html`, `news.html`, `contact.html`
- `product.html?id=dieu-hoa-khong-khi` — chi tiết danh mục mẫu
- `article.html?id=chon-giai-phap-dieu-hoa` — chi tiết bài viết mẫu
- `account.html` — đăng nhập / tạo hồ sơ khách hàng xem thử
- `dashboard.html` — khu vực khách hàng, danh sách yêu cầu đã lưu
- `admin.html` — khu vực quản trị, máy chủ yêu cầu phiên đăng nhập hợp lệ
- `privacy.html`, `terms.html` — chính sách và điều khoản mô tả rõ phạm vi bản xem thử; cần đối chiếu lại khi triển khai hệ thống thật
- `assets/data.js` — dữ liệu doanh nghiệp, danh mục, dịch vụ, quy trình và bài viết
- `assets/site.css`, `assets/site.js` — giao diện responsive và hành vi chung

Giao diện có chuyển cảnh giữa trang, các lớp vòng quỹ đạo HVAC chuyển động, tia sáng và điểm sáng theo con trỏ trên thẻ, hiệu ứng nổi từ hình chính đến nút bấm, chuyển cảnh có nhịp easing mượt và hiệu ứng xuất hiện theo cuộn. Nút đăng nhập được nhấn mạnh trên thanh điều hướng. Chatbot hướng dẫn nhanh, có lối nhắn Zalo hoặc gọi tư vấn viên. Thiết bị bật “giảm chuyển động” sẽ dùng trạng thái tĩnh.

## Cập nhật thông tin trước khi phát hành

1. Sửa dữ liệu đã xác nhận trong `assets/data.js`.
2. Thay domain `tanthanhhung.example` trong `canonical`, Open Graph, structured data, `robots.txt` và `sitemap.xml` bằng domain thật.
3. Xác nhận danh mục, dịch vụ và nội dung bài mẫu trước khi giữ lại; hiện chúng được gắn nhãn tham khảo/mẫu.
4. Cập nhật địa chỉ chuẩn, mã số thuế (nếu công bố), chính sách, giờ hoạt động và thông tin Google Business khi được cung cấp.
5. Thay hình minh họa SVG bằng ảnh công ty/sản phẩm đã được phép sử dụng.

## Tương tác

Tìm kiếm/lọc danh mục, danh sách yêu cầu lưu trên trình duyệt, chatbot hướng dẫn nhanh, nhắn Zalo, gọi điện hoặc SMS trực tiếp; email vẫn có sẵn cho nội dung dài. Liên kết Zalo dùng số 0919 477 856; xác nhận số này có Zalo chính thức trước khi phát hành. Chatbot là luồng trả lời tự động trên trình duyệt, chưa kết nối AI hoặc nhân viên theo thời gian thực. Backend Node.js cung cấp đăng nhập quản trị có phiên cookie HttpOnly; các nội dung sản phẩm, dịch vụ, bài viết, dự án và hồ sơ khách vẫn là dữ liệu xem thử lưu trong trình duyệt, chưa có cơ sở dữ liệu hoặc đồng bộ giữa thiết bị. Thanh toán, xử lý đơn hàng và lưu dữ liệu liên hệ trên máy chủ chưa được kết nối.

Đăng nhập khách hàng vẫn là mô phỏng trên trình duyệt. Quyền truy cập trang quản trị được xác minh ở máy chủ. Trong trang quản trị, có thể thêm/sửa/xóa sản phẩm, tìm kiếm và lưu ảnh, mã, nhóm, giá, thông số, nguồn gốc/nhà cung cấp trên trình duyệt đang dùng. Sản phẩm thêm/sửa/xóa trong quản trị sẽ cập nhật ngay ở danh mục và trang chi tiết mà khách đã đăng nhập hoặc chưa đăng nhập xem trên cùng trình duyệt. Dữ liệu và ảnh không đồng bộ sang thiết bị khác hoặc lên máy chủ. Không dùng localStorage để lưu dữ liệu nghiệp vụ thật; cần API quản trị và cơ sở dữ liệu trước khi phát hành.


Trong trang quản trị, có thể thêm/sửa/xóa và bật/tắt hiển thị bài viết, dự án; nội dung đã xuất bản hiện ở các trang Tin tức và Dự án của khách. Mục “Tài khoản khách” liệt kê tên, email, số điện thoại và ngày đăng ký; biểu mẫu đăng ký yêu cầu số điện thoại. Mật khẩu và xác nhận mật khẩu không được lưu. Tất cả dữ liệu là bản xem thử trong localStorage của trình duyệt hiện tại, không đồng bộ sang máy khác hoặc máy chủ.
Bộ tin tức đã được biên soạn riêng bằng tiếng Việt, gồm 6 bài về nền tảng HVAC, thông gió, bảo trì, VRV Daikin, thu hồi nhiệt và R-32. Các bài kỹ thuật có liên kết tham khảo đến trang/tài liệu chính thức của Daikin. Khi cập nhật từ phiên bản trước, nội dung mẫu cũ được thay bằng bộ bài mới; các bài viết quản trị viên tự thêm vẫn được giữ lại.

Ảnh minh họa HVAC/VRV được tải từ Unsplash và CDN của nhà cung cấp ảnh, nên cần Internet để hiển thị. Các ảnh công trình trên website được ghi rõ là ảnh minh họa, không đại diện cho dự án đã xác nhận của công ty.

## Đăng nhập quản trị có bảo vệ máy chủ

Chỉ hai địa chỉ `thanglehuy789@gmail.com` và `nphu21849@gmail.com` nằm trong danh sách cho phép. Mỗi tài khoản cần mật khẩu riêng (tối thiểu 16 ký tự); mật khẩu được đặt trong file `.env` ở máy chạy website, không đưa vào gói ZIP hoặc mã nguồn.

1. Sao chép `admin.env.example` thành `.env` trong cùng thư mục với `server.js`.
2. Thay hai giá trị mẫu bằng hai mật khẩu mạnh, khác nhau và chỉ chia sẻ với đúng người dùng.
3. Chạy `npm start`, rồi mở website bằng `http://localhost:4173`. Đăng nhập quản trị ở cuối trang Tài khoản. Mở `admin.html` trực tiếp bằng `file://` sẽ không hoạt động.

Máy chủ chỉ cấp cookie phiên `HttpOnly` sau khi xác minh email và mật khẩu; trang quản trị được chặn nếu thiếu phiên hợp lệ. Có giới hạn thử đăng nhập và cookie `Secure` khi chạy với `NODE_ENV=production` qua HTTPS. Phiên hiện lưu trong bộ nhớ tiến trình và hết hạn sau 8 giờ hoặc khi máy chủ khởi động lại. Đây là xác thực mật khẩu theo danh sách email, chưa xác minh quyền sở hữu hộp thư bằng mã OTP. Nội dung quản trị vẫn chỉ lưu ở localStorage nên cần cơ sở dữ liệu và API có phân quyền trước khi lưu dữ liệu thật.