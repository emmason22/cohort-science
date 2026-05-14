const postTitle = document.getElementById('post-title');
const postMeta = document.getElementById('post-meta');
const postStatus = document.getElementById('post-status');
const postContent = document.getElementById('post-content');

function getPostId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function formatDate(dateStr) {
  if (!dateStr) {
    return '';
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
    return;
  }

  postTitle.textContent = post.title;
  postMeta.textContent = formatDate(post.date) ? `Published ${formatDate(post.date)}` : '';
  postStatus.textContent = '';
  const imageMarkup = post.image
    ? `<img class="post-featured-image ${post.imageFit === 'contain' ? 'post-featured-image-contain' : ''}" src="${post.image}" alt="${post.title} featured image" loading="eager" decoding="async">`
    : '';
  postContent.innerHTML = `${imageMarkup}${post.content || '<p>Content unavailable.</p>'}`;
  injectPostSchema(post);
}

function injectPostSchema(post) {
  const url = new URL(window.location.href);
  const imageUrl = post.image ? new URL(post.image, window.location.origin).href : 'https://cohortscience.com/Assets/optimized/logo-320.png';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    image: imageUrl,
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
