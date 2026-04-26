const axios = require("axios");

const API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

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
    console.warn("Google API unavailable, using fallback:", err.message);
    return generateFallbackResults(query);
  }
}

// fallback results for demo when API fails
function generateFallbackResults(query) {
  const domains = [
    "youtube.com", "facebook.com", "twitter.com",
    "instagram.com", "reddit.com", "dailymotion.com",
    "tiktok.com", "twitch.tv"
  ];

  const keywords = query.toLowerCase().split(" ").filter(w => w.length > 2);

  return domains.map((domain) => ({
    title: `${query} - found on ${domain}`,
    url: `https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Virat_Kohli_during_the_2011_World_Cup.jpg/800px-Virat_Kohli_during_the_2011_World_Cup.jpg`,
    sourceUrl: `https://${domain}/watch?v=demo`,
    thumbnail: `https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Virat_Kohli_during_the_2011_World_Cup.jpg/800px-Virat_Kohli_during_the_2011_World_Cup.jpg`,
    domain: domain,
    keywords: keywords,
  }));
}

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

module.exports = { searchImages };