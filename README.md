# Dòng chảy lịch sử

Trang web học lịch sử Việt Nam qua **cuộn phim tư liệu**, **video** và **mô hình 3D có thể tương tác**.

- 44 sự kiện theo niên biểu Chương trình GDPT 2018, chia 7 thời kỳ: từ dấu tích Người tối cổ, thời dựng nước Văn Lang – Âu Lạc, các quốc gia cổ Phù Nam – Chăm-pa, thời Bắc thuộc, các triều đại phong kiến, thời Pháp thuộc đến công cuộc Đổi mới và hội nhập quốc tế
- Mỗi sự kiện: nội dung theo sách giáo khoa, video tiếng Việt đã kiểm chứng, 5 câu trắc nghiệm
- 4 mô phỏng 3D tả thực: **Người tối cổ**, **Sơn Vi – Hòa Bình – Bắc Sơn**, **Thành Cổ Loa** và **Hội thề Hát Môn**, với hai chế độ điều khiển:
  - **Bản đồ** (mặc định, giống Google Maps): kéo để di chuyển; kéo chuột phải hoặc Ctrl + kéo để xoay và nghiêng; lăn chuột hoặc chụm hai ngón để phóng to về phía con trỏ; nút la bàn, 2D/3D và toàn cảnh (`src/three/controls.js`, lớp `MapNavControls`)
  - **Đi bộ**: đi tiến, lùi, trái, phải, bay lên, phóng to (lớp `WalkControls`)
- Bản đồ Việt Nam tương tác (thể hiện quần đảo Hoàng Sa, Trường Sa)
- Lưu tiến độ học: ngay trên trình duyệt khi chưa đăng nhập, hoặc vào **tài khoản** (đăng ký / đăng nhập) để học tiếp trên máy khác
- **Giảng viên AI** dùng Groq API (miễn phí), có thể chuyển sang Claude API (Anthropic)

---

## 1. Cấu trúc thư mục

```
dong-chay-lich-su/
├── server.js              Máy chủ Node.js (Express): phục vụ trang web + API giảng viên AI + API tài khoản
├── server/teacher.js      Gọi Groq / Claude API, lời dặn (system prompt) cho giảng viên AI
├── server/accounts.js     Đăng ký, đăng nhập, lưu tiến độ học vào tài khoản
├── server/db.js           Cơ sở dữ liệu SQLite (file data/dong-chay-lich-su.db — không đưa lên GitHub)
├── server/admin.js        Công cụ quản trị: xem danh sách tài khoản, đặt lại mật khẩu
├── src/
│   ├── data/events.js     NỘI DUNG 12 sự kiện đầu tiên + danh sách thời kỳ   ← sửa nội dung ở đây
│   ├── data/events-more.js NỘI DUNG 32 sự kiện bổ sung theo niên biểu GDPT 2018
│   ├── data/media.js      VIDEO và ẢNH của 12 sự kiện đầu tiên        ← đổi video, ảnh ở đây
│   ├── data/media-more.js VIDEO của 32 sự kiện bổ sung
│   ├── data/vietnamMap.js Dữ liệu bản đồ (tự sinh, không sửa tay)
│   ├── pages/             Các trang (Trang chủ, Học tập, Sự kiện, Mô phỏng 3D, Giảng viên AI…)
│   ├── components/        Thành phần giao diện (cuộn phim, bản đồ, trắc nghiệm, video…)
│   ├── three/             Bộ máy 3D: địa hình, nước, nhà sàn, trống đồng, cảnh Cổ Loa, Hát Môn
│   └── styles/            Giao diện (màu sắc, phông chữ…)
└── public/
    ├── images/            Ảnh sự kiện (Wikimedia Commons) và ảnh nền
    └── 3d/                Bầu trời HDRI, vân bề mặt, mô hình 3D (Poly Haven, CC0)
        └── sketchfab/     ← nơi đặt mô hình bạn tải từ Sketchfab (xem mục 4)
```

## 2. Chạy thử trên máy tính

Cần **Node.js 22.13 trở lên** (chức năng tài khoản dùng SQLite có sẵn trong Node từ bản này).

```bash
npm install
```

Tạo file `.env` (sao chép từ `.env.example`) rồi điền khóa API **miễn phí** của Groq (cách lấy khóa: xem mục 7):

```
GROQ_API_KEY=gsk_...
```

Chạy bản hoàn chỉnh (giống khi đưa lên mạng):

```bash
npm run build
npm start
```

Mở http://localhost:3000

Khi đang sửa giao diện, chạy song song hai lệnh trong hai cửa sổ dòng lệnh để trang tự cập nhật:

```bash
npm run dev:api
npm run dev
```

rồi mở http://localhost:5173

## 3. Sửa nội dung

| Muốn sửa | Mở file |
|---|---|
| Nội dung, diễn biến, ý nghĩa, câu hỏi trắc nghiệm | `src/data/events.js` (12 sự kiện đầu) hoặc `src/data/events-more.js` (32 sự kiện bổ sung) |
| Thêm sự kiện mới | Thêm vào `src/data/events-more.js` với `sortYear` (năm bắt đầu, TCN ghi số âm) — trang tự xếp đúng tiến trình và tự đánh số khung phim |
| Đổi video YouTube | `src/data/media.js` hoặc `src/data/media-more.js` — thay `youtubeId` (phần sau `v=` trong link) |
| Đổi ảnh minh họa | chép ảnh vào `public/images/events/` rồi sửa `src` trong `src/data/media.js` hoặc `src/data/media-more.js` |
| Lời dặn cho giảng viên AI | `server/teacher.js` (biến `SYSTEM_BASE`) |
| Màu sắc, phông chữ, bảng màu chế độ tối | `src/styles/tokens.css` (khối `:root[data-theme='dark']` là màu chế độ tối) |
| Hiệu ứng chuyển động (hiện dần khi cuộn, chuyển trang, nút, pháo giấy…) | `src/styles/motion.css`, `src/lib/motion.jsx` — tự tắt khi máy bật chế độ “giảm chuyển động” |

Mỗi ảnh nên có hai cỡ: `ten-anh.jpg` (rộng ~1400px) và `ten-anh-sm.jpg` (rộng ~720px).

**Video của 32 sự kiện bổ sung:** đã kiểm tra video còn hoạt động, cho phép phát trên trang, đúng kênh, đúng chủ đề; nhưng YouTube không cho tải phụ đề nên **chưa đối chiếu toàn bộ lời thoại với SGK** (mỗi video đều có ghi chú này). Thầy cô nên xem trước khi dùng để dạy.

**Ảnh của 32 sự kiện bổ sung:** 30 sự kiện đã có ảnh lấy từ Wikimedia Commons, chỉ dùng ảnh giấy phép tự do (Public domain, CC0, CC BY, CC BY-SA). Tên tác giả, giấy phép và đường dẫn trang gốc ghi ngay dưới mỗi ảnh và trong `src/data/media-more.js`. Ảnh CC BY / CC BY-SA bắt buộc giữ dòng ghi tác giả này khi dùng lại.

**Ảnh do nhóm thực hiện cung cấp:** “Chiến tranh bảo vệ Tổ quốc” (`bao-ve-to-quoc-1979.jpg`, ghi “Ảnh tư liệu”), “Triệu Quang Phục giữ nước Vạn Xuân” (`trieu-viet-vuong.jpg`, ghi “Tranh minh họa”) chưa có tên tác giả; “Họ Khúc và Dương Đình Nghệ giành quyền tự chủ” (`duong-dinh-nghe.jpg`) ghi “Tranh: Đại Việt Kỳ Nhân” theo con dấu trên tranh. Khi biết nguồn, hãy ghi vào `credit` và `source` trong `src/data/media.js` / `src/data/media-more.js`.

Tranh Dương Đình Nghệ chỉ rộng 423px nên hơi mờ trên màn hình lớn; nếu tìm được bản lớn hơn, chép đè vào `public/images/events/duong-dinh-nghe.jpg` và `duong-dinh-nghe-sm.jpg`.

## 4. Thêm mô hình 3D tải từ Sketchfab

Cảnh 3D đã có đầy đủ địa hình, nhà sàn, trống đồng, thuyền, cờ, cây cối. Cảnh Hội thề Hát Môn còn có hai voi chiến chở Trưng Trắc, Trưng Nhị (kèm quản tượng), 34 nghĩa binh và trống trận trên giá — dựng bằng mã nguồn trong `src/three/models/voiChien.js` (chuyển từ file mô hình nhóm thực hiện cung cấp). Người, voi chiến tả thực thì cần tải thêm; khi có, chúng đứng phía sau đội hình nghĩa quân. Cảnh thành Cổ Loa được dựng dạng sa bàn: ba bậc thành cao dần vào trong, hàng rào gỗ và quân giữ thành trên mép mỗi bậc, hào nước, xóm nhà sàn mái tròn và quân Triệu Đà dàn trận ngoài thành (`src/three/scenes/coLoa.js`). Hai sự kiện thời nguyên thủy cũng có mô phỏng 3D: bầy Người tối cổ bên hang đá vôi (`nguoiToiCo.js`) và thị tộc Người tinh khôn bên mái đá — văn hóa Sơn Vi, Hòa Bình, Bắc Sơn (`hoaBinh.js`); núi đá vôi, người nguyên thủy và công cụ đá dựng bằng mã nguồn trong `src/three/models/nguyenThuy.js`.
Đăng nhập Sketchfab, mở từng link dưới đây, bấm **Download 3D Model** → chọn định dạng **glTF Binary (.glb)**,
rồi **đổi tên file** và đặt vào thư mục `public/3d/sketchfab/`:

| Mô hình | Link | Đổi tên thành | Giấy phép |
|---|---|---|---|
| Trống đồng Đông Sơn – Việt Nam (tác giả **ndnguyen3d**) | https://sketchfab.com/3d-models/trong-ong-ong-son-viet-nam-21e418a517a74b49a17ebbad94ba26c0 | `trong-dong.glb` | CC BY 4.0 |
| Voi tả thực “Elephant – Realistic” (tác giả **MONKEY D. LUFFY**) | https://sketchfab.com/3d-models/elephant-realistic-a9e7ac1424fc4c62a528a3e24201e61a | `voi.glb` | CC BY 4.0 |
| “Tribal Man” — đại diện nghĩa quân Lạc Việt (tác giả **Çağhan Büyükavcı**) | https://sketchfab.com/3d-models/tribal-man-f9efa0a9e9e048849e5240947a1f0f26 | `chien-binh.glb` | CC BY 4.0 |

Không cần sửa code: khi có file, mô hình **tự xuất hiện** đúng kích thước thật (voi cao 3 m, người 1,65 m,
trống đồng 0,63 m), đặt sát mặt đất ở đàn thề Hát Môn và bãi tập trong thành Cổ Loa.
Giấy phép CC BY yêu cầu **ghi tên tác giả**: mục “Nguồn tư liệu và mô hình” (nút ⓘ trong trang mô phỏng) tự thêm dòng ghi tên tác giả khi mô hình được nạp.

Nếu file quá nặng (trên ~15 MB), có thể nén bằng công cụ gltf-transform:

```bash
npx @gltf-transform/cli optimize voi.glb voi.glb --compress meshopt --texture-compress webp --texture-size 1024
```

## 5. Đưa mã nguồn lên GitHub

1. Tạo kho (repository) mới trên https://github.com/new — đặt tên ví dụ `dong-chay-lich-su`, **không** tích “Add a README”.
2. Trong thư mục dự án, chạy:

```bash
git init
git add .
git commit -m "Phiên bản đầu tiên: Dòng chảy lịch sử"
git branch -M main
git remote add origin https://github.com/<tên-tài-khoản>/dong-chay-lich-su.git
git push -u origin main
```

File `.env` chứa khóa API **đã được chặn** trong `.gitignore`, sẽ không bị đưa lên GitHub. Tuyệt đối không dán khóa API vào code.

## 6. Triển khai lên Hostinger

Trang web cần **máy chủ Node.js** (vì có giảng viên AI). Trên Hostinger, chọn gói **Business Web Hosting** hoặc **Cloud** (các gói này hỗ trợ ứng dụng Node.js), hoặc **VPS**.
Gói Premium/Single chỉ chạy được web tĩnh.

### Cách A — Gói Business/Cloud (ứng dụng Node.js trong hPanel)

1. Vào **hPanel** → **Websites** → **Add Website** → **Node.js web app**.
2. Chọn tên miền, hoặc bấm **Use temporary domain** để nhận ngay một địa chỉ miễn phí dạng `...hostingersite.com` (gắn tên miền riêng sau cũng được).
3. Ở mục **Import your Git repository**: bấm **Connect with GitHub**, cho phép (Authorize) ứng dụng Hostinger trên GitHub, rồi chọn kho `Dongchaylichsuh` → **Next**.
4. Ở **Build and output settings**:
   - Framework preset: **Express** (nếu không có thì chọn **Other**)
   - Branch: `main`
   - Node.js version: **22.x** (cần bản 22.13 trở lên cho chức năng tài khoản; nếu nhật ký báo lỗi `node:sqlite` thì chọn **24.x**)
   - Package manager: **npm**
   - Build command: `build`
   - Entry file: `server.js`
5. Thêm **Environment Variables** (biến môi trường), mỗi biến bấm **Add environment variable**:
   - `GROQ_API_KEY` = khóa API Groq (người quản lý tự dán; **không** đưa khóa vào mã nguồn)
   - `NODE_ENV` = `production`
   - (Nếu dùng Claude thay cho Groq: `AI_PROVIDER` = `claude`, `ANTHROPIC_API_KEY` = khóa Anthropic, `CLAUDE_MODEL` = `claude-haiku-5-5` hoặc `claude-opus-5-5`)
   - `DATA_DIR`: **không cần đặt**. Trên Hostinger, dữ liệu tài khoản tự lưu ở `~/dong-chay-lich-su-data/`, nằm ngoài thư mục ứng dụng nên không bị xóa khi triển khai lại (mỗi lần triển khai, Hostinger tạo thư mục build mới trong `.../hbuilds/` và bỏ thư mục cũ).
6. Bấm **Continue** → **Deploy**. Xem tiến trình ở **Deployments**, nhật ký máy chủ ở **Runtime Logs** (dòng “Tài khoản người học: lưu tại …” cho biết chỗ lưu dữ liệu).
7. Từ đó, mỗi lần `git push` lên nhánh `main`, Hostinger **tự động** cài đặt, build và khởi động lại. Sửa biến môi trường xong bấm lưu cũng tự triển khai lại.
8. Gắn tên miền riêng: trên bảng điều khiển của web, bấm **Connect domain** và làm theo hướng dẫn DNS; chứng chỉ SSL (HTTPS) tự cài khi tên miền đã trỏ về Hostinger.

Kiểm tra: mở `https://ten-mien-cua-ban/api/health` — nếu thấy `"ai": true` là giảng viên AI đã sẵn sàng (`"provider"` cho biết đang dùng Groq hay Claude).

Lưu ý: gói Business/Cloud không chạy được lệnh `npm` qua SSH, nên lệnh quản lý tài khoản ở mục 7b (đặt lại mật khẩu) có thể không dùng được trên Hostinger; khi đó học sinh quên mật khẩu thì tạo tài khoản mới. Web cũng có thể “ngủ” khi lâu không có ai truy cập; lượt mở đầu tiên sau đó sẽ chậm vài giây.

### Cách B — VPS (Ubuntu)

```bash
# Cài Node.js 22 và PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2

# Lấy mã nguồn và chạy
git clone https://github.com/<tên-tài-khoản>/dong-chay-lich-su.git
cd dong-chay-lich-su
npm install
cp .env.example .env && nano .env      # điền GROQ_API_KEY
npm run build
NODE_ENV=production pm2 start server.js --name dong-chay-lich-su
pm2 save && pm2 startup
```

Cấu hình Nginx chuyển tiếp tên miền tới cổng 3000 (nhớ tắt bộ đệm để giảng viên AI trả lời mượt):

```nginx
server {
  server_name ten-mien-cua-ban.vn;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
  }
}
```

Bật HTTPS miễn phí: `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx`.

### Cách C — Chạy ngay từ máy tính này (Cloudflare Tunnel, miễn phí)

Không cần thuê máy chủ: máy tính của bạn làm máy chủ, Cloudflare cấp một link HTTPS công khai.

1. Đặt chương trình `cloudflared.exe` vào thư mục `tools/`. Tải bản `cloudflared-windows-amd64.exe` tại
   [github.com/cloudflare/cloudflared/releases](https://github.com/cloudflare/cloudflared/releases) rồi đổi tên.
   Thư mục `tools/` không được đưa lên GitHub.
2. Nhấp đúp **`CHAY-WEB-CONG-KHAI.bat`**. Script tự dựng giao diện (nếu chưa có), bật máy chủ web, mở đường hầm,
   rồi hiện link dạng `https://….trycloudflare.com`. Link được chép sẵn (Ctrl+V để dán) và lưu vào `link-cong-khai.txt`.
3. **Giữ cửa sổ đó mở**, máy bật và có mạng. Trong lúc chạy, script giữ cho máy không tự ngủ. Đóng cửa sổ là web ngừng.

Lưu ý: mỗi lần chạy lại, link sẽ **khác**. Đây là đường hầm nhanh của Cloudflare, không cam kết chạy liên tục,
nên hợp để trình diễn hoặc cho giám khảo xem trong buổi thi. Muốn link cố định, dùng Cách A/B hoặc một tên miền gắn vào Cloudflare.
Tài khoản người học vẫn lưu trên máy này (thư mục `data/`).

### Cách D — Render miễn phí + Turso (link cố định, không cần bật máy)

Render (gói Free) chạy web từ repo GitHub và cho link cố định dạng `https://….onrender.com`. Render miễn phí không giữ
được file, nên tài khoản người học lưu ở **Turso** (cơ sở dữ liệu trên mạng, gói miễn phí).

1. **Turso:** đăng nhập [turso.tech](https://turso.tech) (có thể bằng GitHub) → tạo database (chọn vùng gần Singapore nếu có) →
   ghi lại **Database URL** (dạng `libsql://…turso.io`) và tạo **Token**.
2. **Render:** đăng nhập [render.com](https://render.com) bằng GitHub → **New → Blueprint** → chọn repo này.
   Render đọc file `render.yaml` và hỏi 3 giá trị bí mật: `GROQ_API_KEY`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`. Bạn tự dán vào.
3. Bấm **Deploy**. Mỗi lần `git push` lên nhánh `main`, Render tự cập nhật web.

Lưu ý gói miễn phí: web "ngủ" sau 15 phút không ai vào, người đầu tiên mở lại phải chờ khoảng 1 phút.
Dữ liệu tài khoản nằm an toàn ở Turso nên không mất khi web ngủ hay khi triển khai lại.
Công cụ `npm run tai-khoan` cũng làm việc với Turso nếu file `.env` trên máy có hai biến `TURSO_…` ở trên.

## 7. Giảng viên AI và chi phí

### Mặc định: Groq (miễn phí)

1. **Người từ 18 tuổi trở lên** (ví dụ thầy cô hướng dẫn) đăng ký tài khoản tại https://console.groq.com — không cần thẻ thanh toán.
2. Vào **API Keys** (https://console.groq.com/keys) → **Create API Key** → sao chép khóa (bắt đầu bằng `gsk_`).
3. Dán vào file `.env`: `GROQ_API_KEY=gsk_...`, rồi khởi động lại máy chủ (`npm start`).
4. Kiểm tra: mở `http://localhost:3000/api/health` — thấy `"ai": true, "provider": "groq"` là xong.

Cách hoạt động và giới hạn:
- Dùng model `qwen/qwen3.8-27b` (không bật chế độ suy nghĩ để trả lời nhanh). Khi thử trên các câu hỏi mẫu, qwen bám đúng tư liệu nhất; các model gpt-oss hay bịa chi tiết (kể cả ở mức suy nghĩ vừa), nên mặc định **không dùng model dự phòng**. Có thể đổi mức suy nghĩ bằng `GROQ_REASONING_EFFORT` (low | medium | high).
- Độ ngẫu nhiên (temperature) mặc định 0,3 để model bám sát tư liệu, ít bịa và ít lẫn chữ lạ; đổi bằng `GROQ_TEMPERATURE`. Máy chủ cũng tự lọc bỏ chữ Hán nếu model lỡ chèn vào câu trả lời. Gói miễn phí giới hạn **riêng cho từng model** (khoảng 30 câu/phút, 1.000 câu/ngày nhưng chỉ khoảng 8.000 token/phút — tức chừng 2–3 câu hỏi mỗi phút cho cả trang; xem số chính xác trong trang **Limits** của tài khoản). Khi hết lượt, học sinh được nhắn đợi khoảng một phút rồi hỏi lại. Nếu cần phục vụ nhiều người cùng lúc hơn, có thể bật model dự phòng bằng `GROQ_FALLBACK_MODELS=openai/gpt-oss-120b,openai/gpt-oss-20b` (máy chủ tự chuyển sang model này khi model chính hết lượt), chấp nhận câu trả lời kém chính xác hơn.
- Để tiết kiệm hạn mức, mỗi câu hỏi chỉ gửi kèm tư liệu của 1–2 sự kiện liên quan (tìm theo tên sự kiện, nhân vật, địa danh, mốc năm — gõ không dấu vẫn tìm được) và 6 tin nhắn gần nhất.
- Groq cam kết không dùng câu hỏi và câu trả lời để huấn luyện AI (Groq Services Agreement, điều 4.2).
- Muốn đổi model: sửa `GROQ_MODEL` và `GROQ_FALLBACK_MODELS` trong `.env` (danh sách model: https://console.groq.com/docs/models).

**Không dùng Gemini API của Google:** điều khoản của Google (cả AI Studio lẫn Google Cloud) cấm dùng Gemini trong website mà người dưới 18 tuổi có thể truy cập.

### Tùy chọn: Claude (trả phí, chất lượng cao hơn)

- Đặt `AI_PROVIDER=claude` và `ANTHROPIC_API_KEY=...` (lấy tại https://platform.claude.com, mục **API Keys**, nạp tiền theo hướng dẫn của Anthropic).
- `CLAUDE_MODEL=claude-opus-5-5` (chất lượng cao nhất, 4 USD / 20 USD cho mỗi triệu token vào/ra) hoặc `claude-haiku-5-5` (0,1 USD / 0,5 USD mỗi triệu token).
- Với Claude, mỗi câu hỏi gửi kèm đủ tư liệu 12 sự kiện (được lưu đệm để giảm chi phí), mức suy nghĩ “low”, tự chuyển sang model dự phòng khi model chính từ chối trả lời (server-side fallback).

### Chung cho cả hai

- Mỗi người dùng tối đa 30 câu hỏi / 10 phút; câu hỏi dài tối đa 1.500 ký tự.
- Lời dặn đã giới hạn giảng viên chỉ trả lời về lịch sử, bằng tiếng Việt, theo sách giáo khoa; trang Giảng viên AI ghi rõ người học đang trò chuyện với AI.

## 7b. Tài khoản người học

- Trang **Tài khoản** (`/tai-khoan`, nút trên thanh điều hướng): đăng ký, đăng nhập, đăng xuất, đổi mật khẩu, xóa tài khoản.
- Chưa đăng nhập: tiến độ lưu trên trình duyệt như trước. Khi đăng nhập / đăng ký, tiến độ đã học trên trình duyệt được **gộp vào tài khoản**; từ đó mọi thay đổi tự lưu lên máy chủ và học tiếp được trên máy khác.
- **Chỉ lưu những gì cần thiết**: tên đăng nhập, tên hiển thị (có thể là biệt danh), mật khẩu đã băm (scrypt) và tiến độ học. Không thu thập email, số điện thoại, ngày sinh.
- Bảo mật: phiên đăng nhập nằm trong cookie `HttpOnly`, `SameSite=Lax` (tự bật `Secure` khi chạy HTTPS); cơ sở dữ liệu chỉ lưu mã băm của phiên; giới hạn 20 lần đăng nhập / đăng ký mỗi 15 phút cho mỗi IP; đổi mật khẩu sẽ đăng xuất các thiết bị khác.
- Dữ liệu nằm trong file `data/dong-chay-lich-su.db` (đổi thư mục bằng `DATA_DIR`). File này đã được chặn trong `.gitignore`. **Hãy sao lưu file này định kỳ** — mất file là mất toàn bộ tài khoản.
- Không có "quên mật khẩu qua email" (vì không thu thập email). Khi học sinh quên mật khẩu, người quản lý chạy trên máy chủ:

```bash
npm run tai-khoan -- danh-sach
npm run tai-khoan -- doi-mat-khau <tên đăng nhập>
```

  Lệnh thứ hai in ra một mật khẩu tạm; đưa cho học sinh và nhắc đổi mật khẩu mới trong trang Tài khoản.
- Trang dành cho học sinh (có em dưới 16 tuổi): trước khi mở cho nhiều người dùng, nên hỏi ý kiến thầy cô / nhà trường về quy định bảo vệ dữ liệu cá nhân của trẻ em (Nghị định 13/2023/NĐ-CP).

## 7c. Thống kê lượt truy cập

Trang web tự đếm lượt xem (mã nguồn: `server/stats.js`, `src/lib/stats.js`), không dùng dịch vụ bên ngoài:

- Mỗi lần mở một trang, trình duyệt báo cho máy chủ **đường dẫn trang** đó. Máy chủ cộng vào số lượt xem theo ngày (giờ Việt Nam) và theo trang.
- **Số người xem trong ngày** được ước tính bằng mã băm của (ngày + IP + trình duyệt) với khóa bí mật. Mã đổi mỗi ngày nên không theo dõi được ai qua nhiều ngày; sang ngày mới, các mã cũ bị xóa, chỉ còn con số tổng. **Không cookie, không lưu IP.**
- Không đếm: bot / công cụ tự động, trình duyệt bật *Do Not Track* hoặc *Global Privacy Control*, chính trang thống kê. Đường dẫn không có thật được gom vào mục "(trang khác)".
- Số liệu lưu cùng chỗ với tài khoản (file trong `data/` hoặc Turso).

Xem số liệu bằng một trong hai cách:

```bash
npm run tai-khoan -- thong-ke
```

hoặc mở trang **`/thong-ke`** trên web (không có trên thanh menu) và nhập mật khẩu quản trị. Trang này chỉ bật khi máy chủ có biến
`STATS_PASSWORD` (trong `.env`, hoặc trong mục Environment của Render). Trang có: lượt xem / người xem hôm nay, 7 ngày, 30 ngày;
biểu đồ từng ngày (kèm bảng số); 10 trang được xem nhiều nhất; số tài khoản người học.

## 8. Nguồn tư liệu và giấy phép

- Nội dung chữ: biên soạn theo SGK Lịch sử (Bộ GD&ĐT), Đại Việt sử ký toàn thư.
- Video: nhúng từ YouTube (EZ Sử, Việt Sử Dễ Hiểu, QPVN, Bảo tàng Hồ Chí Minh, ANTV, VTC1) — bản quyền thuộc các kênh; đã đối chiếu lời thoại với SGK, ghi chú dưới video.
- Ảnh: Wikimedia Commons (phạm vi công cộng, CC0, CC BY, CC BY-SA) — tác giả ghi dưới từng ảnh. Ảnh “Chiến thắng Bạch Đằng” và nền bản đồ cổ do nhóm tác giả cung cấp.
- Bản đồ: Natural Earth (phạm vi công cộng).
- 3D: Poly Haven (CC0) — bầu trời HDRI, vân bề mặt, cây, bụi, đá, giỏ, chum, thang, bến gỗ; ảnh mặt nước của three.js (MIT). Nhà sàn, trống đồng, nỏ, thuyền, vọng lâu, cờ, tre, cỏ được dựng bằng mã nguồn.
- Phông chữ: Be Vietnam Pro (chữ thường), Playfair Display (tiêu đề) — Google Fonts, SIL Open Font License.
- Thư viện: React, React Router, Three.js, Express, Anthropic SDK, lucide-react. Giảng viên AI gọi Groq API (GroqCloud) hoặc Claude API.
