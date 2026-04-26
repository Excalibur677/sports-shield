const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { db } = require("../services/firebase");
const upload = require("../middleware/upload");
const { generateFingerprint } = require("../services/fingerprint");

// GET all assets
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("assets").orderBy("uploadedAt", "desc").get();
    const assets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, assets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST upload a new asset
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { assetName, sport, organization } = req.body;
    const assetId = uuidv4();
    const filePath = req.file.path;

    // generate fingerprint from python service
    let fingerprintData = null;
    try {
      fingerprintData = await generateFingerprint(filePath);
    } catch (err) {
      console.warn("Python service unavailable, skipping fingerprint:", err.message);
    }

    const assetDoc = {
      assetId,
      assetName: assetName || req.file.originalname,
      sport: sport || "General",
      organization: organization || "Unknown",
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: filePath,
      fingerprint: fingerprintData?.hash || null,
      uploadedAt: new Date().toISOString(),
      scanCount: 0,
      violationCount: 0,
      status: "active",
    };

    await db.collection("assets").doc(assetId).set(assetDoc);

    res.json({ success: true, message: "Asset uploaded successfully", asset: assetDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE an asset
router.delete("/:assetId", async (req, res) => {
  try {
    const { assetId } = req.params;
    await db.collection("assets").doc(assetId).delete();
    res.json({ success: true, message: "Asset deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;