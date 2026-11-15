# Đề xuất UI/UX cho Utility Lab

Đánh giá ngày 15/11/2026, dựa trên bản Cloudflare của chủ repo.

## Phần đã giữ và phần đã chỉnh

Giữ thư viện 1.500 lineup, vị trí ném, nội dung hướng dẫn, ảnh/video, crosshair,
nguồn/tác giả, favorites và cách chọn mục tiêu → utility → vị trí ném của bản web.
Giữ Tactic board, Stats, Display, Workspace và trạng thái Coming soon của Playbooks.

Chỉ tăng vùng map Lineups trên desktop, đặt `−`/`+` cạnh nhau ở map và ảnh, bổ sung
con lăn cho camera ảnh gốc. Map đã có wheel zoom/pan. Các phần viết lại viewer và
map bounds dựa trên `main` cũ đã được bỏ. Có [biên bản kiểm tra](lineups-map-ux-verification.md).

Repo chưa có mã nguồn tương ứng bản web. Branch lưu một snapshot có hash và công
cụ tái tạo; cần thay bằng source gốc khi có. Nên thêm build/commit ID trong thông
tin ứng dụng để tránh nhầm phiên bản vào lần sau.

## Tham khảo

[CS2UTIL](https://www.cs2util.com/) dùng bản đồ, lọc khu vực/team và mở hướng dẫn
chi tiết. [Lineups.pro](https://lineups.pro/) kết hợp ảnh/video, input và collections.
[CSDB](https://csdb.gg/lineups/) cho thấy giá trị của thông tin độ mới và trạng thái
kiểm chứng. Những hướng này phù hợp với nền tảng Utility Lab đang có; không cần
đổi thương hiệu hoặc dựng lại toàn bộ workspace.

Các ưu tiên sau là nhận định dành cho hai người chuẩn bị tactic và tra nhanh khi
đang chơi. Chúng là đề xuất, chưa được tự động thêm vào ứng dụng.

## Nên cân nhắc tiếp

| Ưu tiên | Tính năng | Cách làm vừa với setup hiện tại |
| --- | --- | --- |
| Cao | Xem gần đây | Lưu vài ID vừa mở trong browser, đặt lối truy cập cạnh Saved để quay lại nhanh trong freeze time. |
| Cao | Trạng thái đã thử | Chưa thử / Đã tự thử / Cần thử lại, kèm ngày và người kiểm tra. Không coi một video còn mở được là bằng chứng lineup còn đúng. |
| Vừa | Bộ lineup thiết yếu | Cho hai bạn ghim vài lineup theo map/side từ favorites. Giữ lựa chọn đơn giản trước khi triển khai Playbooks đầy đủ. |
| Vừa | Ghi chú phối hợp | Ghi người ném, người peek và tín hiệu phối hợp ngay cạnh lineup đã lưu; chưa cần timeline nhiều lớp. |
| Vừa | Nhập dữ liệu có xem trước | Bổ sung xem trước và xử lý ID trùng cho luồng backup/import hiện có, nếu hai bạn thường chuyển dữ liệu giữa browser. |
| Vừa | Điều khiển pan không cần kéo | Một menu nhỏ có bốn hướng cho người khó kéo chuột; giữ cụm zoom hiện tại gọn. |
| Thấp | Báo nội dung cần cập nhật | Ghi chú local khi ảnh/nguồn sai hoặc map đổi; chỉ gửi ra ngoài khi người dùng chủ động chọn. |

Nhóm mục tiêu, link mở lineup, phân loại ảnh Position/Aim/Landing, annotations và
Workspace backup đã có trong bản web: nên hoàn thiện chúng khi có lỗi cụ thể,
không tạo thêm một luồng song song.

## Nguyên tắc UI nên duy trì

- Giữ tỷ lệ map và tọa độ. Cửa sổ rộng nhưng thấp vẫn có khoảng trống hai bên ở
  mức fit; zoom/pan giải quyết việc tra cứu mà không kéo méo hình.
- Giữ nút fit rõ ràng và đưa ảnh mới về 100% khi đổi slide.
- Con lăn trên ảnh chỉ tác động ảnh; Ctrl/Meta + wheel vẫn dành cho browser.
  [MDN về wheel](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event)
  giải thích khác biệt giữa wheel, scroll và zoom browser.
- Nút gần nhau vẫn cần vùng bấm đủ rõ. Tham chiếu
  [W3C Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  và kiểm tra trên thiết bị cảm ứng thật trước khi kết luận đáp ứng accessibility.
- Có phương án con trỏ không cần kéo khi hoàn thiện accessibility, theo
  [W3C Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).
- Giữ creator/source và phân biệt lineup tham khảo với lineup hai bạn đã ném thử.

Realtime, tài khoản Steam, tự phân tích demo và đồng bộ team nên để sau: chúng cần
backend và cách xử lý chia sẻ/xung đột. Với phạm vi hiện tại, Xem gần đây hoặc
Trạng thái đã thử là hai bước nhỏ có lợi ích dễ kiểm chứng nhất.
