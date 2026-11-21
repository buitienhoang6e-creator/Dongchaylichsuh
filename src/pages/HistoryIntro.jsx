import { Link } from 'react-router-dom';
import { EVENTS, PERIODS } from '../data/events.js';

export default function HistoryIntro() {
  return (
    <div className="page">
      <div className="container">
        <header className="page-head intro-head">
          <p className="crumbs">
            <Link to="/">Trang chủ</Link> / <span>Giới thiệu lịch sử</span>
          </p>
          <h1>Mấy nghìn năm dựng nước và giữ nước</h1>
          <p className="page-lead">
            Lịch sử Việt Nam là câu chuyện của một cộng đồng người nhiều lần đứng trước nguy cơ bị xóa tên, và lần nào
            cũng đứng dậy. Trang này giới thiệu {PERIODS.length} thời kỳ lớn để bạn biết mỗi sự kiện trong cuộn phim nằm ở đâu
            trong dòng chảy chung.
          </p>
        </header>

        <figure className="intro-quote">
          <blockquote>
            <p>
              Dân ta phải biết sử ta,
              <br />
              Cho tường gốc tích nước nhà Việt Nam.
            </p>
          </blockquote>
          <figcaption>Hồ Chí Minh, bài diễn ca “Lịch sử nước ta”, 1942</figcaption>
        </figure>

        <ol className="eras">
          {PERIODS.map((p) => {
            const list = EVENTS.filter((e) => e.periodId === p.id);
            return (
              <li key={p.id} id={p.id} className="era">
                <div className="era-range">{p.range}</div>
                <div className="era-body">
                  <h2>{p.name}</h2>
                  <p>{p.description}</p>
                  {list.length > 0 && (
                    <ul className="era-events" aria-label={`Sự kiện thuộc ${p.name}`}>
                      {list.map((e) => (
                        <li key={e.slug}>
                          <Link to={`/su-kien/${e.slug}`}>
                            <span className="era-event-time">{e.time}</span>
                            <span>{e.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <section className="intro-why">
          <h2>Vì sao nên học lịch sử qua hình ảnh và mô hình?</h2>
          <div className="intro-why-grid">
            <p>
              Một mốc năm trong sách dễ quên, nhưng hình ảnh thành Cổ Loa với ba vòng thành đất, hay bãi cọc lấp ló
              dưới nước triều Bạch Đằng, thì khó quên hơn nhiều. Khi tự mình đi lại trong không gian của sự kiện, người
              học hiểu được vì sao người xưa chọn cách đánh ấy.
            </p>
            <p>
              Mỗi khung phim trên trang web đều đi kèm phần chữ biên soạn theo sách giáo khoa, video tiếng Việt đã được
              đối chiếu nội dung, và câu hỏi ôn tập. Hình ảnh giúp nhớ, phần chữ giúp hiểu đúng.
            </p>
          </div>
          <Link to="/hoc-tap/viet-nam" className="btn btn-primary">
            Bắt đầu với khung phim đầu tiên
          </Link>
        </section>
      </div>
    </div>
  );
}
