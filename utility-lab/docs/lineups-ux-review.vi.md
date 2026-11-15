# Đề xuất tính năng và UI UX cho Utility Lab

Ngày đánh giá: 15/11/2026. Ưu tiên cho hai người chuẩn bị tactic và tra lineup nhanh khi đang chơi CS2.

Utility Lab đã có nền tảng phù hợp: bản đồ tương tác, bộ lọc T/CT và utility, ảnh/video, favorites, playbooks và dữ liệu lưu trong browser. Hướng phát triển phù hợp là giảm thời gian tìm đúng lineup và tăng độ tin cậy của hướng dẫn. Các thay đổi lớn về thương hiệu, trang mở đầu hoặc cấu trúc workspace chưa cần thiết.

## Phạm vi của branch hiện tại

- Tận dụng thêm chiều cao trong vùng bản đồ Lineups bằng cách đặt thông tin và công cụ gọn quanh canvas.
- Đặt hai nút `−` và `+` cạnh nhau; nút phần trăm dùng để trở về fit.
- Hỗ trợ con lăn để zoom bản đồ và ảnh lineup, hướng về vị trí con trỏ trong giới hạn nội dung.
- Hỗ trợ kéo chuột để pan khi đã zoom, phím `+`/`−`, phím `0` để fit và phím mũi tên để pan khi vùng xem đang có focus.
- Giữ cách chuyển slide, caption, nguồn, tác giả, bộ lọc, lưu lineup và luồng tải video hiện có.

Phạm vi này bám góp ý về bản đồ và điều khiển zoom. Những tính năng bên dưới là đề xuất cho các lần sau.

## Đồng bộ mã nguồn trước lần phát hành tiếp theo

Ở thời điểm đối chiếu, website Cloudflare có chức năng chưa nằm trong `main` tại commit `a26b2c8`: giao diện gợi ý lineup, nhóm marker theo mục tiêu và thư viện lớn hơn. Mirage T trên website hiển thị 165 tham chiếu. Branch hiện tại được phát triển từ `main` theo lựa chọn của chủ repo.

Trước khi dùng branch này để cập nhật website, cần đưa mã nguồn tương ứng với bản Cloudflare vào Git, rồi ghép các thay đổi của branch vào bản đó. Có thể thêm commit/build ID trong mục thông tin ứng dụng để lần sau xác định đúng phiên bản đang chạy. Đây là việc ưu tiên cao nhất để giữ các thiết lập và dữ liệu nội dung mới hơn.

## Những hướng tham khảo phù hợp

[CS2UTIL](https://www.cs2util.com/) mô tả cách chọn điểm trên bản đồ, lọc theo khu vực/team, zoom bằng nút hoặc con lăn, rồi mở hướng dẫn chi tiết. Điều này ủng hộ cách bố trí lấy bản đồ làm trung tâm mà Utility Lab đang có.

[Lineups.pro](https://lineups.pro/) kết hợp ảnh/video, thông tin vị trí và input, favorites và collections cho team. Với Utility Lab, có thể phát triển tiếp favorites và playbooks hiện có trước khi bổ sung một hệ thống quản lý khác.

[CSDB](https://csdb.gg/lineups/) hiển thị thông tin độ mới của lineup, phân biệt tín hiệu có bản cập nhật game với việc kiểm chứng từng cú ném. Cách phân biệt này phù hợp với thư viện hiện có cả video của creator lẫn tham chiếu minh họa.

Các ưu tiên sau là nhận định dành riêng cho Utility Lab, dựa trên luồng sử dụng hiện tại và những cách làm trên.

## Nên ưu tiên sau khi đồng bộ nguồn

| Tính năng | Cách làm vừa với cấu trúc hiện có | Lợi ích | Mức thay đổi |
| --- | --- | --- | --- |
| Xem gần đây | Lưu danh sách nhỏ gồm ID các lineup vừa mở theo browser; thêm lối truy cập cạnh Saved. | Quay lại lineup vừa tra trong vòng đấu mà không tìm từ đầu. | Nhỏ, không cần tài khoản. |
| Bộ lineup thiết yếu | Cho hai bạn tự chọn một playbook gồm vài lineup hay dùng cho từng map/side; ưu tiên lại favorites hiện có. | Mở đúng bộ smoke/flash của hai người ngay trong freeze time. | Nhỏ đến vừa; không tạo thêm loại collection trùng với playbooks. |
| Trạng thái kiểm chứng | Thêm trạng thái như Chưa thử, Đã tự thử, Cần kiểm tra lại; kèm ngày thử, người thử và phiên bản map nếu biết. | Phân biệt một video tham khảo với lineup đã được hai bạn ném thử. | Vừa; cần mở rộng dữ liệu và export tương thích bản cũ. |
| Nhóm theo mục tiêu | Giữ cách chọn đích đến → loại utility → các vị trí ném. Đồng bộ phần đã có trên website trước khi mở rộng. | Bản đồ bớt chồng marker và dễ tìm nhiều cách ném vào cùng một chỗ. | Vừa; nên kiểm tra với thư viện đông marker. |
| Mở rộng vùng bản đồ | Thêm nút thu/mở danh sách tham chiếu trong Lineups; khi mở editor hoặc cần đọc hướng dẫn thì hiện lại panel. | Tận dụng cửa sổ Steam nhỏ và cho người dùng chọn lúc cần danh sách. | Vừa; giữ danh sách hiện tại làm nền. |
| Link mở đúng tham chiếu | Với lineup tích hợp, link chứa map, tầng, side và ID để bạn kia mở đúng nội dung. | Bớt phải mô tả “cái smoke thứ ba ở góc này”. | Vừa; lineup cá nhân cần cơ chế chuyển dữ liệu riêng. |
| Nhập lại dữ liệu đã export | Hoàn thiện luồng import lineup/playbook với xem trước, xử lý ID trùng và kiểm tra ảnh/link. | File export trở thành cách chuyển dữ liệu thực tế giữa hai người và giữa các browser. | Vừa; ưu tiên tính tương thích và giữ dữ liệu đang có. |

Link cho lineup cá nhân không nên nhét ảnh hoặc ghi chú riêng vào URL. Chuyển bằng file có xem trước là bước nhỏ hợp với ứng dụng đang lưu local; chia sẻ bằng tài khoản có thể cân nhắc sau.

## Cải thiện thêm khi có nhu cầu

| Tính năng | Gợi ý triển khai | Điều cần giữ rõ |
| --- | --- | --- |
| Phân loại ảnh theo bước | Đánh dấu ảnh Vị trí đứng, Điểm ngắm, Thao tác, Điểm rơi; vẫn giữ caption tự do. | Dùng ảnh thật do người dùng cung cấp; không tự tạo ảnh ngắm để thay bằng chứng. |
| Input có cấu trúc | Tách nút chuột, tư thế/di chuyển và thời điểm nhảy/nhả; tiếp tục hiển thị LMB + RMB rõ ràng. | Không suy đoán input chưa thấy trong nguồn. “Không ghi nhận” vẫn là trạng thái hợp lệ. |
| Ghi chú cho cặp người chơi | Dùng playbook để ghi người ném, người peek, thứ tự và tín hiệu phối hợp. | Ghi chú ngắn là đủ cho hai người; chưa cần một timeline nhiều lớp. |
| Ghi nhớ ngữ cảnh tra cứu | Khi đóng viewer, giữ map, tầng, bộ lọc, vị trí zoom và danh sách đang xem; đổi map/tầng thì fit lại. | Tránh mở lại với camera đang trôi ở một góc không liên quan. |
| Điều khiển cảm ứng riêng cho canvas | Xem xét pinch bằng hai ngón cho map/ảnh và cách pan không cản cuộn trang. | Cần thử trên iPhone/Safari thật. Branch hiện tại giữ cuộn trang và pinch của browser. |
| Nút pan bốn hướng | Đặt trong một menu điều hướng nhỏ, bổ sung cho kéo chuột và phím mũi tên. | Giữ cụm `−`/`+` gọn; không bày mọi công cụ thường trực. |
| Chép tọa độ luyện tập | Chỉ thêm nút sao chép khi lineup có tọa độ CS2 thật và nguồn rõ ràng. | Tọa độ marker 0–1000 của ứng dụng không phải tọa độ thế giới CS2; không chuyển đổi bằng phỏng đoán. |

## Các nguyên tắc UI cần duy trì

- **Zoom có điểm quay về.** Hiển thị phần trăm và nút fit rõ ràng; đổi slide phải đưa ảnh mới về fit. Khi ảnh đang phóng to, phím mũi tên trong vùng ảnh dùng để pan; ở mức 100%, trái/phải tiếp tục chuyển slide.
- **Thao tác không lan sang vùng khác.** Con lăn trên map/ảnh điều khiển vùng đó; con lăn trong danh sách vẫn cuộn danh sách. Phím tắt chỉ xử lý khi vùng xem có focus, để người dùng vẫn nhập nội dung và dùng zoom của browser bình thường. Tài liệu [MDN về wheel event](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event) giải thích sự khác biệt giữa wheel, scroll và thao tác zoom của browser.
- **Nút gần nhau nhưng vùng bấm đủ lớn.** W3C quy định mức tối thiểu 24 × 24 CSS px hoặc khoảng cách/thay thế phù hợp trong [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Với cảm ứng, tiếp tục mục tiêu 44px của thiết kế hiện có.
- **Có cách thay thế cho kéo.** Phím mũi tên hữu ích cho người dùng bàn phím. Để đáp ứng đầy đủ tiêu chí [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), còn cần thao tác con trỏ không kéo như nút pan bốn hướng. Các bổ sung hiện tại không đồng nghĩa toàn bộ ứng dụng đã đáp ứng đầy đủ WCAG.
- **Giữ bản đồ đúng tỷ lệ.** Fit toàn bộ map cần giữ hình học và tọa độ. Một cửa sổ rất rộng nhưng thấp vẫn có khoảng trống hai bên ở mức fit; cho người dùng zoom và pan sẽ hữu ích hơn kéo giãn bản đồ.
- **Hướng dẫn có nguồn và trạng thái rõ ràng.** Giữ creator/source, phân biệt video minh họa với dữ liệu đã được người chơi tự thử. Một link video còn hoạt động không chứng minh lineup còn đúng sau khi map thay đổi.

## Những phần nên để sau

Đồng bộ realtime, tài khoản Steam, quyền truy cập theo team, phân tích demo tự động và thống kê trận có thể hữu ích khi phạm vi người dùng lớn hơn. Chúng cần backend, chính sách chia sẻ và cách xử lý xung đột; chưa phải bước nhỏ phù hợp với mục tiêu chỉnh Lineups hiện tại.

Lần tiếp theo nên chọn một luồng để hoàn thiện: **mở lại lineup gần đây**, hoặc **chia sẻ và nhập một bộ lineup cho người bạn**. Hoàn thành một trong hai sẽ đem lại lợi ích dễ kiểm chứng hơn việc thêm nhiều workspace mới cùng lúc.
