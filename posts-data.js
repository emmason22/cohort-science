(function loadCohortPosts() {
  const readyEvent = "cohort:posts-ready";
  const config = window.COHORT_SANITY || {};

  function publish(posts) {
    window.COHORT_POSTS = Array.isArray(posts) ? posts : [];
    window.dispatchEvent(new CustomEvent(readyEvent, { detail: window.COHORT_POSTS }));
  }

  function normalizePost(post) {
    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      image: post.image,
      imageFit: post.imageFit,
      category: post.category,
      author: post.author,
      content: post.content || "<p>Content unavailable.</p>"
    };
  }

  function loadSeedPosts() {
    return fetch("sanity-studio/seed/publicPosts.json", { cache: "no-cache" })
      .then((response) => (response.ok ? response.json() : []))
      .then((posts) => publish(posts.map(normalizePost)))
      .catch(() => publish([]));
  }

  if (!config.projectId) {
    loadSeedPosts();
    return;
  }

  const query = `*[_type == "publicJournalPost" && defined(slug.current)] | order(publishedAt desc) {
    "id": slug.current,
    title,
    excerpt,
    "date": coalesce(publishedAt, _createdAt)[0...10],
    "image": coalesce(featuredImage.asset->url, legacyImage),
    imageFit,
    category,
    author,
    "content": bodyHtml
  }`;
  const dataset = config.dataset || "production";
  const apiVersion = config.apiVersion || "2026-06-19";
  const url = `https://${config.projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load Sanity posts (${response.status})`);
      }
      return response.json();
    })
    .then((data) => publish((data.result || []).map(normalizePost)))
    .catch((error) => {
      console.error(error);
      loadSeedPosts();
    });
})();
