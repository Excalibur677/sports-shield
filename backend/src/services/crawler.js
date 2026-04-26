const axios = require("axios");

const API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

// search google for images matching a query
async function searchImages(query) {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          key: API_KEY,
          cx: SEARCH_ENGINE_ID,
          q: query,
          searchType: "image",
          num: 10,
        },
      }
    );

    const results = response.data.items || [];

    return results.map((item) => ({
      title: item.title,
      url: item.link,
      sourceUrl: item.image?.contextLink || "",
      thumbnail: item.image?.thumbnailLink || "",
      domain: extractDomain(item.image?.contextLink || ""),
    }));
  } catch (err) {
    console.error("Crawler error:", err.message);
    return [];
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

module.exports = { searchImages };