const postTitle = document.getElementById('post-title');
const postMeta = document.getElementById('post-meta');
const postStatus = document.getElementById('post-status');
const postContent = document.getElementById('post-content');
const sourceLink = document.getElementById('source-link');

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get('id'),
    src: params.get('src') || 'https://cohortscience.com/blog/'
  };
}

async function loadPost() {
  const { id, src } = getParams();
  if (sourceLink) {
    sourceLink.href = src;
  }

  if (!id || id === 'live-blog' || id === 'about-team') {
    postTitle.textContent = 'Journal content is available on the live site';
    postStatus.textContent = 'Open the source link to read the full article list.';
    postContent.innerHTML = `<p>Visit <a href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer">the source page</a> for full content.</p>`;
    return;
  }

  try {
    const response = await fetch(`https://cohortscience.com/wp-json/wp/v2/posts/${encodeURIComponent(id)}?_embed`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const post = await response.json();
    const titleText = post?.title?.rendered ? post.title.rendered.replace(/<[^>]*>/g, '').trim() : 'Journal Post';
    const dateText = post?.date ? new Date(post.date).toLocaleDateString() : '';

    postTitle.textContent = titleText;
    postMeta.textContent = dateText ? `Published ${dateText}` : '';
    postStatus.textContent = 'Loaded from cohortscience.com.';
    postContent.innerHTML = post?.content?.rendered || '<p>Content unavailable.</p>';

    if (sourceLink && post?.link) {
      sourceLink.href = post.link;
    }
  } catch (_error) {
    postTitle.textContent = 'Unable to load this post automatically';
    postStatus.textContent = 'This environment cannot fetch the source post right now.';
    postContent.innerHTML = `<p>Please open the <a href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer">source post</a> to read the article.</p>`;
  }
}

if (postTitle && postStatus && postContent) {
  loadPost();
}
