(() => {
    const cards = Array.from(document.querySelectorAll('[data-tool-link]'));
    const search = document.getElementById('directory-search');
    const category = document.getElementById('directory-category');
    const params = new URLSearchParams(location.search);
    search.value = params.get('search') || '';
    if (Array.from(category.options).some(option => option.value === params.get('category'))) category.value = params.get('category');
    function filter() {
        const query = search.value.trim().toLowerCase();
        let count = 0;
        cards.forEach(card => {
            card.hidden = !(card.textContent.toLowerCase().includes(query) && (category.value === 'all' || card.dataset.category === category.value));
            if (!card.hidden) count++;
        });
        document.getElementById('directory-status').textContent = count ? `${count} tools found` : 'No matching tools. Try another word or choose All categories.';
    }
    search.addEventListener('input', filter);
    category.addEventListener('change', filter);
    filter();
    // Preserve previously shared homepage calculator bookmarks.
    function followLegacyLink() {
        const target = document.getElementById(location.hash.slice(1));
        if (target?.dataset.toolLink) location.replace(target.href);
    }
    window.addEventListener('hashchange', followLegacyLink);
    followLegacyLink();
})();
