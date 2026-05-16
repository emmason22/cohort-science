const postTitle = document.getElementById('post-title');
const postStatus = document.getElementById('post-status');
const postContent = document.getElementById('post-content');
const postHeroImage = document.getElementById('post-hero-image');
const relatedPostsGrid = document.getElementById('related-posts-grid');
const postPagination = document.getElementById('post-pagination');
const postShare = document.getElementById('post-share');
const postByline = document.getElementById('post-byline');
const canonicalNode = document.querySelector('link[rel="canonical"]');

function getMeta(selector) {
  return document.querySelector(selector);
}

function setMetaContent(selector, value) {
  const node = getMeta(selector);
  if (node && typeof value === 'string') node.setAttribute('content', value);
}

function ensureMeta(propertyName) {
  let node = document.querySelector(`meta[property="${propertyName}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute('property', propertyName);
    document.head.appendChild(node);
  }
  return node;
}

function getPostId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function stripHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html || '';
  return (temp.textContent || temp.innerText || '').trim();
}

function clampText(text, max = 155) {
  const normalized = (text || '').trim().replace(/\s+/g, ' ');
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).trimEnd()}...`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function updatePostHead(post) {
  const absoluteUrl = new URL(`post.html?id=${encodeURIComponent(post.id)}`, window.location.origin).href;
  const imageUrl = post.image ? new URL(post.image, window.location.origin).href : 'https://cohortscience.com/Assets/optimized/logo-320.png';
  const description = clampText(post.excerpt || stripHtml(post.content || 'Cohort Science™ Journal article.'));
  const title = `${post.title} | Cohort Science™ Journal`;

  document.title = title;
  if (canonicalNode) canonicalNode.href = absoluteUrl;

  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:url"]', absoluteUrl);
  setMetaContent('meta[property="og:image"]', imageUrl);
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);
  setMetaContent('meta[name="twitter:image"]', imageUrl);

  if (post.date) {
    ensureMeta('article:published_time').setAttribute('content', post.date);
    ensureMeta('article:modified_time').setAttribute('content', post.date);
  }
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
    postStatus.textContent = 'This article is not available in local content yet.';
    postContent.innerHTML = '<p>Please return to the Journal page to select an available post.</p>';
    if (relatedPostsGrid) relatedPostsGrid.innerHTML = '';
    return;
  }

  postTitle.textContent = post.title;
  postStatus.textContent = '';
  updatePostHead(post);
  if (postByline) {
    const dateLabel = formatDate(post.date);
    postByline.textContent = dateLabel ? `Published ${dateLabel} • Updated ${dateLabel}` : '';
  }

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
