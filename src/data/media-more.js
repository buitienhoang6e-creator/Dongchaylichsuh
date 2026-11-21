/**
 * VIDEO CỦA CÁC SỰ KIỆN BỔ SUNG (events-more.js)
 * ------------------------------------------------------------
 * Cách đổi video giống media.js: thay `youtubeId` bằng mã video mới.
 *
 * Kiểm tra (tháng 11/2026): từng video được mở qua YouTube để xác nhận còn hoạt động,
 * cho phép phát nhúng trên trang web, đúng kênh, đúng thời lượng và đúng chủ đề bài học.
 * YouTube không cho tải phụ đề tự động nên CHƯA đối chiếu toàn bộ lời thoại với SGK:
 * thầy cô nên xem trước khi dùng để dạy; nếu có điểm khác, hãy theo phần chữ của trang.
 *
 * ẢNH: lấy từ Wikimedia Commons, chỉ dùng ảnh giấy phép tự do (Public domain, CC0, CC BY, CC BY-SA).
 *   Mỗi ảnh có 2 cỡ trong public/images/events/: ten-anh.jpg (1400px) và ten-anh-sm.jpg (720px).
 *   Khi đổi ảnh, nhớ sửa `credit` (tác giả), `license` (giấy phép) và `source` (trang gốc).
 *   Sự kiện chưa tìm được ảnh tự do phù hợp để `image: null` → trang hiện bảng niên đại thay ảnh.
 */

const yt = (youtubeId, title, channel, duration, verify, note) => ({ youtubeId, title, channel, duration, verify, note });

const LINK_OK = 'Đã kiểm tra: video hoạt động, cho phép phát trên trang, đúng chủ đề bài học';
const OFFICIAL = 'Nguồn chính thống';
const NOT_TRANSCRIBED = 'Chưa đối chiếu toàn bộ lời thoại với SGK — nếu có điểm khác, hãy theo phần chữ của trang.';

export const MEDIA_MORE = {
  'dau-tich-nguoi-toi-co': {
    image: {
      src: '/images/events/nguoi-nguyen-thuy.jpg',
      alt: 'Mô hình tái hiện cuộc sống của người nguyên thủy trong hang đá, trưng bày tại Bảo tàng Lịch sử Quốc gia (Hà Nội)',
      credit: 'Gary Todd',
      license: 'CC0',
      source: 'https://commons.wikimedia.org/wiki/File:Neolithic_Diorama_(9732878897).jpg',
    },
    videos: [
      yt('B-bzAZa0Q7Q', 'CHƯƠNG 2: XÃ HỘI NGUYÊN THỦY | LỊCH SỬ & ĐỊA LÝ 6 - KẾT NỐI TRI THỨC', 'Luyện thi cùng cô Thu', '5:13', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'van-hoa-son-vi-hoa-binh-bac-son': {
    image: {
      src: '/images/events/cong-cu-son-vi.jpg',
      alt: 'Công cụ đá cuội ghè đẽo của văn hóa Sơn Vi',
      credit: 'AReinecke',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Son_Vi-Industrie.jpg',
    },
    videos: [
      yt('tPm4EPg6h78', 'Thời đồ đá cũ - Văn hoá Sơn Vi - Những người Việt cổ đầu tiên #lichsuvietnam', 'Kiến Thức Mỗi Ngày', '3:14', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('zsqiDu3ViRI', 'Văn hoá Hoà Bình - Khởi nguyên của người Việt cổ', 'Kiến Thức Mỗi Ngày', '3:28', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('jLbXANtg6zU', 'Văn hoá Bắc Sơn - Dấu ấn chuyển mình của thời đồ đá mới Việt Nam #lichsuvietnam', 'Kiến Thức Mỗi Ngày', '3:31', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'van-hoa-phung-nguyen-dong-dau-go-mun': {
    image: {
      src: '/images/events/gom-phung-nguyen.jpg',
      alt: 'Bình và nồi gốm của văn hóa Phùng Nguyên trưng bày ở bảo tàng',
      credit: 'Gary Todd',
      license: 'CC0',
      source: 'https://commons.wikimedia.org/wiki/File:Phung_Nguyen_Culture_Pots_and_Cooking_Pots.jpg',
    },
    videos: [
      yt('Ev-_IVCzhqI', 'Văn hóa Phùng Nguyên – Bước chuyển vàng trong lịch sử Việt Nam thời đại đồ đồng #lichsuvietnam', 'Kiến Thức Mỗi Ngày', '3:28', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('Wraoo0LR8Dw', 'Văn hóa Đồng Đậu – Nền tảng vững chắc trong lịch sử Việt Nam thời đại đồng thau #lichsuvietnam', 'Kiến Thức Mỗi Ngày', '4:12', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('532zWh7fbx0', 'Văn hóa Gò Mun – Gạch nối quan trọng giữa văn hóa Phùng Nguyên và Đông Sơn', 'Kiến Thức Mỗi Ngày', '3:41', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'van-hoa-dong-son': {
    image: {
      src: '/images/events/trong-dong-ngoc-lu.jpg',
      alt: 'Trống đồng Ngọc Lũ (Hà Nam) – hiện vật tiêu biểu của văn hóa Đông Sơn',
      credit: 'VuThiAnh',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:Ngoc_Lu.jpg',
    },
    videos: [
      yt('Ej4ptGF2hug', 'Thông tin lịch sử Việt Nam Thời Kì Đồ Đồng | văn hóa Đông Sơn | Trống Đồng Đông Sơn - Phong Sử', 'Phong Sử', '9:24', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('7LLaqbxy770', 'Cận cảnh chi tiết đặc biệt của Trống Đồng Đông Sơn 2000 năm tuổi được Pháp bàn giao', 'VTV8 - ĐÀI TRUYỀN HÌNH VIỆT NAM', '12:47', `${OFFICIAL}. ${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'nha-nuoc-van-lang': {
    image: {
      src: '/images/events/den-hung.jpg',
      alt: 'Đền Thượng trên núi Nghĩa Lĩnh, khu di tích Đền Hùng (Phú Thọ) – nơi thờ các Vua Hùng',
      credit: 'Thang Nguyen',
      license: 'CC BY-SA 2.0',
      source: 'https://commons.wikimedia.org/wiki/File:%C4%90%E1%BB%81n_H%C3%B9ng,_%C4%91%E1%BB%81n_Th%C6%B0%E1%BB%A3ng.jpg',
    },
    videos: [
      yt('nGDnoy9cuQw', 'Tóm tắt: Thời kỳ Văn Lang - Âu Lạc (800 TCN - 208 TCN) | Thời Hồng Bàng | Lịch sử Việt Nam', 'Sử Lược - Tóm Tắt Lịch Sử', '10:25', `${LINK_OK}.`, 'Lưu ý: tiêu đề video ghi mốc 800 TCN; SGK ghi nhà nước Văn Lang ra đời khoảng thế kỷ VII TCN. ' + NOT_TRANSCRIBED),
      yt('DbL-hfZDqwo', 'Lịch sử 10 - Bài 9 - Một số nền văn minh cổ trên đất nước Việt Nam - vninfographic', 'vninfographic', '5:59', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'vuong-quoc-phu-nam': {
    image: {
      src: '/images/events/tuong-oc-eo.jpg',
      alt: 'Tượng đá thuộc văn hóa Óc Eo – dấu tích của vương quốc Phù Nam',
      credit: 'Gary Todd',
      license: 'CC0',
      source: 'https://commons.wikimedia.org/wiki/File:Oc_Eo_Culture_Statue.jpg',
      position: 'center 5%',
    },
    videos: [
      yt('zhrVatRQFlY', 'Văn hóa Óc Eo và Vương quốc Phù Nam | Lịch sử phổ thông', 'Từ điển SAMDICT', '4:31', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('f6Q7VU3o3lc', 'Vương quốc Phù Nam: Đế chế HÙNG MẠNH đầu tiên ở Đông Nam Á | Tóm Tắt Lịch Sử Việt Nam', 'Sử Lược - Tóm Tắt Lịch Sử', '7:11', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'vuong-quoc-cham-pa': {
    image: {
      src: '/images/events/my-son.jpg',
      alt: 'Đền tháp Chăm ở Thánh địa Mỹ Sơn (Quảng Nam)',
      credit: 'Philip Nalangan',
      license: 'CC BY 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:My_Son_Sanctuary_Vietnam_04.jpg',
    },
    videos: [
      yt('wnyYD337yQs', 'Vương quốc Chăm pa từ thế kỉ II đến thế kỉ X', 'Lớp học Lịch Sử và Địa Lí cô Phạm Hà', '5:15', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'bac-thuoc-nha-trieu-nha-han': {
    image: {
      src: '/images/events/chua-dau.jpg',
      alt: 'Chùa Dâu ở vùng Luy Lâu (Bắc Ninh) – trị sở và trung tâm Phật giáo thời Bắc thuộc',
      credit: 'Bùi Thế Tâm',
      license: 'CC BY-SA 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:ChuaDau_ToanCanh.JPG',
    },
    videos: [
      yt('zo__BPjcjPg', 'Tóm tắt nhanh: 1000 năm Bắc thuộc | Lịch sử Việt Nam', 'Sử Lược - Tóm Tắt Lịch Sử', '10:36', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'khoi-nghia-ba-trieu': {
    image: {
      src: '/images/events/tuong-ba-trieu.jpg',
      alt: 'Tượng Bà Triệu trong đền thờ trên núi Nưa (Thanh Hóa)',
      credit: 'Newone',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Newone_-_t%C6%B0%E1%BB%A3ng_B%C3%A0_Tri%E1%BB%87u_n%C3%BAi_N%C6%B0a.jpg',
      position: 'center 5%',
    },
    videos: [
      yt('6SVQ12dXV3c', 'Khởi Nghĩa Bà Triệu - EZ Sử', 'EZ Sử', '6:29', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'khoi-nghia-ly-bi': {
    image: {
      src: '/images/events/chua-tran-quoc.jpg',
      alt: 'Chùa Trấn Quốc bên Hồ Tây (Hà Nội), tiền thân là chùa Khai Quốc dựng từ thời Lý Nam Đế',
      credit: 'Jakub Hałun',
      license: 'CC BY 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Tran_Quoc_Pagoda,_Hanoi,_Vietnam,_20240123_1212_3310.jpg',
    },
    videos: [
      yt('DqJz6kdMrDI', 'Tái Hiện Lịch Sử  Triều Đại Tiền Lý (544-602): Lý Bí Và Sự Hình Thành Nước Vạn Xuân', 'CDTeam - Sử Đồ', '13:54', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'trieu-quang-phuc': {
    // Tranh do nhóm thực hiện cung cấp — khi biết tên họa sĩ hãy ghi vào credit/source.
    image: {
      src: '/images/events/trieu-viet-vuong.jpg',
      alt: 'Tranh vẽ Triệu Việt Vương (Triệu Quang Phục) mặc giáp, tay cầm kiếm',
      credit: 'Tranh minh họa',
      license: '',
      source: '',
      position: 'center 20%',
    },
    videos: [
      yt('G6SVq0UAPV4', 'Nước VẠN XUÂN 541 - 602: LÝ NAM ĐẾ - TRIỆU VIỆT VƯƠNG [Lịch sử Việt Nam P8]', 'Dòng Chảy Sử Việt', '12:57', `${LINK_OK}.`, 'Lưu ý: tiêu đề video ghi năm 541; SGK ghi khởi nghĩa Lý Bí bùng nổ năm 542. ' + NOT_TRANSCRIBED),
    ],
  },
  'khoi-nghia-mai-thuc-loan': {
    image: {
      src: '/images/events/tuong-mai-hac-de.jpg',
      alt: 'Tượng đài Mai Hắc Đế (Mai Thúc Loan)',
      credit: 'Bảo bảo 123456789',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Mai_h%E1%BA%AFc_%C4%91%E1%BA%BF.png',
      position: 'center 20%',
    },
    videos: [
      yt('5HC6hRz3vVc', 'Khởi nghĩa Mai Thúc Loan | Kể chuyện Danh nhân', 'Nghệ An TV', '3:14', `${OFFICIAL}. ${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('yn4gvSgtimw', 'MAI THÚC LOAN - PHÙNG HƯNG: Khởi Nghĩa Chống Quân Nhà ĐƯỜNG [Lịch sử Việt Nam P10]', 'Dòng Chảy Sử Việt', '9:26', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'khoi-nghia-phung-hung': {
    image: {
      src: '/images/events/tuong-phung-hung.jpg',
      alt: 'Tượng thờ Phùng Hưng ở đền thờ ông tại làng Cam Lâm, Đường Lâm (Sơn Tây, Hà Nội)',
      credit: 'Doãn Hiệu (Wikipedia tiếng Việt)',
      license: 'CC BY 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:TuongPhungHung.jpg',
      position: 'center 30%',
    },
    videos: [
      yt('yn4gvSgtimw', 'MAI THÚC LOAN - PHÙNG HƯNG: Khởi Nghĩa Chống Quân Nhà ĐƯỜNG [Lịch sử Việt Nam P10]', 'Dòng Chảy Sử Việt', '9:26', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('8K6O7YiDLA8', 'Việt Sử Truyện - Khởi nghĩa Phùng Hưng', 'Việt Sử Truyện', '7:05', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'ho-khuc-duong-dinh-nghe': {
    // Tranh do nhóm thực hiện cung cấp; tên "Đại Việt Kỳ Nhân" đọc từ con dấu đỏ ở góc tranh.
    // Khi biết tên họa sĩ hoặc link gốc, hãy ghi thêm vào credit/source.
    image: {
      src: '/images/events/duong-dinh-nghe.jpg',
      alt: 'Tranh vẽ Dương Đình Nghệ trong tư thế võ tướng, áo đen thắt đai đỏ',
      credit: 'Tranh: Đại Việt Kỳ Nhân',
      license: '',
      source: '',
      position: 'center 12%',
    },
    videos: [
      yt('KSSCE5YTFSA', 'Tóm Tắt Thời Kỳ TỰ CHỦ (905 - 938): KHÚC THỪA DỤ, DƯƠNG ĐÌNH NGHỆ [Lịch sử Việt Nam P11]', 'Dòng Chảy Sử Việt', '4:42', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'nha-ngo-12-su-quan': {
    image: {
      src: '/images/events/lang-ngo-quyen.jpg',
      alt: 'Lăng Ngô Quyền ở làng Cam Lâm, Đường Lâm (Sơn Tây, Hà Nội)',
      credit: 'Bùi Thụy Đào Nguyên',
      license: 'CC BY-SA 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:L%C4%83ng_Ng%C3%B4_Quy%E1%BB%81n.jpg',
    },
    videos: [
      yt('0TrD-u9ilfQ', 'Tóm tắt: Loạn 12 sứ quân | Đinh Tiên Hoàng | Nhà Đinh (968 - 980) | Tóm Tắt Lịch Sử', 'Sử Lược - Tóm Tắt Lịch Sử', '15:27', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'nha-dinh-dai-co-viet': {
    image: {
      src: '/images/events/den-dinh-tien-hoang.jpg',
      alt: 'Sập đá chạm rồng trước đền vua Đinh Tiên Hoàng, cố đô Hoa Lư (Ninh Bình)',
      credit: 'Nguyễn Thanh Quang',
      license: 'CC BY-SA 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:%C4%90%E1%BB%81n_%C4%90inh_Ti%C3%AAn_Ho%C3%A0ng,_s%E1%BA%A1p_r%E1%BB%93ng.JPG',
    },
    videos: [
      yt('NLRYvB5VFYk', 'Tóm tắt nhanh Đinh Bộ Lĩnh dẹp loạn 12 Sứ Quân | Lịch sử Việt Nam |  Kênh tóm tắt lịch sử - EZ Sử', 'EZ Sử', '6:53', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('Io5_1hztKNM', 'Tóm tắt: Nhà Đinh (968 - 980) | Đinh Tiên Hoàng dẹp loạn 12 sứ quân | Tóm tắt lịch sử Việt Nam', 'Sử Lược - Tóm Tắt Lịch Sử', '15:41', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'khang-chien-chong-tong-981': {
    image: {
      src: '/images/events/den-le-hoan.jpg',
      alt: 'Đền vua Lê Đại Hành (Lê Hoàn) ở cố đô Hoa Lư (Ninh Bình)',
      credit: 'Nguoivuban',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:%C4%90%E1%BB%81n_vua_L%C3%AA_Ho%C3%A0n.jpg',
    },
    videos: [
      yt('P1dimC41brI', 'Cuộc Kháng Chiến Chống Tống lần 1 | Lê Hoàn lập ra nhà Tiền Lê | Lịch sử Việt Nam - EZ Sử', 'EZ Sử', '6:46', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'nha-ly-doi-do-thang-long': {
    image: {
      src: '/images/events/tuong-ly-thai-to.jpg',
      alt: 'Tượng đài vua Lý Thái Tổ ở Hà Nội',
      credit: 'William Whyte',
      license: 'CC BY-SA 2.0',
      source: 'https://commons.wikimedia.org/wiki/File:T%C6%B0%E1%BB%A3ng_L%C3%BD_Th%C3%A1i_T%E1%BB%95_2.jpg',
      position: 'center 30%',
    },
    videos: [
      yt('qSWs47TuWyc', 'Tóm tắt nhanh: Nhà Lý (1009 - 1225) | Lịch sử Việt Nam', 'Sử Lược - Tóm Tắt Lịch Sử', '13:26', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'nha-ho-cai-cach-ho-quy-ly': {
    image: {
      src: '/images/events/thanh-nha-ho.jpg',
      alt: 'Cổng Nam thành Tây Đô (thành nhà Hồ), Thanh Hóa',
      credit: 'Nhi NV',
      license: 'CC BY-SA 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:C%E1%BB%95ng_Nam.jpg',
    },
    videos: [
      yt('c0S35T-aMZ8', 'Lịch sử 11 - Bài 9 - Cuộc cải cách của Hồ Quý Ly và triều Hồ - vninfographic', 'vninfographic', '3:49', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('QPwbQUZRMFo', 'Tóm tắt: Nhà Hồ (1400 - 1407) | Cuộc kháng chiến chống quân Minh xâm lược | Tóm tắt lịch sử Việt Nam', 'Sử Lược - Tóm Tắt Lịch Sử', '15:19', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'nha-le-so-le-thanh-tong': {
    image: {
      src: '/images/events/bia-tien-si.jpg',
      alt: 'Bia tiến sĩ thời Lê đặt trên lưng rùa đá ở Văn Miếu – Quốc Tử Giám (Hà Nội)',
      credit: 'Stefan Fussan',
      license: 'CC BY-SA 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:Hanoi_-_Literaturtempel_0011-002.JPG',
    },
    videos: [
      yt('nXQW2ztDquo', 'Lịch sử 11- Bài 10: Cải cách của VUA Lê Thánh Tông - HAY NHẤT', 'Học Lịch sử cùng Thầy Quý Hiền', '12:43', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('-Zade3Tn0z8', 'Lê Thánh Tông - Vị hoàng đế đưa nước Đại Việt trở thành 1 cường quốc | Tóm tắt lịch sử Việt Nam', 'Sử Lược - Tóm Tắt Lịch Sử', '19:31', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'dang-trong-dang-ngoai': {
    image: {
      src: '/images/events/chua-cau-hoi-an.jpg',
      alt: 'Chùa Cầu ở Hội An – thương cảng sầm uất của Đàng Trong thế kỉ XVII',
      credit: 'Steffen Schmitz',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:H%E1%BB%99i_An,_Ch%C3%B9a_C%E1%BA%A7u,_2020-01_CN-02.jpg',
    },
    videos: [
      yt('KsyW3rG8wk0', 'Trịnh Nguyễn phân tranh | Tóm tắt nhanh lịch sử Việt Nam - EZ Sử', 'EZ Sử', '8:13', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'nha-nguyen-minh-mang': {
    image: {
      src: '/images/events/ngo-mon-hue.jpg',
      alt: 'Ngọ Môn – cổng chính Hoàng thành Huế, xây năm 1833 thời vua Minh Mạng',
      credit: 'Supanut Arunoprayote',
      license: 'CC BY 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Meridian_Gate,_Hue_(I).jpg',
    },
    videos: [
      yt('I2unKzI_A30', 'Lịch sử 11 - Bài 11 - Cuộc Cải Cách Của Minh Mạng (Nửa Đầu Thế Kỉ XIX) - vninfographic', 'vninfographic', '2:52', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('7D2Vb2FQmtA', 'Minh Mạng – Từ người kế vị bất đắc dĩ đến vị vua tạo nên kỳ tích | Người nổi tiếng', 'Báo Nhân Dân', '12:28', `${OFFICIAL}. ${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'phap-xam-luoc-1858': {
    image: {
      src: '/images/events/phap-danh-gia-dinh-1859.jpg',
      alt: 'Tranh của Antoine Morel-Fatio vẽ quân Pháp đánh thành Gia Định ngày 18/2/1859',
      credit: 'Antoine Léon Morel-Fatio',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:Prise_de_Saigon_18_Fevrier_1859_Antoine_Morel-Fatio.jpg',
    },
    videos: [
      yt('pA3pBCfUkt8', 'Chiến Tranh Pháp - Đại Nam | Tóm tắt lịch sử Việt Nam - EZ Sử', 'EZ Sử', '9:11', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('910hNLAG2Qk', 'Tóm tắt: Chiến tranh Pháp - Đại Nam (1858-1884) | Thực dân Pháp xâm lược Việt Nam | Tóm Tắt Lịch Sử', 'Sử Lược - Tóm Tắt Lịch Sử', '9:00', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'phong-trao-dong-du-duy-tan': {
    image: {
      src: '/images/events/phan-boi-chau.jpg',
      alt: 'Chân dung Phan Bội Châu (in năm 1928)',
      credit: 'Không rõ tác giả',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:Portrait_of_Phan_B%E1%BB%99i_Ch%C3%A2u_1928.jpg',
      position: 'center 15%',
    },
    videos: [
      yt('DCkcqGPRjoo', 'Phan Bội Châu phát động phong trào Đông Du', 'Vũ trụ sử việt', '3:27', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('lGHYXiOGSoU', 'Ngày này năm xưa: Phan Châu Trinh - Người thắp lửa Duy Tân', 'Báo Nhân Dân', '3:57', `${OFFICIAL}. ${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'nguyen-ai-quoc-tim-duong-cuu-nuoc': {
    image: {
      src: '/images/events/nguyen-ai-quoc-1921.jpg',
      alt: 'Nguyễn Ái Quốc tại Đại hội Đảng Cộng sản Pháp ở Marseille, tháng 12/1921',
      credit: 'Agence de presse Meurisse',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:Nguyen_A%C3%AFn_Nu%C3%A4%27C_(Ho-Chi-Minh),_d%C3%A9l%C3%A9gu%C3%A9_indochinois,_Congr%C3%A8s_communiste_de_Marseille,_1921,_Meurisse,_BNF_Gallica.jpg',
      position: 'center 45%',
    },
    videos: [
      yt('Qu3yMoQfWXI', 'Hành Trình Đi Tìm Đường Cứu Nước Của Nguyễn Ái Quốc - Tóm tắt lịch sử Việt Nam- EZ Sử', 'EZ Sử', '9:36', `${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('jVePylu9dJA', 'Bến Nhà Rồng - nơi Bác Hồ ra đi tìm đường cứu nước', 'THVL Tổng Hợp', '3:09', `${OFFICIAL}. ${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'thanh-lap-dang-cong-san': {
    image: {
      src: '/images/events/tran-phu.jpg',
      alt: 'Chân dung Trần Phú (1904–1931), Tổng Bí thư đầu tiên của Đảng (ảnh phục chế)',
      credit: 'Khánh Hữu (phục chế)',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:Tr%E1%BA%A7n_Ph%C3%BA.jpg',
      position: 'center 30%',
    },
    videos: [
      yt('7FtGvLISpIk', 'Hội nghị thành lập Đảng Cộng sản Việt Nam diễn ra như thế nào?', 'Báo Quân đội nhân dân', '3:22', `${OFFICIAL}. ${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('ijEpyqo6XUc', 'Những chặng đường vẻ vang của Đảng: Hội nghị thành lập Đảng Cộng sản', 'Báo Nhân Dân', '3:07', `${OFFICIAL}. ${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'phong-trao-1930-1939': {
    image: {
      src: '/images/events/phan-dang-luu-1936.jpg',
      alt: 'Phan Đăng Lưu (hàng sau, thứ hai từ trái) trong phong trào dân chủ 1936–1939 ở Huế',
      credit: 'Không rõ tác giả',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:Phan_%C4%90%C4%83ng_L%C6%B0u_during_the_democratic_movement_of_1936-1939_in_Hue.jpg',
    },
    videos: [
      yt('aGcXtik3h8k', 'Ngày này năm xưa: Xô Viết - Nghệ Tĩnh, sức mạnh quần chúng làm nên lịch sử', 'Báo Nhân Dân', '4:09', `${OFFICIAL}. ${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('D_903ijAk6M', 'Phong trào dân chủ 1936 - 1939 - Bài 15 - Lịch sử 12 - Cô Phạm Phương Linh (HAY NHẤT)', 'VietJack THPT Official', '18:14', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'bao-ve-chinh-quyen-1945-1946': {
    image: {
      src: '/images/events/bau-cu-1946.jpg',
      alt: 'Người dân Hà Nội chuẩn bị bầu cử Quốc hội khóa I ở ngõ Phất Lộc, năm 1946',
      credit: 'Không rõ tác giả',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:C%E1%BA%A3nh_chu%E1%BA%A9n_b%E1%BB%8B_b%E1%BA%A7u_c%E1%BB%AD_Qu%E1%BB%91c_h%E1%BB%99i_kh%C3%B3a_I_t%E1%BA%A1i_ng%C3%B5_Ph%E1%BA%A5t_L%E1%BB%99c_n%C4%83m_1946.jpg',
    },
    videos: [
      yt('fu386mTjyho', 'Lịch sử 9 Bài 24 Cuộc đấu tranh bảo vệ và xây dựng chính quyền dân chủ nhân dân 1945 1946 Học online', 'vninfographic', '3:05', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'thong-nhat-dat-nuoc-1976': {
    image: {
      src: '/images/events/cau-hien-luong.jpg',
      alt: 'Cổng tưởng niệm ở cầu Hiền Lương trên sông Bến Hải (Quảng Trị) – nơi từng chia cắt hai miền',
      credit: 'Rolf Müller',
      license: 'CC BY-SA 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:Benhairiver2.jpg',
    },
    videos: [
      yt('XGyWjpCPMQA', 'Lịch sử và địa lí 9- Mục 1-Thống nhất đất nước về mặt Nhà nước', 'TƯ LIỆU DẠY VÀ HỌC LỊCH SỬ', '5:53', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'cong-cuoc-doi-moi-1986': {
    image: {
      src: '/images/events/cang-sai-gon.jpg',
      alt: 'Tàu container ở cảng Sài Gòn năm 2007 – kinh tế mở cửa, giao thương với thế giới sau công cuộc Đổi mới',
      credit: 'Genghiskhanviet',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:SaigonPort1.JPG',
    },
    videos: [
      yt('AaNEPJroA9s', 'Lịch sử 12 - Bài 10 - Khái quát về công cuộc đổi mới từ năm 1986 đến nay - Cánh diều - vninfographic', 'vninfographic', '4:42', `${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'gia-nhap-asean-1995': {
    image: {
      src: '/images/events/co-asean.jpg',
      alt: 'Cờ ASEAN và cờ các nước thành viên bên sông Sài Gòn',
      credit: 'Nat4Eben',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Flags_of_ASEAN_Nations_fly_by_Saigon_River.jpg',
    },
    videos: [
      yt('ZXuc7SUvFjI', 'Khoảnh khắc và sự kiện. Ngày 28/7/1995: Việt Nam chính thức gia nhập ASEAN - VNEWS', 'VNAMEDIA - TRUNG TÂM NỘI DUNG SỐ VÀ TRUYỀN THÔNG', '3:41', `${OFFICIAL}. ${LINK_OK}.`, NOT_TRANSCRIBED),
      yt('X0HiJUqqclM', 'Việt Nam - ASEAN: 30 năm đồng hành | VTV4', 'VTV4', '2:56', `${OFFICIAL}. ${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
  'hoi-nhap-quoc-te': {
    image: {
      src: '/images/events/tp-ho-chi-minh.jpg',
      alt: 'Thành phố Hồ Chí Minh về đêm nhìn từ trên cao',
      credit: 'Lê Minh Phát',
      license: 'CC BY 2.0',
      source: 'https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_City_-_DJI_0124-HDR.jpg',
    },
    videos: [
      yt('b7TM3sXk1_8', 'Việt Nam gia nhập WTO - Điểm sáng trong tiến trình phát triển', 'Báo Nhân Dân', '4:45', `${OFFICIAL}. ${LINK_OK}.`, NOT_TRANSCRIBED),
    ],
  },
};
