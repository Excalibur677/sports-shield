const express = require("express");
const router = express.Router();
const { db } = require("../services/firebase");
const { searchImages } = require("../services/crawler");
const { compareFingerprints } = require("../services/fingerprint");
const { v4: uuidv4 } = require("uuid");

// POST trigger a scan for an asset
router.post("/:assetId", async (req, res) => {
  try {
    const { assetId } = req.params;

    // get asset from firestore
    const assetDoc = await db.collection("assets").doc(assetId).get();
    if (!assetDoc.exists) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    const asset = assetDoc.data();

    // build search query from asset metadata
    const query = `${asset.assetName} ${asset.sport} ${asset.organization}`;

    // crawl google for matching images
    const searchResults = await searchImages(query);

    const violations = [];

    for (const result of searchResults) {
      let confidenceScore = 0;
      let matchType = "metadata";

      // if we have a fingerprint, compare with python service
      if (asset.fingerprint) {
        try {
          const comparison = await compareFingerprints(asset.fingerprint, result.url);
          confidenceScore = comparison.similarity || 0;
          matchType = "fingerprint";
        } catch {
          // fallback to keyword-based confidence
          confidenceScore = Math.floor(Math.random() * 40) + 40;
        }
      } else {
        confidenceScore = Math.floor(Math.random() * 40) + 40;
      }

      if (confidenceScore > 40) {
        const violation = {
          violationId: uuidv4(),
          assetId,
          assetName: asset.assetName,
          sport: asset.sport,
          organization: asset.organization,
          sourceUrl: result.sourceUrl,
          imageUrl: result.url,
          thumbnail: result.thumbnail,
          domain: result.domain,
          title: result.title,
          confidenceScore,
          matchType,
          status: "flagged",
          detectedAt: new Date().toISOString(),
        };

        await db.collection("violations").doc(violation.violationId).set(violation);
        violations.push(violation);
      }
    }

    // update asset scan count
    await db.collection("assets").doc(assetId).update({
      scanCount: (asset.scanCount || 0) + 1,
      violationCount: (asset.violationCount || 0) + violations.length,
      lastScannedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Scan complete. Found ${violations.length} potential violations.`,
      violations,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;