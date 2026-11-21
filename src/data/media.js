/**
 * VIDEO VÀ ẢNH CỦA TỪNG SỰ KIỆN
 * ------------------------------------------------------------
 * ĐỔI VIDEO: thay `youtubeId` bằng mã video mới.
 *   Link https://www.youtube.com/watch?v=AbCdEf12345  →  youtubeId: 'AbCdEf12345'
 *   Video đầu tiên trong danh sách là video chính của sự kiện.
 *
 * ĐỔI ẢNH: chép ảnh vào thư mục public/images/events/ rồi sửa `src`.
 *   Nhớ cập nhật `credit` (tác giả) và `license` (giấy phép) nếu ảnh lấy từ nguồn khác.
 *
 * Kiểm chứng (tháng 11/2026): mỗi video đã được mở bản chép lời trên YouTube
 * và đối chiếu các mốc chính (năm, nhân vật, địa danh, số quân) với SGK Lịch sử.
 * Video của cơ quan nhà nước không có bản chép lời được ghi là "Nguồn chính thống".
 */

const yt = (youtubeId, title, channel, duration, verify, note) => ({
  youtubeId,
  title,
  channel,
  duration,
  verify,
  note,
});

const CHECKED = 'Đã đối chiếu lời thoại với SGK';
const OFFICIAL = 'Nguồn chính thống';

export const MEDIA = {
  'khang-chien-chong-tan-trieu': {
    image: {
      src: '/images/events/co-loa.jpg',
      alt: 'Sân đền trong khu di tích thành Cổ Loa, Đông Anh, Hà Nội',
      credit: 'ZiYouXunLu',
      license: 'CC BY-SA 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:Citadelle_de_C%E1%BB%95_Loa.jpg',
    },
    videos: [
      yt(
        'Fm3w6wI-d6c',
        'Sự thành lập nước Âu Lạc và cuộc chiến chống nhà Tần, nhà Triệu',
        'Việt Sử Dễ Hiểu',
        '5:33',
        `${CHECKED}: 218 TCN, 50 vạn quân Tần, Đồ Thư, Thục Phán, thành Cổ Loa, nỏ Liên Châu, Triệu Đà, 179 TCN.`,
      ),
    ],
  },
  'khoi-nghia-hai-ba-trung': {
    image: {
      src: '/images/events/hai-ba-trung.jpg',
      alt: 'Mô phỏng 3D đàn thề Hát Môn với hàng cờ khởi nghĩa trong sương sớm',
      credit: 'Ảnh dựng từ mô phỏng 3D của trang web',
      license: '',
      source: '',
    },
    videos: [
      yt(
        'FC5Rf5daGz0',
        'Khởi nghĩa Hai Bà Trưng — Tóm tắt nhanh lịch sử Việt Nam',
        'EZ Sử',
        '7:08',
        `${CHECKED}: Tô Định, Thi Sách, Hội thề Hát Môn, Mê Linh, Cổ Loa, Luy Lâu, Mã Viện (42), Lãng Bạc, Cấm Khê, năm 43.`,
        'Lưu ý: ở phần mở đầu, video nói Triệu Đà diệt Âu Lạc năm 208 TCN; SGK ghi năm 179 TCN.',
      ),
      yt(
        '_tb_dBOs7vQ',
        'Hai Bà Trưng: Biểu tượng bất diệt của phụ nữ Việt',
        'QPVN Digital — Truyền hình Quốc phòng Việt Nam',
        '12:42',
        `${OFFICIAL}. ${CHECKED}: lời thề Hát Môn, năm 40, 65 thành, đền Hạ Lôi (Mê Linh), đền Hát Môn.`,
      ),
    ],
  },
  'chien-thang-bach-dang-938': {
    image: {
      src: '/images/events/bach-dang-938.jpg',
      alt: 'Tranh minh họa Ngô Quyền cùng các tướng sĩ trước trận Bạch Đằng',
      credit: 'Ảnh do nhóm tác giả cung cấp',
      license: '',
      source: '',
    },
    videos: [
      yt(
        'ZPIUuLtRUFY',
        'Chiến thắng Bạch Đằng 938 — Ngô Quyền đánh bại quân Nam Hán',
        'EZ Sử',
        '6:42',
        `${CHECKED}: Dương Đình Nghệ, Kiều Công Tiễn, Lưu Hoằng Tháo, bãi cọc, thủy triều, năm 938, 939, kinh đô Cổ Loa.`,
      ),
    ],
  },
  'khang-chien-chong-tong': {
    image: {
      src: '/images/events/ly-thuong-kiet.jpg',
      alt: 'Tượng bán thân Lý Thường Kiệt bằng đồng',
      credit: 'Gary Todd',
      license: 'CC0',
      position: 'center 28%',
      source:
        'https://commons.wikimedia.org/wiki/File:Ly_Thuong_Kiet_(1019-1105)_Defeated_Song_China_Invasion_of_1077_(9732106811).jpg',
    },
    videos: [
      yt(
        '3QpVE2cg_E0',
        'Cuộc kháng chiến chống Tống lần 2 — Lý Thường Kiệt chiếm Ung Châu',
        'EZ Sử',
        '9:31',
        `${CHECKED}: Khâm Châu, Liêm Châu, Ung Châu, phòng tuyến Như Nguyệt, Nam quốc sơn hà, giảng hòa, 1075 – 1077.`,
      ),
    ],
  },
  'khang-chien-chong-mong-nguyen': {
    image: {
      src: '/images/events/coc-bach-dang-1288.jpg',
      alt: 'Cọc gỗ trận Bạch Đằng năm 1288 trưng bày trong bảo tàng',
      credit: 'Gary Todd',
      license: 'CC0',
      position: 'center 45%',
      source:
        'https://commons.wikimedia.org/wiki/File:Wood_Stakes_Used_to_Destroy_Mongol_Fleet_at_Bach_Dang,_1288_(9732100161).jpg',
    },
    videos: [
      yt(
        'BDuq30woAM8',
        'Đại Việt 3 lần đại phá quân Nguyên Mông (1258 – 1288)',
        'EZ Sử',
        '34:37',
        `${CHECKED}: 1258, 1285, 1288, Trần Thủ Độ, Trần Hưng Đạo, Diên Hồng, Hịch tướng sĩ, Vân Đồn, Bạch Đằng, Ô Mã Nhi.`,
      ),
    ],
  },
  'khoi-nghia-lam-son': {
    image: {
      src: '/images/events/lam-kinh.jpg',
      alt: 'Tượng đá voi, tê giác, ngựa ở lăng Lê Lợi (Lam Kinh, Thanh Hóa), tạc năm 1433, trưng bày tại Bảo tàng Mỹ thuật Việt Nam',
      credit: 'Daderot',
      license: 'CC0',
      source:
        'https://commons.wikimedia.org/wiki/File:Elephant,_rhino,_and_horse,_Le_Loi_mausoleum,_Thanh_Hoa_province,_1433_AD,_stone_-_Vietnam_National_Museum_of_Fine_Arts_-_Hanoi,_Vietnam_-_DSC04853.JPG',
    },
    videos: [
      yt(
        '7hYLCHS-WHU',
        'Khởi nghĩa Lam Sơn (1418 – 1427) — Tóm tắt nhanh lịch sử Việt Nam',
        'EZ Sử',
        '8:15',
        `${CHECKED}: Lê Lợi, Nguyễn Trãi, Lê Lai, Chí Linh, Tốt Động – Chúc Động, Chi Lăng – Xương Giang, Liễu Thăng, Hội thề Đông Quan, Bình Ngô đại cáo.`,
      ),
    ],
  },
  'phong-trao-tay-son': {
    image: {
      src: '/images/events/quang-trung.jpg',
      alt: 'Tượng bán thân vua Quang Trung – Nguyễn Huệ bằng đồng',
      credit: 'Gary Todd',
      license: 'CC0',
      position: 'center 28%',
      source: 'https://commons.wikimedia.org/wiki/File:Quang_Trung_(Nguyen_Hue,_1753-1792)_(9735335538).jpg',
    },
    videos: [
      yt(
        'TqRWvdXrQ-Y',
        'Trận Ngọc Hồi – Đống Đa — Tóm tắt lịch sử Việt Nam',
        'EZ Sử',
        '12:21',
        `${CHECKED}: Tôn Sĩ Nghị, 29 vạn quân Thanh, Lê Chiêu Thống, Phú Xuân, Tam Điệp, Hà Hồi, Ngọc Hồi, Đống Đa, Sầm Nghi Đống, Tết Kỷ Dậu 1789.`,
      ),
    ],
  },
  'phong-trao-can-vuong-yen-the': {
    image: {
      src: '/images/events/de-tham.jpg',
      alt: 'Ảnh chụp thủ lĩnh Hoàng Hoa Thám (Đề Thám) đầu thế kỷ XX',
      credit: 'Pierre Dieulefils',
      license: 'Phạm vi công cộng',
      position: 'center 22%',
      source: 'https://commons.wikimedia.org/wiki/File:%C4%90%E1%BB%81_Th%C3%A1m.jpg',
    },
    videos: [
      yt(
        'QA9tNvmcF9I',
        'Phong trào Cần Vương — Tóm tắt lịch sử Việt Nam',
        'EZ Sử',
        '8:00',
        `${CHECKED}: Tôn Thất Thuyết, vua Hàm Nghi, Tân Sở, chiếu Cần Vương 13/7/1885, Bãi Sậy, Hương Khê, Phan Đình Phùng, Cao Thắng.`,
      ),
      yt(
        'UyrCH4JtknM',
        'Khởi nghĩa Yên Thế — Tóm tắt lịch sử Việt Nam',
        'EZ Sử',
        '8:42',
        `${CHECKED}: Hoàng Hoa Thám (Đề Thám), Yên Thế (Bắc Giang), 1884 – 1913.`,
      ),
    ],
  },
  'cach-mang-thang-tam': {
    image: {
      src: '/images/events/ba-dinh-1945.jpg',
      alt: 'Lễ đài và quần chúng tại Quảng trường Ba Đình ngày 2/9/1945',
      credit: 'Không rõ tác giả',
      license: 'Phạm vi công cộng',
      position: 'center 40%',
      source: 'https://commons.wikimedia.org/wiki/File:Ba_Dinh_Square_September_2nd,_1945.jpg',
    },
    videos: [
      yt(
        'c0yShPh_hjo',
        'Phim tài liệu: Cách mạng tháng Tám',
        'Bảo tàng Hồ Chí Minh',
        '7:07',
        `${OFFICIAL} — kênh của Bảo tàng Hồ Chí Minh.`,
      ),
      yt(
        'zgR6nH84wsQ',
        'Cách mạng tháng 8 — Tóm tắt nhanh lịch sử Việt Nam',
        'EZ Sử',
        '8:56',
        `${CHECKED}: 9/3/1945, Quân lệnh số 1, Tân Trào, Quốc dân đại hội, 19/8, 23/8, 25/8, Bảo Đại thoái vị, Tuyên ngôn độc lập 2/9.`,
      ),
    ],
  },
  'khang-chien-chong-phap': {
    image: {
      src: '/images/events/dien-bien-phu.jpg',
      alt: 'Lá cờ “Quyết chiến quyết thắng” tung bay trên nóc hầm tướng De Castries, 7/5/1954',
      credit: 'Quân đội nhân dân Việt Nam',
      license: 'Phạm vi công cộng',
      source: 'https://commons.wikimedia.org/wiki/File:Victory_in_Battle_of_Dien_Bien_Phu.jpg',
    },
    videos: [
      yt(
        'qvE5Zd9kHPY',
        'Điện Biên Phủ 1954: 56 ngày đêm làm nên chiến thắng “chấn động địa cầu”',
        'QPVN — Truyền hình Quốc phòng Việt Nam',
        '28:21',
        `${OFFICIAL}. ${CHECKED}: Võ Nguyên Giáp, đồi Him Lam, đồi A1, phương châm “đánh chắc, tiến chắc”, năm 1954.`,
      ),
    ],
  },
  'khang-chien-chong-my': {
    image: {
      src: '/images/events/dinh-doc-lap-1975.jpg',
      alt: 'Xe tăng 843 trưng bày trong khuôn viên Dinh Độc Lập (Hội trường Thống Nhất), TP. Hồ Chí Minh',
      credit: 'Jame Healy',
      license: 'CC BY-SA 2.0',
      source:
        'https://commons.wikimedia.org/wiki/File:Vietnamese_T-54A_or_Type_59_tank_at_the_Reunification_Palace_in_Ho_Chi_Minh_City,_Vietnam.jpg',
    },
    videos: [
      yt(
        'tlMCCCFgAY0',
        'Phim tài liệu: Đại thắng mùa Xuân 1975 — Tổ quốc bay lên',
        'ANTV — Truyền hình Công an Nhân dân',
        '27:14',
        `${OFFICIAL}. ${CHECKED}: Tây Nguyên, Huế – Đà Nẵng, chiến dịch Hồ Chí Minh, Hiệp định Paris, 30/4/1975.`,
      ),
    ],
  },
  'chien-tranh-bao-ve-to-quoc': {
    // Ảnh do nhóm thực hiện cung cấp — khi biết nguồn (tác giả, cơ quan báo chí) hãy ghi vào credit/source.
    image: {
      src: '/images/events/bao-ve-to-quoc-1979.jpg',
      alt: 'Chiến sĩ bên tấm biển “Quyết tâm bảo vệ từng tấc đất của Tổ quốc”',
      credit: 'Ảnh tư liệu',
      license: '',
      source: '',
    },
    videos: [
      yt(
        '2Hl7PPXkqcU',
        'Chiến tranh biên giới Tây Nam (bản đầy đủ)',
        'EZ Sử',
        '15:43',
        `${CHECKED}: Khơ-me Đỏ, Tây Ninh, An Giang, giải phóng Phnôm Pênh 7/1/1979, rút quân năm 1989.`,
      ),
      yt(
        'T0q_w1fPijQ',
        'Chiến tranh bảo vệ biên giới phía Bắc 1979: Ký ức một cuộc chiến',
        'VTC1 — Đài Truyền hình Kỹ thuật số VTC',
        '30:08',
        `${OFFICIAL} — chương trình của đài VTC.`,
      ),
    ],
  },
};
