const postsGrid = document.getElementById('posts-grid');
const journalStatus = document.getElementById('journal-status');

function createPostCard(post) {
  const article = document.createElement('article');
  article.className = 'card';

  const h3 = document.createElement('h3');
  h3.textContent = post.title;

  const p = document.createElement('p');
  p.textContent = post.excerpt;

  const link = document.createElement('a');
  link.className = 'text-link';
  link.href = `post.html?id=${encodeURIComponent(post.id)}`;
  link.textContent = 'Read more';

  article.append(h3, p, link);
  return article;
}

function renderPosts(posts) {
  postsGrid.innerHTML = '';
  posts.forEach((post) => postsGrid.appendChild(createPostCard(post)));
}

function loadLocalPosts() {
  const posts = Array.isArray(window.COHORT_POSTS) ? window.COHORT_POSTS : [];
  if (!posts.length) {
    journalStatus.textContent = 'No local posts published yet.';
    postsGrid.innerHTML = '';
    return;
  }

  renderPosts(posts);
  journalStatus.textContent = '';
}

if (postsGrid && journalStatus) {
  loadLocalPosts();
}
