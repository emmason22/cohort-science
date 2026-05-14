const postsGrid = document.getElementById('posts-grid');
const journalStatus = document.getElementById('journal-status');

const fallbackPosts = [
  {
    id: 'live-blog',
    title: 'Cohort Science Journal',
    excerpt: 'Read the latest Cohort Science blog posts, announcements, and sector analysis on the live site.',
    url: 'https://cohortscience.com/blog/'
  },
  {
    id: 'about-team',
    title: 'About the Team',
    excerpt: 'Learn more about the Cohort Science leadership and advisor network.',
    url: 'https://cohortscience.com/about-us/'
  }
];

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').trim();
}

function createLocalPostUrl(post) {
  const params = new URLSearchParams();
  params.set('id', post.id);
  if (post.url) {
    params.set('src', post.url);
  }
  return `post.html?${params.toString()}`;
}

function createPostCard(post) {
  const article = document.createElement('article');
  article.className = 'card';

  const h3 = document.createElement('h3');
  h3.textContent = post.title;

  const p = document.createElement('p');
  p.textContent = post.excerpt;

  const link = document.createElement('a');
  link.className = 'text-link';
  link.href = createLocalPostUrl(post);
  link.textContent = 'Read more';

  article.append(h3, p, link);
  return article;
}

function renderPosts(posts) {
  postsGrid.innerHTML = '';
  posts.forEach((post) => postsGrid.appendChild(createPostCard(post)));
}

async function loadLivePosts() {
  try {
    const response = await fetch('https://cohortscience.com/wp-json/wp/v2/posts?per_page=24&_embed');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const posts = data.map((post) => ({
      id: String(post.id),
      title: stripHtml(post.title.rendered),
      excerpt: stripHtml(post.excerpt.rendered).slice(0, 180) || 'Read this post on the Cohort Science Journal.',
      url: post.link
    }));

    if (!posts.length) {
      throw new Error('No posts returned');
    }

    renderPosts(posts);
    journalStatus.textContent = 'Showing posts mirrored to local post pages from cohortscience.com/blog.';
  } catch (_error) {
    renderPosts(fallbackPosts);
    journalStatus.textContent = 'Live post feed is unavailable in this environment. Open a card to continue to the source site.';
  }
}

if (postsGrid && journalStatus) {
  loadLivePosts();
}
