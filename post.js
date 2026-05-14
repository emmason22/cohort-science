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
  postContent.innerHTML = post.content || '<p>Content unavailable.</p>';
}

if (postTitle && postStatus && postContent) {
  loadLocalPost();
}
