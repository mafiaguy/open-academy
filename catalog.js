const searchInput = document.querySelector('#course-search');
const catalogCards = [...document.querySelectorAll('.catalog-card')];
const courseCount = document.querySelector('#course-count');
const emptyMessage = document.querySelector('#catalog-empty');

searchInput?.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  catalogCards.forEach((card) => {
    const matches = `${card.dataset.course} ${card.textContent}`.toLowerCase().includes(query);
    card.hidden = !matches;
    if (matches) visible += 1;
  });
  courseCount.textContent = `${visible} ${visible === 1 ? 'course' : 'courses'}`;
  emptyMessage.hidden = visible !== 0;
});
