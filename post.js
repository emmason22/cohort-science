const postTitle = document.getElementById('post-title');
const postStatus = document.getElementById('post-status');
const postContent = document.getElementById('post-content');
const postHeroImage = document.getElementById('post-hero-image');
const relatedPostsGrid = document.getElementById('related-posts-grid');
const postPagination = document.getElementById('post-pagination');
const postShare = document.getElementById('post-share');

function getPostId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function stripHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html || '';
  return (temp.textContent || temp.innerText || '').trim();
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

function renderPostPagination(currentPost, allPosts) {
  if (!postPagination) return;
  const idx = allPosts.findIndex((p) => p.id === currentPost.id);
  const newer = idx > 0 ? allPosts[idx - 1] : null;
  const older = idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null;

  const parts = [];
  if (newer) {
    parts.push(`<a class="post-nav-link" href="post.html?id=${encodeURIComponent(newer.id)}"><span class="post-nav-label">Newer</span><span>${newer.title}</span></a>`);
  } else {
    parts.push('<span class="post-nav-link post-nav-link-disabled"><span class="post-nav-label">Newer</span><span>None</span></span>');
  }
  if (older) {
    parts.push(`<a class="post-nav-link" href="post.html?id=${encodeURIComponent(older.id)}"><span class="post-nav-label">Older</span><span>${older.title}</span></a>`);
  } else {
    parts.push('<span class="post-nav-link post-nav-link-disabled"><span class="post-nav-label">Older</span><span>None</span></span>');
  }
  postPagination.innerHTML = parts.join('');
}

function renderShareButtons(post) {
  if (!postShare) return;
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(post.title);
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  const x = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
  const email = `mailto:?subject=${title}&body=${url}`;
  postShare.innerHTML = `
    <a class="share-link" href="${linkedIn}" target="_blank" rel="noopener noreferrer">Share on LinkedIn</a>
    <a class="share-link" href="${x}" target="_blank" rel="noopener noreferrer">Share on X</a>
    <a class="share-link" href="${email}">Share by Email</a>
  `;
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

  postTitle.textContent = post.title;
  postStatus.textContent = '';

  if (postHeroImage) {
    postHeroImage.innerHTML = post.image
      ? `<img class="post-featured-image ${post.imageFit === 'contain' ? 'post-featured-image-contain' : ''}" src="${post.image}" alt="${post.title} featured image" loading="eager" decoding="async">`
      : '';
  }

  postContent.innerHTML = `${post.content || '<p>Content unavailable.</p>'}`;
  renderRelatedPosts(post, posts);
  renderPostPagination(post, posts);
  renderShareButtons(post);
  injectPostSchema(post, post.author || 'Cohort Science™ Team');
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
