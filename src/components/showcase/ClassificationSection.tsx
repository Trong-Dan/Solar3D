import { Icon } from '@iconify/react';
import { Sparkles, BookOpen, Orbit, Layers, Info } from 'lucide-react';
import { allCelestialBodies } from '../../data/planets';
import { systemOverview, classificationTable } from '../../data/systemOverview';

const typeIcons: Record<string, string> = {
  star: 'ph:sun-bold',
  terrestrial: 'ph:planet-bold',
  gas_giant: 'ph:cloud-bold',
  ice_giant: 'ph:snowflake-bold',
  dwarf: 'ph:circles-three-bold',
};

const typeLabels: Record<string, string> = {
  star: 'Ngôi sao',
  terrestrial: 'Đá',
  gas_giant: 'Khí khổng lồ',
  ice_giant: 'Băng khổng lồ',
  dwarf: 'Hành tinh lùn',
};

export function ClassificationSection() {
  return (
    <section className="ares-classification" data-section-index={allCelestialBodies.length + 1}>
      <div className="ares-section-glow" />

      <div className="bloom delay-1 ares-badge-row">
        <span className="orbtag">
          <span className="orbtag-dot" />
          Kiến thức thiên văn
        </span>
        <span className="ares-step-counter">TÀI LIỆU</span>
      </div>

      <h2 className="bloom delay-2 ares-planet-name pulse-text">
        Định nghĩa & Phân loại hành tinh
      </h2>
      <span className="bloom delay-2 ares-english-name">Classification of Planets</span>

      {/* IAU Definition */}
      <div className="bloom delay-3 ares-def-box">
        <div className="ares-def-title">
          <BookOpen size={16} />
          <span>Tiêu chuẩn IAU (2006)</span>
        </div>
        <p className="ares-def-text">{systemOverview.definition[0]}</p>
      </div>

      {/* Two Groups */}
      <div className="bloom delay-4 ares-groups-grid">
        {systemOverview.groups.map((group) => (
          <div key={group.title} className="ares-group-card">
            <div className="ares-group-header">
              <Orbit size={15} />
              <span className="ares-group-title">{group.title}</span>
            </div>
            <div className="ares-group-subtitle">{group.subtitle}</div>
            <div className="ares-group-bodies">
              {group.ids.map((id) => {
                const body = allCelestialBodies.find((b) => b.id === id)!;
                return (
                  <div key={id} className="ares-group-body">
                    <div className="ares-group-body-dot" style={{ background: body.color }} />
                    <span className="ares-group-body-name">{body.name}</span>
                    <Icon icon={typeIcons[body.type]} width={13} className="ares-group-body-icon" />
                  </div>
                );
              })}
            </div>
            <p className="ares-group-desc">{group.desc}</p>
          </div>
        ))}
      </div>

      {/* Dwarf Planets */}
      <div className="bloom delay-5 ares-dwarf-box">
        <div className="ares-def-title">
          <Sparkles size={15} />
          <span>Hành tinh lùn (Dwarf Planets)</span>
        </div>
        <p className="ares-def-text">{systemOverview.dwarfPlanets}</p>
      </div>

      {/* Other Bodies */}
      <div className="bloom delay-5 ares-other-title">
        <Layers size={15} />
        <span>Cấu trúc các vùng khác của Hệ Mặt Trời</span>
      </div>
      <div className="bloom delay-5 ares-other-grid">
        {systemOverview.otherBodies.map((body) => (
          <div key={body.name} className="ares-other-card">
            <div className="ares-other-name">{body.name}</div>
            <div className="ares-other-loc">{body.location}</div>
            <div className="ares-other-desc">{body.desc}</div>
          </div>
        ))}
      </div>

      {/* Summary Table */}
      <div className="bloom delay-6 ares-table-wrap">
        <div className="ares-def-title">
          <Info size={15} />
          <span>Bảng tóm tắt thông tin chính</span>
        </div>
        <div className="ares-table-scroll">
          <table className="ares-table">
            <thead>
              <tr>
                <th>Hành tinh</th>
                <th>Loại</th>
                <th>Đường kính (km)</th>
                <th>Khoảng cách (triệu km)</th>
                <th>Chu kỳ quỹ đạo</th>
                <th>Vệ tinh</th>
              </tr>
            </thead>
            <tbody>
              {classificationTable.map((row) => (
                <tr key={row.planet}>
                  <td className="ares-table-planet">{row.planet}</td>
                  <td>{row.type}</td>
                  <td>{row.diameterKm}</td>
                  <td>{row.distanceMillionKm}</td>
                  <td>{row.period}</td>
                  <td className="ares-table-moons">{row.moons}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formation */}
      <div className="bloom delay-7 ares-def-box ares-formation-box">
        <div className="ares-def-title">
          <BookOpen size={16} />
          <span>Nguồn gốc hình thành</span>
        </div>
        <p className="ares-def-text">{systemOverview.formation}</p>
      </div>
    </section>
  );
}
