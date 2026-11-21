/**
 * DỮ LIỆU CÁC SỰ KIỆN LỊCH SỬ VIỆT NAM
 * ------------------------------------------------------------
 * Đây là file nội dung chính của trang web. Muốn sửa nội dung, câu hỏi
 * trắc nghiệm… chỉ cần sửa ở đây (12 sự kiện đầu tiên) hoặc ở events-more.js
 * (các sự kiện bổ sung theo niên biểu Chương trình GDPT 2018) — không cần đụng vào code giao diện.
 *
 * Thứ tự khung phim và số thứ tự (id) được TỰ SẮP theo `sortYear`, nên thêm sự kiện mới
 * ở bất kỳ đâu cũng sẽ nằm đúng vị trí trong tiến trình lịch sử.
 *
 * Muốn ĐỔI VIDEO hoặc ẢNH: sửa file media.js (hoặc media-more.js) nằm cùng thư mục.
 *
 * Nội dung được biên soạn theo sách giáo khoa Lịch sử (Bộ GD&ĐT)
 * và Đại Việt sử ký toàn thư; năm tháng theo cách ghi phổ biến trong SGK.
 *
 * File này được dùng cả ở giao diện (React) lẫn server (Giảng viên AI),
 * nên chỉ chứa dữ liệu thuần, không import thư viện.
 */

import { MEDIA } from './media.js';
import { MEDIA_MORE } from './media-more.js';
import { MORE_EVENTS } from './events-more.js';

export const PERIODS = [
  {
    id: 'nguyen-thuy',
    short: 'Nguyên thủy',
    name: 'Thời nguyên thủy',
    range: 'Khoảng 40 vạn năm trước – thế kỷ VII TCN',
    description:
      'Từ dấu tích Người tối cổ đến các nền văn hóa Sơn Vi, Hòa Bình, Bắc Sơn và Phùng Nguyên – Đồng Đậu – Gò Mun: con người trên đất Việt Nam chế tác công cụ đá, làm gốm, trồng lúa và bước vào thời đại kim khí.',
  },
  {
    id: 'dung-nuoc',
    short: 'Dựng nước',
    name: 'Thời kỳ dựng nước',
    range: 'Khoảng thế kỷ VII TCN – 179 TCN',
    description:
      'Nhà nước Văn Lang của các vua Hùng ra đời trên lưu vực sông Hồng, sông Mã, sông Cả. Tiếp nối là nhà nước Âu Lạc của An Dương Vương với thành Cổ Loa và nền văn hóa Đông Sơn rực rỡ, tiêu biểu là trống đồng.',
  },
  {
    id: 'quoc-gia-co',
    short: 'Phù Nam – Chăm-pa',
    name: 'Các quốc gia cổ ở miền Trung và Nam Bộ',
    range: 'Thế kỷ I – thế kỷ XV',
    description:
      'Trên nền văn hóa Óc Eo ở Nam Bộ và văn hóa Sa Huỳnh ở miền Trung, từ những thế kỷ đầu Công nguyên đã hình thành vương quốc Phù Nam và vương quốc Chăm-pa — hai bộ phận quan trọng làm nên lịch sử, văn hóa đa dạng của Việt Nam.',
  },
  {
    id: 'bac-thuoc',
    short: 'Bắc thuộc',
    name:'Thời kỳ Bắc thuộc và chống Bắc thuộc',
    range: '179 TCN – 938',
    description:
      'Hơn một nghìn năm dưới ách đô hộ của các triều đại phong kiến phương Bắc. Người Việt vẫn giữ tiếng nói, phong tục và liên tục vùng lên: Hai Bà Trưng, Bà Triệu, Lý Bí, Mai Thúc Loan, Phùng Hưng, Khúc Thừa Dụ…',
  },
  {
    id: 'tu-chu',
    short: 'Độc lập, tự chủ',
    name:'Thời kỳ phong kiến độc lập, tự chủ',
    range: '938 – 1858',
    description:
      'Từ chiến thắng Bạch Đằng, các triều Ngô, Đinh, Tiền Lê, Lý, Trần, Hồ, Lê, Tây Sơn, Nguyễn xây dựng quốc gia Đại Việt, nhiều lần đánh bại các cuộc xâm lược lớn từ phương Bắc và phương Nam.',
  },
  {
    id: 'phap-thuoc',
    short: 'Pháp thuộc',
    name:'Thời kỳ Pháp thuộc và đấu tranh giải phóng',
    range: '1858 – 1945',
    description:
      'Thực dân Pháp xâm lược và đặt ách thống trị. Các phong trào yêu nước nối tiếp nhau: Cần Vương, Yên Thế, Đông Du, Duy Tân… cho đến khi Đảng Cộng sản ra đời (1930) và lãnh đạo Cách mạng tháng Tám thành công.',
  },
  {
    id: 'hien-dai',
    short: 'Hiện đại',
    name:'Thời kỳ hiện đại',
    range: '1945 – nay',
    description:
      'Nước Việt Nam Dân chủ Cộng hòa ra đời, trải qua hai cuộc kháng chiến chống Pháp và chống Mỹ, thống nhất đất nước năm 1975, bảo vệ biên giới, chủ quyền và bước vào công cuộc Đổi mới từ năm 1986.',
  },
];

const RAW_EVENTS = [
  // ───────────────────────────────────────────── 1
  {
    id: 1,
    slug: 'khang-chien-chong-tan-trieu',
    time: 'Thế kỷ III – II TCN',
    yearLabel: '218 TCN',
    sortYear: -218,
    title: 'Kháng chiến chống Tần và chống Triệu',
    shortTitle: 'Chống Tần – Triệu',
    periodId: 'dung-nuoc',
    period: 'Thời kỳ dựng nước (Văn Lang – Âu Lạc)',
    summary:
      'Nhân dân Lạc Việt – Âu Việt dưới sự lãnh đạo của Thục Phán đánh lui 50 vạn quân Tần. Sau đó là cuộc kháng chiến chống Triệu Đà của An Dương Vương (thất bại năm 179 TCN), đất nước rơi vào ách đô hộ.',
    context:
      'Năm 218 TCN, sau khi thống nhất Trung Quốc, nhà Tần sai tướng Đồ Thư đem 50 vạn quân tiến xuống phương Nam đánh chiếm đất của các tộc Việt. Vùng đất của người Tây Âu (Âu Việt) và Lạc Việt ở Bắc Bộ trở thành mục tiêu xâm lược.',
    timeline: [
      {
        when: '218 TCN',
        text: 'Quân Tần tiến xuống phương Nam. Người Âu Việt và Lạc Việt cùng nhau suy tôn Thục Phán làm thủ lĩnh, rút vào rừng sâu để kháng chiến lâu dài.',
      },
      {
        when: '218 – 208 TCN',
        text: 'Ban ngày ở yên, ban đêm ra đánh. Quân Tần lâm vào cảnh thiếu lương thực, chủ tướng Đồ Thư bị giết. Nhà Tần buộc phải bãi binh.',
      },
      {
        when: 'Khoảng 208 TCN',
        text: 'Thục Phán xưng là An Dương Vương, lập nước Âu Lạc, đóng đô ở Phong Khê (nay thuộc Đông Anh, Hà Nội) và cho xây thành Cổ Loa.',
      },
      {
        when: 'Cuối thế kỷ III TCN',
        text: 'Triệu Đà — viên quan cũ nhà Tần, lập nước Nam Việt — nhiều lần đem quân đánh Âu Lạc nhưng đều thất bại trước thành Cổ Loa và nỏ Liên Châu.',
      },
      {
        when: '179 TCN',
        text: 'Triệu Đà dùng kế giảng hòa, cho con trai là Trọng Thủy sang ở rể để dò xét. Khi An Dương Vương mất cảnh giác, Triệu Đà bất ngờ tấn công, Âu Lạc thất thủ.',
      },
    ],
    result:
      'Cuộc kháng chiến chống Tần thắng lợi, dẫn tới sự ra đời của nước Âu Lạc. Cuộc kháng chiến chống Triệu thất bại năm 179 TCN; đất nước rơi vào ách đô hộ của phong kiến phương Bắc.',
    significance:
      'Thể hiện tinh thần đoàn kết của các tộc người Việt cổ và trình độ quân sự cao (thành Cổ Loa, nỏ Liên Châu). Bài học mất nước từ chuyện Mỵ Châu – Trọng Thủy nhắc nhở các thế hệ sau về tinh thần cảnh giác trước kẻ thù.',
    figures: [
      { name: 'Thục Phán – An Dương Vương', role: 'Thủ lĩnh kháng chiến chống Tần, vua nước Âu Lạc' },
      { name: 'Cao Lỗ', role: 'Tướng tài, theo truyền thuyết là người chế tạo nỏ Liên Châu' },
    ],
    places: [{ name: 'Thành Cổ Loa', lat: 21.115, lon: 105.873 }],
    facts: [
      'Thành Cổ Loa có ba vòng thành đắp bằng đất, chu vi lần lượt khoảng 8 km, 6,5 km và 1,6 km, bên ngoài mỗi vòng là hào nước.',
      'Năm 1959, các nhà khảo cổ tìm thấy hàng vạn mũi tên đồng tại khu Cầu Vực, gần thành Cổ Loa.',
    ],
    image: null,
    video: null,
    sim3d: 'co-loa',
    quiz: [
      {
        q: 'Năm 218 TCN, nhà Tần đem bao nhiêu quân xâm lược phương Nam?',
        options: ['10 vạn', '29 vạn', '50 vạn', '60 vạn'],
        answer: 2,
        explain: 'Nhà Tần sai Đồ Thư đem 50 vạn quân tiến xuống phương Nam.',
      },
      {
        q: 'Ai được người Âu Việt và Lạc Việt suy tôn làm thủ lĩnh kháng chiến chống Tần?',
        options: ['Hùng Vương', 'Thục Phán', 'Cao Lỗ', 'Triệu Đà'],
        answer: 1,
        explain: 'Thục Phán lãnh đạo kháng chiến, sau đó xưng An Dương Vương, lập nước Âu Lạc.',
      },
      {
        q: 'Kinh đô của nước Âu Lạc đặt ở đâu?',
        options: ['Phong Châu', 'Mê Linh', 'Phong Khê (Cổ Loa)', 'Hoa Lư'],
        answer: 2,
        explain: 'An Dương Vương đóng đô ở Phong Khê và xây thành Cổ Loa, nay thuộc Đông Anh, Hà Nội.',
      },
      {
        q: 'Đặc điểm nổi bật của thành Cổ Loa là gì?',
        options: [
          'Xây hoàn toàn bằng đá ong',
          'Nhiều vòng thành đắp bằng đất, có hào nước bao quanh',
          'Nằm trên đỉnh núi cao',
          'Có tường thành bằng gạch nung',
        ],
        answer: 1,
        explain: 'Cổ Loa có ba vòng thành đất, mỗi vòng có hào nước, vừa phòng thủ trên bộ vừa trên sông.',
      },
      {
        q: 'Năm nào nước Âu Lạc rơi vào ách đô hộ của Triệu Đà?',
        options: ['208 TCN', '179 TCN', '111 TCN', 'Năm 40'],
        answer: 1,
        explain: 'Năm 179 TCN, Triệu Đà đánh chiếm Âu Lạc, mở đầu thời kỳ Bắc thuộc.',
      },
    ],
  },

  // ───────────────────────────────────────────── 2
  {
    id: 2,
    slug: 'khoi-nghia-hai-ba-trung',
    time: 'Năm 40',
    yearLabel: '40',
    sortYear: 40,
    title: 'Khởi nghĩa Hai Bà Trưng',
    shortTitle: 'Hai Bà Trưng',
    periodId: 'bac-thuoc',
    period: 'Thời kỳ Bắc thuộc',
    summary:
      'Cuộc khởi nghĩa quy mô lớn đầu tiên của nhân dân ta dưới ách đô hộ của phong kiến phương Bắc, lật đổ chính quyền đô hộ nhà Hán, lập ra nhà nước độc lập tự chủ trong thời gian ngắn (40 – 43).',
    context:
      'Đầu Công nguyên, nhà Hán đặt ách cai trị hà khắc lên đất Giao Chỉ. Thái thú Tô Định nổi tiếng tham lam, tàn bạo, bắt dân nộp nhiều thứ thuế và cống nạp sản vật quý. Trưng Trắc, Trưng Nhị là con gái Lạc tướng huyện Mê Linh, có chí lớn cứu nước.',
    timeline: [
      {
        when: 'Mùa xuân năm 40',
        text: 'Hai Bà Trưng dựng cờ khởi nghĩa ở Hát Môn (nay thuộc Hà Nội) với lời thề “đền nợ nước, trả thù nhà”. Nhân dân khắp nơi hưởng ứng.',
      },
      {
        when: 'Năm 40',
        text: 'Nghĩa quân nhanh chóng làm chủ Mê Linh, tiến đánh Cổ Loa rồi Luy Lâu (nay thuộc Bắc Ninh). Tô Định hoảng sợ, cắt tóc, cạo râu, bỏ trốn về nước.',
      },
      {
        when: 'Năm 40',
        text: 'Khởi nghĩa giành thắng lợi, 65 thành trì được giải phóng. Trưng Trắc lên ngôi vua (Trưng Vương), đóng đô ở Mê Linh, miễn thuế hai năm cho nhân dân.',
      },
      {
        when: 'Năm 42',
        text: 'Nhà Hán sai Mã Viện đem khoảng 2 vạn quân cùng nhiều thuyền chiến sang đàn áp. Hai Bà chỉ huy chiến đấu quyết liệt ở Lãng Bạc rồi lui về Cấm Khê.',
      },
      {
        when: 'Năm 43',
        text: 'Cuộc kháng chiến thất bại, Hai Bà Trưng hy sinh anh dũng. Nhiều nữ tướng như Lê Chân, Thánh Thiên, Bát Nàn cũng chiến đấu đến cùng.',
      },
    ],
    result:
      'Lật đổ ách đô hộ của nhà Hán, giành lại độc lập trong ba năm (40 – 43) trước khi bị Mã Viện đàn áp.',
    significance:
      'Là cuộc khởi nghĩa lớn đầu tiên của nhân dân ta trong thời Bắc thuộc, khẳng định ý chí độc lập của dân tộc. Cuộc khởi nghĩa cho thấy vai trò to lớn của phụ nữ Việt Nam trong lịch sử giữ nước.',
    figures: [
      { name: 'Trưng Trắc (Trưng Vương)', role: 'Thủ lĩnh khởi nghĩa, lên ngôi vua năm 40' },
      { name: 'Trưng Nhị', role: 'Cùng chị lãnh đạo khởi nghĩa' },
      { name: 'Lê Chân, Thánh Thiên, Bát Nàn', role: 'Các nữ tướng của Hai Bà Trưng' },
    ],
    places: [
      { name: 'Hát Môn', lat: 21.135, lon: 105.555 },
      { name: 'Mê Linh', lat: 21.18, lon: 105.72 },
    ],
    facts: [
      'Theo Hậu Hán thư, cuộc khởi nghĩa đã làm chủ 65 thành trì.',
      'Hằng năm, lễ hội đền Hai Bà Trưng ở Hát Môn và Mê Linh được tổ chức vào tháng Giêng, tháng Hai âm lịch.',
    ],
    image: null,
    video: null,
    sim3d: 'hat-mon',
    quiz: [
      {
        q: 'Viên thái thú nhà Hán bị nghĩa quân Hai Bà Trưng đánh đuổi là ai?',
        options: ['Mã Viện', 'Tô Định', 'Triệu Đà', 'Lưu Hoằng Tháo'],
        answer: 1,
        explain: 'Tô Định tham lam, tàn bạo; khi nghĩa quân tiến đánh, hắn bỏ trốn về nước.',
      },
      {
        q: 'Hai Bà Trưng dựng cờ khởi nghĩa ở đâu?',
        options: ['Hát Môn', 'Lam Sơn', 'Hoa Lư', 'Yên Thế'],
        answer: 0,
        explain: 'Mùa xuân năm 40, Hai Bà dựng cờ khởi nghĩa ở Hát Môn.',
      },
      {
        q: 'Sau khi khởi nghĩa thắng lợi, Trưng Trắc đóng đô ở đâu?',
        options: ['Cổ Loa', 'Luy Lâu', 'Mê Linh', 'Thăng Long'],
        answer: 2,
        explain: 'Trưng Trắc lên ngôi vua, đóng đô ở Mê Linh.',
      },
      {
        q: 'Năm 42, nhà Hán sai tướng nào sang đàn áp cuộc khởi nghĩa?',
        options: ['Đồ Thư', 'Mã Viện', 'Tôn Sĩ Nghị', 'Liễu Thăng'],
        answer: 1,
        explain: 'Mã Viện đem khoảng 2 vạn quân cùng thuyền chiến sang đàn áp.',
      },
      {
        q: 'Ý nghĩa nổi bật của khởi nghĩa Hai Bà Trưng là gì?',
        options: [
          'Chấm dứt hoàn toàn thời kỳ Bắc thuộc',
          'Là cuộc khởi nghĩa lớn đầu tiên trong thời Bắc thuộc',
          'Mở ra triều đại nhà Lý',
          'Đánh tan quân Nam Hán',
        ],
        answer: 1,
        explain: 'Đây là cuộc khởi nghĩa quy mô lớn đầu tiên, giành độc lập trong ba năm.',
      },
    ],
  },

  // ───────────────────────────────────────────── 3
  {
    id: 3,
    slug: 'chien-thang-bach-dang-938',
    time: 'Năm 938',
    yearLabel: '938',
    sortYear: 938,
    title: 'Chiến thắng Bạch Đằng',
    shortTitle: 'Bạch Đằng 938',
    periodId: 'tu-chu',
    period: 'Mở đầu thời kỳ độc lập, tự chủ',
    summary:
      'Do Ngô Quyền lãnh đạo, đánh tan đạo quân Nam Hán trên sông Bạch Đằng. Sự kiện này chính thức chấm dứt hơn 1000 năm Bắc thuộc, mở ra kỷ nguyên độc lập, tự chủ lâu dài cho dân tộc.',
    context:
      'Năm 937, Kiều Công Tiễn giết Tiết độ sứ Dương Đình Nghệ để đoạt quyền, rồi cầu cứu nhà Nam Hán. Ngô Quyền — con rể và là tướng giỏi của Dương Đình Nghệ — kéo quân từ Ái Châu (Thanh Hóa) ra diệt Kiều Công Tiễn và chuẩn bị đánh quân Nam Hán.',
    timeline: [
      {
        when: 'Cuối năm 938',
        text: 'Ngô Quyền giết Kiều Công Tiễn. Vua Nam Hán sai con là Lưu Hoằng Tháo đem quân theo đường biển tiến vào nước ta.',
      },
      {
        when: 'Cuối năm 938',
        text: 'Ngô Quyền cho quân đóng cọc gỗ lớn, đầu bịt sắt nhọn xuống lòng sông Bạch Đằng ở những nơi hiểm yếu. Khi nước triều lên, bãi cọc bị che lấp.',
      },
      {
        when: 'Trận đánh',
        text: 'Thuyền nhẹ của ta ra khiêu chiến lúc triều lên rồi giả thua, nhử quân Nam Hán vượt qua bãi cọc. Khi nước triều rút, quân ta đổ ra đánh quyết liệt.',
      },
      {
        when: 'Kết thúc',
        text: 'Thuyền địch tháo chạy, va vào bãi cọc, vỡ và đắm rất nhiều. Lưu Hoằng Tháo tử trận; vua Nam Hán phải bỏ ý định xâm lược.',
      },
      {
        when: 'Năm 939',
        text: 'Ngô Quyền xưng vương, đóng đô ở Cổ Loa, xây dựng nền độc lập của đất nước.',
      },
    ],
    result: 'Quân Nam Hán thất bại hoàn toàn, chủ tướng Lưu Hoằng Tháo tử trận.',
    significance:
      'Chấm dứt hơn một nghìn năm Bắc thuộc, mở ra thời kỳ độc lập, tự chủ lâu dài. Cách đánh dựa vào thủy triều và bãi cọc ngầm trở thành bài học quân sự được nhà Trần vận dụng năm 1288.',
    figures: [
      { name: 'Ngô Quyền', role: 'Người chỉ huy trận Bạch Đằng, lập ra nhà Ngô' },
      { name: 'Lưu Hoằng Tháo', role: 'Chỉ huy quân Nam Hán, tử trận trên sông Bạch Đằng' },
    ],
    places: [{ name: 'Sông Bạch Đằng', lat: 20.93, lon: 106.75 }],
    facts: [
      'Bãi cọc gỗ trên sông Bạch Đằng được bố trí ở nơi hiểm yếu gần cửa biển, tận dụng chênh lệch thủy triều.',
    ],
    image: null,
    video: null,
    sim3d: null,
    quiz: [
      {
        q: 'Ai lãnh đạo nhân dân ta giành chiến thắng Bạch Đằng năm 938?',
        options: ['Lý Thường Kiệt', 'Trần Hưng Đạo', 'Ngô Quyền', 'Đinh Bộ Lĩnh'],
        answer: 2,
        explain: 'Ngô Quyền chỉ huy trận Bạch Đằng năm 938.',
      },
      {
        q: 'Năm 938, quân ta đánh tan quân xâm lược nào?',
        options: ['Quân Nam Hán', 'Quân Tống', 'Quân Minh', 'Quân Nguyên'],
        answer: 0,
        explain: 'Quân Nam Hán do Lưu Hoằng Tháo chỉ huy.',
      },
      {
        q: 'Kế sách nổi tiếng của Ngô Quyền trong trận Bạch Đằng là gì?',
        options: [
          'Vườn không nhà trống',
          'Đóng cọc ngầm, lợi dụng thủy triều',
          'Tiên phát chế nhân',
          'Đánh nhanh thắng nhanh',
        ],
        answer: 1,
        explain: 'Bãi cọc đầu bịt sắt kết hợp thủy triều lên xuống khiến thuyền địch vỡ, đắm.',
      },
      {
        q: 'Ý nghĩa lớn nhất của chiến thắng Bạch Đằng năm 938 là gì?',
        options: [
          'Mở đầu thời kỳ Bắc thuộc',
          'Chấm dứt hơn 1000 năm Bắc thuộc',
          'Thống nhất hai miền Nam – Bắc',
          'Đánh bại quân Mông Cổ',
        ],
        answer: 1,
        explain: 'Chiến thắng mở ra kỷ nguyên độc lập, tự chủ lâu dài của dân tộc.',
      },
      {
        q: 'Năm 939, Ngô Quyền xưng vương và đóng đô ở đâu?',
        options: ['Hoa Lư', 'Thăng Long', 'Cổ Loa', 'Phú Xuân'],
        answer: 2,
        explain: 'Ngô Quyền chọn Cổ Loa — kinh đô cũ của An Dương Vương — làm nơi đóng đô.',
      },
    ],
  },

  // ───────────────────────────────────────────── 4
  {
    id: 4,
    slug: 'khang-chien-chong-tong',
    time: '1075 – 1077',
    yearLabel: '1075',
    sortYear: 1075,
    title: 'Kháng chiến chống Tống lần thứ hai',
    shortTitle: 'Chống Tống',
    periodId: 'tu-chu',
    period: 'Thời kỳ phong kiến tự chủ (Nhà Lý)',
    summary:
      'Dưới sự chỉ huy của Lý Thường Kiệt, quân dân Đại Việt thực hiện chiến lược “tiên phát chế nhân” đánh sang đất Tống, sau đó lập phòng tuyến trên sông Như Nguyệt để đánh tan quân xâm lược.',
    context:
      'Nửa sau thế kỷ XI, nhà Tống gặp nhiều khó khăn trong nước và bị các nước phía bắc uy hiếp, nên tính chuyện xâm lược Đại Việt để gây thanh thế. Chúng tích trữ lương thảo, luyện quân ở các châu sát biên giới.',
    timeline: [
      {
        when: 'Cuối năm 1075',
        text: 'Lý Thường Kiệt chủ trương “ngồi yên đợi giặc không bằng đem quân đánh trước để chặn mũi nhọn của giặc”, chia quân thủy, bộ đánh vào Khâm Châu, Liêm Châu.',
      },
      {
        when: 'Đầu năm 1076',
        text: 'Quân ta hạ thành Ung Châu — căn cứ tập trung lương thảo lớn của quân Tống — rồi chủ động rút về nước.',
      },
      {
        when: '1076',
        text: 'Lý Thường Kiệt cho xây dựng phòng tuyến kiên cố bằng đất, cắm rào tre dày đặc dọc bờ nam sông Như Nguyệt (sông Cầu).',
      },
      {
        when: 'Đầu năm 1077',
        text: 'Quân Tống do Quách Quỳ, Triệu Tiết chỉ huy kéo sang nhưng không vượt được sông Như Nguyệt; cánh thủy quân bị chặn đánh ở vùng biển Đông Bắc.',
      },
      {
        when: 'Cuối xuân 1077',
        text: 'Quân ta bất ngờ phản công, quân Tống thua to. Lý Thường Kiệt chủ động đề nghị giảng hòa; quân Tống rút về nước.',
      },
    ],
    result: 'Cuộc kháng chiến thắng lợi, quân Tống phải rút về nước, nền độc lập của Đại Việt được giữ vững.',
    significance:
      'Một trong những trận đánh phòng ngự – phản công xuất sắc trong lịch sử. Bài thơ “Nam quốc sơn hà” gắn với cuộc kháng chiến được xem như bản tuyên ngôn độc lập đầu tiên của nước ta.',
    figures: [
      { name: 'Lý Thường Kiệt', role: 'Tổng chỉ huy cuộc kháng chiến' },
      { name: 'Tông Đản', role: 'Chỉ huy cánh quân bộ tiến sang đất Tống' },
    ],
    places: [{ name: 'Sông Như Nguyệt', lat: 21.22, lon: 106.05 }],
    facts: ['“Tiên phát chế nhân” nghĩa là ra tay trước để khống chế đối phương.'],
    image: null,
    video: null,
    sim3d: null,
    quiz: [
      {
        q: 'Ai là người chỉ huy cuộc kháng chiến chống Tống 1075 – 1077?',
        options: ['Lý Công Uẩn', 'Lý Thường Kiệt', 'Trần Thủ Độ', 'Lê Hoàn'],
        answer: 1,
        explain: 'Lý Thường Kiệt là tổng chỉ huy cuộc kháng chiến.',
      },
      {
        q: '“Tiên phát chế nhân” có nghĩa là gì?',
        options: [
          'Rút lui để bảo toàn lực lượng',
          'Chủ động tiến công trước để chặn thế mạnh của giặc',
          'Giảng hòa trước khi đánh',
          'Đánh du kích lâu dài',
        ],
        answer: 1,
        explain: 'Lý Thường Kiệt chủ động đánh sang đất Tống để phá căn cứ chuẩn bị xâm lược.',
      },
      {
        q: 'Phòng tuyến chống quân Tống được xây dựng trên con sông nào?',
        options: ['Sông Bạch Đằng', 'Sông Như Nguyệt', 'Sông Hồng', 'Sông Tiền'],
        answer: 1,
        explain: 'Phòng tuyến Như Nguyệt nằm trên sông Cầu ngày nay.',
      },
      {
        q: 'Bài thơ nào được xem như bản tuyên ngôn độc lập đầu tiên, gắn với cuộc kháng chiến này?',
        options: ['Hịch tướng sĩ', 'Bình Ngô đại cáo', 'Nam quốc sơn hà', 'Chiếu dời đô'],
        answer: 2,
        explain: '“Nam quốc sơn hà” khẳng định chủ quyền của nước Nam.',
      },
      {
        q: 'Lý Thường Kiệt kết thúc chiến tranh bằng cách nào?',
        options: [
          'Truy kích tiêu diệt toàn bộ quân Tống',
          'Chủ động đề nghị giảng hòa để quân Tống rút về',
          'Cầu viện nước khác',
          'Ký hiệp ước chia đôi đất nước',
        ],
        answer: 1,
        explain: 'Giảng hòa giúp kết thúc chiến tranh nhanh, giữ quan hệ hòa hiếu lâu dài.',
      },
    ],
  },

  // ───────────────────────────────────────────── 5
  {
    id: 5,
    slug: 'khang-chien-chong-mong-nguyen',
    time: 'Thế kỷ XIII',
    yearLabel: '1258',
    sortYear: 1258,
    title: 'Ba lần kháng chiến chống Mông – Nguyên',
    shortTitle: 'Chống Mông – Nguyên',
    periodId: 'tu-chu',
    period: 'Thời kỳ phong kiến tự chủ (Nhà Trần)',
    summary:
      'Quân dân nhà Trần dưới sự chỉ huy của Trần Thủ Độ, Trần Hưng Đạo đã ba lần (1258, 1285, 1287 – 1288) đánh bại đế chế hùng mạnh nhất thế giới, bảo vệ vững chắc nền độc lập.',
    context:
      'Thế kỷ XIII, đế quốc Mông Cổ (sau là nhà Nguyên) chinh phục một vùng rộng lớn từ châu Á sang châu Âu. Đại Việt nằm trên đường tiến xuống phương Nam nên ba lần bị xâm lược.',
    timeline: [
      {
        when: '1258',
        text: 'Lần thứ nhất: Quân Mông Cổ do Ngột Lương Hợp Thai chỉ huy tiến vào Thăng Long. Trần Thủ Độ khẳng định: “Đầu thần chưa rơi xuống đất, xin bệ hạ đừng lo”. Quân ta phản công ở Đông Bộ Đầu, địch rút chạy.',
      },
      {
        when: '1284',
        text: 'Hội nghị Diên Hồng hỏi ý kiến các bô lão; cả hội nghị đồng thanh hô “Đánh!”. Trần Hưng Đạo soạn “Hịch tướng sĩ”, quân sĩ thích lên tay hai chữ “Sát Thát”.',
      },
      {
        when: '1285',
        text: 'Lần thứ hai: Thoát Hoan đem quân lớn tiến vào. Quân ta thực hiện “vườn không nhà trống”, rồi phản công thắng lớn ở Hàm Tử, Chương Dương, Tây Kết, Vạn Kiếp.',
      },
      {
        when: '1287 – 1288',
        text: 'Lần thứ ba: Trần Khánh Dư đánh tan đoàn thuyền lương của Trương Văn Hổ ở Vân Đồn, khiến quân Nguyên thiếu lương thực trầm trọng.',
      },
      {
        when: 'Tháng 4/1288',
        text: 'Trần Hưng Đạo bố trí trận địa cọc trên sông Bạch Đằng, đánh tan thủy quân Nguyên, bắt sống Ô Mã Nhi.',
      },
    ],
    result: 'Cả ba lần kháng chiến đều thắng lợi, quân xâm lược Mông – Nguyên phải rút chạy.',
    significance:
      'Đập tan ý chí xâm lược của đế chế hùng mạnh bậc nhất thời bấy giờ, bảo vệ độc lập dân tộc. Để lại bài học về khối đoàn kết toàn dân và nghệ thuật lấy ít địch nhiều.',
    figures: [
      { name: 'Trần Hưng Đạo (Trần Quốc Tuấn)', role: 'Quốc công tiết chế, chỉ huy kháng chiến lần 2 và lần 3' },
      { name: 'Trần Thủ Độ', role: 'Thái sư, chỉ huy kháng chiến lần thứ nhất' },
      { name: 'Trần Quốc Toản', role: 'Thiếu niên anh hùng với lá cờ “Phá cường địch, báo hoàng ân”' },
    ],
    places: [
      { name: 'Vạn Kiếp', lat: 21.11, lon: 106.39 },
      { name: 'Bạch Đằng 1288', lat: 20.9, lon: 106.78 },
    ],
    facts: ['Quân Mông Cổ từng chinh phục từ Trung Hoa, Trung Á đến Đông Âu.'],
    image: null,
    video: null,
    sim3d: null,
    quiz: [
      {
        q: 'Ba lần kháng chiến chống Mông – Nguyên diễn ra vào những năm nào?',
        options: ['1075, 1076, 1077', '1258, 1285, 1287 – 1288', '1418, 1427, 1428', '1785, 1788, 1789'],
        answer: 1,
        explain: 'Ba lần kháng chiến: 1258, 1285 và 1287 – 1288.',
      },
      {
        q: 'Hội nghị nào hỏi ý kiến các bô lão về việc đánh hay hòa?',
        options: ['Hội nghị Bình Than', 'Hội nghị Diên Hồng', 'Hội thề Đông Quan', 'Hội nghị Tân Trào'],
        answer: 1,
        explain: 'Tại Hội nghị Diên Hồng, các bô lão đồng thanh hô “Đánh!”.',
      },
      {
        q: 'Tác phẩm nào do Trần Hưng Đạo soạn để khích lệ tướng sĩ?',
        options: ['Nam quốc sơn hà', 'Hịch tướng sĩ', 'Bình Ngô đại cáo', 'Chiếu Cần Vương'],
        answer: 1,
        explain: '“Hịch tướng sĩ” khơi dậy lòng căm thù giặc và tinh thần chiến đấu.',
      },
      {
        q: 'Trận đánh nào kết thúc thắng lợi cuộc kháng chiến lần thứ ba?',
        options: ['Đông Bộ Đầu', 'Chương Dương', 'Bạch Đằng năm 1288', 'Chi Lăng'],
        answer: 2,
        explain: 'Trận Bạch Đằng tháng 4/1288, bắt sống Ô Mã Nhi.',
      },
      {
        q: 'Kế sách “vườn không nhà trống” nhằm mục đích gì?',
        options: [
          'Để dân chạy trốn ra nước ngoài',
          'Không để lại lương thực, của cải cho giặc, khiến giặc lâm vào thế khó',
          'Mở đường cho giặc vào kinh thành',
          'Xây dựng thành lũy kiên cố',
        ],
        answer: 1,
        explain: 'Giặc không cướp được lương thực, càng đánh càng suy yếu.',
      },
    ],
  },

  // ───────────────────────────────────────────── 6
  {
    id: 6,
    slug: 'khoi-nghia-lam-son',
    time: '1418 – 1427',
    yearLabel: '1418',
    sortYear: 1418,
    title: 'Khởi nghĩa Lam Sơn',
    shortTitle: 'Lam Sơn',
    periodId: 'tu-chu',
    period: 'Thời kỳ phong kiến tự chủ',
    summary:
      'Lê Lợi và Nguyễn Trãi lãnh đạo cuộc khởi nghĩa bùng nổ từ vùng núi Thanh Hóa, phát triển thành chiến tranh giải phóng dân tộc quy mô toàn quốc, đánh đuổi quân Minh và lập ra nhà Hậu Lê.',
    context:
      'Năm 1407, nhà Minh đánh bại nhà Hồ và đặt ách đô hộ, thi hành chính sách bóc lột, đồng hóa tàn bạo. Lê Lợi — một hào trưởng có uy tín ở Lam Sơn (Thanh Hóa) — bí mật tập hợp nghĩa sĩ, trong đó có Nguyễn Trãi.',
    timeline: [
      {
        when: 'Đầu năm 1418',
        text: 'Lê Lợi dựng cờ khởi nghĩa ở Lam Sơn, tự xưng Bình Định Vương. Nghĩa quân nhiều lần bị vây, phải rút lên núi Chí Linh; Lê Lai liều mình cứu chúa.',
      },
      {
        when: '1424 – 1425',
        text: 'Theo kế của Nguyễn Chích, nghĩa quân chuyển vào Nghệ An, rồi giải phóng Tân Bình, Thuận Hóa, tạo căn cứ vững chắc.',
      },
      {
        when: 'Cuối năm 1426',
        text: 'Nghĩa quân tiến ra Bắc, giành thắng lợi lớn ở Tốt Động – Chúc Động, vây hãm thành Đông Quan.',
      },
      {
        when: 'Tháng 10/1427',
        text: 'Chiến thắng Chi Lăng – Xương Giang: chủ tướng viện binh Liễu Thăng bị giết ở ải Chi Lăng, hàng vạn quân Minh bị tiêu diệt.',
      },
      {
        when: 'Tháng 12/1427',
        text: 'Vương Thông xin hòa, Hội thề Đông Quan diễn ra; quân Minh rút về nước. Đầu năm 1428, Nguyễn Trãi viết “Bình Ngô đại cáo”.',
      },
    ],
    result: 'Quân Minh bị đánh đuổi hoàn toàn. Năm 1428, Lê Lợi lên ngôi hoàng đế, lập ra nhà Lê (Hậu Lê), khôi phục quốc hiệu Đại Việt.',
    significance:
      'Kết thúc 20 năm đô hộ của nhà Minh, mở ra thời kỳ phát triển mới. “Bình Ngô đại cáo” được coi là bản tuyên ngôn độc lập thứ hai của dân tộc.',
    figures: [
      { name: 'Lê Lợi', role: 'Lãnh tụ khởi nghĩa, vua Lê Thái Tổ' },
      { name: 'Nguyễn Trãi', role: 'Quân sư, tác giả “Bình Ngô đại cáo”' },
      { name: 'Lê Lai', role: 'Liều mình cứu chúa' },
    ],
    places: [{ name: 'Lam Sơn', lat: 19.93, lon: 105.4 }],
    facts: ['Ải Chi Lăng (Lạng Sơn) là nơi địa hình hiểm trở, nhiều lần là mồ chôn quân xâm lược.'],
    image: null,
    video: null,
    sim3d: null,
    quiz: [
      {
        q: 'Lê Lợi dựng cờ khởi nghĩa ở đâu?',
        options: ['Lam Sơn (Thanh Hóa)', 'Tây Sơn (Bình Định)', 'Hát Môn (Hà Nội)', 'Yên Thế (Bắc Giang)'],
        answer: 0,
        explain: 'Khởi nghĩa bùng nổ ở Lam Sơn, Thanh Hóa, năm 1418.',
      },
      {
        q: 'Ai đã liều mình cải trang làm Lê Lợi để cứu chúa?',
        options: ['Nguyễn Trãi', 'Lê Lai', 'Nguyễn Chích', 'Đinh Lễ'],
        answer: 1,
        explain: 'Lê Lai hy sinh để Lê Lợi thoát khỏi vòng vây.',
      },
      {
        q: 'Trận quyết chiến chiến lược năm 1427 là trận nào?',
        options: ['Tốt Động – Chúc Động', 'Chi Lăng – Xương Giang', 'Ngọc Hồi – Đống Đa', 'Rạch Gầm – Xoài Mút'],
        answer: 1,
        explain: 'Chiến thắng Chi Lăng – Xương Giang đập tan viện binh nhà Minh.',
      },
      {
        q: 'Tác phẩm nào của Nguyễn Trãi được coi là bản tuyên ngôn độc lập thứ hai?',
        options: ['Hịch tướng sĩ', 'Nam quốc sơn hà', 'Bình Ngô đại cáo', 'Quân trung từ mệnh tập'],
        answer: 2,
        explain: '“Bình Ngô đại cáo” tổng kết cuộc kháng chiến và khẳng định nền độc lập.',
      },
      {
        q: 'Khởi nghĩa Lam Sơn đánh đuổi quân xâm lược nào?',
        options: ['Quân Nguyên', 'Quân Minh', 'Quân Thanh', 'Quân Tống'],
        answer: 1,
        explain: 'Nghĩa quân Lam Sơn đánh đuổi quân Minh.',
      },
    ],
  },

  // ───────────────────────────────────────────── 7
  {
    id: 7,
    slug: 'phong-trao-tay-son',
    time: '1785 – 1789',
    yearLabel: '1785',
    sortYear: 1785,
    title: 'Phong trào Tây Sơn',
    shortTitle: 'Tây Sơn',
    periodId: 'tu-chu',
    period: 'Thời kỳ phong kiến tự chủ',
    summary:
      'Dưới sự lãnh đạo của Nguyễn Huệ (Quang Trung), nghĩa quân Tây Sơn đã đánh tan 5 vạn quân Xiêm (trận Rạch Gầm – Xoài Mút, 1785) và 29 vạn quân Thanh (trận Ngọc Hồi – Đống Đa, 1789), bảo vệ độc lập và bước đầu thống nhất đất nước.',
    context:
      'Năm 1771, ba anh em Nguyễn Nhạc, Nguyễn Huệ, Nguyễn Lữ dựng cờ khởi nghĩa ở Tây Sơn (Bình Định). Thất bại trước Tây Sơn, Nguyễn Ánh cầu cứu Xiêm; sau đó vua Lê Chiêu Thống cầu cứu nhà Thanh, mở đường cho ngoại xâm.',
    timeline: [
      {
        when: 'Tháng 1/1785',
        text: 'Nguyễn Huệ bố trí trận địa mai phục trên sông Tiền, đoạn Rạch Gầm – Xoài Mút (Tiền Giang), đánh tan 5 vạn quân Xiêm.',
      },
      {
        when: '1786',
        text: 'Nghĩa quân Tây Sơn tiến ra Bắc, lật đổ chính quyền chúa Trịnh, xóa bỏ ranh giới chia cắt Đàng Trong – Đàng Ngoài.',
      },
      {
        when: 'Cuối năm 1788',
        text: '29 vạn quân Thanh do Tôn Sĩ Nghị chỉ huy tiến vào Thăng Long. Ngày 22/12/1788, Nguyễn Huệ lên ngôi hoàng đế ở Phú Xuân, lấy niên hiệu Quang Trung, rồi tiến quân ra Bắc.',
      },
      {
        when: 'Đêm 30 Tết Kỷ Dậu',
        text: 'Quang Trung cho quân ăn Tết trước, chia làm 5 đạo tiến đánh. Quân ta lần lượt hạ các đồn Hà Hồi, Ngọc Hồi.',
      },
      {
        when: 'Mùng 5 Tết (30/1/1789)',
        text: 'Đồn Ngọc Hồi bị hạ, tướng Sầm Nghi Đống ở Đống Đa thắt cổ tự tử; Tôn Sĩ Nghị hoảng sợ bỏ chạy. Quang Trung tiến vào Thăng Long.',
      },
    ],
    result: 'Đánh tan quân Xiêm và quân Thanh, lật đổ các chính quyền phong kiến Nguyễn, Trịnh, Lê.',
    significance:
      'Bảo vệ vững chắc độc lập dân tộc, xóa bỏ tình trạng chia cắt, đặt nền tảng thống nhất đất nước. Quang Trung là thiên tài quân sự với lối đánh thần tốc, bất ngờ.',
    figures: [
      { name: 'Nguyễn Huệ – Quang Trung', role: 'Thủ lĩnh, hoàng đế, chỉ huy các trận quyết chiến' },
      { name: 'Nguyễn Nhạc, Nguyễn Lữ', role: 'Cùng lãnh đạo phong trào Tây Sơn' },
    ],
    places: [
      { name: 'Rạch Gầm – Xoài Mút', lat: 10.35, lon: 106.2 },
      { name: 'Ngọc Hồi – Đống Đa', lat: 20.92, lon: 105.85 },
    ],
    facts: ['Tết Kỷ Dậu 1789, quân Tây Sơn hành quân thần tốc, giải phóng Thăng Long chỉ trong vài ngày.'],
    image: null,
    video: null,
    sim3d: null,
    quiz: [
      {
        q: 'Trận Rạch Gầm – Xoài Mút (1785) đánh tan quân xâm lược nào?',
        options: ['Quân Thanh', 'Quân Xiêm', 'Quân Minh', 'Quân Pháp'],
        answer: 1,
        explain: 'Nguyễn Huệ đánh tan 5 vạn quân Xiêm trên sông Tiền.',
      },
      {
        q: 'Nguyễn Huệ lên ngôi hoàng đế, lấy niên hiệu Quang Trung vào năm nào?',
        options: ['1771', '1785', '1788', '1802'],
        answer: 2,
        explain: 'Ngày 22/12/1788, Nguyễn Huệ lên ngôi ở Phú Xuân.',
      },
      {
        q: 'Trận Ngọc Hồi – Đống Đa diễn ra vào dịp nào?',
        options: ['Tết Kỷ Dậu 1789', 'Rằm tháng Bảy 1788', 'Mùa thu 1786', 'Tết Mậu Thân 1968'],
        answer: 0,
        explain: 'Quân Tây Sơn đại phá quân Thanh vào Tết Kỷ Dậu 1789.',
      },
      {
        q: 'Quân Thanh sang xâm lược nước ta năm 1788 có khoảng bao nhiêu quân?',
        options: ['5 vạn', '10 vạn', '29 vạn', '50 vạn'],
        answer: 2,
        explain: 'Tôn Sĩ Nghị chỉ huy 29 vạn quân Thanh.',
      },
      {
        q: 'Phong trào Tây Sơn bùng nổ ở đâu?',
        options: ['Lam Sơn (Thanh Hóa)', 'Tây Sơn (Bình Định)', 'Phú Xuân (Huế)', 'Gia Định'],
        answer: 1,
        explain: 'Năm 1771, ba anh em nhà Tây Sơn dựng cờ khởi nghĩa ở Bình Định.',
      },
    ],
  },

  // ───────────────────────────────────────────── 8
  {
    id: 8,
    slug: 'phong-trao-can-vuong-yen-the',
    time: 'Cuối thế kỷ XIX – Đầu thế kỷ XX',
    yearLabel: '1885',
    sortYear: 1885,
    title: 'Phong trào Cần Vương và Yên Thế',
    shortTitle: 'Cần Vương – Yên Thế',
    periodId: 'phap-thuoc',
    period: 'Thời kỳ Pháp thuộc',
    summary:
      'Các cuộc đấu tranh vũ trang sôi nổi dưới ngọn cờ tôn quân cứu quốc (khởi nghĩa Hương Khê, Ba Đình, Bãi Sậy) và phong trào nông dân Yên Thế do Hoàng Hoa Thám lãnh đạo.',
    context:
      'Sau các hiệp ước 1883 và 1884, Pháp cơ bản đặt ách thống trị lên Việt Nam. Phái chủ chiến trong triều đình Huế do Tôn Thất Thuyết đứng đầu chuẩn bị lực lượng chống Pháp.',
    timeline: [
      {
        when: 'Đêm 4 rạng 5/7/1885',
        text: 'Tôn Thất Thuyết cho quân tấn công Pháp ở kinh thành Huế nhưng thất bại, rồi đưa vua Hàm Nghi chạy ra Tân Sở (Quảng Trị).',
      },
      {
        when: '13/7/1885',
        text: 'Nhân danh vua Hàm Nghi, Tôn Thất Thuyết ra chiếu Cần Vương, kêu gọi văn thân, sĩ phu và nhân dân đứng lên giúp vua cứu nước.',
      },
      {
        when: '1885 – 1896',
        text: 'Nhiều cuộc khởi nghĩa bùng nổ: Ba Đình (Thanh Hóa), Bãi Sậy (Hưng Yên), Hương Khê (Hà Tĩnh) — lớn và kéo dài nhất, do Phan Đình Phùng và Cao Thắng lãnh đạo.',
      },
      {
        when: 'Tháng 11/1888',
        text: 'Vua Hàm Nghi bị bắt rồi bị đày sang Angiêri, nhưng phong trào vẫn tiếp tục đến năm 1896.',
      },
      {
        when: '1884 – 1913',
        text: 'Ở Yên Thế (Bắc Giang), nông dân dưới sự lãnh đạo của Hoàng Hoa Thám (Đề Thám) kiên cường chiến đấu gần 30 năm.',
      },
    ],
    result: 'Các phong trào cuối cùng đều thất bại do thiếu đường lối đúng đắn và bị thực dân Pháp đàn áp.',
    significance:
      'Thể hiện tinh thần yêu nước, ý chí bất khuất của nhân dân; để lại nhiều bài học kinh nghiệm cho các phong trào giải phóng dân tộc sau này.',
    figures: [
      { name: 'Vua Hàm Nghi', role: 'Vị vua yêu nước, biểu tượng của phong trào Cần Vương' },
      { name: 'Tôn Thất Thuyết', role: 'Thủ lĩnh phái chủ chiến' },
      { name: 'Phan Đình Phùng', role: 'Lãnh đạo khởi nghĩa Hương Khê' },
      { name: 'Hoàng Hoa Thám', role: 'Thủ lĩnh khởi nghĩa Yên Thế' },
    ],
    places: [
      { name: 'Hương Khê', lat: 18.18, lon: 105.7 },
      { name: 'Ba Đình', lat: 20.04, lon: 105.86 },
      { name: 'Yên Thế', lat: 21.52, lon: 106.1 },
    ],
    facts: ['Nghĩa quân Hương Khê tự chế tạo được súng trường theo mẫu súng của Pháp.'],
    image: null,
    video: null,
    sim3d: null,
    quiz: [
      {
        q: 'Ai nhân danh vua Hàm Nghi ra chiếu Cần Vương năm 1885?',
        options: ['Phan Đình Phùng', 'Tôn Thất Thuyết', 'Hoàng Hoa Thám', 'Nguyễn Thiện Thuật'],
        answer: 1,
        explain: 'Tôn Thất Thuyết ra chiếu Cần Vương ngày 13/7/1885 tại Tân Sở.',
      },
      {
        q: 'Cuộc khởi nghĩa lớn nhất trong phong trào Cần Vương là cuộc khởi nghĩa nào?',
        options: ['Ba Đình', 'Bãi Sậy', 'Hương Khê', 'Yên Thế'],
        answer: 2,
        explain: 'Khởi nghĩa Hương Khê kéo dài từ 1885 đến 1896.',
      },
      {
        q: 'Ai lãnh đạo khởi nghĩa Hương Khê?',
        options: ['Phan Đình Phùng', 'Đinh Công Tráng', 'Nguyễn Thiện Thuật', 'Phan Bội Châu'],
        answer: 0,
        explain: 'Phan Đình Phùng lãnh đạo, Cao Thắng là phó tướng chế tạo súng.',
      },
      {
        q: 'Thủ lĩnh nổi tiếng của khởi nghĩa Yên Thế là ai?',
        options: ['Hoàng Hoa Thám', 'Trương Định', 'Nguyễn Trung Trực', 'Tôn Thất Thuyết'],
        answer: 0,
        explain: 'Hoàng Hoa Thám (Đề Thám) được gọi là “Hùm thiêng Yên Thế”.',
      },
      {
        q: 'Khởi nghĩa Yên Thế kéo dài trong khoảng thời gian nào?',
        options: ['1858 – 1862', '1884 – 1913', '1930 – 1931', '1885 – 1888'],
        answer: 1,
        explain: 'Phong trào nông dân Yên Thế kéo dài gần 30 năm (1884 – 1913).',
      },
    ],
  },

  // ───────────────────────────────────────────── 9
  {
    id: 9,
    slug: 'cach-mang-thang-tam',
    time: 'Tháng 8/1945',
    yearLabel: '1945',
    sortYear: 1945,
    title: 'Cách mạng tháng Tám',
    shortTitle: 'Cách mạng tháng Tám',
    periodId: 'hien-dai',
    period: 'Đấu tranh giành độc lập',
    summary:
      'Dưới sự lãnh đạo của Đảng Cộng sản Đông Dương và Hồ Chí Minh, toàn dân tộc nổi dậy giành chính quyền từ tay phát xít Nhật và thực dân Pháp, khai sinh ra nước Việt Nam Dân chủ Cộng hòa (2/9/1945).',
    context:
      'Ngày 9/3/1945, Nhật đảo chính Pháp, độc chiếm Đông Dương. Giữa tháng 8/1945, Nhật đầu hàng Đồng minh; quân Nhật ở Đông Dương rệu rã, chính quyền tay sai hoang mang — thời cơ ngàn năm có một đã đến.',
    timeline: [
      {
        when: '13 – 15/8/1945',
        text: 'Hội nghị toàn quốc của Đảng họp ở Tân Trào (Tuyên Quang), quyết định phát động Tổng khởi nghĩa; Ủy ban khởi nghĩa toàn quốc ra Quân lệnh số 1.',
      },
      {
        when: '16/8/1945',
        text: 'Quốc dân đại hội ở Tân Trào tán thành chủ trương Tổng khởi nghĩa, cử ra Ủy ban dân tộc giải phóng Việt Nam do Hồ Chí Minh làm Chủ tịch.',
      },
      {
        when: '19/8/1945',
        text: 'Khởi nghĩa giành chính quyền thắng lợi ở Hà Nội; tiếp đó là Huế (23/8) và Sài Gòn (25/8).',
      },
      {
        when: '30/8/1945',
        text: 'Vua Bảo Đại thoái vị, chế độ phong kiến ở Việt Nam chấm dứt. Chỉ trong khoảng 15 ngày, Tổng khởi nghĩa thắng lợi trên cả nước.',
      },
      {
        when: '2/9/1945',
        text: 'Tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa.',
      },
    ],
    result: 'Lật đổ ách thống trị của Pháp – Nhật và chế độ phong kiến, lập ra nước Việt Nam Dân chủ Cộng hòa.',
    significance:
      'Mở ra kỷ nguyên mới: kỷ nguyên độc lập, tự do. Nhân dân Việt Nam từ thân phận nô lệ trở thành người làm chủ đất nước; cổ vũ phong trào giải phóng dân tộc trên thế giới.',
    figures: [
      { name: 'Hồ Chí Minh', role: 'Lãnh tụ cách mạng, đọc Tuyên ngôn độc lập' },
      { name: 'Võ Nguyên Giáp', role: 'Chỉ huy lực lượng vũ trang giải phóng' },
    ],
    places: [
      { name: 'Tân Trào', lat: 21.79, lon: 105.43 },
      { name: 'Quảng trường Ba Đình', lat: 21.037, lon: 105.835 },
    ],
    facts: ['Tuyên ngôn độc lập mở đầu bằng việc trích dẫn Tuyên ngôn độc lập của Mỹ (1776) và Tuyên ngôn Nhân quyền và Dân quyền của Pháp (1791).'],
    image: null,
    video: null,
    sim3d: null,
    quiz: [
      {
        q: 'Khởi nghĩa giành chính quyền ở Hà Nội thắng lợi vào ngày nào?',
        options: ['19/8/1945', '23/8/1945', '25/8/1945', '2/9/1945'],
        answer: 0,
        explain: 'Ngày 19/8/1945, nhân dân Hà Nội giành chính quyền.',
      },
      {
        q: 'Hội nghị toàn quốc của Đảng và Quốc dân đại hội tháng 8/1945 họp ở đâu?',
        options: ['Pác Bó', 'Tân Trào', 'Hà Nội', 'Huế'],
        answer: 1,
        explain: 'Cả hai hội nghị đều họp ở Tân Trào, Tuyên Quang.',
      },
      {
        q: 'Chủ tịch Hồ Chí Minh đọc Tuyên ngôn độc lập vào ngày nào?',
        options: ['19/8/1945', '30/8/1945', '2/9/1945', '19/12/1946'],
        answer: 2,
        explain: 'Ngày 2/9/1945 tại Quảng trường Ba Đình.',
      },
      {
        q: 'Vị vua cuối cùng của chế độ phong kiến Việt Nam thoái vị là ai?',
        options: ['Hàm Nghi', 'Duy Tân', 'Khải Định', 'Bảo Đại'],
        answer: 3,
        explain: 'Vua Bảo Đại thoái vị ngày 30/8/1945.',
      },
      {
        q: 'Cách mạng tháng Tám thành công đã khai sinh ra nhà nước nào?',
        options: [
          'Việt Nam Dân chủ Cộng hòa',
          'Cộng hòa xã hội chủ nghĩa Việt Nam',
          'Đế quốc Việt Nam',
          'Liên bang Đông Dương',
        ],
        answer: 0,
        explain: 'Nước Việt Nam Dân chủ Cộng hòa ra đời ngày 2/9/1945.',
      },
    ],
  },

  // ───────────────────────────────────────────── 10
  {
    id: 10,
    slug: 'khang-chien-chong-phap',
    time: '1946 – 1954',
    yearLabel: '1946',
    sortYear: 1946,
    title: 'Kháng chiến chống thực dân Pháp',
    shortTitle: 'Chống Pháp',
    periodId: 'hien-dai',
    period: 'Thời kỳ hiện đại',
    summary:
      'Trải qua 9 năm trường kỳ kháng chiến với các chiến dịch lớn (Việt Bắc 1947, Biên giới 1950) và kết thúc bằng thắng lợi lịch sử Điện Biên Phủ (1954), buộc Pháp phải ký Hiệp định Geneva.',
    context:
      'Sau Cách mạng tháng Tám, thực dân Pháp quay lại xâm lược. Ngày 19/12/1946, Chủ tịch Hồ Chí Minh ra Lời kêu gọi toàn quốc kháng chiến: “Chúng ta thà hy sinh tất cả, chứ nhất định không chịu mất nước, nhất định không chịu làm nô lệ”.',
    timeline: [
      {
        when: '19/12/1946',
        text: 'Toàn quốc kháng chiến bùng nổ, theo đường lối toàn dân, toàn diện, trường kỳ, tự lực cánh sinh.',
      },
      {
        when: 'Thu – đông 1947',
        text: 'Chiến dịch Việt Bắc đánh bại cuộc tấn công lớn của Pháp lên căn cứ địa, bảo vệ cơ quan đầu não kháng chiến.',
      },
      {
        when: 'Thu – đông 1950',
        text: 'Chiến dịch Biên giới — chiến dịch tiến công lớn đầu tiên do ta chủ động mở — khai thông biên giới Việt – Trung.',
      },
      {
        when: '13/3 – 7/5/1954',
        text: 'Chiến dịch Điện Biên Phủ do Đại tướng Võ Nguyên Giáp chỉ huy, sau 56 ngày đêm tiêu diệt toàn bộ tập đoàn cứ điểm, bắt sống tướng De Castries.',
      },
      {
        when: '21/7/1954',
        text: 'Hiệp định Giơ-ne-vơ (Geneva) về Đông Dương được ký kết, công nhận độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của Việt Nam.',
      },
    ],
    result: 'Kết thúc cuộc chiến tranh xâm lược của Pháp; miền Bắc được hoàn toàn giải phóng.',
    significance:
      'Chiến thắng Điện Biên Phủ “lừng lẫy năm châu, chấn động địa cầu”, cổ vũ mạnh mẽ phong trào giải phóng dân tộc ở châu Á, châu Phi và Mỹ Latinh.',
    figures: [
      { name: 'Hồ Chí Minh', role: 'Lãnh đạo cuộc kháng chiến' },
      { name: 'Võ Nguyên Giáp', role: 'Tổng chỉ huy chiến dịch Điện Biên Phủ' },
    ],
    places: [
      { name: 'Điện Biên Phủ', lat: 21.386, lon: 103.017 },
      { name: 'Việt Bắc', lat: 21.85, lon: 105.6 },
    ],
    facts: ['Hiệp định Giơ-ne-vơ quy định lấy vĩ tuyến 17 làm giới tuyến quân sự tạm thời.'],
    image: null,
    video: null,
    sim3d: null,
    quiz: [
      {
        q: 'Lời kêu gọi toàn quốc kháng chiến được ra đời vào ngày nào?',
        options: ['2/9/1945', '19/12/1946', '7/5/1954', '21/7/1954'],
        answer: 1,
        explain: 'Chủ tịch Hồ Chí Minh ra Lời kêu gọi ngày 19/12/1946.',
      },
      {
        q: 'Chiến dịch tiến công lớn đầu tiên do quân ta chủ động mở là chiến dịch nào?',
        options: ['Việt Bắc 1947', 'Biên giới 1950', 'Điện Biên Phủ 1954', 'Hòa Bình 1951'],
        answer: 1,
        explain: 'Chiến dịch Biên giới thu – đông 1950.',
      },
      {
        q: 'Chiến dịch Điện Biên Phủ kéo dài bao nhiêu ngày đêm?',
        options: ['12 ngày đêm', '30 ngày đêm', '56 ngày đêm', '81 ngày đêm'],
        answer: 2,
        explain: 'Từ 13/3 đến 7/5/1954 — 56 ngày đêm.',
      },
      {
        q: 'Ai là Tổng chỉ huy chiến dịch Điện Biên Phủ?',
        options: ['Văn Tiến Dũng', 'Võ Nguyên Giáp', 'Hoàng Văn Thái', 'Nguyễn Chí Thanh'],
        answer: 1,
        explain: 'Đại tướng Võ Nguyên Giáp chỉ huy chiến dịch.',
      },
      {
        q: 'Hiệp định nào kết thúc cuộc kháng chiến chống Pháp?',
        options: ['Hiệp định Sơ bộ', 'Hiệp định Paris', 'Hiệp định Giơ-ne-vơ', 'Hiệp ước Pa-tơ-nốt'],
        answer: 2,
        explain: 'Hiệp định Giơ-ne-vơ ký ngày 21/7/1954.',
      },
    ],
  },

  // ───────────────────────────────────────────── 11
  {
    id: 11,
    slug: 'khang-chien-chong-my',
    time: '1954 – 1975',
    yearLabel: '1975',
    sortYear: 1975,
    title: 'Kháng chiến chống Mỹ, cứu nước',
    shortTitle: 'Chống Mỹ',
    periodId: 'hien-dai',
    period: 'Thời kỳ hiện đại',
    summary:
      'Cuộc chiến đấu khốc liệt giải phóng miền Nam, thống nhất đất nước với nhiều mốc son: Phong trào Đồng Khởi (1960), Tổng tiến công Mậu Thân (1968), Điện Biên Phủ trên không (1972) và đỉnh cao là Đại thắng mùa Xuân 1975.',
    context:
      'Sau Hiệp định Giơ-ne-vơ, Mỹ thay chân Pháp, dựng lên chính quyền Sài Gòn, âm mưu chia cắt lâu dài Việt Nam. Miền Bắc xây dựng hậu phương lớn, miền Nam trực tiếp đấu tranh giải phóng.',
    timeline: [
      {
        when: '1959 – 1960',
        text: 'Phong trào Đồng Khởi bùng nổ, tiêu biểu ở Bến Tre. Ngày 20/12/1960, Mặt trận Dân tộc giải phóng miền Nam Việt Nam ra đời.',
      },
      {
        when: 'Tết Mậu Thân 1968',
        text: 'Cuộc Tổng tiến công và nổi dậy diễn ra đồng loạt ở nhiều đô thị miền Nam, buộc Mỹ phải xuống thang chiến tranh.',
      },
      {
        when: '18 – 29/12/1972',
        text: 'Quân dân miền Bắc đánh bại cuộc tập kích bằng máy bay B-52 vào Hà Nội, Hải Phòng — trận “Điện Biên Phủ trên không” 12 ngày đêm.',
      },
      {
        when: '27/1/1973',
        text: 'Hiệp định Pa-ri được ký kết; Mỹ cam kết rút hết quân khỏi miền Nam Việt Nam.',
      },
      {
        when: 'Mùa Xuân 1975',
        text: 'Tổng tiến công và nổi dậy với ba chiến dịch Tây Nguyên, Huế – Đà Nẵng, Hồ Chí Minh. Trưa 30/4/1975, lá cờ cách mạng tung bay trên Dinh Độc Lập; miền Nam hoàn toàn giải phóng.',
      },
    ],
    result: 'Giải phóng hoàn toàn miền Nam, kết thúc 21 năm kháng chiến, đất nước thống nhất.',
    significance:
      'Mở ra kỷ nguyên đất nước độc lập, thống nhất, đi lên chủ nghĩa xã hội. Là thắng lợi có tầm quan trọng quốc tế và tính thời đại sâu sắc.',
    figures: [
      { name: 'Hồ Chí Minh', role: 'Lãnh tụ, người đề ra mục tiêu thống nhất đất nước' },
      { name: 'Võ Nguyên Giáp, Văn Tiến Dũng', role: 'Chỉ đạo, chỉ huy chiến dịch mùa Xuân 1975' },
    ],
    places: [
      { name: 'Bến Tre', lat: 10.24, lon: 106.38 },
      { name: 'Dinh Độc Lập', lat: 10.777, lon: 106.695 },
    ],
    facts: ['Đường Trường Sơn — đường Hồ Chí Minh — là tuyến chi viện chiến lược từ Bắc vào Nam.'],
    image: null,
    video: null,
    sim3d: null,
    quiz: [
      {
        q: 'Phong trào Đồng Khởi tiêu biểu nhất diễn ra ở tỉnh nào?',
        options: ['Bến Tre', 'Quảng Trị', 'Tây Ninh', 'Huế'],
        answer: 0,
        explain: 'Đồng Khởi bùng nổ mạnh mẽ ở Bến Tre năm 1960.',
      },
      {
        q: 'Trận “Điện Biên Phủ trên không” kéo dài bao nhiêu ngày đêm?',
        options: ['12 ngày đêm', '56 ngày đêm', '15 ngày', '30 ngày đêm'],
        answer: 0,
        explain: 'Từ 18 đến 29/12/1972 — 12 ngày đêm.',
      },
      {
        q: 'Hiệp định Pa-ri về Việt Nam được ký vào ngày nào?',
        options: ['21/7/1954', '27/1/1973', '30/4/1975', '2/9/1969'],
        answer: 1,
        explain: 'Hiệp định Pa-ri ký ngày 27/1/1973.',
      },
      {
        q: 'Chiến dịch mở màn cuộc Tổng tiến công và nổi dậy mùa Xuân 1975 là chiến dịch nào?',
        options: ['Chiến dịch Hồ Chí Minh', 'Chiến dịch Tây Nguyên', 'Chiến dịch Huế – Đà Nẵng', 'Chiến dịch Đường 9 – Nam Lào'],
        answer: 1,
        explain: 'Chiến dịch Tây Nguyên mở màn bằng trận Buôn Ma Thuột (3/1975).',
      },
      {
        q: 'Miền Nam hoàn toàn giải phóng vào ngày nào?',
        options: ['30/4/1975', '2/9/1975', '7/5/1954', '1/5/1975'],
        answer: 0,
        explain: 'Trưa 30/4/1975, chiến dịch Hồ Chí Minh toàn thắng.',
      },
    ],
  },

  // ───────────────────────────────────────────── 12
  {
    id: 12,
    slug: 'chien-tranh-bao-ve-to-quoc',
    time: '1975 – 1989',
    yearLabel: '1979',
    sortYear: 1979,
    title: 'Chiến tranh bảo vệ Tổ quốc',
    shortTitle: 'Bảo vệ Tổ quốc',
    periodId: 'hien-dai',
    period: 'Thời kỳ hiện đại',
    summary:
      'Quân dân Việt Nam chiến đấu bảo vệ biên giới Tây Nam (chống tập đoàn Pol Pot) và biên giới phía Bắc (1979), đồng thời làm nghĩa vụ quốc tế, bảo vệ toàn vẹn lãnh thổ và hòa bình của đất nước.',
    context:
      'Ngay sau khi đất nước thống nhất, tập đoàn Khơ-me Đỏ (Pol Pot) liên tục xâm lấn, tàn sát dân thường ở biên giới Tây Nam. Ở phía Bắc, tình hình biên giới cũng ngày càng căng thẳng.',
    timeline: [
      {
        when: '1977 – 1978',
        text: 'Quân Pol Pot tấn công nhiều tỉnh biên giới Tây Nam như Tây Ninh, An Giang, gây ra những vụ thảm sát đau thương như ở Ba Chúc (An Giang, 4/1978).',
      },
      {
        when: '22/12/1978 – 7/1/1979',
        text: 'Quân dân ta phản công, cùng lực lượng cách mạng Campuchia giải phóng Phnôm Pênh ngày 7/1/1979, giúp nhân dân Campuchia thoát khỏi họa diệt chủng.',
      },
      {
        when: '17/2/1979',
        text: 'Trung Quốc huy động khoảng 60 vạn quân tấn công toàn tuyến biên giới, trên địa bàn 6 tỉnh phía Bắc nước ta. Quân dân ta chiến đấu anh dũng.',
      },
      {
        when: '5/3 – 18/3/1979',
        text: 'Trung Quốc tuyên bố rút quân và đến ngày 18/3/1979 rút hết khỏi lãnh thổ Việt Nam.',
      },
      {
        when: '1979 – 1989',
        text: 'Chiến sự còn kéo dài ở nhiều điểm biên giới, ác liệt nhất là mặt trận Vị Xuyên (Hà Giang). Năm 1988, nhiều chiến sĩ hải quân hy sinh khi bảo vệ đảo Gạc Ma (Trường Sa). Năm 1989, quân tình nguyện Việt Nam rút hết khỏi Campuchia.',
      },
    ],
    result: 'Bảo vệ vững chắc chủ quyền, toàn vẹn lãnh thổ ở cả biên giới Tây Nam và biên giới phía Bắc.',
    significance:
      'Khẳng định ý chí bảo vệ Tổ quốc của dân tộc Việt Nam, đồng thời thể hiện tinh thần quốc tế cao cả khi giúp nhân dân Campuchia thoát khỏi chế độ diệt chủng.',
    figures: [{ name: 'Các chiến sĩ biên phòng, bộ đội và dân quân', role: 'Những người trực tiếp chiến đấu bảo vệ biên giới' }],
    places: [
      { name: 'Biên giới Tây Nam (Tây Ninh)', lat: 11.3, lon: 106.1 },
      { name: 'Lạng Sơn', lat: 21.85, lon: 106.76 },
      { name: 'Vị Xuyên', lat: 22.67, lon: 104.98 },
    ],
    facts: ['Nghĩa trang Liệt sĩ Quốc gia Vị Xuyên (Hà Giang) là nơi an nghỉ của gần 2.000 liệt sĩ.'],
    image: null,
    video: null,
    sim3d: null,
    quiz: [
      {
        q: 'Thủ đô Phnôm Pênh được giải phóng vào ngày nào?',
        options: ['30/4/1975', '7/1/1979', '17/2/1979', '18/3/1979'],
        answer: 1,
        explain: 'Ngày 7/1/1979, Phnôm Pênh được giải phóng khỏi chế độ Pol Pot.',
      },
      {
        q: 'Cuộc chiến đấu bảo vệ biên giới phía Bắc bùng nổ vào ngày nào?',
        options: ['17/2/1979', '22/12/1978', '14/3/1988', '7/1/1979'],
        answer: 0,
        explain: 'Ngày 17/2/1979, chiến sự nổ ra trên toàn tuyến biên giới phía Bắc.',
      },
      {
        q: 'Năm 1979, chiến sự ở biên giới phía Bắc diễn ra trên địa bàn bao nhiêu tỉnh?',
        options: ['3 tỉnh', '4 tỉnh', '6 tỉnh', '8 tỉnh'],
        answer: 2,
        explain: 'Chiến sự diễn ra trên địa bàn 6 tỉnh biên giới phía Bắc.',
      },
      {
        q: 'Mặt trận nào ở biên giới phía Bắc diễn ra ác liệt và kéo dài đến năm 1989?',
        options: ['Đồng Đăng', 'Vị Xuyên (Hà Giang)', 'Móng Cái', 'Lào Cai'],
        answer: 1,
        explain: 'Mặt trận Vị Xuyên kéo dài nhiều năm với những trận đánh ác liệt.',
      },
      {
        q: 'Quân tình nguyện Việt Nam rút hết khỏi Campuchia vào năm nào?',
        options: ['1979', '1985', '1989', '1991'],
        answer: 2,
        explain: 'Năm 1989, quân tình nguyện Việt Nam hoàn thành nghĩa vụ và rút về nước.',
      },
    ],
  },
];

// Gộp sự kiện gốc và sự kiện bổ sung, sắp theo tiến trình lịch sử, đánh số khung phim từ 1.
export const EVENTS = [...RAW_EVENTS, ...MORE_EVENTS]
  .sort((a, b) => a.sortYear - b.sortYear)
  .map((e, i) => {
    const media = MEDIA[e.slug] ?? MEDIA_MORE[e.slug];
    return { ...e, id: i + 1, image: media?.image ?? null, videos: media?.videos ?? [] };
  });

export const SIM_TITLES = {
  'co-loa': 'Thành Cổ Loa — kinh đô nước Âu Lạc',
  'hat-mon': 'Hội thề Hát Môn — mùa xuân năm 40',
};

export const getEventBySlug = (slug) => EVENTS.find((e) => e.slug === slug);
export const getPeriod = (id) => PERIODS.find((p) => p.id === id);
