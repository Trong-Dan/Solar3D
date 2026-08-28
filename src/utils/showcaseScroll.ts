export function scrollShowcaseToIndex(index: number) {
  const container = document.querySelector('.ares-scroll-content');
  const section = container?.querySelector(`[data-section-index="${index}"]`);
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
