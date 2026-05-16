const postsGrid = document.getElementById('posts-grid');
const journalStatus = document.getElementById('journal-status');
const searchInput = document.getElementById('journal-search');
const categorySelect = document.getElementById('journal-category');

function categorizePost(post) {
  const text = `${post.title} ${post.excerpt}`.toLowerCase();
  if (text.includes('science of cohorts') || text.includes('cohort')) {
    return 'science-of-cohorts';
  }
  if (text.includes('announces') || text.includes('unveils') || text.includes('launch')) {
    return 'announcement';
  }
  if (text.includes('partnership') || text.includes('selects') || text.includes('agreement')) {
    return 'partnership';
  }
  return 'insight';
}

function createPostCard(post) {
  const article = document.createElement('article');
  article.className = 'card';

  if (post.image) {
    const image = document.createElement('img');
    image.className = 'journal-card-image';
    if (post.imageFit === 'contain') {
      image.classList.add('journal-card-image-contain');
    }
    image.src = post.image;
    image.alt = `${post.title} featured image`;
    image.loading = 'lazy';
    image.decoding = 'async';
    article.appendChild(image);
  }

  const tag = document.createElement('p');
  tag.className = 'journal-tag';
  tag.textContent = post.categoryLabel;

  const h3 = document.createElement('h3');
  h3.textContent = post.title;

  const p = document.createElement('p');
  p.textContent = post.excerpt;

  const link = document.createElement('a');
  link.className = 'text-link';
  link.href = `post.html?id=${encodeURIComponent(post.id)}`;
  link.textContent = 'Read more';

  article.append(tag, h3, p, link);
  return article;
}

function renderPosts(posts) {
  postsGrid.innerHTML = '';
  posts.forEach((post) => postsGrid.appendChild(createPostCard(post)));
}

function applyFilters() {
  const allPosts = Array.isArray(window.COHORT_POSTS) ? window.COHORT_POSTS : [];
  const q = (searchInput?.value || '').trim().toLowerCase();
  const category = categorySelect?.value || 'all';

  const enriched = allPosts.map((post) => {
    const cat = post.category || categorizePost(post);
    const labelMap = {
      'science-of-cohorts': 'Science of Cohorts',
      announcement: 'Announcement',
      partnership: 'Partnership',
      insight: 'Insight'
    };
    return {
      ...post,
      category: cat,
      categoryLabel: labelMap[cat] || 'Insight'
    };
  });

  const filtered = enriched.filter((post) => {
    const matchesCategory = category === 'all' || post.category === category;
    const haystack = `${post.title} ${post.excerpt}`.toLowerCase();
    const matchesQuery = !q || haystack.includes(q);
    return matchesCategory && matchesQuery;
  });

  if (!filtered.length) {
    postsGrid.innerHTML = '';
    journalStatus.textContent = 'No posts match this filter yet.';
    return;
  }

  renderPosts(filtered);
  journalStatus.textContent = '';
}

function loadLocalPosts() {
  const posts = Array.isArray(window.COHORT_POSTS) ? window.COHORT_POSTS : [];
  if (!posts.length) {
    journalStatus.textContent = 'No local posts published yet.';
    postsGrid.innerHTML = '';
    return;
  }

  applyFilters();
}

if (postsGrid && journalStatus) {
  searchInput?.addEventListener('input', applyFilters);
  categorySelect?.addEventListener('change', applyFilters);
  loadLocalPosts();
}
