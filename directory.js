(() => {
  const cards = Array.from(document.querySelectorAll('[data-tool-link]'));
  const search = document.getElementById('directory-search');
  const category = document.getElementById('directory-category');
  const more = document.getElementById('show-more');
  const clear = document.getElementById('clear-filters');
  if (!search || !category) return;
  let expanded = false;
  function readURL() {
    const params = new URLSearchParams(location.search);
    search.value = params.get('search') || '';
    category.value = Array.from(category.options).some(o => o.value === params.get('category')) ? params.get('category') : 'all';
    expanded = params.get('view') === 'all';
  }
  function filter(syncURL = true) {
    const query = search.value.trim().toLowerCase();
    const filtered = Boolean(query || category.value !== 'all');
    const matches = cards.filter(card => card.textContent.toLowerCase().includes(query) && (category.value === 'all' || card.dataset.category === category.value));
    const visible = new Set(filtered || expanded || !more ? matches : matches.slice(0, 12));
    cards.forEach(card => { card.hidden = !visible.has(card); });
    document.getElementById('directory-status').textContent = matches.length ? (visible.size < matches.length ? `Showing ${visible.size} of ${matches.length} tools` : `${matches.length} tools found`) : 'No matching tools. Try another word or choose All categories.';
    if (more) more.hidden = filtered || expanded || matches.length <= 12;
    if (clear) clear.hidden = !filtered;
    if (syncURL) {
      const url = new URL(location.href);
      query ? url.searchParams.set('search', search.value.trim()) : url.searchParams.delete('search');
      category.value === 'all' ? url.searchParams.delete('category') : url.searchParams.set('category', category.value);
      expanded ? url.searchParams.set('view', 'all') : url.searchParams.delete('view');
      history.replaceState(null, '', url);
    }
  }
  search.addEventListener('input', () => filter());
  category.addEventListener('change', () => { expanded = false; filter(); });
  more?.addEventListener('click', () => {
    expanded = true;
    filter();
    cards[12]?.focus();
  });
  clear?.addEventListener('click', () => { search.value = ''; category.value = 'all'; expanded = false; filter(); search.focus({preventScroll:true}); });
  document.querySelectorAll('[data-search]').forEach(button => button.addEventListener('click', () => { search.value = button.dataset.search; category.value = 'all'; filter(); }));
  window.addEventListener('popstate', () => { readURL(); filter(false); });
  readURL();
  filter(false);
  function followLegacyLink() {
    const target = document.getElementById(location.hash.slice(1));
    if (target?.dataset.toolLink) location.replace(target.href);
  }
  window.addEventListener('hashchange', followLegacyLink);
  followLegacyLink();
})();
