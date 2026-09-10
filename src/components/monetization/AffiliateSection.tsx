import { Telescope, BookOpen, GraduationCap, ExternalLink } from 'lucide-react';
import { analyticsTracker } from '../../services/analyticsTracker';
import { MONETIZATION_CONFIG } from '../../config/monetization';

interface AffiliateSectionProps {
  variant?: 'cards' | 'compact';
  className?: string;
}

export function AffiliateSection({ variant = 'cards', className = '' }: AffiliateSectionProps) {
  const items = [
    {
      id: 'telescope',
      title: 'Kính thiên văn cho người mới',
      desc: 'Celestron PowerSeeker 127EQ — quan sát Sao Mộc, Sao Thổ rõ nét',
      icon: Telescope,
      url: MONETIZATION_CONFIG.telescopeUrl,
      price: '~3.500.000₫',
      tag: 'AMAZON',
    },
    {
      id: 'book',
      title: 'Cosmos — Carl Sagan',
      desc: 'Cuốn sách kinh điển về vũ trụ cho mọi lứa tuổi',
      icon: BookOpen,
      url: MONETIZATION_CONFIG.bookUrl,
      price: '~280.000₫',
      tag: 'SÁCH',
    },
    {
      id: 'course',
      title: 'Khóa học Thiên văn cơ bản',
      desc: 'Coursera — The Solar System (University of Arizona)',
      icon: GraduationCap,
      url: MONETIZATION_CONFIG.courseUrl,
      price: 'Miễn phí',
      tag: 'KHÓA HỌC',
    },
  ];

  const handleClick = (item: typeof items[0]) => {
    analyticsTracker.trackAffiliateClick(item.id, item.title, item.price, item.tag);
  };

  if (variant === 'compact') {
    return (
      <div className={`affiliate-compact-list ${className}`}>
        <div className="affiliate-list-header">
          <Telescope size={14} />
          <span>TÌM HIỂU THÊM</span>
        </div>
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="affiliate-compact-item"
            onClick={() => handleClick(item)}
          >
            <item.icon size={14} />
            <span className="affiliate-compact-title">{item.title}</span>
            <span className="affiliate-compact-price">{item.price}</span>
            <ExternalLink size={11} />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={`affiliate-cards-grid ${className}`}>
      <div className="affiliate-grid-header">
        <div className="affiliate-grid-tag">
          <Telescope size={14} />
          <span>KHÁM PHÁ THÊM</span>
        </div>
        <span className="affiliate-grid-sub">Sản phẩm được đề xuất cho người yêu thiên văn</span>
      </div>
      <div className="affiliate-grid-items">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="affiliate-card-item"
            onClick={() => handleClick(item)}
          >
            <div className="affiliate-card-icon-wrap">
              <item.icon size={18} />
            </div>
            <div className="affiliate-card-content">
              <div className="affiliate-card-tag">{item.tag}</div>
              <div className="affiliate-card-title">{item.title}</div>
              <div className="affiliate-card-desc">{item.desc}</div>
            </div>
            <div className="affiliate-card-price-badge">
              <span>{item.price}</span>
              <ExternalLink size={11} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
