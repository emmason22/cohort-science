const postTitle = document.getElementById('post-title');
const postMeta = document.getElementById('post-meta');
const postStatus = document.getElementById('post-status');
const postContent = document.getElementById('post-content');
const relatedPostsGrid = document.getElementById('related-posts-grid');

function getPostId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function stripHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html || '';
  return (temp.textContent || temp.innerText || '').trim();
}

function estimateReadTime(contentHtml) {
  const words = stripHtml(contentHtml).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

function categorizePost(post) {
  const text = `${post.title} ${post.excerpt}`.toLowerCase();
  if (text.includes('science of cohorts') || text.includes('cohort')) return 'Science of Cohorts';
  if (text.includes('announces') || text.includes('unveils') || text.includes('launch')) return 'Announcement';
  if (text.includes('partnership') || text.includes('selects') || text.includes('agreement')) return 'Partnership';
  return 'Insight';
}

function createRelatedCard(post) {
  const article = document.createElement('article');
  article.className = 'card';

  const h4 = document.createElement('h3');
  h4.textContent = post.title;

  const p = document.createElement('p');
  p.textContent = post.excerpt;

  const link = document.createElement('a');
  link.className = 'text-link';
  link.href = `post.html?id=${encodeURIComponent(post.id)}`;
  link.textContent = 'Read more';

  article.append(h4, p, link);
  return article;
}

function renderRelatedPosts(currentPost, allPosts) {
  if (!relatedPostsGrid) return;
  const related = allPosts.filter((p) => p.id !== currentPost.id).slice(0, 3);
  relatedPostsGrid.innerHTML = '';
  related.forEach((post) => relatedPostsGrid.appendChild(createRelatedCard(post)));
}

function loadLocalPost() {
  const id = getPostId();
  const posts = Array.isArray(window.COHORT_POSTS) ? window.COHORT_POSTS : [];
  const post = posts.find((item) => item.id === id);

  if (!post) {
    postTitle.textContent = 'Post not found';
    postMeta.textContent = '';
    postStatus.textContent = 'This article is not available in local content yet.';
    postContent.innerHTML = '<p>Please return to the Journal page to select an available post.</p>';
    if (relatedPostsGrid) relatedPostsGrid.innerHTML = '';
    return;
  }

  const author = post.author || 'Cohort Science™ Team';
  const published = formatDate(post.date);
  const readTime = estimateReadTime(post.content || '');
  const category = post.categoryLabel || categorizePost(post);

  postTitle.textContent = post.title;
  postMeta.innerHTML = [
    `<span class="post-meta-item"><span class="post-meta-icon" aria-hidden="true">🏷</span>${category}</span>`,
    published ? `<span class="post-meta-item"><span class="post-meta-icon" aria-hidden="true">🕒</span>${published}</span>` : '',
    `<span class="post-meta-item"><span class="post-meta-icon" aria-hidden="true">👤</span>${author}</span>`,
    `<span class="post-meta-item"><span class="post-meta-icon" aria-hidden="true">💬</span>No Comments</span>`,
    `<span class="post-meta-item"><span class="post-meta-icon" aria-hidden="true">⏱</span>${readTime}</span>`
  ].filter(Boolean).join('');
  postStatus.textContent = '';

  const imageMarkup = post.image
    ? `<img class="post-featured-image ${post.imageFit === 'contain' ? 'post-featured-image-contain' : ''}" src="${post.image}" alt="${post.title} featured image" loading="eager" decoding="async">`
    : '';

  postContent.innerHTML = `${imageMarkup}${post.content || '<p>Content unavailable.</p>'}`;
  renderRelatedPosts(post, posts);
  injectPostSchema(post, author);
}

function injectPostSchema(post, author) {
  const url = new URL(window.location.href);
  const imageUrl = post.image ? new URL(post.image, window.location.origin).href : 'https://cohortscience.com/Assets/optimized/logo-320.png';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    image: imageUrl,
    author: {
      '@type': 'Organization',
      name: author
    },
    mainEntityOfPage: url.href,
    publisher: {
      '@type': 'Organization',
      name: 'Cohort Science™',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cohortscience.com/Assets/optimized/logo-320.png'
      }
    }
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

if (postTitle && postStatus && postContent) {
  loadLocalPost();
}
