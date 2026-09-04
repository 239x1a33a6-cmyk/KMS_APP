const https = require("https");
const http = require("http");
const Resource = require("../models/Resource");

// ─── Spotlight Search ───────────────────────────────────────────────────────
// Returns up to 8 resources matching the query across title / description / tags
const spotlightSearchHandler = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();

    if (!q || q.length < 1) {
      return res.status(200).json({ success: true, data: [] });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const results = await Resource.find({
      createdBy: req.user.id,
      isDeleted: false,
      $or: [
        { title: regex },
        { description: regex },
        { tags: regex },
        { category: regex },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(8)
      .select("_id title type category tags")
      .lean();

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return next(error);
  }
};

// ─── Link Metadata Preview ──────────────────────────────────────────────────
// Fetches the target URL and extracts Open Graph / meta tags
const fetchHtml = (targetUrl) =>
  new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const lib = parsed.protocol === "https:" ? https : http;

    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "GET",
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; KnowledgeVault/1.0; +https://knowledgevault.app)",
        Accept: "text/html",
      },
    };

    const req = lib.request(options, (response) => {
      if (
        [301, 302, 307, 308].includes(response.statusCode) &&
        response.headers.location
      ) {
        // Follow one redirect
        fetchHtml(response.headers.location).then(resolve).catch(reject);
        return;
      }

      let data = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        data += chunk;
        if (data.length > 200_000) {
          response.destroy();
        }
      });
      response.on("end", () => resolve(data));
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
    req.on("error", reject);
    req.end();
  });

const extractMeta = (html, property) => {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
};

const extractTitle = (html) => {
  const ogTitle = extractMeta(html, "title");
  if (ogTitle) return ogTitle;

  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
};

const linkPreviewHandler = async (req, res, next) => {
  try {
    const targetUrl = (req.query.url || "").trim();

    if (!targetUrl) {
      return res
        .status(400)
        .json({ success: false, message: "url query param required" });
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Invalid URL provided" });
    }

    let html;
    try {
      html = await fetchHtml(targetUrl);
    } catch {
      return res.status(200).json({
        success: true,
        data: { title: null, description: null, image: null, url: targetUrl },
      });
    }

    const title = extractTitle(html);
    const description = extractMeta(html, "description");
    let image = extractMeta(html, "image");

    // Make relative image URLs absolute
    if (image && !image.startsWith("http")) {
      image = `${parsedUrl.origin}${image.startsWith("/") ? "" : "/"}${image}`;
    }

    return res.status(200).json({
      success: true,
      data: { title, description, image, url: targetUrl },
    });
  } catch (error) {
    return next(error);
  }
};

// ─── Similar Title Detection ────────────────────────────────────────────────
// Returns resources whose title is similar (case-insensitive, substring match)
const similarTitleHandler = async (req, res, next) => {
  try {
    const title = (req.query.title || "").trim();

    if (!title || title.length < 3) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Build a fuzzy pattern — match any resource whose title contains the
    // first 60% of the query words (simple heuristic, zero dependencies)
    const words = title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    if (words.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const regexPatterns = words.map(
      (w) => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    );

    const matches = await Resource.find({
      createdBy: req.user.id,
      isDeleted: false,
      $or: regexPatterns.map((r) => ({ title: r })),
    })
      .select("_id title type")
      .limit(5)
      .lean();

    // Filter to results that share at least half the words
    const threshold = Math.max(1, Math.ceil(words.length / 2));
    const filtered = matches.filter((doc) => {
      const docWords = doc.title.toLowerCase().split(/\s+/);
      const matched = words.filter((w) =>
        docWords.some((dw) => dw.includes(w)),
      ).length;
      return matched >= threshold;
    });

    return res.status(200).json({ success: true, data: filtered });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  spotlightSearchHandler,
  linkPreviewHandler,
  similarTitleHandler,
};
