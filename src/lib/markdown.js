/**
 * Chuyển một ít Markdown (in đậm, in nghiêng, danh sách, tiêu đề nhỏ, bảng, trích dẫn) sang HTML.
 * Toàn bộ văn bản được thoát ký tự HTML TRƯỚC khi định dạng, nên không thể chèn mã độc.
 */
const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Chỉ tạo liên kết tới trang bên trong website (/su-kien/..., /mo-phong/...); liên kết ra ngoài giữ nguyên chữ.
const INTERNAL = '(\\/(?:su-kien|mo-phong|ban-do|hoc-tap|muc-luc)(?:\\/[a-z0-9-]+)?)';
const link = (s) =>
  s
    .replace(new RegExp(`\\[([^\\]]+)\\]\\(${INTERNAL}\\)`, 'g'), '<a href="$2">$1</a>')
    .replace(/\[([^\]]+)\]\((?:https?:)?[^)\s]*\)/g, '$1')
    .replace(new RegExp(`(^|[\\s(:])${INTERNAL}(?=[\\s).,;!?]|$)`, 'g'), '$1<a href="$2">$2</a>');

const inline = (s) =>
  link(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');

// Ô bảng: cho phép xuống dòng bằng <br> (đã bị thoát thành &lt;br&gt;)
const cell = (s) => inline(s.trim()).replace(/&lt;br\s*\/?&gt;/gi, '<br>');
const splitRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');

export function renderMarkdown(text) {
  const lines = escape(text || '').split(/\r?\n/);
  const out = [];
  let list = null;
  let para = [];
  let table = null;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join('<br>'))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      out.push(`<${list.type}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.type}>`);
      list = null;
    }
  };
  const flushTable = () => {
    if (table) {
      const [head, ...body] = table;
      const row = (cells, tag) => `<tr>${cells.map((c) => `<${tag}>${cell(c)}</${tag}>`).join('')}</tr>`;
      out.push(
        `<div class="chat-table"><table><thead>${row(head, 'th')}</thead><tbody>${body.map((r) => row(r, 'td')).join('')}</tbody></table></div>`,
      );
      table = null;
    }
  };

  for (const raw of lines) {
    let line = raw.trimEnd();
    // Bảng Markdown: | a | b |
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushPara();
      flushList();
      if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) continue; // dòng kẻ |---|---|
      (table ||= []).push(splitRow(line));
      continue;
    }
    flushTable();
    // Đường kẻ ngang (---) thì bỏ; trích dẫn (> ...) thì hiển thị như đoạn thường
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushPara();
      flushList();
      continue;
    }
    line = line.replace(/^\s*&gt;\s?/, '');
    const ul = line.match(/^\s*[-*•]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const h = line.match(/^#{1,4}\s+(.*)$/);
    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (h) {
      flushPara();
      flushList();
      out.push(`<h4>${inline(h[1])}</h4>`);
    } else if (ul || ol) {
      flushPara();
      const type = ul ? 'ul' : 'ol';
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((ul || ol)[1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushTable();
  flushPara();
  flushList();
  return out.join('');
}
