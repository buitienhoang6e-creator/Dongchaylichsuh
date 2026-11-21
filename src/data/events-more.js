/**
 * CÁC SỰ KIỆN BỔ SUNG theo "Niên biểu tiến trình lịch sử Việt Nam" (Chương trình GDPT 2018).
 * ------------------------------------------------------------
 * Cùng cấu trúc với các sự kiện trong events.js. Thứ tự hiển thị và số khung phim
 * được tự sắp theo `sortYear` (năm bắt đầu; năm trước Công nguyên là số âm).
 * Video của từng sự kiện nằm trong media.js.
 *
 * Nội dung biên soạn theo SGK Lịch sử (Bộ GD&ĐT, chương trình 2018);
 * năm tháng theo cách ghi phổ biến trong SGK.
 */

const P = {
  nguyenThuy: 'Thời nguyên thủy',
  dungNuoc: 'Thời kỳ dựng nước (Văn Lang – Âu Lạc)',
  quocGiaCo: 'Các quốc gia cổ ở miền Trung và Nam Bộ',
  bacThuoc: 'Thời kỳ Bắc thuộc và chống Bắc thuộc',
  tuChu: 'Thời kỳ phong kiến độc lập, tự chủ',
  phapThuoc: 'Thời kỳ Pháp thuộc và đấu tranh giải phóng',
  hienDai: 'Thời kỳ hiện đại',
};

const base = { image: null, video: null, sim3d: null };

/**
 * Trộn thứ tự phương án trắc nghiệm để đáp án đúng không dồn vào một vị trí (A, B, C, D).
 * Cách trộn cố định theo tên sự kiện nên lần nào mở trang cũng giống nhau.
 * Câu có các phương án là năm / con số thì giữ thứ tự tăng dần cho dễ đọc.
 */
function seeded(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
function arrange(q, seed) {
  if (q.options.every((o) => /^\d/.test(o))) return q;
  const rand = seeded(seed);
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}

const EVENTS_RAW = [
  // ═════════════════════════════════════════════ THỜI NGUYÊN THỦY
  {
    ...base,
    sim3d: 'nguoi-toi-co',
    slug: 'dau-tich-nguoi-toi-co',
    time: 'Khoảng 40 – 30 vạn năm trước',
    yearLabel: '40 vạn năm',
    sortYear: -400000,
    title: 'Dấu tích Người tối cổ trên đất Việt Nam',
    shortTitle: 'Người tối cổ',
    periodId: 'nguyen-thuy',
    period: P.nguyenThuy,
    summary:
      'Răng hóa thạch và công cụ đá ghè đẽo thô sơ tìm thấy ở Lạng Sơn, Thanh Hóa, Đồng Nai, Gia Lai… cho thấy Việt Nam là một trong những nơi có con người xuất hiện từ rất sớm.',
    context:
      'Người tối cổ là loài người xuất hiện sớm nhất: đã đi bằng hai chân, đôi tay được giải phóng để cầm nắm và chế tác công cụ. Ở Việt Nam, dấu tích của họ được tìm thấy trong các hang động núi đá vôi và trên những vùng đồi, từ miền Bắc vào tới Tây Nguyên và Đông Nam Bộ.',
    timeline: [
      {
        when: 'Khoảng 40 – 30 vạn năm trước',
        text: 'Người tối cổ cư trú trong các hang động ở Lạng Sơn. Răng hóa thạch của họ được tìm thấy ở hang Thẩm Khuyên, Thẩm Hai (Bình Gia, Lạng Sơn).',
      },
      {
        when: 'Thời đá cũ',
        text: 'Họ chế tác công cụ bằng cách ghè đẽo thô sơ những hòn cuội, mảnh đá thành rìu tay, công cụ chặt — dấu tích ở Núi Đọ, Quan Yên (Thanh Hóa), Xuân Lộc (Đồng Nai), An Khê (Gia Lai).',
      },
      {
        when: 'Đời sống',
        text: 'Người tối cổ sống thành từng bầy trong hang động, mái đá; kiếm sống bằng săn bắt thú rừng và hái lượm hoa quả, rễ cây.',
      },
      {
        when: 'Năm 1960',
        text: 'Các nhà khảo cổ học phát hiện di chỉ Núi Đọ (Thanh Hóa) với hàng nghìn công cụ đá ghè đẽo — di chỉ thời đá cũ đầu tiên được tìm thấy ở nước ta.',
      },
      {
        when: 'Ngày nay',
        text: 'Những phát hiện ở nhiều vùng khác nhau cho thấy con người đã sinh sống trên đất Việt Nam liên tục qua nhiều giai đoạn tiến hóa.',
      },
    ],
    result: 'Xác định con người đã có mặt và sinh sống trên lãnh thổ Việt Nam từ thời đá cũ.',
    significance:
      'Chứng minh Việt Nam là một trong những nơi có con người xuất hiện sớm, mở đầu cho tiến trình lịch sử lâu dài của dân tộc.',
    figures: [{ name: 'Người tối cổ', role: 'Chủ nhân các công cụ đá ghè đẽo ở Núi Đọ, Thẩm Khuyên, An Khê…' }],
    places: [
      { name: 'Hang Thẩm Khuyên (Lạng Sơn)', lat: 21.95, lon: 106.37 },
      { name: 'Núi Đọ (Thanh Hóa)', lat: 19.85, lon: 105.72 },
    ],
    facts: [
      'Núi Đọ (Thanh Hóa) là di chỉ thời đá cũ đầu tiên được phát hiện ở Việt Nam, năm 1960.',
      'Công cụ của Người tối cổ chỉ được ghè đẽo vài nhát ở một mặt hoặc hai mặt, chưa được mài.',
    ],
    quiz: [
      {
        q: 'Răng hóa thạch của Người tối cổ ở Việt Nam được tìm thấy ở đâu?',
        options: ['Hang Thẩm Khuyên, Thẩm Hai (Lạng Sơn)', 'Hang Đồng Nội (Hòa Bình)', 'Thành Cổ Loa (Hà Nội)', 'Óc Eo (An Giang)'],
        answer: 0,
        explain: 'Răng hóa thạch của Người tối cổ được tìm thấy ở hang Thẩm Khuyên, Thẩm Hai (Lạng Sơn).',
      },
      {
        q: 'Di chỉ Núi Đọ thuộc tỉnh nào ngày nay?',
        options: ['Nghệ An', 'Thanh Hóa', 'Lạng Sơn', 'Gia Lai'],
        answer: 1,
        explain: 'Núi Đọ thuộc tỉnh Thanh Hóa, là di chỉ thời đá cũ đầu tiên được phát hiện ở nước ta.',
      },
      {
        q: 'Công cụ lao động của Người tối cổ có đặc điểm gì?',
        options: ['Mài nhẵn toàn thân', 'Đúc bằng đồng thau', 'Ghè đẽo thô sơ từ hòn cuội, mảnh đá', 'Rèn bằng sắt'],
        answer: 2,
        explain: 'Người tối cổ ghè đẽo thô sơ hòn cuội, mảnh đá để làm công cụ.',
      },
      {
        q: 'Người tối cổ kiếm sống chủ yếu bằng cách nào?',
        options: ['Trồng lúa nước', 'Săn bắt và hái lượm', 'Buôn bán đường biển', 'Đúc đồng'],
        answer: 1,
        explain: 'Họ sống thành bầy, kiếm sống bằng săn bắt thú và hái lượm.',
      },
      {
        q: 'Các dấu tích Người tối cổ ở Việt Nam chứng tỏ điều gì?',
        options: [
          'Việt Nam đã có nhà nước từ rất sớm',
          'Người tối cổ đã biết trồng lúa',
          'Việt Nam là một trong những nơi có con người xuất hiện sớm',
          'Người tối cổ đã biết luyện kim',
        ],
        answer: 2,
        explain: 'Những dấu tích này cho thấy Việt Nam là một trong những nơi có con người xuất hiện từ rất sớm.',
      },
    ],
  },

  {
    ...base,
    sim3d: 'hoa-binh',
    slug: 'van-hoa-son-vi-hoa-binh-bac-son',
    time: 'Khoảng 20.000 – 6.000 TCN',
    yearLabel: '20.000 TCN',
    sortYear: -20000,
    title: 'Văn hóa Sơn Vi, Hòa Bình, Bắc Sơn',
    shortTitle: 'Sơn Vi – Hòa Bình – Bắc Sơn',
    periodId: 'nguyen-thuy',
    period: P.nguyenThuy,
    summary:
      'Người tinh khôn xuất hiện và để lại các nền văn hóa Sơn Vi, Hòa Bình, Bắc Sơn: từ công cụ cuội ghè đẽo đến rìu mài lưỡi, biết làm đồ gốm và bắt đầu trồng trọt, chăn nuôi.',
    context:
      'Tiếp nối Người tối cổ, Người tinh khôn có cấu tạo cơ thể giống người ngày nay. Họ sống thành các thị tộc trong hang động, mái đá ven suối ở vùng trung du, miền núi phía Bắc và Bắc Trung Bộ, công cụ ngày càng tiến bộ.',
    timeline: [
      {
        when: 'Văn hóa Sơn Vi',
        text: 'Người tinh khôn ghè đẽo những hòn cuội ven suối thành công cụ chặt, nạo. Văn hóa được đặt tên theo xã Sơn Vi (Lâm Thao, Phú Thọ), phân bố rộng ở trung du và miền núi phía Bắc.',
      },
      {
        when: 'Văn hóa Hòa Bình',
        text: 'Cư dân sống trong hang động, mái đá; công cụ chủ yếu là rìu cuội ghè đẽo một mặt. Họ đã biết trồng trọt sơ khai các loại rau, củ, cây ăn quả bên cạnh săn bắt, hái lượm.',
      },
      {
        when: 'Văn hóa Bắc Sơn',
        text: 'Kỹ thuật chế tác đá có bước tiến lớn: người Bắc Sơn biết mài lưỡi rìu cho sắc (rìu mài lưỡi), làm đồ gốm để đun nấu, chứa đựng.',
      },
      {
        when: 'Đời sống thị tộc',
        text: 'Người tinh khôn sống theo thị tộc, cùng làm cùng hưởng; biết làm đồ trang sức bằng vỏ ốc, đá; chôn người chết kèm theo công cụ lao động.',
      },
      {
        when: 'Khoảng 6.000 năm trước',
        text: 'Cư dân dần mở rộng địa bàn xuống vùng đồng bằng, ven biển; trồng trọt và chăn nuôi ngày càng quan trọng.',
      },
    ],
    result: 'Công cụ đá tiến bộ (từ ghè đẽo đến mài lưỡi), xuất hiện đồ gốm, trồng trọt và chăn nuôi sơ khai.',
    significance:
      'Đánh dấu bước chuyển quan trọng từ kinh tế khai thác tự nhiên sang kinh tế sản xuất, đặt nền móng cho nông nghiệp của người Việt cổ.',
    figures: [{ name: 'Người tinh khôn', role: 'Chủ nhân các nền văn hóa Sơn Vi, Hòa Bình, Bắc Sơn' }],
    places: [
      { name: 'Hòa Bình', lat: 20.81, lon: 105.34 },
      { name: 'Bắc Sơn (Lạng Sơn)', lat: 21.9, lon: 106.32 },
      { name: 'Sơn Vi (Phú Thọ)', lat: 21.33, lon: 105.28 },
    ],
    facts: [
      'Tên gọi “văn hóa Hòa Bình” được giới khảo cổ học thế giới dùng cho cả một nền văn hóa thời đá ở Đông Nam Á.',
      'Rìu mài lưỡi Bắc Sơn là một bước tiến lớn: lưỡi rìu sắc hơn, dùng lâu hơn rìu ghè đẽo.',
    ],
    quiz: [
      {
        q: 'Chủ nhân của các nền văn hóa Sơn Vi, Hòa Bình, Bắc Sơn là ai?',
        options: ['Người tối cổ', 'Người tinh khôn', 'Người Chăm', 'Người Phù Nam'],
        answer: 1,
        explain: 'Đây là các nền văn hóa của Người tinh khôn trên đất Việt Nam.',
      },
      {
        q: 'Ở văn hóa Bắc Sơn, kỹ thuật chế tác công cụ có bước tiến nào?',
        options: ['Biết mài lưỡi rìu', 'Biết đúc đồng', 'Biết rèn sắt', 'Chỉ ghè đẽo thô sơ'],
        answer: 0,
        explain: 'Người Bắc Sơn đã biết mài lưỡi rìu cho sắc — rìu mài lưỡi.',
      },
      {
        q: 'Văn hóa Sơn Vi được đặt tên theo một địa danh thuộc tỉnh nào?',
        options: ['Hòa Bình', 'Lạng Sơn', 'Phú Thọ', 'Thanh Hóa'],
        answer: 2,
        explain: 'Sơn Vi là tên một xã thuộc huyện Lâm Thao, tỉnh Phú Thọ.',
      },
      {
        q: 'Cư dân văn hóa Hòa Bình đã biết làm gì bên cạnh săn bắt, hái lượm?',
        options: ['Trồng trọt sơ khai', 'Đúc trống đồng', 'Xây thành lũy', 'Dùng cày sắt'],
        answer: 0,
        explain: 'Người Hòa Bình đã biết trồng trọt sơ khai các loại rau, củ, cây ăn quả.',
      },
      {
        q: 'Phát minh nào giúp người Bắc Sơn đun nấu, chứa đựng thức ăn?',
        options: ['Đồ sắt', 'Đồ gốm', 'Đồ đồng', 'Giấy'],
        answer: 1,
        explain: 'Người Bắc Sơn đã biết làm đồ gốm.',
      },
    ],
  },

  {
    ...base,
    slug: 'van-hoa-phung-nguyen-dong-dau-go-mun',
    time: 'Khoảng 2.000 – 700 TCN',
    yearLabel: '2.000 TCN',
    sortYear: -2000,
    title: 'Văn hóa Phùng Nguyên – Đồng Đậu – Gò Mun',
    shortTitle: 'Phùng Nguyên – Gò Mun',
    periodId: 'nguyen-thuy',
    period: P.nguyenThuy,
    summary:
      'Cư dân lưu vực sông Hồng biết luyện kim đồng thau; đồ đồng ngày càng phổ biến qua ba giai đoạn Phùng Nguyên, Đồng Đậu, Gò Mun. Nông nghiệp trồng lúa nước phát triển, tạo tiền đề cho sự ra đời của nhà nước.',
    context:
      'Từ khoảng 4.000 năm trước, người Việt cổ định cư lâu dài ở vùng trung du và đồng bằng sông Hồng. Bên cạnh công cụ đá mài tinh xảo, họ phát hiện ra kim loại — mở đầu thời đại kim khí.',
    timeline: [
      {
        when: 'Văn hóa Phùng Nguyên',
        text: 'Cư dân làm công cụ đá mài rất tinh xảo, đồ gốm đẹp; trong di chỉ đã có những mẩu đồng, xỉ đồng — dấu hiệu người Việt cổ bắt đầu biết luyện kim. Văn hóa được đặt tên theo làng Phùng Nguyên (Lâm Thao, Phú Thọ).',
      },
      {
        when: 'Văn hóa Đồng Đậu',
        text: 'Đồ đồng xuất hiện nhiều hơn: mũi tên, lưỡi câu, dùi, rìu đồng… Di chỉ tiêu biểu ở Đồng Đậu (Yên Lạc, Vĩnh Phúc).',
      },
      {
        when: 'Văn hóa Gò Mun',
        text: 'Đồ đồng chiếm ưu thế so với đồ đá: rìu, giáo, mũi tên, lưỡi liềm… Kỹ thuật đúc đồng thau ngày càng thành thạo. Di chỉ tiêu biểu ở Gò Mun (Phú Thọ).',
      },
      {
        when: 'Kinh tế',
        text: 'Nông nghiệp trồng lúa nước trở thành ngành chính, kết hợp chăn nuôi, đánh cá và các nghề thủ công như làm gốm, đúc đồng, dệt vải.',
      },
      {
        when: 'Xã hội',
        text: 'Làng xóm định cư hình thành dọc các dòng sông; xã hội bắt đầu có sự phân hóa giàu – nghèo.',
      },
    ],
    result: 'Thuật luyện kim đồng thau ra đời và phát triển; nông nghiệp lúa nước định hình trên lưu vực sông Hồng.',
    significance:
      'Tạo tiền đề kinh tế – xã hội trực tiếp cho văn hóa Đông Sơn và sự ra đời của nhà nước Văn Lang.',
    figures: [{ name: 'Người Việt cổ ở lưu vực sông Hồng', role: 'Chủ nhân các nền văn hóa Phùng Nguyên, Đồng Đậu, Gò Mun' }],
    places: [
      { name: 'Phùng Nguyên (Phú Thọ)', lat: 21.31, lon: 105.3 },
      { name: 'Đồng Đậu (Vĩnh Phúc)', lat: 21.24, lon: 105.58 },
      { name: 'Gò Mun (Phú Thọ)', lat: 21.36, lon: 105.34 },
    ],
    facts: [
      'Đồng thau là hợp kim của đồng với thiếc (có khi thêm chì), cứng hơn đồng nguyên chất nên làm được công cụ, vũ khí sắc bén.',
      'Ba giai đoạn Phùng Nguyên – Đồng Đậu – Gò Mun được gọi chung là các văn hóa “tiền Đông Sơn”.',
    ],
    quiz: [
      {
        q: 'Thời kỳ Phùng Nguyên – Đồng Đậu – Gò Mun, cư dân đã biết kỹ thuật mới nào?',
        options: ['Rèn sắt', 'Luyện kim đồng thau', 'Làm giấy', 'In sách'],
        answer: 1,
        explain: 'Thuật luyện kim đồng thau ra đời và phát triển trong thời kỳ này.',
      },
      {
        q: 'Ở văn hóa nào, đồ đồng chiếm ưu thế so với đồ đá?',
        options: ['Phùng Nguyên', 'Sơn Vi', 'Gò Mun', 'Hòa Bình'],
        answer: 2,
        explain: 'Đến văn hóa Gò Mun, đồ đồng đã chiếm ưu thế.',
      },
      {
        q: 'Các nền văn hóa này phân bố chủ yếu ở đâu?',
        options: ['Lưu vực sông Hồng', 'Lưu vực sông Đồng Nai', 'Tây Nguyên', 'Đồng bằng sông Cửu Long'],
        answer: 0,
        explain: 'Phùng Nguyên, Đồng Đậu, Gò Mun phân bố ở trung du và đồng bằng sông Hồng.',
      },
      {
        q: 'Ngành kinh tế chính của cư dân thời kỳ này là gì?',
        options: ['Săn bắt', 'Buôn bán đường biển', 'Trồng lúa nước', 'Khai thác mỏ'],
        answer: 2,
        explain: 'Nông nghiệp trồng lúa nước trở thành ngành kinh tế chính.',
      },
      {
        q: 'Ý nghĩa lớn nhất của thời kỳ Phùng Nguyên – Đồng Đậu – Gò Mun là gì?',
        options: [
          'Mở đầu thời kỳ Bắc thuộc',
          'Tạo tiền đề cho sự ra đời của nhà nước Văn Lang',
          'Chấm dứt thời kỳ đồ đá',
          'Hình thành vương quốc Phù Nam',
        ],
        answer: 1,
        explain: 'Sự phát triển kinh tế – xã hội thời kỳ này tạo tiền đề cho nhà nước Văn Lang ra đời.',
      },
    ],
  },

  // ═════════════════════════════════════════════ DỰNG NƯỚC
  {
    ...base,
    slug: 'van-hoa-dong-son',
    time: 'Thế kỷ VII TCN – thế kỷ I',
    yearLabel: 'TK VII TCN',
    sortYear: -700,
    title: 'Văn hóa Đông Sơn và trống đồng',
    shortTitle: 'Văn hóa Đông Sơn',
    periodId: 'dung-nuoc',
    period: P.dungNuoc,
    summary:
      'Đỉnh cao thời đại kim khí ở Bắc Bộ và Bắc Trung Bộ: kỹ thuật đúc đồng tinh xảo với trống đồng, thạp đồng; công cụ sắt xuất hiện; nông nghiệp lúa nước dùng cày và sức kéo của trâu bò.',
    context:
      'Kế thừa các văn hóa Phùng Nguyên – Đồng Đậu – Gò Mun, văn hóa Đông Sơn phát triển rực rỡ trên lưu vực sông Hồng, sông Mã, sông Cả. Đây chính là nền tảng vật chất và tinh thần của nhà nước Văn Lang – Âu Lạc.',
    timeline: [
      {
        when: 'Năm 1924',
        text: 'Những hiện vật đầu tiên được tìm thấy ở làng Đông Sơn (bên sông Mã, Thanh Hóa); nền văn hóa được đặt tên theo địa danh này.',
      },
      {
        when: 'Kỹ thuật',
        text: 'Đúc đồng đạt trình độ rất cao: trống đồng, thạp đồng, rìu, giáo, dao găm, mũi tên đồng… Người Đông Sơn bắt đầu biết rèn sắt.',
      },
      {
        when: 'Kinh tế',
        text: 'Trồng lúa nước là chính, dùng lưỡi cày đồng và sức kéo của trâu bò; kết hợp chăn nuôi, đánh cá, làm gốm, dệt vải, đúc đồng.',
      },
      {
        when: 'Trống đồng',
        text: 'Mặt trống Ngọc Lũ, Hoàng Hạ… khắc hình mặt trời nhiều tia, chim Lạc bay, người giã gạo, nhà sàn, thuyền chiến — bức tranh sinh động về đời sống cư dân Việt cổ.',
      },
      {
        when: 'Đời sống tinh thần',
        text: 'Cư dân thờ cúng tổ tiên, thờ các vị thần tự nhiên; có tục nhuộm răng, ăn trầu, xăm mình; tổ chức lễ hội với múa hát, đua thuyền.',
      },
    ],
    result: 'Hình thành nền văn minh sông Hồng (văn minh Văn Lang – Âu Lạc) với bản sắc riêng.',
    significance:
      'Trống đồng Đông Sơn trở thành biểu tượng của văn hóa Việt Nam, minh chứng cho một nền văn minh bản địa rực rỡ từ thời dựng nước.',
    figures: [{ name: 'Cư dân Đông Sơn (Lạc Việt, Âu Việt)', role: 'Chủ nhân văn hóa Đông Sơn' }],
    places: [
      { name: 'Làng Đông Sơn (Thanh Hóa)', lat: 19.83, lon: 105.8 },
      { name: 'Ngọc Lũ (Hà Nam)', lat: 20.48, lon: 106.0 },
    ],
    facts: [
      'Trống đồng Ngọc Lũ (phát hiện năm 1893 ở Hà Nam) là một trong những trống đồng đẹp nhất, được công nhận là Bảo vật quốc gia.',
      'Chính giữa mặt trống đồng Đông Sơn luôn có hình ngôi sao (mặt trời) nhiều tia, quanh đó là các vành hoa văn.',
    ],
    quiz: [
      {
        q: 'Văn hóa Đông Sơn được đặt tên theo địa danh thuộc tỉnh nào?',
        options: ['Phú Thọ', 'Hà Nam', 'Thanh Hóa', 'Nghệ An'],
        answer: 2,
        explain: 'Làng Đông Sơn nằm bên sông Mã, thuộc tỉnh Thanh Hóa.',
      },
      {
        q: 'Hiện vật tiêu biểu nhất của văn hóa Đông Sơn là gì?',
        options: ['Trống đồng', 'Tháp Chăm', 'Tiền giấy', 'Rìu mài lưỡi'],
        answer: 0,
        explain: 'Trống đồng là hiện vật tiêu biểu, biểu tượng của văn hóa Đông Sơn.',
      },
      {
        q: 'Cư dân Đông Sơn làm ruộng bằng công cụ và sức kéo nào?',
        options: ['Cuốc đá, sức người', 'Lưỡi cày đồng, sức kéo trâu bò', 'Máy cày', 'Gậy chọc lỗ'],
        answer: 1,
        explain: 'Người Đông Sơn đã dùng lưỡi cày đồng và sức kéo của trâu bò.',
      },
      {
        q: 'Văn hóa Đông Sơn phân bố chủ yếu trên lưu vực những con sông nào?',
        options: ['Sông Hồng, sông Mã, sông Cả', 'Sông Đồng Nai, sông Tiền', 'Sông Thu Bồn, sông Đà Rằng', 'Sông Hậu, sông Vàm Cỏ'],
        answer: 0,
        explain: 'Văn hóa Đông Sơn phát triển trên lưu vực sông Hồng, sông Mã, sông Cả.',
      },
      {
        q: 'Hình ảnh nào thường gặp trên mặt trống đồng Đông Sơn?',
        options: ['Rồng và phượng', 'Mặt trời nhiều tia, chim Lạc', 'Chữ Hán', 'Tháp Chăm'],
        answer: 1,
        explain: 'Giữa mặt trống là hình mặt trời nhiều tia, xung quanh có chim Lạc bay, người giã gạo, nhà sàn…',
      },
    ],
  },

  {
    ...base,
    slug: 'nha-nuoc-van-lang',
    time: 'Thế kỷ VII TCN',
    yearLabel: 'VII TCN',
    sortYear: -699,
    title: 'Nhà nước Văn Lang',
    shortTitle: 'Nhà nước Văn Lang',
    periodId: 'dung-nuoc',
    period: P.dungNuoc,
    summary:
      'Nhà nước đầu tiên của người Việt do Hùng Vương đứng đầu, đóng đô ở Phong Châu (Phú Thọ). Cả nước chia làm 15 bộ, mở đầu thời kỳ dựng nước.',
    context:
      'Kinh tế phát triển, xã hội phân hóa giàu – nghèo; cư dân cần liên kết để trị thủy, làm thủy lợi bảo vệ mùa màng và chống giặc ngoại xâm. Từ nhu cầu đó, các bộ lạc ở lưu vực sông Hồng, sông Mã, sông Cả liên kết lại với nhau.',
    timeline: [
      {
        when: 'Khoảng thế kỷ VII TCN',
        text: 'Thủ lĩnh bộ lạc Văn Lang (vùng Bạch Hạc, Phú Thọ) mạnh nhất, thống nhất các bộ lạc, lập nên nước Văn Lang, xưng là Hùng Vương.',
      },
      {
        when: 'Kinh đô',
        text: 'Kinh đô đặt ở Phong Châu (nay thuộc tỉnh Phú Thọ).',
      },
      {
        when: 'Tổ chức nhà nước',
        text: 'Đứng đầu là vua Hùng, giúp việc có Lạc hầu, Lạc tướng. Cả nước chia làm 15 bộ do Lạc tướng cai quản; dưới bộ là các chiềng, chạ do Bồ chính đứng đầu.',
      },
      {
        when: 'Đời sống',
        text: 'Cư dân ở nhà sàn, ăn cơm nếp, cơm tẻ, rau, cá; có tục xăm mình, nhuộm răng, ăn trầu; thờ cúng tổ tiên và tổ chức lễ hội. Các truyền thuyết Sơn Tinh – Thủy Tinh, Thánh Gióng, bánh chưng bánh giầy ra đời từ thời này.',
      },
      {
        when: 'Thế kỷ III TCN',
        text: 'Nhà nước Văn Lang kết thúc khi Thục Phán hợp nhất người Âu Việt và Lạc Việt, lập nước Âu Lạc.',
      },
    ],
    result: 'Nhà nước Văn Lang tồn tại qua nhiều đời vua Hùng, đến khoảng thế kỷ III TCN.',
    significance:
      'Mở đầu thời kỳ dựng nước; hình thành ý thức cộng đồng và cội nguồn chung của dân tộc — “Dù ai đi ngược về xuôi, nhớ ngày giỗ Tổ mùng mười tháng ba”.',
    figures: [
      { name: 'Hùng Vương', role: 'Vua đứng đầu nước Văn Lang' },
      { name: 'Lạc hầu, Lạc tướng', role: 'Giúp vua cai quản đất nước và các bộ' },
    ],
    places: [{ name: 'Đền Hùng – Phong Châu (Phú Thọ)', lat: 21.37, lon: 105.32 }],
    facts: [
      'Tín ngưỡng thờ cúng Hùng Vương ở Phú Thọ được UNESCO ghi danh là Di sản văn hóa phi vật thể đại diện của nhân loại năm 2012.',
      'Giỗ Tổ Hùng Vương (10/3 âm lịch) là ngày lễ lớn của cả nước.',
    ],
    quiz: [
      {
        q: 'Nhà nước đầu tiên của người Việt là nhà nước nào?',
        options: ['Âu Lạc', 'Văn Lang', 'Vạn Xuân', 'Đại Cồ Việt'],
        answer: 1,
        explain: 'Văn Lang là nhà nước đầu tiên của người Việt, do Hùng Vương đứng đầu.',
      },
      {
        q: 'Kinh đô của nước Văn Lang đặt ở đâu?',
        options: ['Phong Châu (Phú Thọ)', 'Phong Khê (Cổ Loa)', 'Hoa Lư', 'Thăng Long'],
        answer: 0,
        explain: 'Kinh đô Văn Lang đặt ở Phong Châu, nay thuộc tỉnh Phú Thọ.',
      },
      {
        q: 'Nước Văn Lang được chia làm bao nhiêu bộ?',
        options: ['12 bộ', '13 bộ', '15 bộ', '30 bộ'],
        answer: 2,
        explain: 'Cả nước chia làm 15 bộ do Lạc tướng đứng đầu.',
      },
      {
        q: 'Người đứng đầu các bộ của nước Văn Lang là ai?',
        options: ['Lạc tướng', 'Bồ chính', 'Thái thú', 'Tiết độ sứ'],
        answer: 0,
        explain: 'Lạc tướng cai quản các bộ; Bồ chính đứng đầu chiềng, chạ.',
      },
      {
        q: 'Nhu cầu nào thúc đẩy nhà nước Văn Lang ra đời?',
        options: [
          'Buôn bán với Ấn Độ',
          'Trị thủy, làm thủy lợi và chống giặc ngoại xâm',
          'Truyền bá đạo Phật',
          'Khai thác mỏ sắt',
        ],
        answer: 1,
        explain: 'Nhu cầu trị thủy, làm thủy lợi và chống ngoại xâm thúc đẩy các bộ lạc liên kết, lập nhà nước.',
      },
    ],
  },

  // ═════════════════════════════════════════════ CÁC QUỐC GIA CỔ
  {
    ...base,
    slug: 'vuong-quoc-phu-nam',
    time: 'Thế kỷ I – VII',
    yearLabel: 'TK I',
    sortYear: 50,
    title: 'Vương quốc Phù Nam',
    shortTitle: 'Phù Nam',
    periodId: 'quoc-gia-co',
    period: P.quocGiaCo,
    summary:
      'Quốc gia cổ ở vùng Nam Bộ, hình thành trên nền văn hóa Óc Eo khoảng thế kỷ I, phát triển mạnh nhờ buôn bán đường biển với cảng thị Óc Eo sầm uất; suy yếu vào thế kỷ VI – VII.',
    context:
      'Ở vùng châu thổ sông Cửu Long, cư dân văn hóa Óc Eo sinh sống trên những gò đất cao, làm nông nghiệp và buôn bán. Nằm trên con đường biển nối Ấn Độ với Trung Quốc, vùng đất này sớm trở thành nơi giao lưu thương mại sôi động.',
    timeline: [
      {
        when: 'Thế kỷ I',
        text: 'Vương quốc Phù Nam hình thành. Theo truyền thuyết, Hỗn Điền (người từ phương xa đến) kết hôn với nữ chúa Liễu Diệp lập nên nước.',
      },
      {
        when: 'Thế kỷ III – V',
        text: 'Thời kỳ cường thịnh: Phù Nam mở rộng ảnh hưởng ra nhiều vùng lân cận; cảng thị Óc Eo là trung tâm buôn bán quốc tế.',
      },
      {
        when: 'Kinh tế',
        text: 'Cư dân trồng lúa nước, làm thủ công (chế tác đồ trang sức, đúc kim loại) và đặc biệt phát triển thương mại đường biển với Ấn Độ, Trung Quốc, vùng Địa Trung Hải.',
      },
      {
        when: 'Văn hóa',
        text: 'Cư dân ở nhà sàn; chịu ảnh hưởng văn hóa Ấn Độ: thờ thần Hin-đu, theo đạo Phật, tạc nhiều tượng thần, tượng Phật bằng gỗ, đá.',
      },
      {
        when: 'Thế kỷ VI – VII',
        text: 'Phù Nam suy yếu dần và bị Chân Lạp thôn tính.',
      },
    ],
    result: 'Phù Nam tồn tại khoảng 6 thế kỷ, để lại di sản văn hóa Óc Eo phong phú ở Nam Bộ.',
    significance:
      'Là một trong ba quốc gia cổ trên lãnh thổ Việt Nam ngày nay (cùng Văn Lang – Âu Lạc và Chăm-pa), góp phần vào sự đa dạng của lịch sử, văn hóa dân tộc.',
    figures: [{ name: 'Hỗn Điền và Liễu Diệp', role: 'Những người lập nước Phù Nam theo truyền thuyết' }],
    places: [{ name: 'Óc Eo (An Giang)', lat: 10.24, lon: 105.15 }],
    facts: [
      'Các nhà khảo cổ đã tìm thấy đồng tiền La Mã, gương đồng Trung Quốc, đồ trang sức Ấn Độ ở Óc Eo — bằng chứng về buôn bán đường biển xa xôi.',
      'Khu di tích Óc Eo – Ba Thê (An Giang) được xếp hạng Di tích quốc gia đặc biệt năm 2012.',
    ],
    quiz: [
      {
        q: 'Vương quốc Phù Nam hình thành trên nền văn hóa nào?',
        options: ['Đông Sơn', 'Sa Huỳnh', 'Óc Eo', 'Hòa Bình'],
        answer: 2,
        explain: 'Phù Nam hình thành trên nền văn hóa Óc Eo ở Nam Bộ.',
      },
      {
        q: 'Vương quốc Phù Nam nằm ở vùng nào của nước ta ngày nay?',
        options: ['Bắc Bộ', 'Trung Bộ', 'Tây Nguyên', 'Nam Bộ'],
        answer: 3,
        explain: 'Phù Nam nằm ở vùng Nam Bộ, đặc biệt là châu thổ sông Cửu Long.',
      },
      {
        q: 'Ngành kinh tế nổi bật của Phù Nam là gì?',
        options: ['Thương mại đường biển', 'Khai thác mỏ sắt', 'Chăn nuôi ngựa', 'Đúc trống đồng'],
        answer: 0,
        explain: 'Phù Nam phát triển mạnh thương mại đường biển; Óc Eo là cảng thị sầm uất.',
      },
      {
        q: 'Văn hóa Phù Nam chịu ảnh hưởng nhiều từ nền văn hóa nào?',
        options: ['Văn hóa Ấn Độ', 'Văn hóa La Mã', 'Văn hóa Nhật Bản', 'Văn hóa Ả Rập'],
        answer: 0,
        explain: 'Cư dân Phù Nam thờ thần Hin-đu, theo đạo Phật — ảnh hưởng của văn hóa Ấn Độ.',
      },
      {
        q: 'Vào thế kỷ VI – VII, Phù Nam bị nước nào thôn tính?',
        options: ['Chăm-pa', 'Chân Lạp', 'Văn Lang', 'Nhà Hán'],
        answer: 1,
        explain: 'Phù Nam suy yếu và bị Chân Lạp thôn tính vào thế kỷ VI – VII.',
      },
    ],
  },

  {
    ...base,
    slug: 'vuong-quoc-cham-pa',
    time: 'Từ năm 192 đến thế kỷ XV',
    yearLabel: '192',
    sortYear: 192,
    title: 'Vương quốc Chăm-pa',
    shortTitle: 'Chăm-pa',
    periodId: 'quoc-gia-co',
    period: P.quocGiaCo,
    summary:
      'Năm 192, nhân dân huyện Tượng Lâm do Khu Liên lãnh đạo nổi dậy giành quyền tự chủ, lập nước Lâm Ấp — tiền thân của vương quốc Chăm-pa phát triển rực rỡ ở miền Trung.',
    context:
      'Trên nền văn hóa Sa Huỳnh ở miền Trung, cư dân sớm biết làm nông nghiệp, đúc sắt và buôn bán đường biển. Cuối thế kỷ II, vùng đất phía nam quận Nhật Nam (huyện Tượng Lâm) đang bị nhà Hán đô hộ.',
    timeline: [
      {
        when: 'Năm 192',
        text: 'Nhân lúc nhà Hán suy yếu, Khu Liên lãnh đạo nhân dân huyện Tượng Lâm nổi dậy, giành quyền tự chủ, lập nước Lâm Ấp.',
      },
      {
        when: 'Thế kỷ IV',
        text: 'Người Chăm sáng tạo chữ viết riêng (chữ Chăm cổ) dựa trên chữ Phạn của Ấn Độ.',
      },
      {
        when: 'Thế kỷ VI',
        text: 'Lâm Ấp đổi tên thành Chăm-pa. Vương quốc phát triển nông nghiệp lúa nước, khai thác lâm sản, đóng thuyền buôn bán đường biển.',
      },
      {
        when: 'Văn hóa',
        text: 'Người Chăm theo Ấn Độ giáo và đạo Phật, xây dựng nhiều đền tháp bằng gạch nung tuyệt đẹp như khu đền tháp Mỹ Sơn; có tục hỏa táng, ở nhà sàn, ăn trầu.',
      },
      {
        when: 'Từ thế kỷ XV',
        text: 'Chăm-pa suy yếu, lãnh thổ thu hẹp dần; vùng đất và cư dân Chăm từng bước hòa nhập vào quốc gia Đại Việt.',
      },
    ],
    result: 'Chăm-pa tồn tại hơn 10 thế kỷ, để lại kho tàng di sản kiến trúc, điêu khắc độc đáo.',
    significance:
      'Văn hóa Chăm là một bộ phận quan trọng, đặc sắc trong nền văn hóa đa dạng của Việt Nam ngày nay.',
    figures: [{ name: 'Khu Liên', role: 'Người lãnh đạo nhân dân Tượng Lâm nổi dậy, lập nước Lâm Ấp (năm 192)' }],
    places: [
      { name: 'Thánh địa Mỹ Sơn (Quảng Nam)', lat: 15.76, lon: 108.12 },
      { name: 'Trà Kiệu (Quảng Nam)', lat: 15.83, lon: 108.23 },
    ],
    facts: [
      'Khu đền tháp Mỹ Sơn (Quảng Nam) được UNESCO công nhận là Di sản văn hóa thế giới năm 1999.',
      'Người Chăm xây tháp bằng gạch nung mà hầu như không thấy mạch vữa — kỹ thuật đến nay vẫn còn nhiều điều bí ẩn.',
    ],
    quiz: [
      {
        q: 'Năm 192, ai lãnh đạo nhân dân Tượng Lâm nổi dậy, lập nước Lâm Ấp?',
        options: ['Khu Liên', 'Lý Bí', 'Hỗn Điền', 'Phùng Hưng'],
        answer: 0,
        explain: 'Khu Liên lãnh đạo nhân dân Tượng Lâm nổi dậy, lập nước Lâm Ấp năm 192.',
      },
      {
        q: 'Đến thế kỷ VI, nước Lâm Ấp đổi tên thành gì?',
        options: ['Phù Nam', 'Chân Lạp', 'Chăm-pa', 'Vạn Xuân'],
        answer: 2,
        explain: 'Từ thế kỷ VI, Lâm Ấp đổi tên thành Chăm-pa.',
      },
      {
        q: 'Vương quốc Chăm-pa hình thành trên nền văn hóa nào?',
        options: ['Óc Eo', 'Sa Huỳnh', 'Đông Sơn', 'Bắc Sơn'],
        answer: 1,
        explain: 'Chăm-pa hình thành trên nền văn hóa Sa Huỳnh ở miền Trung.',
      },
      {
        q: 'Chữ Chăm cổ được sáng tạo dựa trên loại chữ nào?',
        options: ['Chữ Hán', 'Chữ La-tinh', 'Chữ Phạn (Ấn Độ)', 'Chữ Nôm'],
        answer: 2,
        explain: 'Từ thế kỷ IV, người Chăm sáng tạo chữ viết dựa trên chữ Phạn.',
      },
      {
        q: 'Di sản văn hóa thế giới nào là của người Chăm?',
        options: ['Khu đền tháp Mỹ Sơn', 'Hoàng thành Thăng Long', 'Thành nhà Hồ', 'Đô thị cổ Hội An'],
        answer: 0,
        explain: 'Khu đền tháp Mỹ Sơn (Quảng Nam) được UNESCO công nhận năm 1999.',
      },
    ],
  },

  // ═════════════════════════════════════════════ BẮC THUỘC VÀ CHỐNG BẮC THUỘC
  {
    ...base,
    slug: 'bac-thuoc-nha-trieu-nha-han',
    time: '179 – 111 TCN',
    yearLabel: '111 TCN',
    sortYear: -111,
    title: 'Âu Lạc bị đô hộ – thời Bắc thuộc bắt đầu',
    shortTitle: 'Bắc thuộc bắt đầu',
    periodId: 'bac-thuoc',
    period: P.bacThuoc,
    summary:
      'Năm 179 TCN Triệu Đà sáp nhập Âu Lạc vào nước Nam Việt; năm 111 TCN nhà Hán chiếm Nam Việt, chia đất Âu Lạc cũ thành ba quận Giao Chỉ, Cửu Chân, Nhật Nam, thi hành chính sách cai trị, bóc lột và đồng hóa.',
    context:
      'Sau khi An Dương Vương thất bại (179 TCN), đất nước rơi vào ách đô hộ của phong kiến phương Bắc. Thời kỳ Bắc thuộc kéo dài hơn một nghìn năm, đến chiến thắng Bạch Đằng năm 938.',
    timeline: [
      {
        when: '179 TCN',
        text: 'Triệu Đà thôn tính Âu Lạc, sáp nhập vào nước Nam Việt và chia thành hai quận Giao Chỉ, Cửu Chân.',
      },
      {
        when: '111 TCN',
        text: 'Nhà Hán đánh chiếm Nam Việt. Đất Âu Lạc cũ bị chia thành ba quận Giao Chỉ, Cửu Chân, Nhật Nam, gộp với các quận khác của Trung Quốc thành châu Giao.',
      },
      {
        when: 'Bộ máy cai trị',
        text: 'Đứng đầu châu, quận là quan lại người Hán (Thứ sử, Thái thú). Thời gian đầu, các Lạc tướng vẫn cai quản dân ở cấp huyện như cũ.',
      },
      {
        when: 'Chính sách bóc lột',
        text: 'Nhân dân phải cống nạp nặng nề sản vật quý (ngà voi, sừng tê, ngọc trai, đồi mồi…); chính quyền đô hộ nắm độc quyền muối và sắt.',
      },
      {
        when: 'Chính sách đồng hóa',
        text: 'Đưa người Hán sang ở lẫn với người Việt, bắt người Việt theo phong tục, luật pháp của người Hán, truyền bá Nho giáo, chữ Hán.',
      },
    ],
    result: 'Nước ta mất độc lập, bị phong kiến phương Bắc đô hộ hơn một nghìn năm.',
    significance:
      'Dù bị đô hộ lâu dài, người Việt vẫn giữ được tiếng nói, phong tục (nhuộm răng, ăn trầu, thờ cúng tổ tiên) và liên tục đứng lên đấu tranh giành độc lập.',
    figures: [
      { name: 'Triệu Đà', role: 'Vua nước Nam Việt, thôn tính Âu Lạc năm 179 TCN' },
      { name: 'Nhà Hán', role: 'Triều đại phong kiến phương Bắc đô hộ nước ta từ năm 111 TCN' },
    ],
    places: [{ name: 'Luy Lâu (Thuận Thành, Bắc Ninh)', lat: 21.04, lon: 106.04 }],
    facts: [
      'Luy Lâu (Bắc Ninh) từng là trị sở của quận Giao Chỉ và là một trung tâm Phật giáo sớm của nước ta.',
      'Câu ca dao “Muối bể, sắt rừng” nhắc đến hai thứ bị chính quyền đô hộ nắm độc quyền để bóc lột nhân dân.',
    ],
    quiz: [
      {
        q: 'Năm 111 TCN, triều đại nào đánh chiếm Nam Việt và đô hộ đất Âu Lạc cũ?',
        options: ['Nhà Tần', 'Nhà Hán', 'Nhà Đường', 'Nhà Lương'],
        answer: 1,
        explain: 'Năm 111 TCN, nhà Hán chiếm Nam Việt, đô hộ đất Âu Lạc cũ.',
      },
      {
        q: 'Nhà Hán chia đất Âu Lạc cũ thành những quận nào?',
        options: [
          'Giao Chỉ, Cửu Chân, Nhật Nam',
          'Giao Chỉ, Cửu Chân, Tượng Quận',
          'Long Biên, Phong Châu, Mê Linh',
          'Thanh Hóa, Nghệ An, Hà Tĩnh',
        ],
        answer: 0,
        explain: 'Đất Âu Lạc cũ bị chia thành ba quận Giao Chỉ, Cửu Chân, Nhật Nam.',
      },
      {
        q: 'Chính quyền đô hộ nắm độc quyền những mặt hàng nào?',
        options: ['Lúa và gạo', 'Muối và sắt', 'Vải và lụa', 'Gốm và sứ'],
        answer: 1,
        explain: 'Chính quyền đô hộ nắm độc quyền muối và sắt để bóc lột nhân dân.',
      },
      {
        q: 'Mục đích của chính sách đồng hóa là gì?',
        options: [
          'Giúp người Việt phát triển kinh tế',
          'Xóa bỏ bản sắc, biến người Việt thành người Hán',
          'Mở trường dạy chữ Nôm',
          'Trả lại quyền tự chủ cho Lạc tướng',
        ],
        answer: 1,
        explain: 'Chính sách đồng hóa nhằm xóa bỏ phong tục, tiếng nói, bản sắc của người Việt.',
      },
      {
        q: 'Thời kỳ Bắc thuộc kết thúc bằng sự kiện nào?',
        options: ['Khởi nghĩa Hai Bà Trưng', 'Khởi nghĩa Lý Bí', 'Chiến thắng Bạch Đằng năm 938', 'Khởi nghĩa Lam Sơn'],
        answer: 2,
        explain: 'Chiến thắng Bạch Đằng năm 938 của Ngô Quyền chấm dứt hơn một nghìn năm Bắc thuộc.',
      },
    ],
  },

  {
    ...base,
    slug: 'khoi-nghia-ba-trieu',
    time: 'Năm 248',
    yearLabel: '248',
    sortYear: 248,
    title: 'Khởi nghĩa Bà Triệu',
    shortTitle: 'Bà Triệu',
    periodId: 'bac-thuoc',
    period: P.bacThuoc,
    summary:
      'Năm 248, Triệu Thị Trinh cùng anh là Triệu Quốc Đạt khởi nghĩa ở núi Nưa (Cửu Chân, nay là Thanh Hóa) chống ách đô hộ của nhà Ngô, làm rung chuyển chính quyền đô hộ ở Giao Châu.',
    context:
      'Thế kỷ III, Trung Quốc chia ba (Tam Quốc); nhà Ngô (Đông Ngô) cai trị châu Giao rất tàn bạo, vơ vét của cải, bắt hàng nghìn thợ thủ công giỏi đưa về nước. Nhân dân căm phẫn, nhiều nơi nổi dậy.',
    timeline: [
      {
        when: 'Năm 248',
        text: 'Bà Triệu cùng anh là Triệu Quốc Đạt dựng cờ khởi nghĩa ở núi Nưa (Triệu Sơn, Thanh Hóa).',
      },
      {
        when: 'Năm 248',
        text: 'Triệu Quốc Đạt mất, nghĩa quân tôn Bà Triệu làm chủ tướng. Bà mặc áo giáp vàng, cưỡi voi ra trận, được gọi là “Nhụy Kiều tướng quân”.',
      },
      {
        when: 'Năm 248',
        text: 'Nghĩa quân đánh nhiều trận ở Cửu Chân, Giao Chỉ, làm cho quân Ngô khiếp sợ.',
      },
      {
        when: 'Năm 248',
        text: 'Nhà Ngô cử Lục Dận đem 8.000 quân sang đàn áp, vừa đánh vừa mua chuộc các thủ lĩnh địa phương.',
      },
      {
        when: 'Cuối năm 248',
        text: 'Cuộc khởi nghĩa thất bại. Bà Triệu hy sinh ở núi Tùng (Hậu Lộc, Thanh Hóa) khi mới 23 tuổi.',
      },
    ],
    result: 'Khởi nghĩa thất bại nhưng đã giáng đòn mạnh vào chính quyền đô hộ của nhà Ngô.',
    significance:
      'Thể hiện ý chí giành độc lập và tinh thần bất khuất của người Việt, đặc biệt là vai trò to lớn của người phụ nữ trong đấu tranh giữ nước.',
    figures: [
      { name: 'Triệu Thị Trinh (Bà Triệu)', role: 'Chủ tướng cuộc khởi nghĩa năm 248' },
      { name: 'Triệu Quốc Đạt', role: 'Anh trai Bà Triệu, cùng dựng cờ khởi nghĩa' },
      { name: 'Lục Dận', role: 'Tướng nhà Ngô được cử sang đàn áp' },
    ],
    places: [
      { name: 'Núi Nưa (Triệu Sơn, Thanh Hóa)', lat: 19.8, lon: 105.6 },
      { name: 'Đền Bà Triệu (Hậu Lộc, Thanh Hóa)', lat: 19.93, lon: 105.88 },
    ],
    facts: [
      'Câu nói nổi tiếng của Bà Triệu: “Tôi muốn cưỡi cơn gió mạnh, đạp luồng sóng dữ, chém cá kình ở biển Đông, đánh đuổi quân Ngô, giành lại giang sơn, cởi ách nô lệ, chứ không chịu khom lưng làm tì thiếp cho người!”',
    ],
    quiz: [
      {
        q: 'Khởi nghĩa Bà Triệu nổ ra vào năm nào?',
        options: ['Năm 40', 'Năm 248', 'Năm 542', 'Năm 713'],
        answer: 1,
        explain: 'Khởi nghĩa Bà Triệu nổ ra năm 248.',
      },
      {
        q: 'Bà Triệu khởi nghĩa chống ách đô hộ của triều đại nào?',
        options: ['Nhà Hán', 'Nhà Ngô (Đông Ngô)', 'Nhà Lương', 'Nhà Đường'],
        answer: 1,
        explain: 'Bà Triệu khởi nghĩa chống nhà Ngô thời Tam Quốc.',
      },
      {
        q: 'Cuộc khởi nghĩa Bà Triệu bùng nổ ở đâu?',
        options: ['Hát Môn (Hà Nội)', 'Núi Nưa (Thanh Hóa)', 'Đường Lâm (Hà Nội)', 'Hoan Châu (Nghệ An)'],
        answer: 1,
        explain: 'Bà Triệu cùng anh dựng cờ khởi nghĩa ở núi Nưa, Thanh Hóa.',
      },
      {
        q: 'Nhà Ngô cử ai đem quân sang đàn áp cuộc khởi nghĩa?',
        options: ['Mã Viện', 'Tô Định', 'Lục Dận', 'Lưu Hoằng Tháo'],
        answer: 2,
        explain: 'Nhà Ngô cử Lục Dận đem 8.000 quân sang đàn áp.',
      },
      {
        q: 'Câu nói “cưỡi cơn gió mạnh, đạp luồng sóng dữ…” thể hiện điều gì?',
        options: [
          'Mong muốn làm giàu',
          'Ý chí giành độc lập, không chịu làm nô lệ',
          'Muốn sang Trung Quốc học tập',
          'Muốn làm hòa với nhà Ngô',
        ],
        answer: 1,
        explain: 'Câu nói thể hiện ý chí quyết tâm giành độc lập, không chịu khuất phục.',
      },
    ],
  },

  {
    ...base,
    slug: 'khoi-nghia-ly-bi',
    time: '542 – 544',
    yearLabel: '544',
    sortYear: 542,
    title: 'Khởi nghĩa Lý Bí và nước Vạn Xuân',
    shortTitle: 'Lý Bí – Vạn Xuân',
    periodId: 'bac-thuoc',
    period: P.bacThuoc,
    summary:
      'Năm 542, Lý Bí lãnh đạo khởi nghĩa, đánh đuổi Thứ sử Tiêu Tư của nhà Lương. Mùa xuân năm 544, ông lên ngôi Hoàng đế (Lý Nam Đế), đặt tên nước là Vạn Xuân, đóng đô ở vùng cửa sông Tô Lịch.',
    context:
      'Đầu thế kỷ VI, nhà Lương đô hộ nước ta, chia lại châu quận, đặt ra hàng trăm thứ thuế. Thứ sử Tiêu Tư tàn bạo, khiến nhân dân căm ghét.',
    timeline: [
      {
        when: 'Năm 542',
        text: 'Lý Bí liên kết hào kiệt các nơi (Triệu Túc, Tinh Thiều, Phạm Tu…) dựng cờ khởi nghĩa. Chưa đầy ba tháng, nghĩa quân chiếm thành Long Biên, Tiêu Tư bỏ chạy.',
      },
      {
        when: '542 – 543',
        text: 'Nhà Lương hai lần đem quân sang đàn áp đều bị nghĩa quân đánh bại.',
      },
      {
        when: 'Mùa xuân năm 544',
        text: 'Lý Bí lên ngôi Hoàng đế, xưng Lý Nam Đế, đặt quốc hiệu Vạn Xuân, đóng đô ở vùng cửa sông Tô Lịch (Hà Nội), dựng chùa Khai Quốc.',
      },
      {
        when: 'Tổ chức nhà nước',
        text: 'Lý Nam Đế đặt niên hiệu riêng, lập triều đình với hai ban văn, võ: Tinh Thiều đứng đầu ban văn, Phạm Tu đứng đầu ban võ.',
      },
      {
        when: 'Năm 545',
        text: 'Nhà Lương sai Trần Bá Tiên đem quân sang xâm lược. Lý Nam Đế rút lui, trao quyền chỉ huy kháng chiến cho Triệu Quang Phục.',
      },
    ],
    result: 'Nước Vạn Xuân ra đời — nhà nước độc lập đầu tiên sau hơn 500 năm Bắc thuộc.',
    significance:
      'Lần đầu tiên người đứng đầu đất nước xưng Hoàng đế, đặt quốc hiệu Vạn Xuân, thể hiện ý chí độc lập và mong muốn đất nước trường tồn muôn mùa xuân.',
    figures: [
      { name: 'Lý Bí (Lý Nam Đế)', role: 'Lãnh đạo khởi nghĩa, lập nước Vạn Xuân' },
      { name: 'Tinh Thiều, Phạm Tu', role: 'Đứng đầu ban văn, ban võ của triều đình Vạn Xuân' },
    ],
    places: [{ name: 'Cửa sông Tô Lịch – chùa Trấn Quốc (Hà Nội)', lat: 21.05, lon: 105.84 }],
    facts: [
      'Chùa Khai Quốc do Lý Nam Đế dựng là tiền thân của chùa Trấn Quốc bên Hồ Tây — ngôi chùa cổ nhất Hà Nội.',
      'Tên nước “Vạn Xuân” mang ý nghĩa mong cho đất nước bền vững muôn mùa xuân.',
    ],
    quiz: [
      {
        q: 'Lý Bí khởi nghĩa chống ách đô hộ của triều đại nào?',
        options: ['Nhà Ngô', 'Nhà Lương', 'Nhà Tùy', 'Nhà Đường'],
        answer: 1,
        explain: 'Năm 542, Lý Bí khởi nghĩa chống nhà Lương.',
      },
      {
        q: 'Năm 544, Lý Bí đặt quốc hiệu nước ta là gì?',
        options: ['Văn Lang', 'Âu Lạc', 'Vạn Xuân', 'Đại Việt'],
        answer: 2,
        explain: 'Mùa xuân năm 544, Lý Bí lên ngôi, đặt quốc hiệu Vạn Xuân.',
      },
      {
        q: 'Sau khi lên ngôi, Lý Bí xưng hiệu là gì?',
        options: ['Lý Nam Đế', 'Lý Thái Tổ', 'Mai Hắc Đế', 'Triệu Việt Vương'],
        answer: 0,
        explain: 'Lý Bí xưng là Lý Nam Đế.',
      },
      {
        q: 'Kinh đô nước Vạn Xuân đặt ở đâu?',
        options: ['Phong Châu', 'Vùng cửa sông Tô Lịch (Hà Nội)', 'Hoa Lư', 'Cổ Loa'],
        answer: 1,
        explain: 'Lý Nam Đế đóng đô ở vùng cửa sông Tô Lịch, nay thuộc Hà Nội.',
      },
      {
        q: 'Chùa nào ở Hà Nội có tiền thân là chùa Khai Quốc do Lý Nam Đế dựng?',
        options: ['Chùa Một Cột', 'Chùa Trấn Quốc', 'Chùa Hương', 'Chùa Dâu'],
        answer: 1,
        explain: 'Chùa Khai Quốc là tiền thân của chùa Trấn Quốc bên Hồ Tây.',
      },
    ],
  },

  {
    ...base,
    slug: 'trieu-quang-phuc',
    time: '545 – 602',
    yearLabel: '550',
    sortYear: 545,
    title: 'Triệu Quang Phục giữ nước Vạn Xuân',
    shortTitle: 'Triệu Quang Phục',
    periodId: 'bac-thuoc',
    period: P.bacThuoc,
    summary:
      'Triệu Quang Phục lập căn cứ ở đầm Dạ Trạch, đánh du kích lâu dài; năm 550 đánh tan quân Lương, giành lại độc lập, xưng Triệu Việt Vương. Nước Vạn Xuân tồn tại đến năm 602.',
    context:
      'Năm 545, quân Lương do Trần Bá Tiên chỉ huy tràn sang. Lý Nam Đế lui về giữ thành Gia Ninh rồi động Khuất Lão, giao binh quyền cho tướng Triệu Quang Phục tiếp tục kháng chiến.',
    timeline: [
      {
        when: '546 – 548',
        text: 'Triệu Quang Phục đưa quân về đầm Dạ Trạch (Khoái Châu, Hưng Yên) — vùng đầm lầy rộng, lau sậy um tùm, giữa đầm có bãi đất cao để đóng quân.',
      },
      {
        when: 'Chiến thuật',
        text: 'Ban ngày nghĩa quân tắt hết khói lửa, im lặng như không có người; ban đêm dùng thuyền độc mộc ra đánh úp, cướp lương thảo của địch.',
      },
      {
        when: 'Năm 548',
        text: 'Lý Nam Đế mất; Triệu Quang Phục xưng là Triệu Việt Vương, tiếp tục lãnh đạo kháng chiến.',
      },
      {
        when: 'Năm 550',
        text: 'Nhân lúc nhà Lương có loạn, Triệu Quang Phục phản công, giết tướng Dương Sàn, giành lại thành Long Biên.',
      },
      {
        when: '571 – 602',
        text: 'Năm 571, Lý Phật Tử cướp ngôi Triệu Việt Vương. Năm 602, nhà Tùy đem quân xâm lược, Lý Phật Tử đầu hàng; nước Vạn Xuân kết thúc.',
      },
    ],
    result: 'Kháng chiến chống Lương thắng lợi; nền độc lập của nước Vạn Xuân được giữ vững hơn nửa thế kỷ.',
    significance:
      'Là cuộc kháng chiến tiêu biểu với lối đánh du kích, lấy ít địch nhiều, dựa vào địa hình hiểm trở — bài học quý cho các cuộc kháng chiến sau này.',
    figures: [
      { name: 'Triệu Quang Phục (Triệu Việt Vương)', role: 'Lãnh đạo kháng chiến chống quân Lương' },
      { name: 'Lý Phật Tử (Hậu Lý Nam Đế)', role: 'Người kế tục nước Vạn Xuân đến năm 602' },
    ],
    places: [{ name: 'Đầm Dạ Trạch (Khoái Châu, Hưng Yên)', lat: 20.86, lon: 105.95 }],
    facts: [
      'Đầm Dạ Trạch gắn với truyền thuyết Chử Đồng Tử – Tiên Dung; dân gian kể Triệu Quang Phục được thần trao móng rồng gắn lên mũ để đánh giặc.',
    ],
    quiz: [
      {
        q: 'Triệu Quang Phục chọn nơi nào làm căn cứ kháng chiến?',
        options: ['Núi Nưa', 'Đầm Dạ Trạch', 'Hát Môn', 'Lam Sơn'],
        answer: 1,
        explain: 'Triệu Quang Phục lập căn cứ ở đầm Dạ Trạch (Hưng Yên).',
      },
      {
        q: 'Chiến thuật đánh giặc của Triệu Quang Phục ở đầm Dạ Trạch là gì?',
        options: [
          'Đánh trận lớn giữa đồng bằng',
          'Đánh du kích: ngày ẩn, đêm dùng thuyền ra đánh úp',
          'Xây thành kiên cố để thủ',
          'Đóng cọc trên sông',
        ],
        answer: 1,
        explain: 'Ban ngày tắt khói lửa, ban đêm dùng thuyền độc mộc đánh úp quân Lương.',
      },
      {
        q: 'Năm 550, Triệu Quang Phục giành thắng lợi trước quân của triều đại nào?',
        options: ['Nhà Lương', 'Nhà Tùy', 'Nhà Đường', 'Nhà Hán'],
        answer: 0,
        explain: 'Năm 550, Triệu Quang Phục đánh tan quân Lương, giết tướng Dương Sàn.',
      },
      {
        q: 'Triệu Quang Phục xưng hiệu là gì?',
        options: ['Lý Nam Đế', 'Triệu Việt Vương', 'Bố Cái Đại Vương', 'Mai Hắc Đế'],
        answer: 1,
        explain: 'Triệu Quang Phục xưng là Triệu Việt Vương.',
      },
      {
        q: 'Nước Vạn Xuân kết thúc vào năm nào?',
        options: ['550', '571', '602', '679'],
        answer: 2,
        explain: 'Năm 602, nhà Tùy xâm lược, nước Vạn Xuân kết thúc.',
      },
    ],
  },

  {
    ...base,
    slug: 'khoi-nghia-mai-thuc-loan',
    time: '713 – 722',
    yearLabel: '713',
    sortYear: 713,
    title: 'Khởi nghĩa Mai Thúc Loan',
    shortTitle: 'Mai Thúc Loan',
    periodId: 'bac-thuoc',
    period: P.bacThuoc,
    summary:
      'Mai Thúc Loan lãnh đạo nhân dân Hoan Châu khởi nghĩa chống nhà Đường, xây thành Vạn An làm căn cứ, xưng Hoàng đế (Mai Hắc Đế) và giải phóng thành Tống Bình.',
    context:
      'Nhà Đường đặt An Nam đô hộ phủ, bắt nhân dân cống nạp nhiều sản vật quý. Hằng năm, người dân Hoan Châu phải gánh quả vải từ Giao Châu sang tận Trung Quốc để cống nạp, nhiều người chết dọc đường.',
    timeline: [
      {
        when: 'Năm 713',
        text: 'Những người phu gánh vải cống nạp nổi dậy, theo Mai Thúc Loan khởi nghĩa ở Hoan Châu (Nghệ An – Hà Tĩnh).',
      },
      {
        when: 'Căn cứ Vạn An',
        text: 'Mai Thúc Loan xưng Hoàng đế (Mai Hắc Đế), xây thành Vạn An (Nam Đàn, Nghệ An) làm căn cứ chính.',
      },
      {
        when: 'Mở rộng khởi nghĩa',
        text: 'Nhân dân khắp Giao Châu và cả Lâm Ấp, Chân Lạp hưởng ứng. Nghĩa quân đánh chiếm thành Tống Bình, viên đô hộ Quang Sở Khách phải bỏ chạy về nước.',
      },
      {
        when: 'Làm chủ đất nước',
        text: 'Mai Hắc Đế cai quản đất nước trong khoảng 10 năm.',
      },
      {
        when: 'Năm 722',
        text: 'Nhà Đường sai Dương Tư Húc đem 10 vạn quân sang đàn áp; cuộc khởi nghĩa thất bại.',
      },
    ],
    result: 'Khởi nghĩa giành được quyền làm chủ trong một thời gian, sau đó bị nhà Đường đàn áp.',
    significance:
      'Là một trong những cuộc khởi nghĩa lớn nhất thời Bắc thuộc, thể hiện sức mạnh đoàn kết của nhân dân và ý chí giành độc lập.',
    figures: [
      { name: 'Mai Thúc Loan (Mai Hắc Đế)', role: 'Lãnh đạo khởi nghĩa, xưng Hoàng đế' },
      { name: 'Dương Tư Húc', role: 'Tướng nhà Đường đem 10 vạn quân sang đàn áp' },
    ],
    places: [{ name: 'Thành Vạn An (Nam Đàn, Nghệ An)', lat: 18.7, lon: 105.5 }],
    facts: [
      'Mai Thúc Loan có nước da đen nên nhân dân gọi là “Vua Đen” — Mai Hắc Đế.',
      'Khu di tích Mai Hắc Đế ở Nam Đàn (Nghệ An) nằm dưới chân núi Đụn; lễ hội được tổ chức hằng năm.',
    ],
    quiz: [
      {
        q: 'Mai Thúc Loan khởi nghĩa chống ách đô hộ của triều đại nào?',
        options: ['Nhà Lương', 'Nhà Tùy', 'Nhà Đường', 'Nhà Tống'],
        answer: 2,
        explain: 'Khởi nghĩa Mai Thúc Loan chống ách đô hộ của nhà Đường.',
      },
      {
        q: 'Nguyên nhân trực tiếp dẫn tới cuộc khởi nghĩa là gì?',
        options: [
          'Nhà Đường bắt dân gánh quả vải đi cống nạp',
          'Nhà Đường cấm buôn muối',
          'Nhà Đường bắt thợ giỏi sang Trung Quốc',
          'Nhà Đường giết Lạc tướng',
        ],
        answer: 0,
        explain: 'Những người phu gánh vải cống nạp nổi dậy theo Mai Thúc Loan.',
      },
      {
        q: 'Mai Thúc Loan xây thành nào làm căn cứ?',
        options: ['Thành Cổ Loa', 'Thành Vạn An', 'Thành Đại La', 'Thành Tây Đô'],
        answer: 1,
        explain: 'Mai Thúc Loan xây thành Vạn An (Nam Đàn, Nghệ An).',
      },
      {
        q: 'Nhân dân gọi Mai Thúc Loan là gì?',
        options: ['Bố Cái Đại Vương', 'Mai Hắc Đế', 'Triệu Việt Vương', 'Lý Nam Đế'],
        answer: 1,
        explain: 'Ông xưng Hoàng đế, nhân dân gọi là Mai Hắc Đế (Vua Đen).',
      },
      {
        q: 'Năm 722, nhà Đường cử ai đem 10 vạn quân sang đàn áp?',
        options: ['Dương Tư Húc', 'Lục Dận', 'Trần Bá Tiên', 'Cao Biền'],
        answer: 0,
        explain: 'Nhà Đường sai Dương Tư Húc đem 10 vạn quân sang đàn áp.',
      },
    ],
  },

  {
    ...base,
    slug: 'khoi-nghia-phung-hung',
    time: 'Khoảng 776 – 791',
    yearLabel: '776',
    sortYear: 776,
    title: 'Khởi nghĩa Phùng Hưng',
    shortTitle: 'Phùng Hưng',
    periodId: 'bac-thuoc',
    period: P.bacThuoc,
    summary:
      'Anh em Phùng Hưng, Phùng Hải khởi nghĩa ở Đường Lâm (Sơn Tây, Hà Nội), chiếm thành Tống Bình, giành quyền làm chủ đất nước; nhân dân tôn Phùng Hưng là Bố Cái Đại Vương.',
    context:
      'Cuối thế kỷ VIII, nhà Đường tăng thuế, bóc lột nặng nề. Viên đô hộ Cao Chính Bình bắt dân đóng thuế cao, nhân dân vô cùng oán giận.',
    timeline: [
      {
        when: 'Khoảng năm 776',
        text: 'Phùng Hưng — một hào trưởng ở Đường Lâm, khỏe mạnh, giàu lòng thương người — cùng em là Phùng Hải dựng cờ khởi nghĩa, được nhân dân khắp nơi hưởng ứng.',
      },
      {
        when: 'Vây thành Tống Bình',
        text: 'Nghĩa quân tiến về vây thành Tống Bình (Hà Nội). Đô hộ Cao Chính Bình lo sợ, ốm rồi chết.',
      },
      {
        when: 'Làm chủ đất nước',
        text: 'Phùng Hưng vào thành Tống Bình, sắp đặt việc cai trị, giữ quyền tự chủ trong một thời gian.',
      },
      {
        when: 'Phùng Hưng mất',
        text: 'Nhân dân thương tiếc, tôn ông là “Bố Cái Đại Vương” (người cha, người mẹ lớn của dân). Con ông là Phùng An lên thay.',
      },
      {
        when: 'Năm 791',
        text: 'Nhà Đường đem quân sang đàn áp, Phùng An đầu hàng; cuộc khởi nghĩa kết thúc.',
      },
    ],
    result: 'Nghĩa quân làm chủ thành Tống Bình, giành quyền tự chủ trong hơn mười năm.',
    significance:
      'Tiếp nối truyền thống đấu tranh bất khuất, góp phần làm suy yếu ách đô hộ của nhà Đường.',
    figures: [
      { name: 'Phùng Hưng (Bố Cái Đại Vương)', role: 'Lãnh đạo khởi nghĩa' },
      { name: 'Phùng Hải', role: 'Em trai Phùng Hưng, cùng khởi nghĩa' },
    ],
    places: [{ name: 'Đường Lâm (Sơn Tây, Hà Nội)', lat: 21.16, lon: 105.47 }],
    facts: [
      'Làng cổ Đường Lâm được gọi là “đất hai vua” vì là quê hương của Phùng Hưng và Ngô Quyền.',
    ],
    quiz: [
      {
        q: 'Khởi nghĩa Phùng Hưng nổ ra ở đâu?',
        options: ['Đường Lâm (Hà Nội)', 'Hoan Châu (Nghệ An)', 'Mê Linh (Hà Nội)', 'Cửu Chân (Thanh Hóa)'],
        answer: 0,
        explain: 'Phùng Hưng khởi nghĩa ở Đường Lâm, nay thuộc Sơn Tây, Hà Nội.',
      },
      {
        q: 'Nhân dân tôn Phùng Hưng là gì?',
        options: ['Mai Hắc Đế', 'Bố Cái Đại Vương', 'Lý Nam Đế', 'Vạn Thắng Vương'],
        answer: 1,
        explain: 'Nhân dân tôn ông là Bố Cái Đại Vương — người cha, người mẹ lớn của dân.',
      },
      {
        q: 'Nghĩa quân Phùng Hưng đã chiếm được thành nào?',
        options: ['Thành Vạn An', 'Thành Cổ Loa', 'Thành Tống Bình', 'Thành Tây Đô'],
        answer: 2,
        explain: 'Nghĩa quân vây và chiếm thành Tống Bình (Hà Nội).',
      },
      {
        q: 'Phùng Hưng khởi nghĩa chống ách đô hộ của triều đại nào?',
        options: ['Nhà Đường', 'Nhà Hán', 'Nhà Lương', 'Nhà Minh'],
        answer: 0,
        explain: 'Phùng Hưng khởi nghĩa chống nhà Đường.',
      },
      {
        q: 'Làng cổ Đường Lâm được gọi là “đất hai vua” vì là quê hương của ai?',
        options: ['Lý Bí và Lý Phật Tử', 'Phùng Hưng và Ngô Quyền', 'Đinh Bộ Lĩnh và Lê Hoàn', 'Khúc Thừa Dụ và Khúc Hạo'],
        answer: 1,
        explain: 'Đường Lâm là quê hương của Phùng Hưng và Ngô Quyền.',
      },
    ],
  },

  {
    ...base,
    slug: 'ho-khuc-duong-dinh-nghe',
    time: '905 – 931',
    yearLabel: '905',
    sortYear: 905,
    title: 'Họ Khúc và Dương Đình Nghệ giành quyền tự chủ',
    shortTitle: 'Họ Khúc – Dương Đình Nghệ',
    periodId: 'bac-thuoc',
    period: P.bacThuoc,
    summary:
      'Năm 905, Khúc Thừa Dụ chiếm thành Đại La, tự xưng Tiết độ sứ, mở đầu thời kỳ tự chủ; Khúc Hạo tiến hành cải cách; năm 931 Dương Đình Nghệ đánh tan quân Nam Hán, giữ vững quyền tự chủ.',
    context:
      'Cuối thế kỷ IX, nhà Đường suy yếu, nhiều nơi nổi dậy. Ở An Nam, Khúc Thừa Dụ — một hào trưởng ở Hồng Châu (Hải Dương), tính khoan hòa, được nhiều người kính phục — nhân cơ hội đó giành quyền tự chủ.',
    timeline: [
      {
        when: 'Năm 905',
        text: 'Được nhân dân ủng hộ, Khúc Thừa Dụ đánh chiếm thành Đại La, tự xưng Tiết độ sứ, xây dựng chính quyền tự chủ.',
      },
      {
        when: 'Năm 906',
        text: 'Nhà Đường buộc phải công nhận chức Tiết độ sứ của Khúc Thừa Dụ.',
      },
      {
        when: 'Năm 907',
        text: 'Khúc Hạo lên thay, tiến hành cải cách: đặt lại các khu vực hành chính, định lại mức thuế, bãi bỏ chế độ lao dịch nặng nề thời Bắc thuộc.',
      },
      {
        when: 'Năm 930',
        text: 'Quân Nam Hán sang xâm lược, bắt được Khúc Thừa Mỹ.',
      },
      {
        when: 'Năm 931',
        text: 'Dương Đình Nghệ (người Ái Châu, Thanh Hóa) đem quân ra Bắc đánh tan quân Nam Hán, chiếm lại thành Đại La, tự xưng Tiết độ sứ.',
      },
    ],
    result: 'Quyền tự chủ của người Việt được xác lập và giữ vững trước âm mưu xâm lược của nhà Nam Hán.',
    significance:
      'Đặt nền móng cho nền độc lập; mở đường cho chiến thắng Bạch Đằng năm 938 chấm dứt hoàn toàn thời Bắc thuộc.',
    figures: [
      { name: 'Khúc Thừa Dụ', role: 'Người mở đầu thời kỳ tự chủ (905)' },
      { name: 'Khúc Hạo', role: 'Tiến hành cải cách đất nước (907)' },
      { name: 'Dương Đình Nghệ', role: 'Đánh bại quân Nam Hán lần thứ nhất (931)' },
    ],
    places: [{ name: 'Thành Đại La (Hà Nội)', lat: 21.03, lon: 105.85 }],
    facts: [
      'Chính sách của Khúc Hạo được sử sách ghi là “chuộng khoan dung, giản dị”, giúp “nhân dân đều được yên vui”.',
    ],
    quiz: [
      {
        q: 'Năm 905, ai chiếm thành Đại La, tự xưng Tiết độ sứ?',
        options: ['Khúc Thừa Dụ', 'Dương Đình Nghệ', 'Ngô Quyền', 'Khúc Hạo'],
        answer: 0,
        explain: 'Năm 905, Khúc Thừa Dụ chiếm thành Đại La, mở đầu thời kỳ tự chủ.',
      },
      {
        q: 'Ai là người tiến hành cải cách đất nước năm 907?',
        options: ['Khúc Thừa Mỹ', 'Khúc Hạo', 'Dương Đình Nghệ', 'Kiều Công Tiễn'],
        answer: 1,
        explain: 'Khúc Hạo lên thay năm 907 và tiến hành cải cách.',
      },
      {
        q: 'Năm 931, Dương Đình Nghệ đánh tan quân xâm lược nào?',
        options: ['Quân Đường', 'Quân Nam Hán', 'Quân Tống', 'Quân Lương'],
        answer: 1,
        explain: 'Năm 931, Dương Đình Nghệ đánh tan quân Nam Hán, chiếm lại Đại La.',
      },
      {
        q: 'Cuộc cải cách của Khúc Hạo có điểm nổi bật nào?',
        options: [
          'Bãi bỏ lao dịch nặng nề, định lại mức thuế',
          'Tăng thuế để xây thành',
          'Dời đô về Hoa Lư',
          'Đổi quốc hiệu là Đại Việt',
        ],
        answer: 0,
        explain: 'Khúc Hạo định lại mức thuế, bãi bỏ lao dịch nặng nề, “chuộng khoan dung, giản dị”.',
      },
      {
        q: 'Ý nghĩa của sự kiện năm 905 là gì?',
        options: [
          'Chấm dứt hoàn toàn thời Bắc thuộc',
          'Mở đầu thời kỳ tự chủ của người Việt',
          'Lập ra nước Vạn Xuân',
          'Thống nhất đất nước sau loạn 12 sứ quân',
        ],
        answer: 1,
        explain: 'Năm 905 mở đầu thời kỳ tự chủ; đến năm 938 mới chấm dứt hoàn toàn thời Bắc thuộc.',
      },
    ],
  },
  // ═════════════════════════════════════════════ PHONG KIẾN ĐỘC LẬP, TỰ CHỦ
  {
    ...base,
    slug: 'nha-ngo-12-su-quan',
    time: '939 – 967',
    yearLabel: '939',
    sortYear: 939,
    title: 'Nhà Ngô và loạn 12 sứ quân',
    shortTitle: 'Nhà Ngô – 12 sứ quân',
    periodId: 'tu-chu',
    period: P.tuChu,
    summary:
      'Năm 939, Ngô Quyền xưng vương, đóng đô ở Cổ Loa, xây dựng nhà nước độc lập. Sau khi ông mất, triều Ngô suy yếu; từ năm 965 đất nước rơi vào cảnh cát cứ của 12 sứ quân.',
    context:
      'Chiến thắng Bạch Đằng năm 938 chấm dứt hơn một nghìn năm Bắc thuộc. Nhiệm vụ đặt ra là xây dựng một nhà nước độc lập, tự chủ, khẳng định chủ quyền.',
    timeline: [
      {
        when: 'Năm 939',
        text: 'Ngô Quyền xưng vương, bỏ chức Tiết độ sứ của phong kiến phương Bắc, đóng đô ở Cổ Loa, đặt triều nghi, quy định lễ phục các quan.',
      },
      {
        when: 'Năm 944',
        text: 'Ngô Quyền mất. Dương Tam Kha (em vợ Ngô Quyền) cướp ngôi, triều đình rối loạn.',
      },
      {
        when: 'Năm 950',
        text: 'Ngô Xương Văn (con Ngô Quyền) lật đổ Dương Tam Kha, giành lại ngôi vua, nhưng chính quyền trung ương ngày càng suy yếu.',
      },
      {
        when: 'Năm 965',
        text: 'Ngô Xương Văn mất. Các thủ lĩnh địa phương nổi dậy, chiếm cứ mỗi người một vùng, hình thành 12 sứ quân (Ngô Xương Xí, Kiều Công Hãn, Đỗ Cảnh Thạc, Trần Lãm…).',
      },
      {
        when: '965 – 967',
        text: 'Các sứ quân đánh lẫn nhau, đất nước bị chia cắt, nhân dân cực khổ, nguy cơ ngoại xâm rình rập.',
      },
    ],
    result: 'Nhà Ngô sụp đổ; đất nước rơi vào tình trạng chia cắt (loạn 12 sứ quân) cho đến năm 967.',
    significance:
      'Nhà Ngô đặt nền móng cho một quốc gia độc lập. Loạn 12 sứ quân cho thấy yêu cầu cấp thiết phải thống nhất đất nước.',
    figures: [
      { name: 'Ngô Quyền', role: 'Người lập nhà Ngô, xưng vương năm 939' },
      { name: 'Ngô Xương Văn', role: 'Vua cuối cùng của nhà Ngô (950 – 965)' },
    ],
    places: [{ name: 'Kinh đô Cổ Loa (Hà Nội)', lat: 21.12, lon: 105.87 }],
    facts: [
      'Ngô Quyền chọn Cổ Loa — kinh đô cũ của An Dương Vương — làm kinh đô, thể hiện ý thức nối tiếp truyền thống dựng nước.',
    ],
    quiz: [
      {
        q: 'Năm 939, Ngô Quyền xưng vương và đóng đô ở đâu?',
        options: ['Hoa Lư', 'Cổ Loa', 'Thăng Long', 'Phong Châu'],
        answer: 1,
        explain: 'Ngô Quyền xưng vương, đóng đô ở Cổ Loa.',
      },
      {
        q: 'Việc Ngô Quyền bỏ chức Tiết độ sứ có ý nghĩa gì?',
        options: [
          'Khẳng định nền độc lập, không lệ thuộc phương Bắc',
          'Xin thần phục nhà Nam Hán',
          'Chia đất nước cho các sứ quân',
          'Dời đô về Thăng Long',
        ],
        answer: 0,
        explain: 'Bỏ chức Tiết độ sứ của phương Bắc là khẳng định nền độc lập của đất nước.',
      },
      {
        q: 'Sau khi Ngô Quyền mất, ai cướp ngôi nhà Ngô?',
        options: ['Đinh Bộ Lĩnh', 'Kiều Công Tiễn', 'Dương Tam Kha', 'Lê Hoàn'],
        answer: 2,
        explain: 'Năm 944, Dương Tam Kha cướp ngôi nhà Ngô.',
      },
      {
        q: 'Loạn 12 sứ quân bắt đầu từ năm nào?',
        options: ['939', '944', '965', '968'],
        answer: 2,
        explain: 'Năm 965, Ngô Xương Văn mất, các sứ quân nổi dậy cát cứ.',
      },
      {
        q: 'Hậu quả của loạn 12 sứ quân là gì?',
        options: [
          'Đất nước bị chia cắt, nhân dân cực khổ',
          'Kinh tế phát triển mạnh',
          'Nhà Tống công nhận nền độc lập',
          'Đất nước được mở rộng về phía Nam',
        ],
        answer: 0,
        explain: 'Các sứ quân đánh lẫn nhau, đất nước chia cắt, nhân dân khổ cực.',
      },
    ],
  },

  {
    ...base,
    slug: 'nha-dinh-dai-co-viet',
    time: '968 – 980',
    yearLabel: '968',
    sortYear: 968,
    title: 'Nhà Đinh và nước Đại Cồ Việt',
    shortTitle: 'Nhà Đinh',
    periodId: 'tu-chu',
    period: P.tuChu,
    summary:
      'Đinh Bộ Lĩnh dẹp loạn 12 sứ quân, thống nhất đất nước, lên ngôi Hoàng đế năm 968, đặt quốc hiệu Đại Cồ Việt, đóng đô ở Hoa Lư (Ninh Bình).',
    context:
      'Đất nước chia cắt bởi 12 sứ quân. Ở Hoa Lư, Đinh Bộ Lĩnh — từ nhỏ đã nổi tiếng với trò chơi “cờ lau tập trận” — xây dựng lực lượng, được nhân dân ủng hộ.',
    timeline: [
      {
        when: 'Trước 965',
        text: 'Đinh Bộ Lĩnh xây dựng căn cứ ở Hoa Lư, chiêu mộ lực lượng, được nhiều hào kiệt theo về.',
      },
      {
        when: '966 – 967',
        text: 'Liên kết với sứ quân Trần Lãm, Đinh Bộ Lĩnh lần lượt đánh dẹp các sứ quân, được tôn là “Vạn Thắng Vương”. Đất nước được thống nhất.',
      },
      {
        when: 'Năm 968',
        text: 'Đinh Bộ Lĩnh lên ngôi Hoàng đế (Đinh Tiên Hoàng), đặt quốc hiệu Đại Cồ Việt, đóng đô ở Hoa Lư.',
      },
      {
        when: 'Năm 970',
        text: 'Nhà Đinh đặt niên hiệu Thái Bình, sai sứ sang giao hảo với nhà Tống; đúc tiền đồng riêng.',
      },
      {
        when: 'Năm 979',
        text: 'Đinh Tiên Hoàng và con trưởng Đinh Liễn bị ám hại. Đinh Toàn mới 6 tuổi lên ngôi, triều đình suy yếu.',
      },
    ],
    result: 'Đất nước được thống nhất, nhà nước độc lập được củng cố với quốc hiệu Đại Cồ Việt.',
    significance:
      'Chấm dứt tình trạng chia cắt; việc xưng Hoàng đế, đặt quốc hiệu, niên hiệu riêng khẳng định nước ta ngang hàng với phương Bắc.',
    figures: [
      { name: 'Đinh Bộ Lĩnh (Đinh Tiên Hoàng)', role: 'Dẹp loạn 12 sứ quân, lập nhà Đinh' },
      { name: 'Đinh Liễn', role: 'Con trưởng Đinh Bộ Lĩnh, cùng cha dẹp loạn' },
    ],
    places: [{ name: 'Cố đô Hoa Lư (Ninh Bình)', lat: 20.29, lon: 105.91 }],
    facts: [
      'Nhà Đinh đúc đồng tiền “Thái Bình hưng bảo” — một trong những đồng tiền riêng đầu tiên của nước ta.',
      'Quốc hiệu “Đại Cồ Việt” có nghĩa là nước Việt to lớn.',
    ],
    quiz: [
      {
        q: 'Ai là người dẹp loạn 12 sứ quân, thống nhất đất nước?',
        options: ['Ngô Quyền', 'Đinh Bộ Lĩnh', 'Lê Hoàn', 'Lý Công Uẩn'],
        answer: 1,
        explain: 'Đinh Bộ Lĩnh dẹp loạn 12 sứ quân, thống nhất đất nước.',
      },
      {
        q: 'Năm 968, Đinh Bộ Lĩnh đặt quốc hiệu nước ta là gì?',
        options: ['Đại Việt', 'Vạn Xuân', 'Đại Cồ Việt', 'Đại Ngu'],
        answer: 2,
        explain: 'Đinh Bộ Lĩnh lên ngôi năm 968, đặt quốc hiệu Đại Cồ Việt.',
      },
      {
        q: 'Kinh đô của nhà Đinh đặt ở đâu?',
        options: ['Cổ Loa', 'Thăng Long', 'Hoa Lư (Ninh Bình)', 'Tây Đô'],
        answer: 2,
        explain: 'Nhà Đinh đóng đô ở Hoa Lư, Ninh Bình.',
      },
      {
        q: 'Đinh Bộ Lĩnh được tôn là gì sau khi dẹp các sứ quân?',
        options: ['Vạn Thắng Vương', 'Bố Cái Đại Vương', 'Triệu Việt Vương', 'Bình Định Vương'],
        answer: 0,
        explain: 'Đinh Bộ Lĩnh được tôn là Vạn Thắng Vương.',
      },
      {
        q: 'Đồng tiền riêng do nhà Đinh đúc có tên là gì?',
        options: ['Thông bảo hội sao', 'Thái Bình hưng bảo', 'Thiên Phúc trấn bảo', 'Gia Long thông bảo'],
        answer: 1,
        explain: 'Nhà Đinh đúc đồng tiền “Thái Bình hưng bảo”.',
      },
    ],
  },

  {
    ...base,
    slug: 'khang-chien-chong-tong-981',
    time: '980 – 981',
    yearLabel: '981',
    sortYear: 980,
    title: 'Nhà Tiền Lê và kháng chiến chống Tống lần thứ nhất',
    shortTitle: 'Chống Tống năm 981',
    periodId: 'tu-chu',
    period: P.tuChu,
    summary:
      'Năm 980, trước nguy cơ quân Tống xâm lược, Lê Hoàn được tôn lên ngôi (Lê Đại Hành), lập nhà Tiền Lê. Năm 981, ông lãnh đạo quân dân đánh tan quân Tống trên sông Bạch Đằng và ở Chi Lăng.',
    context:
      'Triều Đinh rối ren khi vua Đinh Toàn còn nhỏ. Nhân cơ hội đó, nhà Tống chuẩn bị đem quân xâm lược Đại Cồ Việt.',
    timeline: [
      {
        when: 'Năm 980',
        text: 'Trước tình thế khẩn cấp, Thái hậu Dương Vân Nga và triều thần tôn Thập đạo tướng quân Lê Hoàn lên ngôi vua, lập nhà Tiền Lê.',
      },
      {
        when: 'Đầu năm 981',
        text: 'Quân Tống do Hầu Nhân Bảo chỉ huy chia hai đường thủy, bộ tiến vào nước ta.',
      },
      {
        when: 'Năm 981',
        text: 'Lê Hoàn cho đóng cọc trên sông Bạch Đằng chặn thủy quân giặc, đồng thời dùng kế trá hàng, nhử Hầu Nhân Bảo vào trận địa mai phục ở Chi Lăng và giết chết.',
      },
      {
        when: 'Kết thúc',
        text: 'Quân Tống thua to, bị giết và bị bắt rất nhiều, phải rút về nước.',
      },
      {
        when: 'Năm 987',
        text: 'Đất nước yên bình, Lê Hoàn tổ chức lễ cày tịch điền đầu tiên ở Đọi Sơn (Hà Nam), khuyến khích sản xuất nông nghiệp.',
      },
    ],
    result: 'Cuộc kháng chiến chống Tống thắng lợi nhanh chóng, bảo vệ vững chắc nền độc lập.',
    significance:
      'Khẳng định sức mạnh của nhà nước độc lập non trẻ; để lại bài học về chủ động đối phó và nghệ thuật đánh giặc trên sông Bạch Đằng, ải Chi Lăng.',
    figures: [
      { name: 'Lê Hoàn (Lê Đại Hành)', role: 'Lập nhà Tiền Lê, lãnh đạo kháng chiến chống Tống năm 981' },
      { name: 'Dương Vân Nga', role: 'Thái hậu nhà Đinh, trao ngôi cho Lê Hoàn' },
      { name: 'Hầu Nhân Bảo', role: 'Tướng chỉ huy quân Tống, tử trận ở Chi Lăng' },
    ],
    places: [
      { name: 'Ải Chi Lăng (Lạng Sơn)', lat: 21.67, lon: 106.62 },
      { name: 'Sông Bạch Đằng', lat: 20.92, lon: 106.79 },
    ],
    facts: [
      'Tương truyền Thái hậu Dương Vân Nga đã khoác áo long cổn cho Lê Hoàn ngay trước triều đình để tôn ông lên ngôi.',
    ],
    quiz: [
      {
        q: 'Năm 980, ai được tôn lên ngôi vua, lập nhà Tiền Lê?',
        options: ['Đinh Toàn', 'Lê Hoàn', 'Lý Công Uẩn', 'Ngô Xương Văn'],
        answer: 1,
        explain: 'Lê Hoàn được tôn lên ngôi, lập nhà Tiền Lê.',
      },
      {
        q: 'Tướng chỉ huy quân Tống xâm lược năm 981 là ai?',
        options: ['Hầu Nhân Bảo', 'Quách Quỳ', 'Lưu Hoằng Tháo', 'Thoát Hoan'],
        answer: 0,
        explain: 'Hầu Nhân Bảo chỉ huy quân Tống và tử trận ở Chi Lăng.',
      },
      {
        q: 'Trong kháng chiến năm 981, quân ta đánh bại quân Tống ở đâu?',
        options: ['Sông Như Nguyệt', 'Sông Bạch Đằng và ải Chi Lăng', 'Rạch Gầm – Xoài Mút', 'Đống Đa'],
        answer: 1,
        explain: 'Quân ta đánh tan quân Tống trên sông Bạch Đằng và ở ải Chi Lăng.',
      },
      {
        q: 'Ai đã trao ngôi cho Lê Hoàn?',
        options: ['Thái hậu Dương Vân Nga', 'Vua Đinh Tiên Hoàng', 'Nhà Tống', 'Lý Thường Kiệt'],
        answer: 0,
        explain: 'Thái hậu Dương Vân Nga và triều thần tôn Lê Hoàn lên ngôi.',
      },
      {
        q: 'Năm 987, Lê Hoàn tổ chức nghi lễ gì để khuyến khích nông nghiệp?',
        options: ['Lễ cày tịch điền', 'Lễ hội đua thuyền', 'Lễ tế Nam Giao', 'Hội nghị Diên Hồng'],
        answer: 0,
        explain: 'Năm 987, Lê Hoàn tổ chức lễ cày tịch điền đầu tiên ở Đọi Sơn (Hà Nam).',
      },
    ],
  },

  {
    ...base,
    slug: 'nha-ly-doi-do-thang-long',
    time: '1009 – 1070',
    yearLabel: '1010',
    sortYear: 1009,
    title: 'Nhà Lý dời đô về Thăng Long',
    shortTitle: 'Dời đô Thăng Long',
    periodId: 'tu-chu',
    period: P.tuChu,
    summary:
      'Lý Công Uẩn lập nhà Lý (1009), ban Chiếu dời đô từ Hoa Lư về Đại La, đổi tên là Thăng Long (1010). Nhà Lý ban hành bộ luật Hình thư (1042), đổi quốc hiệu thành Đại Việt (1054), xây Văn Miếu (1070).',
    context:
      'Cuối thời Tiền Lê, vua Lê Long Đĩnh ăn chơi, tàn bạo, lòng người oán hận. Năm 1009 vua mất, triều thần tôn Lý Công Uẩn — người nổi tiếng nhân hậu, có uy tín — lên ngôi.',
    timeline: [
      {
        when: 'Năm 1009',
        text: 'Lý Công Uẩn lên ngôi vua (Lý Thái Tổ), lập nhà Lý.',
      },
      {
        when: 'Mùa thu năm 1010',
        text: 'Lý Thái Tổ ban Chiếu dời đô, dời kinh đô từ Hoa Lư về thành Đại La và đổi tên là Thăng Long.',
      },
      {
        when: 'Năm 1042',
        text: 'Nhà Lý ban hành bộ luật Hình thư — bộ luật thành văn đầu tiên của nước ta.',
      },
      {
        when: 'Năm 1054',
        text: 'Vua Lý Thánh Tông đổi quốc hiệu Đại Cồ Việt thành Đại Việt.',
      },
      {
        when: 'Năm 1070',
        text: 'Xây dựng Văn Miếu ở Thăng Long để thờ Khổng Tử; năm 1075 mở khoa thi đầu tiên, năm 1076 lập Quốc Tử Giám.',
      },
    ],
    result: 'Thăng Long trở thành kinh đô của nhiều triều đại; nhà nước quân chủ trung ương tập quyền được xây dựng vững mạnh.',
    significance:
      'Việc dời đô về Thăng Long — nơi “trung tâm trời đất”, thế “rồng cuộn hổ ngồi” — mở ra thời kỳ phát triển mới của văn minh Đại Việt.',
    figures: [
      { name: 'Lý Công Uẩn (Lý Thái Tổ)', role: 'Người lập nhà Lý, ban Chiếu dời đô' },
      { name: 'Lý Thánh Tông', role: 'Vua đổi quốc hiệu thành Đại Việt (1054), xây Văn Miếu (1070)' },
    ],
    places: [{ name: 'Hoàng thành Thăng Long (Hà Nội)', lat: 21.035, lon: 105.84 }],
    facts: [
      'Khu trung tâm Hoàng thành Thăng Long – Hà Nội được UNESCO công nhận là Di sản văn hóa thế giới năm 2010, đúng dịp 1000 năm Thăng Long.',
      'Theo truyền thuyết, khi thuyền vua tới Đại La, thấy rồng vàng bay lên nên vua đặt tên kinh đô là Thăng Long (rồng bay lên).',
    ],
    quiz: [
      {
        q: 'Năm 1010, Lý Công Uẩn dời kinh đô từ đâu về Đại La?',
        options: ['Cổ Loa', 'Hoa Lư', 'Tây Đô', 'Phú Xuân'],
        answer: 1,
        explain: 'Lý Công Uẩn dời đô từ Hoa Lư về Đại La, đổi tên là Thăng Long.',
      },
      {
        q: 'Bộ luật thành văn đầu tiên của nước ta là bộ luật nào?',
        options: ['Luật Hồng Đức', 'Luật Gia Long', 'Hình thư', 'Hình luật'],
        answer: 2,
        explain: 'Năm 1042, nhà Lý ban hành bộ luật Hình thư.',
      },
      {
        q: 'Năm 1054, quốc hiệu nước ta được đổi thành gì?',
        options: ['Đại Cồ Việt', 'Đại Việt', 'Đại Ngu', 'Việt Nam'],
        answer: 1,
        explain: 'Năm 1054, vua Lý Thánh Tông đổi quốc hiệu thành Đại Việt.',
      },
      {
        q: 'Văn Miếu ở Thăng Long được xây dựng năm nào?',
        options: ['1010', '1042', '1070', '1076'],
        answer: 2,
        explain: 'Văn Miếu được xây dựng năm 1070; Quốc Tử Giám lập năm 1076.',
      },
      {
        q: 'Tên “Thăng Long” có nghĩa là gì?',
        options: ['Rồng bay lên', 'Thành vững chắc', 'Mùa xuân muôn năm', 'Đất nước to lớn'],
        answer: 0,
        explain: 'Thăng Long nghĩa là “rồng bay lên”.',
      },
    ],
  },

  {
    ...base,
    slug: 'nha-ho-cai-cach-ho-quy-ly',
    time: '1400 – 1407',
    yearLabel: '1400',
    sortYear: 1400,
    title: 'Nhà Hồ và cải cách Hồ Quý Ly',
    shortTitle: 'Cải cách Hồ Quý Ly',
    periodId: 'tu-chu',
    period: P.tuChu,
    summary:
      'Cuối thế kỷ XIV, Hồ Quý Ly tiến hành nhiều cải cách; năm 1400 lập nhà Hồ, đặt quốc hiệu Đại Ngu, xây thành Tây Đô. Cuộc kháng chiến chống quân Minh của nhà Hồ thất bại năm 1407.',
    context:
      'Cuối thế kỷ XIV, nhà Trần suy yếu: vua quan ăn chơi, nông dân, nô tì nổi dậy khắp nơi, phương Bắc nhà Minh đe dọa, phía Nam Chăm-pa thường xuyên tấn công. Hồ Quý Ly — một đại thần có quyền lực — từng bước tiến hành cải cách.',
    timeline: [
      {
        when: 'Năm 1396',
        text: 'Hồ Quý Ly cho phát hành tiền giấy “Thông bảo hội sao” thay cho tiền đồng.',
      },
      {
        when: 'Năm 1397',
        text: 'Xây thành Tây Đô (Vĩnh Lộc, Thanh Hóa) bằng đá; ban hành phép hạn điền, hạn chế ruộng tư của quý tộc, địa chủ.',
      },
      {
        when: 'Năm 1400',
        text: 'Hồ Quý Ly phế truất vua Trần, lập nhà Hồ, đặt quốc hiệu Đại Ngu.',
      },
      {
        when: 'Năm 1401',
        text: 'Ban hành phép hạn nô (hạn chế số nô tì của quý tộc); cải cách giáo dục, thi cử, đề cao chữ Nôm.',
      },
      {
        when: '1406 – 1407',
        text: 'Quân Minh xâm lược. Nhà Hồ kháng chiến nhưng thất bại; tháng 6/1407 cha con Hồ Quý Ly bị bắt, nước ta rơi vào ách đô hộ của nhà Minh.',
      },
    ],
    result: 'Cải cách góp phần củng cố tiềm lực đất nước nhưng chưa thu phục được lòng dân; kháng chiến chống Minh thất bại.',
    significance:
      'Cải cách Hồ Quý Ly thể hiện tinh thần đổi mới mạnh mẽ; bài học thất bại cho thấy sức mạnh của khối đoàn kết toàn dân là yếu tố quyết định.',
    figures: [
      { name: 'Hồ Quý Ly', role: 'Người lập nhà Hồ và tiến hành cải cách' },
      { name: 'Hồ Nguyên Trừng', role: 'Con trưởng Hồ Quý Ly, người chế tạo súng thần cơ' },
    ],
    places: [{ name: 'Thành nhà Hồ – Tây Đô (Thanh Hóa)', lat: 20.08, lon: 105.6 }],
    facts: [
      'Thành nhà Hồ được UNESCO công nhận là Di sản văn hóa thế giới năm 2011.',
      'Hồ Nguyên Trừng từng nói: “Tôi không sợ đánh, chỉ sợ lòng dân không theo”.',
    ],
    quiz: [
      {
        q: 'Năm 1400, Hồ Quý Ly đặt quốc hiệu nước ta là gì?',
        options: ['Đại Việt', 'Đại Ngu', 'Đại Cồ Việt', 'Đại Nam'],
        answer: 1,
        explain: 'Hồ Quý Ly lập nhà Hồ, đặt quốc hiệu Đại Ngu.',
      },
      {
        q: 'Thành Tây Đô (thành nhà Hồ) được xây ở đâu?',
        options: ['Ninh Bình', 'Thanh Hóa', 'Nghệ An', 'Hà Nội'],
        answer: 1,
        explain: 'Thành Tây Đô được xây ở Vĩnh Lộc, Thanh Hóa.',
      },
      {
        q: 'Chính sách nào của Hồ Quý Ly nhằm hạn chế ruộng tư của quý tộc, địa chủ?',
        options: ['Phép hạn điền', 'Phép quân điền', 'Lộc điền', 'Phép tịch điền'],
        answer: 0,
        explain: 'Phép hạn điền (1397) hạn chế số ruộng tư của quý tộc, địa chủ.',
      },
      {
        q: 'Hồ Quý Ly cho phát hành loại tiền nào?',
        options: ['Tiền đồng Thái Bình', 'Tiền giấy Thông bảo hội sao', 'Tiền bạc', 'Tiền vàng'],
        answer: 1,
        explain: 'Năm 1396, Hồ Quý Ly phát hành tiền giấy “Thông bảo hội sao”.',
      },
      {
        q: 'Nguyên nhân chính khiến kháng chiến chống Minh của nhà Hồ thất bại là gì?',
        options: [
          'Không có vũ khí',
          'Không có thành lũy',
          'Không đoàn kết được toàn dân',
          'Không có tướng giỏi',
        ],
        answer: 2,
        explain: 'Như Hồ Nguyên Trừng nói, nhà Hồ “chỉ sợ lòng dân không theo” — không đoàn kết được toàn dân.',
      },
    ],
  },

  {
    ...base,
    slug: 'nha-le-so-le-thanh-tong',
    time: '1428 – 1527',
    yearLabel: '1428',
    sortYear: 1428,
    title: 'Nhà Lê sơ và cải cách Lê Thánh Tông',
    shortTitle: 'Lê Thánh Tông',
    periodId: 'tu-chu',
    period: P.tuChu,
    summary:
      'Năm 1428 Lê Lợi lên ngôi, khôi phục quốc hiệu Đại Việt. Dưới thời Lê Thánh Tông (1460 – 1497), bộ máy nhà nước được cải cách toàn diện, ban hành Luật Hồng Đức, vẽ bản đồ Hồng Đức; Đại Việt đạt tới thời thịnh trị.',
    context:
      'Sau thắng lợi của khởi nghĩa Lam Sơn, nhà Lê sơ xây dựng lại đất nước bị chiến tranh tàn phá. Đến thời Lê Thánh Tông, cần một bộ máy nhà nước chặt chẽ, tập trung quyền lực vào nhà vua.',
    timeline: [
      {
        when: 'Năm 1428',
        text: 'Lê Lợi lên ngôi Hoàng đế (Lê Thái Tổ), khôi phục quốc hiệu Đại Việt, đóng đô ở Thăng Long.',
      },
      {
        when: 'Năm 1460',
        text: 'Lê Thánh Tông lên ngôi, bắt đầu một loạt cải cách quan trọng.',
      },
      {
        when: '1466 – 1471',
        text: 'Cải cách hành chính: bãi bỏ các chức quan đại thần trung gian; chia cả nước thành 13 đạo thừa tuyên, mỗi đạo có 3 ty (Đô ty, Thừa ty, Hiến ty) cùng quản lý.',
      },
      {
        when: 'Thời Lê Thánh Tông',
        text: 'Ban hành Quốc triều hình luật (Luật Hồng Đức) với nhiều điều khoản bảo vệ quyền lợi của phụ nữ; năm 1490 hoàn thành bản đồ Hồng Đức — bản đồ hành chính đầu tiên của cả nước.',
      },
      {
        when: 'Năm 1527',
        text: 'Mạc Đăng Dung phế truất vua Lê, lập nhà Mạc; nhà Lê sơ kết thúc.',
      },
    ],
    result: 'Bộ máy nhà nước quân chủ trung ương tập quyền đạt đến đỉnh cao; kinh tế, văn hóa, giáo dục phát triển.',
    significance:
      'Thời Lê Thánh Tông là giai đoạn thịnh trị bậc nhất của Đại Việt; Luật Hồng Đức là bộ luật tiến bộ, có giá trị lâu dài.',
    figures: [
      { name: 'Lê Thánh Tông', role: 'Vị vua cải cách, đưa Đại Việt tới thời thịnh trị' },
      { name: 'Lê Lợi (Lê Thái Tổ)', role: 'Người lập nhà Lê sơ năm 1428' },
      { name: 'Ngô Sĩ Liên', role: 'Sử gia, biên soạn Đại Việt sử ký toàn thư (1479)' },
    ],
    places: [{ name: 'Văn Miếu – Quốc Tử Giám (Hà Nội)', lat: 21.028, lon: 105.836 }],
    facts: [
      'Năm 1484, Lê Thánh Tông cho dựng bia ghi tên tiến sĩ ở Văn Miếu; 82 bia tiến sĩ được UNESCO ghi danh là Di sản tư liệu thế giới năm 2010.',
    ],
    quiz: [
      {
        q: 'Năm 1428, Lê Lợi lên ngôi và khôi phục quốc hiệu nào?',
        options: ['Đại Ngu', 'Đại Việt', 'Đại Nam', 'Việt Nam'],
        answer: 1,
        explain: 'Lê Lợi lên ngôi năm 1428, khôi phục quốc hiệu Đại Việt.',
      },
      {
        q: 'Lê Thánh Tông chia cả nước thành bao nhiêu đạo thừa tuyên?',
        options: ['12 đạo', '13 đạo', '15 đạo', '30 tỉnh'],
        answer: 1,
        explain: 'Lê Thánh Tông chia cả nước thành 13 đạo thừa tuyên.',
      },
      {
        q: 'Bộ luật được ban hành dưới thời Lê Thánh Tông là gì?',
        options: ['Hình thư', 'Hình luật', 'Quốc triều hình luật (Luật Hồng Đức)', 'Hoàng Việt luật lệ'],
        answer: 2,
        explain: 'Lê Thánh Tông ban hành Quốc triều hình luật, thường gọi là Luật Hồng Đức.',
      },
      {
        q: 'Điểm tiến bộ nổi bật của Luật Hồng Đức là gì?',
        options: [
          'Có nhiều điều khoản bảo vệ quyền lợi của phụ nữ',
          'Bãi bỏ mọi hình phạt',
          'Cho phép mua bán chức quan',
          'Chỉ áp dụng cho quý tộc',
        ],
        answer: 0,
        explain: 'Luật Hồng Đức có nhiều điều khoản bảo vệ quyền lợi của phụ nữ.',
      },
      {
        q: 'Năm 1484, Lê Thánh Tông cho dựng gì ở Văn Miếu?',
        options: ['Khuê Văn Các', 'Bia ghi tên tiến sĩ', 'Quốc Tử Giám', 'Tượng Khổng Tử'],
        answer: 1,
        explain: 'Năm 1484 bắt đầu dựng bia tiến sĩ; 82 bia được UNESCO ghi danh năm 2010.',
      },
    ],
  },

  {
    ...base,
    slug: 'dang-trong-dang-ngoai',
    time: '1527 – 1777',
    yearLabel: '1527',
    sortYear: 1527,
    title: 'Nam – Bắc triều, Đàng Trong – Đàng Ngoài',
    shortTitle: 'Đàng Trong – Đàng Ngoài',
    periodId: 'tu-chu',
    period: P.tuChu,
    summary:
      'Từ năm 1527 đất nước rơi vào chia cắt: Nam – Bắc triều (Lê – Mạc), rồi Trịnh – Nguyễn phân tranh lấy sông Gianh làm ranh giới. Ở Đàng Trong, các chúa Nguyễn khai phá vùng đất Nam Bộ, lập đội Hoàng Sa, Bắc Hải quản lý biển đảo.',
    context:
      'Đầu thế kỷ XVI, nhà Lê sơ suy yếu, các phe phái tranh giành quyền lực. Năm 1527, Mạc Đăng Dung lập nhà Mạc, mở đầu hơn hai thế kỷ đất nước bị chia cắt.',
    timeline: [
      {
        when: 'Năm 1527',
        text: 'Mạc Đăng Dung phế truất vua Lê, lập nhà Mạc.',
      },
      {
        when: '1533 – 1592',
        text: 'Nguyễn Kim lập Nam triều (nhà Lê) ở Thanh Hóa, chống lại Bắc triều (nhà Mạc) ở Thăng Long. Chiến tranh Nam – Bắc triều kéo dài hơn 50 năm.',
      },
      {
        when: '1627 – 1672',
        text: 'Chiến tranh Trịnh – Nguyễn diễn ra 7 lần. Hai bên lấy sông Gianh (Quảng Bình) làm ranh giới: Đàng Ngoài thuộc chúa Trịnh, Đàng Trong thuộc chúa Nguyễn.',
      },
      {
        when: '1698 – 1757',
        text: 'Năm 1698, Nguyễn Hữu Cảnh lập phủ Gia Định. Đến năm 1757, các chúa Nguyễn hoàn thành việc xác lập chủ quyền trên vùng đất Nam Bộ.',
      },
      {
        when: 'Thế kỷ XVII – XVIII',
        text: 'Chúa Nguyễn lập đội Hoàng Sa, đội Bắc Hải hằng năm ra các quần đảo Hoàng Sa, Trường Sa để khai thác sản vật và quản lý biển đảo.',
      },
    ],
    result: 'Đất nước bị chia cắt lâu dài; đồng thời lãnh thổ được mở rộng về phía Nam và chủ quyền biển đảo được xác lập.',
    significance:
      'Chia cắt gây nhiều đau thương cho nhân dân; nhưng công cuộc khai phá Nam Bộ và quản lý Hoàng Sa, Trường Sa là đóng góp to lớn vào lãnh thổ Việt Nam ngày nay.',
    figures: [
      { name: 'Mạc Đăng Dung', role: 'Người lập nhà Mạc năm 1527' },
      { name: 'Nguyễn Hoàng', role: 'Chúa Nguyễn đầu tiên, mở đầu xây dựng Đàng Trong' },
      { name: 'Nguyễn Hữu Cảnh', role: 'Người lập phủ Gia Định năm 1698' },
    ],
    places: [
      { name: 'Sông Gianh (Quảng Bình)', lat: 17.7, lon: 106.47 },
      { name: 'Phủ Gia Định', lat: 10.78, lon: 106.69 },
    ],
    facts: [
      'Đô thị cổ Hội An — thương cảng sầm uất của Đàng Trong thế kỷ XVII – XVIII — được UNESCO công nhận là Di sản văn hóa thế giới năm 1999.',
    ],
    quiz: [
      {
        q: 'Năm 1527, ai lập ra nhà Mạc?',
        options: ['Nguyễn Kim', 'Mạc Đăng Dung', 'Trịnh Kiểm', 'Nguyễn Hoàng'],
        answer: 1,
        explain: 'Mạc Đăng Dung phế truất vua Lê, lập nhà Mạc năm 1527.',
      },
      {
        q: 'Con sông nào là ranh giới giữa Đàng Trong và Đàng Ngoài?',
        options: ['Sông Gianh', 'Sông Bến Hải', 'Sông Hồng', 'Sông Mã'],
        answer: 0,
        explain: 'Sông Gianh (Quảng Bình) là ranh giới chia cắt Đàng Trong – Đàng Ngoài.',
      },
      {
        q: 'Năm 1698, ai được chúa Nguyễn cử vào lập phủ Gia Định?',
        options: ['Nguyễn Hữu Cảnh', 'Nguyễn Hoàng', 'Mạc Cửu', 'Nguyễn Huệ'],
        answer: 0,
        explain: 'Năm 1698, Nguyễn Hữu Cảnh lập phủ Gia Định.',
      },
      {
        q: 'Đội nào được chúa Nguyễn lập ra để quản lý, khai thác quần đảo Hoàng Sa?',
        options: ['Đội Hoàng Sa', 'Đội Thủy binh', 'Đội Thần cơ', 'Đội Cấm quân'],
        answer: 0,
        explain: 'Chúa Nguyễn lập đội Hoàng Sa, đội Bắc Hải ra quản lý, khai thác biển đảo.',
      },
      {
        q: 'Ở Đàng Ngoài, quyền lực thực tế nằm trong tay ai?',
        options: ['Chúa Nguyễn', 'Chúa Trịnh', 'Nhà Mạc', 'Vua Quang Trung'],
        answer: 1,
        explain: 'Ở Đàng Ngoài, vua Lê chỉ là bù nhìn, quyền lực thuộc về chúa Trịnh.',
      },
    ],
  },

  {
    ...base,
    slug: 'nha-nguyen-minh-mang',
    time: '1802 – 1858',
    yearLabel: '1802',
    sortYear: 1802,
    title: 'Nhà Nguyễn và cải cách Minh Mạng',
    shortTitle: 'Nhà Nguyễn – Minh Mạng',
    periodId: 'tu-chu',
    period: P.tuChu,
    summary:
      'Năm 1802 Nguyễn Ánh lên ngôi (Gia Long), lập nhà Nguyễn, đóng đô ở Phú Xuân (Huế); năm 1804 đặt quốc hiệu Việt Nam. Vua Minh Mạng cải cách hành chính, chia cả nước thành 30 tỉnh và 1 phủ Thừa Thiên; nhà Nguyễn tiếp tục thực thi chủ quyền ở Hoàng Sa, Trường Sa.',
    context:
      'Sau khi đánh bại triều Tây Sơn, Nguyễn Ánh làm chủ một lãnh thổ thống nhất rộng lớn từ Bắc vào Nam. Nhiệm vụ đặt ra là xây dựng bộ máy quản lý chặt chẽ cho cả nước.',
    timeline: [
      {
        when: 'Năm 1802',
        text: 'Nguyễn Ánh lên ngôi Hoàng đế (niên hiệu Gia Long), lập nhà Nguyễn, đóng đô ở Phú Xuân (Huế).',
      },
      {
        when: 'Năm 1804',
        text: 'Vua Gia Long đặt quốc hiệu là Việt Nam.',
      },
      {
        when: 'Năm 1816',
        text: 'Vua Gia Long sai thủy quân ra quần đảo Hoàng Sa cắm cờ, đo đạc thủy trình, khẳng định chủ quyền.',
      },
      {
        when: '1831 – 1832',
        text: 'Vua Minh Mạng cải cách hành chính: chia cả nước thành 30 tỉnh và 1 phủ Thừa Thiên; bỏ Bắc thành, Gia Định thành để tập trung quyền lực vào triều đình. Năm 1838 đổi quốc hiệu thành Đại Nam.',
      },
      {
        when: 'Năm 1836',
        text: 'Vua Minh Mạng sai Phạm Hữu Nhật đem thủy quân ra Hoàng Sa cắm mốc, dựng bia chủ quyền.',
      },
    ],
    result: 'Bộ máy nhà nước được tổ chức chặt chẽ, thống nhất từ trung ương tới địa phương; chủ quyền biển đảo được thực thi liên tục.',
    significance:
      'Cải cách Minh Mạng để lại nền nếp hành chính có giá trị lâu dài; nhiều tỉnh ngày nay vẫn mang tên gọi từ thời đó. Các hoạt động ở Hoàng Sa, Trường Sa là bằng chứng lịch sử quan trọng về chủ quyền của Việt Nam.',
    figures: [
      { name: 'Gia Long (Nguyễn Ánh)', role: 'Người lập nhà Nguyễn, đặt quốc hiệu Việt Nam' },
      { name: 'Minh Mạng', role: 'Vị vua tiến hành cải cách hành chính (1831 – 1832)' },
    ],
    places: [{ name: 'Kinh thành Huế', lat: 16.47, lon: 107.58 }],
    facts: [
      'Quần thể di tích Cố đô Huế được UNESCO công nhận là Di sản văn hóa thế giới năm 1993 — di sản văn hóa thế giới đầu tiên của Việt Nam.',
    ],
    quiz: [
      {
        q: 'Năm 1804, vua Gia Long đặt quốc hiệu nước ta là gì?',
        options: ['Đại Việt', 'Đại Nam', 'Việt Nam', 'Đại Ngu'],
        answer: 2,
        explain: 'Năm 1804, vua Gia Long đặt quốc hiệu Việt Nam.',
      },
      {
        q: 'Kinh đô của nhà Nguyễn đặt ở đâu?',
        options: ['Thăng Long', 'Phú Xuân (Huế)', 'Gia Định', 'Hoa Lư'],
        answer: 1,
        explain: 'Nhà Nguyễn đóng đô ở Phú Xuân (Huế).',
      },
      {
        q: 'Vua Minh Mạng chia cả nước thành bao nhiêu tỉnh?',
        options: ['13 đạo', '30 tỉnh và 1 phủ Thừa Thiên', '15 bộ', '63 tỉnh'],
        answer: 1,
        explain: 'Năm 1831 – 1832, Minh Mạng chia cả nước thành 30 tỉnh và 1 phủ Thừa Thiên.',
      },
      {
        q: 'Năm 1836, vua Minh Mạng sai ai ra Hoàng Sa cắm mốc, dựng bia chủ quyền?',
        options: ['Phạm Hữu Nhật', 'Nguyễn Tri Phương', 'Nguyễn Hữu Cảnh', 'Phan Thanh Giản'],
        answer: 0,
        explain: 'Năm 1836, Phạm Hữu Nhật được cử ra Hoàng Sa cắm mốc chủ quyền.',
      },
      {
        q: 'Di sản văn hóa thế giới đầu tiên của Việt Nam là gì?',
        options: ['Vịnh Hạ Long', 'Quần thể di tích Cố đô Huế', 'Phố cổ Hội An', 'Thành nhà Hồ'],
        answer: 1,
        explain: 'Quần thể di tích Cố đô Huế được UNESCO công nhận năm 1993.',
      },
    ],
  },
  // ═════════════════════════════════════════════ PHÁP THUỘC VÀ ĐẤU TRANH GIẢI PHÓNG
  {
    ...base,
    slug: 'phap-xam-luoc-1858',
    time: '1858 – 1884',
    yearLabel: '1858',
    sortYear: 1858,
    title: 'Thực dân Pháp xâm lược Việt Nam',
    shortTitle: 'Pháp xâm lược',
    periodId: 'phap-thuoc',
    period: P.phapThuoc,
    summary:
      'Ngày 1/9/1858, liên quân Pháp – Tây Ban Nha nổ súng tấn công Đà Nẵng, mở đầu cuộc xâm lược. Nhân dân kiên cường kháng chiến, nhưng triều Nguyễn lần lượt ký các hiệp ước 1862, 1874, 1883, 1884; Việt Nam trở thành thuộc địa của Pháp.',
    context:
      'Giữa thế kỷ XIX, các nước tư bản phương Tây ráo riết tìm kiếm thuộc địa. Trong khi đó, chế độ phong kiến nhà Nguyễn khủng hoảng, kinh tế sa sút, quân đội yếu kém, triều đình thi hành chính sách “bế quan tỏa cảng”.',
    timeline: [
      {
        when: '1/9/1858',
        text: 'Liên quân Pháp – Tây Ban Nha tấn công bán đảo Sơn Trà (Đà Nẵng). Quân dân ta do Nguyễn Tri Phương chỉ huy đánh trả quyết liệt, làm thất bại kế hoạch “đánh nhanh thắng nhanh” của địch.',
      },
      {
        when: '2/1859',
        text: 'Pháp chuyển hướng tấn công vào Gia Định. Nghĩa quân của Trương Định, Nguyễn Trung Trực… nổi dậy khắp Nam Kỳ.',
      },
      {
        when: '5/6/1862',
        text: 'Triều Nguyễn ký Hiệp ước Nhâm Tuất, cắt ba tỉnh miền Đông Nam Kỳ (Gia Định, Định Tường, Biên Hòa) và đảo Côn Lôn cho Pháp. Năm 1867, Pháp chiếm tiếp ba tỉnh miền Tây Nam Kỳ.',
      },
      {
        when: '1873 – 1874',
        text: 'Pháp đánh Bắc Kỳ lần thứ nhất; quân ta phục kích giết Gác-ni-ê ở Cầu Giấy (21/12/1873). Nhưng triều Nguyễn ký Hiệp ước Giáp Tuất (1874), thừa nhận sáu tỉnh Nam Kỳ thuộc Pháp.',
      },
      {
        when: '1882 – 1884',
        text: 'Pháp đánh Bắc Kỳ lần thứ hai; Tổng đốc Hoàng Diệu tuẫn tiết khi thành Hà Nội thất thủ (1882). Hiệp ước Hác-măng (1883) và Pa-tơ-nốt (6/6/1884) đặt ách bảo hộ của Pháp lên cả nước.',
      },
    ],
    result: 'Việt Nam trở thành thuộc địa của thực dân Pháp; triều Nguyễn chỉ còn là chính quyền bù nhìn.',
    significance:
      'Nhân dân ta kháng chiến anh dũng ngay từ đầu, thể hiện truyền thống yêu nước; sự nhu nhược của triều Nguyễn là bài học đau xót về trách nhiệm giữ nước.',
    figures: [
      { name: 'Nguyễn Tri Phương', role: 'Tổng chỉ huy chống Pháp ở Đà Nẵng, Gia Định, Hà Nội' },
      { name: 'Trương Định', role: 'Lãnh đạo nghĩa quân chống Pháp ở Gò Công, được phong “Bình Tây Đại nguyên soái”' },
      { name: 'Nguyễn Trung Trực', role: 'Chỉ huy nghĩa quân đốt tàu Hy Vọng của Pháp (1861)' },
      { name: 'Hoàng Diệu', role: 'Tổng đốc Hà Nội, tuẫn tiết khi thành mất (1882)' },
    ],
    places: [
      { name: 'Bán đảo Sơn Trà (Đà Nẵng)', lat: 16.1, lon: 108.25 },
      { name: 'Gia Định', lat: 10.78, lon: 106.69 },
    ],
    facts: [
      'Nguyễn Trung Trực có câu nói nổi tiếng: “Bao giờ người Tây nhổ hết cỏ nước Nam thì mới hết người Nam đánh Tây”.',
    ],
    quiz: [
      {
        q: 'Ngày 1/9/1858, liên quân Pháp – Tây Ban Nha nổ súng tấn công ở đâu?',
        options: ['Gia Định', 'Đà Nẵng', 'Hà Nội', 'Huế'],
        answer: 1,
        explain: 'Liên quân Pháp – Tây Ban Nha tấn công bán đảo Sơn Trà, Đà Nẵng.',
      },
      {
        q: 'Ai chỉ huy quân dân ta chống Pháp ở Đà Nẵng năm 1858?',
        options: ['Hoàng Diệu', 'Nguyễn Tri Phương', 'Tôn Thất Thuyết', 'Phan Thanh Giản'],
        answer: 1,
        explain: 'Nguyễn Tri Phương chỉ huy kháng chiến ở mặt trận Đà Nẵng.',
      },
      {
        q: 'Hiệp ước Nhâm Tuất (1862) cắt cho Pháp những vùng đất nào?',
        options: [
          'Ba tỉnh miền Đông Nam Kỳ và đảo Côn Lôn',
          'Ba tỉnh miền Tây Nam Kỳ',
          'Toàn bộ Bắc Kỳ',
          'Kinh thành Huế',
        ],
        answer: 0,
        explain: 'Hiệp ước 1862 cắt ba tỉnh miền Đông Nam Kỳ (Gia Định, Định Tường, Biên Hòa) và đảo Côn Lôn.',
      },
      {
        q: 'Hiệp ước nào năm 1884 đánh dấu nước ta trở thành thuộc địa của Pháp?',
        options: ['Hiệp ước Giáp Tuất', 'Hiệp ước Nhâm Tuất', 'Hiệp ước Pa-tơ-nốt', 'Hiệp định Sơ bộ'],
        answer: 2,
        explain: 'Hiệp ước Pa-tơ-nốt (6/6/1884) đặt ách bảo hộ lâu dài của Pháp lên nước ta.',
      },
      {
        q: 'Ai chỉ huy nghĩa quân đốt cháy tàu Hy Vọng của Pháp trên sông Nhật Tảo?',
        options: ['Trương Định', 'Nguyễn Trung Trực', 'Nguyễn Hữu Huân', 'Võ Duy Dương'],
        answer: 1,
        explain: 'Năm 1861, Nguyễn Trung Trực chỉ huy nghĩa quân đốt tàu Hy Vọng.',
      },
    ],
  },

  {
    ...base,
    slug: 'phong-trao-dong-du-duy-tan',
    time: '1904 – 1918',
    yearLabel: '1905',
    sortYear: 1904,
    title: 'Phong trào Đông Du, Duy Tân và Đông Kinh nghĩa thục',
    shortTitle: 'Đông Du – Duy Tân',
    periodId: 'phap-thuoc',
    period: P.phapThuoc,
    summary:
      'Đầu thế kỷ XX, phong trào yêu nước theo khuynh hướng dân chủ tư sản dâng cao: Phan Bội Châu lập Duy tân hội, tổ chức phong trào Đông Du; Phan Châu Trinh khởi xướng cuộc vận động Duy Tân; Đông Kinh nghĩa thục mở trường dạy học ở Hà Nội.',
    context:
      'Phong trào Cần Vương thất bại cho thấy con đường cứu nước theo ý thức hệ phong kiến không còn phù hợp. Những tư tưởng dân chủ tư sản từ Nhật Bản, Trung Quốc, Pháp được truyền vào Việt Nam, một lớp sĩ phu yêu nước tiến bộ xuất hiện.',
    timeline: [
      {
        when: 'Năm 1904',
        text: 'Phan Bội Châu cùng các đồng chí lập Duy tân hội ở Quảng Nam, mục tiêu đánh đuổi Pháp, giành độc lập.',
      },
      {
        when: '1905 – 1908',
        text: 'Phong trào Đông Du đưa thanh niên sang Nhật Bản học tập (lúc cao nhất khoảng 200 người). Năm 1908, Nhật cấu kết với Pháp trục xuất du học sinh, phong trào tan rã.',
      },
      {
        when: '1906 – 1908',
        text: 'Phan Châu Trinh, Huỳnh Thúc Kháng, Trần Quý Cáp phát động cuộc vận động Duy Tân ở Trung Kỳ: mở trường, cổ động cắt tóc ngắn, mặc âu phục, lập hội buôn. Năm 1908, phong trào chống thuế ở Trung Kỳ bị đàn áp.',
      },
      {
        when: '3 – 12/1907',
        text: 'Đông Kinh nghĩa thục do Lương Văn Can, Nguyễn Quyền… mở ở Hà Nội, dạy học không lấy tiền, cổ động bài trừ hủ tục, chấn hưng thực nghiệp. Cuối năm 1907, Pháp đóng cửa trường.',
      },
      {
        when: 'Năm 1912',
        text: 'Phan Bội Châu lập Việt Nam Quang phục hội ở Quảng Châu (Trung Quốc), chủ trương đánh đuổi Pháp, thành lập nước Cộng hòa Dân quốc Việt Nam.',
      },
    ],
    result: 'Các phong trào lần lượt bị thực dân Pháp đàn áp và thất bại, nhưng đã khơi dậy mạnh mẽ tinh thần yêu nước, nâng cao dân trí.',
    significance:
      'Đánh dấu bước chuyển của phong trào yêu nước sang khuynh hướng dân chủ tư sản; để lại bài học về đường lối, chuẩn bị cho sự tìm tòi con đường cứu nước mới.',
    figures: [
      { name: 'Phan Bội Châu', role: 'Lập Duy tân hội, khởi xướng phong trào Đông Du' },
      { name: 'Phan Châu Trinh', role: 'Khởi xướng cuộc vận động Duy Tân, chủ trương “khai dân trí, chấn dân khí, hậu dân sinh”' },
      { name: 'Lương Văn Can', role: 'Thục trưởng Đông Kinh nghĩa thục' },
    ],
    places: [
      { name: 'Quảng Nam (nơi lập Duy tân hội)', lat: 15.57, lon: 108.47 },
      { name: 'Đông Kinh nghĩa thục (Hà Nội)', lat: 21.034, lon: 105.851 },
    ],
    facts: [
      'Tên “Đông Kinh nghĩa thục” được đặt theo mô hình trường Khánh Ứng nghĩa thục (Keio Gijuku) ở Nhật Bản.',
    ],
    quiz: [
      {
        q: 'Ai là người khởi xướng phong trào Đông Du?',
        options: ['Phan Châu Trinh', 'Phan Bội Châu', 'Lương Văn Can', 'Huỳnh Thúc Kháng'],
        answer: 1,
        explain: 'Phan Bội Châu khởi xướng phong trào Đông Du, đưa thanh niên sang Nhật học tập.',
      },
      {
        q: 'Phong trào Đông Du đưa thanh niên Việt Nam sang nước nào học tập?',
        options: ['Pháp', 'Trung Quốc', 'Nhật Bản', 'Liên Xô'],
        answer: 2,
        explain: '“Đông Du” nghĩa là sang phương Đông — sang Nhật Bản học tập.',
      },
      {
        q: 'Chủ trương “khai dân trí, chấn dân khí, hậu dân sinh” là của ai?',
        options: ['Phan Châu Trinh', 'Phan Bội Châu', 'Tôn Thất Thuyết', 'Hoàng Hoa Thám'],
        answer: 0,
        explain: 'Phan Châu Trinh chủ trương cải cách, nâng cao dân trí, dân khí, dân sinh.',
      },
      {
        q: 'Đông Kinh nghĩa thục được mở ở đâu?',
        options: ['Huế', 'Sài Gòn', 'Hà Nội', 'Quảng Nam'],
        answer: 2,
        explain: 'Đông Kinh nghĩa thục mở ở Hà Nội (Đông Kinh là tên gọi cũ của Hà Nội).',
      },
      {
        q: 'Các phong trào đầu thế kỷ XX đi theo khuynh hướng nào?',
        options: ['Phong kiến', 'Dân chủ tư sản', 'Vô sản', 'Quân chủ'],
        answer: 1,
        explain: 'Phong trào Đông Du, Duy Tân, Đông Kinh nghĩa thục theo khuynh hướng dân chủ tư sản.',
      },
    ],
  },

  {
    ...base,
    slug: 'nguyen-ai-quoc-tim-duong-cuu-nuoc',
    time: '1911 – 1929',
    yearLabel: '1911',
    sortYear: 1911,
    title: 'Nguyễn Ái Quốc tìm đường cứu nước',
    shortTitle: 'Tìm đường cứu nước',
    periodId: 'phap-thuoc',
    period: P.phapThuoc,
    summary:
      'Ngày 5/6/1911, Nguyễn Tất Thành rời bến Nhà Rồng ra đi tìm đường cứu nước. Năm 1920, Người đọc Luận cương của Lê-nin, tìm thấy con đường giải phóng dân tộc theo con đường cách mạng vô sản; năm 1925 lập Hội Việt Nam Cách mạng Thanh niên.',
    context:
      'Đầu thế kỷ XX, các phong trào yêu nước theo khuynh hướng phong kiến và dân chủ tư sản đều thất bại. Cách mạng Việt Nam rơi vào khủng hoảng về đường lối cứu nước.',
    timeline: [
      {
        when: '5/6/1911',
        text: 'Nguyễn Tất Thành rời bến cảng Nhà Rồng (Sài Gòn) trên con tàu Đô đốc La-tút-sơ Tơ-rê-vin, sang phương Tây tìm đường cứu nước.',
      },
      {
        when: '18/6/1919',
        text: 'Lấy tên Nguyễn Ái Quốc, Người gửi tới Hội nghị Véc-xai “Bản yêu sách của nhân dân An Nam”, đòi các quyền tự do, dân chủ, bình đẳng cho dân tộc Việt Nam.',
      },
      {
        when: '7/1920',
        text: 'Đọc “Sơ thảo lần thứ nhất những luận cương về vấn đề dân tộc và vấn đề thuộc địa” của Lê-nin, Người tìm thấy con đường cứu nước: con đường cách mạng vô sản.',
      },
      {
        when: '12/1920',
        text: 'Tại Đại hội Tua, Nguyễn Ái Quốc bỏ phiếu tán thành gia nhập Quốc tế Cộng sản, tham gia sáng lập Đảng Cộng sản Pháp.',
      },
      {
        when: '6/1925',
        text: 'Thành lập Hội Việt Nam Cách mạng Thanh niên ở Quảng Châu (Trung Quốc), mở lớp huấn luyện cán bộ; năm 1927 tập bài giảng được in thành sách “Đường Kách mệnh”. Năm 1929, ba tổ chức cộng sản ra đời ở Việt Nam.',
      },
    ],
    result: 'Nguyễn Ái Quốc tìm ra con đường cứu nước đúng đắn, chuẩn bị về tư tưởng, chính trị, tổ chức cho sự ra đời của Đảng Cộng sản Việt Nam.',
    significance:
      'Mở ra con đường giải phóng dân tộc gắn với cách mạng vô sản, chấm dứt thời kỳ khủng hoảng đường lối cứu nước kéo dài.',
    figures: [{ name: 'Nguyễn Ái Quốc (Nguyễn Tất Thành, Hồ Chí Minh)', role: 'Người tìm ra con đường cứu nước' }],
    places: [{ name: 'Bến Nhà Rồng (TP Hồ Chí Minh)', lat: 10.768, lon: 106.707 }],
    facts: [
      'Năm 1987, UNESCO ra nghị quyết tôn vinh Chủ tịch Hồ Chí Minh là “Anh hùng giải phóng dân tộc, Nhà văn hóa kiệt xuất của Việt Nam” nhân dịp kỷ niệm 100 năm ngày sinh của Người (1990).',
    ],
    quiz: [
      {
        q: 'Nguyễn Tất Thành ra đi tìm đường cứu nước vào ngày nào?',
        options: ['5/6/1911', '19/5/1890', '3/2/1930', '2/9/1945'],
        answer: 0,
        explain: 'Ngày 5/6/1911, Nguyễn Tất Thành rời bến Nhà Rồng ra đi tìm đường cứu nước.',
      },
      {
        q: 'Nguyễn Tất Thành ra đi tìm đường cứu nước từ bến cảng nào?',
        options: ['Cảng Hải Phòng', 'Bến Nhà Rồng', 'Cảng Đà Nẵng', 'Cảng Quy Nhơn'],
        answer: 1,
        explain: 'Người ra đi từ bến cảng Nhà Rồng, Sài Gòn.',
      },
      {
        q: 'Văn kiện nào giúp Nguyễn Ái Quốc tìm thấy con đường cứu nước (7/1920)?',
        options: [
          'Tuyên ngôn Độc lập của Mỹ',
          'Luận cương của Lê-nin về vấn đề dân tộc và thuộc địa',
          'Bản yêu sách của nhân dân An Nam',
          'Đường Kách mệnh',
        ],
        answer: 1,
        explain: 'Đọc Luận cương của Lê-nin, Người tìm thấy con đường cách mạng vô sản.',
      },
      {
        q: 'Năm 1925, Nguyễn Ái Quốc thành lập tổ chức nào?',
        options: ['Việt Nam Quang phục hội', 'Hội Việt Nam Cách mạng Thanh niên', 'Mặt trận Việt Minh', 'Duy tân hội'],
        answer: 1,
        explain: 'Tháng 6/1925, Người lập Hội Việt Nam Cách mạng Thanh niên ở Quảng Châu.',
      },
      {
        q: 'Bản yêu sách của nhân dân An Nam được gửi tới hội nghị nào?',
        options: ['Hội nghị Véc-xai', 'Hội nghị Giơ-ne-vơ', 'Hội nghị Pa-ri 1973', 'Đại hội Tua'],
        answer: 0,
        explain: 'Năm 1919, Nguyễn Ái Quốc gửi bản yêu sách tới Hội nghị Véc-xai.',
      },
    ],
  },

  {
    ...base,
    slug: 'thanh-lap-dang-cong-san',
    time: 'Ngày 3/2/1930',
    yearLabel: '1930',
    sortYear: 1930,
    title: 'Thành lập Đảng Cộng sản Việt Nam',
    shortTitle: 'Thành lập Đảng',
    periodId: 'phap-thuoc',
    period: P.phapThuoc,
    summary:
      'Đầu năm 1930, tại Cửu Long (Hương Cảng, Trung Quốc), Nguyễn Ái Quốc chủ trì Hội nghị hợp nhất các tổ chức cộng sản thành Đảng Cộng sản Việt Nam, thông qua Cương lĩnh chính trị đầu tiên. Ngày 3/2 được lấy làm ngày thành lập Đảng.',
    context:
      'Năm 1929, ở Việt Nam xuất hiện ba tổ chức cộng sản hoạt động riêng rẽ, tranh giành ảnh hưởng của nhau. Yêu cầu cấp thiết là phải thống nhất thành một đảng duy nhất.',
    timeline: [
      {
        when: 'Năm 1929',
        text: 'Ba tổ chức cộng sản ra đời: Đông Dương Cộng sản đảng (6/1929), An Nam Cộng sản đảng (8/1929), Đông Dương Cộng sản liên đoàn (9/1929).',
      },
      {
        when: 'Đầu năm 1930',
        text: 'Với tư cách phái viên của Quốc tế Cộng sản, Nguyễn Ái Quốc triệu tập Hội nghị hợp nhất tại Cửu Long (Hương Cảng, Trung Quốc).',
      },
      {
        when: '3/2/1930',
        text: 'Hội nghị nhất trí hợp nhất các tổ chức cộng sản thành Đảng Cộng sản Việt Nam; thông qua Chánh cương vắn tắt, Sách lược vắn tắt — Cương lĩnh chính trị đầu tiên của Đảng.',
      },
      {
        when: 'Nội dung Cương lĩnh',
        text: 'Xác định cách mạng Việt Nam trải qua hai giai đoạn, nhiệm vụ là đánh đổ đế quốc Pháp và phong kiến, làm cho nước Việt Nam hoàn toàn độc lập.',
      },
      {
        when: '10/1930',
        text: 'Hội nghị Ban Chấp hành Trung ương lần thứ nhất đổi tên thành Đảng Cộng sản Đông Dương, thông qua Luận cương chính trị; Trần Phú được bầu làm Tổng Bí thư đầu tiên.',
      },
    ],
    result: 'Đảng Cộng sản Việt Nam ra đời, chấm dứt thời kỳ khủng hoảng về đường lối và tổ chức lãnh đạo cách mạng.',
    significance:
      'Là bước ngoặt vĩ đại của cách mạng Việt Nam; sự chuẩn bị tất yếu cho những thắng lợi về sau, trước hết là Cách mạng tháng Tám năm 1945.',
    figures: [
      { name: 'Nguyễn Ái Quốc', role: 'Người sáng lập và chủ trì Hội nghị thành lập Đảng' },
      { name: 'Trần Phú', role: 'Tổng Bí thư đầu tiên của Đảng (10/1930)' },
    ],
    places: [{ name: 'Cửu Long (Hương Cảng, Trung Quốc)', lat: 22.32, lon: 114.17 }],
    facts: [
      'Đại hội lần thứ III của Đảng (1960) quyết định lấy ngày 3/2 hằng năm làm ngày kỷ niệm thành lập Đảng.',
    ],
    quiz: [
      {
        q: 'Ngày nào được lấy làm ngày thành lập Đảng Cộng sản Việt Nam?',
        options: ['5/6/1911', '3/2/1930', '19/8/1945', '2/9/1945'],
        answer: 1,
        explain: 'Ngày 3/2/1930 được lấy làm ngày thành lập Đảng.',
      },
      {
        q: 'Hội nghị thành lập Đảng diễn ra ở đâu?',
        options: ['Pác Bó (Cao Bằng)', 'Cửu Long (Hương Cảng, Trung Quốc)', 'Tân Trào (Tuyên Quang)', 'Pa-ri (Pháp)'],
        answer: 1,
        explain: 'Hội nghị hợp nhất diễn ra tại Cửu Long, Hương Cảng (Trung Quốc).',
      },
      {
        q: 'Ai chủ trì Hội nghị thành lập Đảng?',
        options: ['Trần Phú', 'Lê Hồng Phong', 'Nguyễn Ái Quốc', 'Nguyễn Văn Cừ'],
        answer: 2,
        explain: 'Nguyễn Ái Quốc chủ trì Hội nghị hợp nhất các tổ chức cộng sản.',
      },
      {
        q: 'Năm 1929, ở Việt Nam có bao nhiêu tổ chức cộng sản ra đời?',
        options: ['Một', 'Hai', 'Ba', 'Bốn'],
        answer: 2,
        explain: 'Năm 1929 có ba tổ chức cộng sản ra đời, hoạt động riêng rẽ.',
      },
      {
        q: 'Tổng Bí thư đầu tiên của Đảng là ai?',
        options: ['Trần Phú', 'Hà Huy Tập', 'Lê Duẩn', 'Trường Chinh'],
        answer: 0,
        explain: 'Tháng 10/1930, Trần Phú được bầu làm Tổng Bí thư đầu tiên.',
      },
    ],
  },

  {
    ...base,
    slug: 'phong-trao-1930-1939',
    time: '1930 – 1939',
    yearLabel: '1931',
    sortYear: 1930.5,
    title: 'Phong trào cách mạng 1930 – 1931 và 1936 – 1939',
    shortTitle: 'Phong trào 1930 – 1939',
    periodId: 'phap-thuoc',
    period: P.phapThuoc,
    summary:
      'Phong trào cách mạng 1930 – 1931 với đỉnh cao Xô viết Nghệ – Tĩnh và phong trào dân chủ 1936 – 1939 là hai cuộc tập dượt lớn, chuẩn bị lực lượng cho Cách mạng tháng Tám năm 1945.',
    context:
      'Cuộc khủng hoảng kinh tế thế giới (1929 – 1933) làm đời sống nhân dân Đông Dương vô cùng cực khổ, trong khi thực dân Pháp tăng cường khủng bố. Đảng Cộng sản vừa ra đời đã kịp thời lãnh đạo quần chúng đấu tranh.',
    timeline: [
      {
        when: '1/5/1930',
        text: 'Nhân ngày Quốc tế Lao động, phong trào đấu tranh của công nhân, nông dân bùng nổ trên khắp cả nước.',
      },
      {
        when: '12/9/1930',
        text: 'Khoảng 8.000 nông dân Hưng Nguyên (Nghệ An) biểu tình bị Pháp cho máy bay ném bom. Phong trào càng dâng cao; ở nhiều nơi thuộc Nghệ An, Hà Tĩnh, chính quyền Xô viết ra đời.',
      },
      {
        when: '1931',
        text: 'Thực dân Pháp khủng bố trắng, phong trào tạm lắng; nhiều đảng viên bị bắt, Tổng Bí thư Trần Phú hy sinh (6/9/1931).',
      },
      {
        when: '1936 – 1939',
        text: 'Nhân tình hình thế giới thay đổi, Đảng lập Mặt trận Dân chủ Đông Dương, phát động phong trào đòi tự do, dân sinh, dân chủ, cơm áo, hòa bình: phong trào Đông Dương đại hội, mít tinh ngày 1/5/1938 ở Hà Nội, báo chí công khai.',
      },
      {
        when: '9/1939',
        text: 'Chiến tranh thế giới thứ hai bùng nổ, Pháp đàn áp cách mạng; phong trào dân chủ chấm dứt, Đảng chuyển hướng chỉ đạo.',
      },
    ],
    result: 'Đảng được tôi luyện, đội ngũ cán bộ trưởng thành, khối liên minh công – nông được hình thành và một lực lượng chính trị quần chúng đông đảo được xây dựng.',
    significance:
      'Là hai cuộc “tổng diễn tập” đầu tiên của nhân dân Việt Nam dưới sự lãnh đạo của Đảng, chuẩn bị cho thắng lợi của Cách mạng tháng Tám.',
    figures: [
      { name: 'Trần Phú', role: 'Tổng Bí thư, hy sinh năm 1931' },
      { name: 'Nguyễn Văn Cừ', role: 'Tổng Bí thư thời kỳ 1938 – 1940' },
    ],
    places: [{ name: 'Hưng Nguyên (Nghệ An)', lat: 18.67, lon: 105.63 }],
    facts: [
      'Trước khi hy sinh, Tổng Bí thư Trần Phú nhắn lại: “Hãy giữ vững chí khí chiến đấu!”.',
      'Ngày 12/9 hằng năm là Ngày truyền thống Xô viết Nghệ – Tĩnh.',
    ],
    quiz: [
      {
        q: 'Đỉnh cao của phong trào cách mạng 1930 – 1931 là gì?',
        options: ['Khởi nghĩa Bắc Sơn', 'Xô viết Nghệ – Tĩnh', 'Khởi nghĩa Nam Kỳ', 'Đông Dương đại hội'],
        answer: 1,
        explain: 'Xô viết Nghệ – Tĩnh là đỉnh cao của phong trào 1930 – 1931.',
      },
      {
        q: 'Cuộc biểu tình của nông dân Hưng Nguyên (Nghệ An) diễn ra ngày nào?',
        options: ['1/5/1930', '12/9/1930', '3/2/1930', '19/8/1945'],
        answer: 1,
        explain: 'Ngày 12/9/1930, nông dân Hưng Nguyên biểu tình và bị Pháp ném bom.',
      },
      {
        q: 'Trong những năm 1936 – 1939, Đảng thành lập mặt trận nào?',
        options: ['Mặt trận Việt Minh', 'Mặt trận Dân chủ Đông Dương', 'Mặt trận Liên Việt', 'Mặt trận Tổ quốc'],
        answer: 1,
        explain: 'Năm 1938, Đảng lập Mặt trận Dân chủ Đông Dương.',
      },
      {
        q: 'Mục tiêu đấu tranh của phong trào 1936 – 1939 là gì?',
        options: [
          'Đòi tự do, dân sinh, dân chủ, cơm áo, hòa bình',
          'Đánh đổ ngay chính quyền thực dân',
          'Thành lập nước Việt Nam Dân chủ Cộng hòa',
          'Đuổi quân Nhật',
        ],
        answer: 0,
        explain: 'Phong trào 1936 – 1939 đòi tự do, dân sinh, dân chủ, cơm áo và hòa bình.',
      },
      {
        q: 'Ý nghĩa chung của hai phong trào 1930 – 1931 và 1936 – 1939 là gì?',
        options: [
          'Là các cuộc tập dượt chuẩn bị cho Cách mạng tháng Tám',
          'Giành chính quyền trên cả nước',
          'Đánh bại thực dân Pháp',
          'Thống nhất đất nước',
        ],
        answer: 0,
        explain: 'Hai phong trào là những cuộc tập dượt chuẩn bị cho Cách mạng tháng Tám năm 1945.',
      },
    ],
  },
  // ═════════════════════════════════════════════ HIỆN ĐẠI
  {
    ...base,
    slug: 'bao-ve-chinh-quyen-1945-1946',
    time: '9/1945 – 12/1946',
    yearLabel: '1945–46',
    sortYear: 1945.9,
    title: 'Xây dựng và bảo vệ chính quyền cách mạng (1945 – 1946)',
    shortTitle: 'Bảo vệ chính quyền',
    periodId: 'hien-dai',
    period: P.hienDai,
    summary:
      'Sau Cách mạng tháng Tám, nước Việt Nam Dân chủ Cộng hòa đứng trước tình thế “ngàn cân treo sợi tóc”. Đảng và Chủ tịch Hồ Chí Minh lãnh đạo nhân dân diệt giặc đói, giặc dốt, tổ chức Tổng tuyển cử, ký Hiệp định Sơ bộ và Tạm ước để có thời gian chuẩn bị kháng chiến.',
    context:
      'Chính quyền cách mạng non trẻ gặp muôn vàn khó khăn: nạn đói, hơn 90% dân số mù chữ, ngân sách trống rỗng. Ở miền Bắc, 20 vạn quân Trung Hoa Dân quốc kéo vào; ở miền Nam, quân Anh vào giải giáp quân Nhật, giúp Pháp quay lại xâm lược.',
    timeline: [
      {
        when: '23/9/1945',
        text: 'Thực dân Pháp nổ súng đánh chiếm Sài Gòn; nhân dân Nam Bộ đứng lên kháng chiến.',
      },
      {
        when: '1945 – 1946',
        text: 'Phát động phong trào “Tuần lễ vàng”, “Hũ gạo cứu đói”, tăng gia sản xuất; thành lập Nha Bình dân học vụ, mở phong trào xóa nạn mù chữ.',
      },
      {
        when: '6/1/1946',
        text: 'Tổng tuyển cử bầu Quốc hội khóa I trong cả nước. Ngày 9/11/1946, Quốc hội thông qua bản Hiến pháp đầu tiên.',
      },
      {
        when: '6/3/1946',
        text: 'Ký Hiệp định Sơ bộ với Pháp — “hòa để tiến”, tránh cùng lúc đối đầu với nhiều kẻ thù, đẩy quân Trung Hoa Dân quốc về nước. Ngày 14/9/1946 ký tiếp bản Tạm ước.',
      },
      {
        when: '19/12/1946',
        text: 'Thực dân Pháp bội ước, ngày càng lấn tới. Chủ tịch Hồ Chí Minh ra Lời kêu gọi toàn quốc kháng chiến.',
      },
    ],
    result: 'Chính quyền cách mạng được giữ vững và củng cố; đất nước có thêm thời gian chuẩn bị lực lượng cho cuộc kháng chiến lâu dài.',
    significance:
      'Thể hiện sự sáng suốt, mềm dẻo trong đường lối của Đảng và Chủ tịch Hồ Chí Minh; để lại bài học về lợi dụng mâu thuẫn trong hàng ngũ kẻ thù.',
    figures: [
      { name: 'Hồ Chí Minh', role: 'Chủ tịch nước Việt Nam Dân chủ Cộng hòa' },
      { name: 'Huỳnh Thúc Kháng', role: 'Quyền Chủ tịch nước khi Chủ tịch Hồ Chí Minh sang Pháp (1946)' },
    ],
    places: [{ name: 'Nhà hát Lớn Hà Nội (nơi Quốc hội khóa I họp phiên đầu tiên)', lat: 21.024, lon: 105.858 }],
    facts: [
      'Trong cuộc Tổng tuyển cử ngày 6/1/1946, khoảng 89% cử tri trong cả nước đã đi bầu.',
    ],
    quiz: [
      {
        q: 'Sau Cách mạng tháng Tám, tình thế đất nước được ví như thế nào?',
        options: ['“Ngàn cân treo sợi tóc”', '“Rồng cuộn hổ ngồi”', '“Nước sôi lửa bỏng” của kẻ thù', '“Thái bình thịnh trị”'],
        answer: 0,
        explain: 'Đất nước đứng trước tình thế “ngàn cân treo sợi tóc” với giặc đói, giặc dốt và giặc ngoại xâm.',
      },
      {
        q: 'Cuộc Tổng tuyển cử bầu Quốc hội khóa I diễn ra ngày nào?',
        options: ['2/9/1945', '6/1/1946', '6/3/1946', '19/12/1946'],
        answer: 1,
        explain: 'Ngày 6/1/1946, cả nước tiến hành Tổng tuyển cử bầu Quốc hội khóa I.',
      },
      {
        q: 'Ngày 6/3/1946, Chính phủ ta ký văn bản nào với Pháp?',
        options: ['Tạm ước', 'Hiệp định Sơ bộ', 'Hiệp định Giơ-ne-vơ', 'Hiệp định Pa-ri'],
        answer: 1,
        explain: 'Ngày 6/3/1946, ta ký Hiệp định Sơ bộ với Pháp.',
      },
      {
        q: 'Phong trào nào góp phần giải quyết nạn đói sau Cách mạng tháng Tám?',
        options: ['Bình dân học vụ', '“Hũ gạo cứu đói”, tăng gia sản xuất', 'Đông Du', 'Đồng khởi'],
        answer: 1,
        explain: 'Phong trào “Hũ gạo cứu đói”, tăng gia sản xuất giúp đẩy lùi nạn đói.',
      },
      {
        q: 'Ngày 19/12/1946 gắn với sự kiện nào?',
        options: [
          'Tổng tuyển cử',
          'Chủ tịch Hồ Chí Minh ra Lời kêu gọi toàn quốc kháng chiến',
          'Ký Hiệp định Sơ bộ',
          'Quốc hội thông qua Hiến pháp',
        ],
        answer: 1,
        explain: 'Ngày 19/12/1946, Chủ tịch Hồ Chí Minh ra Lời kêu gọi toàn quốc kháng chiến.',
      },
    ],
  },

  {
    ...base,
    slug: 'thong-nhat-dat-nuoc-1976',
    time: '1975 – 1976',
    yearLabel: '1976',
    sortYear: 1976,
    title: 'Thống nhất đất nước về mặt nhà nước',
    shortTitle: 'Thống nhất 1976',
    periodId: 'hien-dai',
    period: P.hienDai,
    summary:
      'Sau đại thắng mùa Xuân 1975, cuộc Tổng tuyển cử ngày 25/4/1976 bầu Quốc hội chung của cả nước. Ngày 2/7/1976, Quốc hội quyết định đặt tên nước là Cộng hòa xã hội chủ nghĩa Việt Nam.',
    context:
      'Đất nước đã thống nhất về lãnh thổ, nhưng ở mỗi miền vẫn tồn tại một hình thức tổ chức nhà nước khác nhau. Nguyện vọng của nhân dân cả nước là sớm có một nhà nước chung.',
    timeline: [
      {
        when: '9/1975',
        text: 'Hội nghị lần thứ 24 Ban Chấp hành Trung ương Đảng đề ra nhiệm vụ hoàn thành thống nhất đất nước về mặt nhà nước.',
      },
      {
        when: '11/1975',
        text: 'Hội nghị Hiệp thương chính trị thống nhất đất nước giữa đại biểu hai miền họp tại Sài Gòn.',
      },
      {
        when: '25/4/1976',
        text: 'Tổng tuyển cử bầu Quốc hội chung trong cả nước với hơn 23 triệu cử tri tham gia (98,8%).',
      },
      {
        when: '24/6 – 3/7/1976',
        text: 'Quốc hội khóa VI họp kỳ thứ nhất. Ngày 2/7/1976, Quốc hội quyết định tên nước là Cộng hòa xã hội chủ nghĩa Việt Nam; Thủ đô là Hà Nội; đổi tên Sài Gòn – Gia Định thành Thành phố Hồ Chí Minh.',
      },
      {
        when: '20/9/1977',
        text: 'Việt Nam trở thành thành viên chính thức của Liên hợp quốc.',
      },
    ],
    result: 'Hoàn thành thống nhất đất nước về mặt nhà nước; cả nước có chung một Quốc hội, một Chính phủ.',
    significance:
      'Tạo điều kiện chính trị cơ bản để phát huy sức mạnh toàn diện của đất nước, xây dựng và bảo vệ Tổ quốc, mở rộng quan hệ quốc tế.',
    figures: [
      { name: 'Tôn Đức Thắng', role: 'Chủ tịch nước Cộng hòa xã hội chủ nghĩa Việt Nam' },
      { name: 'Phạm Văn Đồng', role: 'Thủ tướng Chính phủ' },
    ],
    places: [{ name: 'Hội trường Ba Đình (Hà Nội)', lat: 21.037, lon: 105.836 }],
    facts: ['Ngày 20/9/1977, Việt Nam trở thành thành viên thứ 149 của Liên hợp quốc.'],
    quiz: [
      {
        q: 'Tổng tuyển cử bầu Quốc hội chung của cả nước diễn ra ngày nào?',
        options: ['30/4/1975', '25/4/1976', '2/7/1976', '6/1/1946'],
        answer: 1,
        explain: 'Ngày 25/4/1976, cả nước tổng tuyển cử bầu Quốc hội chung.',
      },
      {
        q: 'Ngày 2/7/1976, Quốc hội quyết định đặt tên nước là gì?',
        options: [
          'Việt Nam Dân chủ Cộng hòa',
          'Cộng hòa xã hội chủ nghĩa Việt Nam',
          'Đại Nam',
          'Việt Nam Cộng hòa',
        ],
        answer: 1,
        explain: 'Quốc hội quyết định tên nước là Cộng hòa xã hội chủ nghĩa Việt Nam.',
      },
      {
        q: 'Năm 1976, thành phố Sài Gòn – Gia Định được đổi tên thành gì?',
        options: ['Thành phố Hồ Chí Minh', 'Thành phố Gia Định', 'Thành phố Sài Gòn', 'Thành phố Thống Nhất'],
        answer: 0,
        explain: 'Quốc hội quyết định đổi tên Sài Gòn – Gia Định thành Thành phố Hồ Chí Minh.',
      },
      {
        q: 'Việt Nam trở thành thành viên Liên hợp quốc vào năm nào?',
        options: ['1975', '1976', '1977', '1995'],
        answer: 2,
        explain: 'Ngày 20/9/1977, Việt Nam trở thành thành viên Liên hợp quốc.',
      },
      {
        q: 'Ý nghĩa của việc thống nhất đất nước về mặt nhà nước là gì?',
        options: [
          'Chấm dứt chiến tranh với Pháp',
          'Tạo điều kiện chính trị để xây dựng, bảo vệ Tổ quốc và mở rộng quan hệ quốc tế',
          'Mở đầu công cuộc Đổi mới',
          'Giúp Việt Nam gia nhập WTO',
        ],
        answer: 1,
        explain: 'Thống nhất về mặt nhà nước tạo điều kiện chính trị cơ bản để phát triển đất nước.',
      },
    ],
  },

  {
    ...base,
    slug: 'cong-cuoc-doi-moi-1986',
    time: 'Tháng 12/1986',
    yearLabel: '1986',
    sortYear: 1986,
    title: 'Đại hội VI và công cuộc Đổi mới',
    shortTitle: 'Đổi mới 1986',
    periodId: 'hien-dai',
    period: P.hienDai,
    summary:
      'Đại hội đại biểu toàn quốc lần thứ VI của Đảng (15 – 18/12/1986) đề ra đường lối Đổi mới toàn diện: xóa bỏ cơ chế tập trung quan liêu, bao cấp, phát triển kinh tế hàng hóa nhiều thành phần theo định hướng xã hội chủ nghĩa.',
    context:
      'Cuối những năm 1970 – giữa những năm 1980, đất nước lâm vào khủng hoảng kinh tế – xã hội nghiêm trọng: sản xuất trì trệ, lương thực thiếu, lạm phát lên tới hàng trăm phần trăm, đời sống nhân dân khó khăn.',
    timeline: [
      {
        when: 'Năm 1981',
        text: 'Chỉ thị 100 về khoán sản phẩm đến nhóm và người lao động trong nông nghiệp (“khoán 100”) — bước tìm tòi đổi mới đầu tiên.',
      },
      {
        when: '15 – 18/12/1986',
        text: 'Đại hội VI của Đảng họp ở Hà Nội với tinh thần “nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật”, đề ra đường lối Đổi mới toàn diện; Nguyễn Văn Linh được bầu làm Tổng Bí thư.',
      },
      {
        when: 'Nội dung',
        text: 'Đổi mới kinh tế là trọng tâm: xóa bỏ cơ chế bao cấp, phát triển kinh tế nhiều thành phần, vận hành theo cơ chế thị trường có sự quản lý của Nhà nước; mở rộng quan hệ đối ngoại.',
      },
      {
        when: '4/1988',
        text: 'Nghị quyết 10 của Bộ Chính trị (“khoán 10”) giao ruộng đất lâu dài cho hộ nông dân, tạo động lực lớn cho sản xuất nông nghiệp.',
      },
      {
        when: 'Năm 1989',
        text: 'Từ chỗ thiếu lương thực, Việt Nam đã xuất khẩu được khoảng 1,4 triệu tấn gạo.',
      },
    ],
    result: 'Đất nước từng bước ra khỏi khủng hoảng kinh tế – xã hội; đời sống nhân dân được cải thiện rõ rệt.',
    significance:
      'Đại hội VI là mốc mở đầu công cuộc Đổi mới — bước ngoặt có ý nghĩa lịch sử, đưa Việt Nam vào thời kỳ phát triển và hội nhập.',
    figures: [
      { name: 'Nguyễn Văn Linh', role: 'Tổng Bí thư được bầu tại Đại hội VI' },
      { name: 'Trường Chinh', role: 'Tổng Bí thư trước Đại hội VI, người có công khởi xướng đổi mới tư duy' },
    ],
    places: [{ name: 'Hà Nội (nơi họp Đại hội VI)', lat: 21.03, lon: 105.85 }],
    facts: [
      'Năm 1986, lạm phát ở Việt Nam lên tới khoảng 774% — mức cao kỷ lục.',
    ],
    quiz: [
      {
        q: 'Công cuộc Đổi mới được khởi xướng tại Đại hội Đảng lần thứ mấy?',
        options: ['Đại hội IV', 'Đại hội V', 'Đại hội VI', 'Đại hội VII'],
        answer: 2,
        explain: 'Đại hội VI (12/1986) đề ra đường lối Đổi mới toàn diện.',
      },
      {
        q: 'Đại hội VI của Đảng diễn ra vào thời gian nào?',
        options: ['Tháng 12/1976', 'Tháng 12/1986', 'Tháng 6/1991', 'Tháng 6/1996'],
        answer: 1,
        explain: 'Đại hội VI họp từ 15 đến 18/12/1986.',
      },
      {
        q: 'Lĩnh vực trọng tâm của công cuộc Đổi mới là gì?',
        options: ['Quân sự', 'Kinh tế', 'Văn hóa', 'Ngoại giao'],
        answer: 1,
        explain: 'Đổi mới kinh tế là trọng tâm, xóa bỏ cơ chế bao cấp.',
      },
      {
        q: 'Nghị quyết 10 (“khoán 10”) năm 1988 có nội dung chính gì?',
        options: [
          'Giao ruộng đất lâu dài cho hộ nông dân',
          'Quốc hữu hóa toàn bộ ruộng đất',
          'Thành lập hợp tác xã cấp cao',
          'Cấm buôn bán lúa gạo',
        ],
        answer: 0,
        explain: 'Khoán 10 giao ruộng đất lâu dài cho hộ nông dân, tạo động lực sản xuất.',
      },
      {
        q: 'Ai được bầu làm Tổng Bí thư tại Đại hội VI?',
        options: ['Lê Duẩn', 'Trường Chinh', 'Nguyễn Văn Linh', 'Đỗ Mười'],
        answer: 2,
        explain: 'Nguyễn Văn Linh được bầu làm Tổng Bí thư tại Đại hội VI.',
      },
    ],
  },

  {
    ...base,
    slug: 'gia-nhap-asean-1995',
    time: '1991 – 1995',
    yearLabel: '1995',
    sortYear: 1995,
    title: 'Bình thường hóa quan hệ và gia nhập ASEAN',
    shortTitle: 'Gia nhập ASEAN',
    periodId: 'hien-dai',
    period: P.hienDai,
    summary:
      'Với đường lối đối ngoại “Việt Nam muốn là bạn với tất cả các nước”, Việt Nam bình thường hóa quan hệ với Trung Quốc (11/1991), Hoa Kỳ (11/7/1995) và trở thành thành viên thứ 7 của ASEAN (28/7/1995).',
    context:
      'Đầu những năm 1990, tình hình thế giới thay đổi sâu sắc; Việt Nam bị bao vây, cấm vận. Mở rộng quan hệ đối ngoại, phá thế bao vây là yêu cầu cấp thiết của công cuộc Đổi mới.',
    timeline: [
      {
        when: '6/1991',
        text: 'Đại hội VII của Đảng thông qua Cương lĩnh xây dựng đất nước, đề ra chủ trương: “Việt Nam muốn là bạn với tất cả các nước trong cộng đồng thế giới”.',
      },
      {
        when: '11/1991',
        text: 'Việt Nam và Trung Quốc bình thường hóa quan hệ.',
      },
      {
        when: '1993 – 1994',
        text: 'Việt Nam khôi phục quan hệ với các tổ chức tài chính quốc tế (IMF, WB); tháng 2/1994, Hoa Kỳ bãi bỏ lệnh cấm vận đối với Việt Nam.',
      },
      {
        when: '11/7/1995',
        text: 'Việt Nam và Hoa Kỳ chính thức bình thường hóa quan hệ ngoại giao.',
      },
      {
        when: '28/7/1995',
        text: 'Tại Bru-nây, Việt Nam chính thức trở thành thành viên thứ 7 của Hiệp hội các quốc gia Đông Nam Á (ASEAN).',
      },
    ],
    result: 'Việt Nam phá thế bị bao vây, cấm vận, mở rộng quan hệ với các nước và các tổ chức quốc tế.',
    significance:
      'Mở ra thời kỳ hội nhập khu vực và quốc tế; nâng cao vị thế của Việt Nam, tạo môi trường hòa bình để phát triển đất nước.',
    figures: [{ name: 'Nguyễn Mạnh Cầm', role: 'Bộ trưởng Bộ Ngoại giao, ký văn kiện gia nhập ASEAN' }],
    places: [{ name: 'Hà Nội', lat: 21.03, lon: 105.85 }],
    facts: ['Việt Nam là thành viên thứ 7 của ASEAN; đến năm 1999, khi Cam-pu-chia gia nhập, ASEAN có đủ 10 nước Đông Nam Á.'],
    quiz: [
      {
        q: 'Việt Nam gia nhập ASEAN vào ngày nào?',
        options: ['11/7/1995', '28/7/1995', '11/1/2007', '2/7/1976'],
        answer: 1,
        explain: 'Ngày 28/7/1995, Việt Nam trở thành thành viên của ASEAN.',
      },
      {
        q: 'Việt Nam là thành viên thứ mấy của ASEAN?',
        options: ['Thứ 5', 'Thứ 6', 'Thứ 7', 'Thứ 10'],
        answer: 2,
        explain: 'Việt Nam là thành viên thứ 7 của ASEAN.',
      },
      {
        q: 'Việt Nam bình thường hóa quan hệ ngoại giao với Hoa Kỳ vào năm nào?',
        options: ['1991', '1994', '1995', '2000'],
        answer: 2,
        explain: 'Ngày 11/7/1995, Việt Nam – Hoa Kỳ bình thường hóa quan hệ ngoại giao.',
      },
      {
        q: 'Chủ trương đối ngoại nổi bật của Đại hội VII (1991) là gì?',
        options: [
          '“Việt Nam muốn là bạn với tất cả các nước”',
          '“Bế quan tỏa cảng”',
          'Chỉ quan hệ với các nước xã hội chủ nghĩa',
          'Đóng cửa với phương Tây',
        ],
        answer: 0,
        explain: 'Đại hội VII chủ trương “Việt Nam muốn là bạn với tất cả các nước trong cộng đồng thế giới”.',
      },
      {
        q: 'Năm 1991, Việt Nam bình thường hóa quan hệ với nước nào?',
        options: ['Hoa Kỳ', 'Trung Quốc', 'Nhật Bản', 'Pháp'],
        answer: 1,
        explain: 'Tháng 11/1991, Việt Nam và Trung Quốc bình thường hóa quan hệ.',
      },
    ],
  },

  {
    ...base,
    slug: 'hoi-nhap-quoc-te',
    time: '1996 – nay',
    yearLabel: '2007',
    sortYear: 1996,
    title: 'Công nghiệp hóa, hiện đại hóa và hội nhập quốc tế',
    shortTitle: 'Hội nhập quốc tế',
    periodId: 'hien-dai',
    period: P.hienDai,
    summary:
      'Từ năm 1996, Việt Nam đẩy mạnh công nghiệp hóa, hiện đại hóa và hội nhập quốc tế sâu rộng: gia nhập APEC (1998), Tổ chức Thương mại Thế giới WTO (2007), thông qua Hiến pháp 2013 và cùng các nước xây dựng Cộng đồng ASEAN (2015).',
    context:
      'Sau mười năm Đổi mới, đất nước đã ra khỏi khủng hoảng kinh tế – xã hội. Nhiệm vụ mới là đẩy mạnh công nghiệp hóa, hiện đại hóa, chủ động hội nhập để phát triển nhanh và bền vững.',
    timeline: [
      {
        when: '6/1996',
        text: 'Đại hội VIII của Đảng đề ra chủ trương đẩy mạnh công nghiệp hóa, hiện đại hóa đất nước.',
      },
      {
        when: '11/1998',
        text: 'Việt Nam trở thành thành viên Diễn đàn Hợp tác Kinh tế châu Á – Thái Bình Dương (APEC).',
      },
      {
        when: '11/1/2007',
        text: 'Việt Nam chính thức trở thành thành viên thứ 150 của Tổ chức Thương mại Thế giới (WTO).',
      },
      {
        when: '28/11/2013',
        text: 'Quốc hội thông qua Hiến pháp năm 2013.',
      },
      {
        when: '31/12/2015',
        text: 'Cộng đồng ASEAN chính thức được thành lập, Việt Nam là thành viên tích cực, chủ động.',
      },
    ],
    result: 'Kinh tế tăng trưởng, đời sống nhân dân nâng cao; Việt Nam có quan hệ ngoại giao với hầu hết các nước trên thế giới.',
    significance:
      'Vị thế và uy tín của Việt Nam trên trường quốc tế ngày càng được nâng cao; đất nước bước vào thời kỳ phát triển mới.',
    figures: [{ name: 'Nhân dân Việt Nam', role: 'Chủ thể của công cuộc xây dựng và hội nhập' }],
    places: [{ name: 'Thành phố Hồ Chí Minh', lat: 10.78, lon: 106.7 }],
    facts: [
      'Việt Nam đã hai lần đăng cai Tuần lễ Cấp cao APEC: năm 2006 ở Hà Nội và năm 2017 ở Đà Nẵng.',
    ],
    quiz: [
      {
        q: 'Việt Nam trở thành thành viên của WTO vào ngày nào?',
        options: ['28/7/1995', '11/1/2007', '28/11/2013', '31/12/2015'],
        answer: 1,
        explain: 'Ngày 11/1/2007, Việt Nam trở thành thành viên thứ 150 của WTO.',
      },
      {
        q: 'Việt Nam là thành viên thứ bao nhiêu của WTO?',
        options: ['Thứ 7', 'Thứ 100', 'Thứ 149', 'Thứ 150'],
        answer: 3,
        explain: 'Việt Nam là thành viên thứ 150 của Tổ chức Thương mại Thế giới.',
      },
      {
        q: 'Việt Nam gia nhập Diễn đàn APEC năm nào?',
        options: ['1995', '1998', '2006', '2017'],
        answer: 1,
        explain: 'Tháng 11/1998, Việt Nam trở thành thành viên APEC.',
      },
      {
        q: 'Hiến pháp hiện hành của Việt Nam được Quốc hội thông qua năm nào?',
        options: ['1946', '1980', '1992', '2013'],
        answer: 3,
        explain: 'Ngày 28/11/2013, Quốc hội thông qua Hiến pháp năm 2013.',
      },
      {
        q: 'Đại hội nào của Đảng chủ trương đẩy mạnh công nghiệp hóa, hiện đại hóa (1996)?',
        options: ['Đại hội VI', 'Đại hội VII', 'Đại hội VIII', 'Đại hội IX'],
        answer: 2,
        explain: 'Đại hội VIII (6/1996) đề ra chủ trương đẩy mạnh công nghiệp hóa, hiện đại hóa.',
      },
    ],
  },
];

export const MORE_EVENTS = EVENTS_RAW.map((e) => ({
  ...e,
  quiz: e.quiz.map((q, i) => arrange(q, `${e.slug}#${i}`)),
}));
