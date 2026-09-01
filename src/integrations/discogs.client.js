const DISCOGS_BASE_URL = "https://api.discogs.com";
const TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithRetry(url, options = {}) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      if (response.ok) {
        return response;
      }

      // Retry temporary server errors
      if (response.status >= 500 && attempt < MAX_RETRIES) {
        await wait(500 * (attempt + 1));
        continue;
      }

      const error = new Error(
        `Discogs API returned status ${response.status}`
      );

      error.status = response.status;
      throw error;
    } catch (error) {
      lastError = error;

      if (attempt < MAX_RETRIES) {
        await wait(500 * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError;
}

export async function searchDiscogs(query) {
  if (!process.env.DISCOGS_TOKEN) {
    const error = new Error("Discogs API token is not configured");
    error.name = "DiscogsConfigurationError";
    throw error;
  }

  const searchParams = new URLSearchParams({
    q: query,
    type: "release",
    per_page: "10"
  });

  const url =
    `${DISCOGS_BASE_URL}/database/search?${searchParams.toString()}`;

  try {
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
        "User-Agent": "RetroRecords/1.0"
      }
    });

    const data = await response.json();

    return {
      source: "discogs",
      fallback: false,
      results: data.results.map((item) => ({
        discogs_release_id: item.id,
        title: item.title,
        year: item.year ?? null,
        country: item.country ?? null,
        format: item.format ?? [],
        genre: item.genre ?? [],
        style: item.style ?? [],
        cover_image: item.cover_image ?? null,
        resource_url: item.resource_url ?? null
      }))
    };
  } catch (error) {
    console.error("Discogs API error:", error.message);

    // Fallback keeps our API available even if Discogs is down
    return {
      source: "fallback",
      fallback: true,
      message: "Discogs is temporarily unavailable",
      results: []
    };
  }
}