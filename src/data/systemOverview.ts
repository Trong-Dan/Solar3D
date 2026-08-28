export const systemOverview = {
  definition: [
    'Theo Hiệp hội Thiên văn Quốc tế (IAU), một hành tinh phải thỏa mãn ba điều kiện: (1) quay quanh Mặt Trời, (2) có đủ khối lượng để tự trọng lực tạo hình cầu (cân bằng thủy tĩnh), và (3) đã "dọn sạch" vùng lân cận quỹ đạo của nó.',
  ],
  groups: [
    {
      title: 'Hành tinh vòng trong (Terrestrial Planets)',
      subtitle: '4 hành tinh đá gần Mặt Trời nhất',
      ids: ['mercury', 'venus', 'earth', 'mars'],
      desc: 'Những hành tinh đất đá nhỏ gọn với bề mặt rắn, cấu tạo chủ yếu từ silicat và kim loại.',
    },
    {
      title: 'Hành tinh vòng ngoài (Gas & Ice Giants)',
      subtitle: '4 hành tinh khổng lồ ngoài cùng',
      ids: ['jupiter', 'saturn', 'uranus', 'neptune'],
      desc: 'Những hành tinh khí/băng khổng lồ với khối lượng và kích thước vượt trội, không có bề mặt rắn.',
    },
  ],
  dwarfPlanets:
    'Ngoài ra còn có hành tinh lùn (dwarf planets) như Pluto, Ceres, Eris, Haumea, Makemake – thỏa điều kiện (1) và (2) nhưng chưa dọn sạch quỹ đạo.',
  otherBodies: [
    {
      name: 'Vành đai tiểu hành tinh',
      location: 'Giữa Sao Hỏa và Sao Mộc',
      desc: 'Chứa hàng triệu tiểu hành tinh, trong đó Ceres là lớn nhất.',
    },
    {
      name: 'Vành đai Kuiper',
      location: 'Vùng ngoài Sao Hải Vương',
      desc: 'Chứa nhiều vật thể băng giá, bao gồm Pluto, Haumea, Makemake.',
    },
    {
      name: 'Đĩa phân tán',
      location: 'Vùng xa hơn Kuiper',
      desc: 'Chứa các vật thể như Eris.',
    },
    {
      name: 'Đám mây Oort',
      location: '~50.000–100.000 AU',
      desc: 'Vùng giả thuyết xa nhất, nguồn gốc của các sao chổi dài hạn.',
    },
    {
      name: 'Sao chổi',
      location: 'Toàn hệ Mặt Trời',
      desc: 'Vật thể băng giá, khi đến gần Mặt Trời tạo ra đuôi sáng (ví dụ: Hale-Bopp).',
    },
  ],
  formation:
    'Hệ Mặt Trời hình thành khoảng 4,6 tỷ năm trước từ một đám mây khí và bụi (đĩa tiền hành tinh), với các hành tinh đá hình thành gần Mặt Trời và các hành tinh khí hình thành ngoài "đường băng giá" (frost line) nơi các hợp chất dễ bay hơi có thể ngưng tụ.',
};

export const classificationTable = [
  { planet: 'Sao Thủy', type: 'Đá', diameterKm: '4.879', distanceMillionKm: '57,9', period: '88 ngày', moons: '0' },
  { planet: 'Sao Kim', type: 'Đá', diameterKm: '12.104', distanceMillionKm: '108,2', period: '225 ngày', moons: '0' },
  { planet: 'Trái Đất', type: 'Đá', diameterKm: '12.742', distanceMillionKm: '149,6', period: '365,24 ngày', moons: '1' },
  { planet: 'Sao Hỏa', type: 'Đá', diameterKm: '6.779', distanceMillionKm: '227,9', period: '687 ngày', moons: '2' },
  { planet: 'Sao Mộc', type: 'Khí khổng lồ', diameterKm: '139.820', distanceMillionKm: '778,5', period: '12 năm', moons: '95+' },
  { planet: 'Sao Thổ', type: 'Khí khổng lồ', diameterKm: '116.460', distanceMillionKm: '1.430', period: '29,5 năm', moons: '146+' },
  { planet: 'Sao Thiên Vương', type: 'Băng khổng lồ', diameterKm: '50.724', distanceMillionKm: '2.870', period: '84 năm', moons: '27' },
  { planet: 'Sao Hải Vương', type: 'Băng khổng lồ', diameterKm: '49.244', distanceMillionKm: '4.500', period: '165 năm', moons: '14' },
];