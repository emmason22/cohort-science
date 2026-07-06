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

  function sortPosts(posts) {
    return posts.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  function mergePosts(primaryPosts, secondaryPosts) {
    const byId = new Map();
    [...primaryPosts, ...secondaryPosts].forEach((post) => {
      if (post && post.id && !byId.has(post.id)) {
        byId.set(post.id, post);
      }
    });
    return sortPosts([...byId.values()]);
  }

  function loadSeedPosts() {
    return fetch("sanity-studio/seed/publicPosts.json", { cache: "no-cache" })
      .then((response) => (response.ok ? response.json() : []))
      .then((posts) => posts.map(normalizePost))
      .catch(() => []);
  }

  if (!config.projectId) {
    loadSeedPosts().then(publish);
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
    .then((data) => {
      const sanityPosts = (data.result || []).map(normalizePost);
      return loadSeedPosts().then((seedPosts) => publish(mergePosts(sanityPosts, seedPosts)));
    })
    .catch((error) => {
      console.error(error);
      loadSeedPosts().then(publish);
    });
})();
