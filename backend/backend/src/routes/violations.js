const express = require("express");
const router = express.Router();
const { db } = require("../services/firebase");

// GET all violations
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("violations")
      .orderBy("detectedAt", "desc")
      .get();

    const violations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, violations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET violations for a specific asset
// GET violations for a specific asset
router.get("/:assetId", async (req, res) => {
  try {
    const { assetId } = req.params;
    
    // skip if assetId is "all" 
    if (assetId === "all") {
      return res.status(400).json({ success: false, message: "Invalid assetId" });
    }

    const snapshot = await db
      .collection("violations")
      .where("assetId", "==", assetId)
      .get();

    const violations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, violations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update violation status (flagged -> reviewed -> resolved)
router.patch("/:violationId/status", async (req, res) => {
  try {
    const { violationId } = req.params;
    const { status } = req.body;

    const allowed = ["flagged", "reviewed", "resolved", "false_positive"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    await db.collection("violations").doc(violationId).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "Violation status updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// POST create a test violation (for demo purposes)
router.post("/", async (req, res) => {
  try {
    const violation = req.body;
    await db.collection("violations").doc(violation.violationId).set(violation);
    res.json({ success: true, message: "Violation created", violation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE all violations (for testing/reset)
router.delete("/all", async (req, res) => {
  try {
    const snapshot = await db.collection("violations").get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    res.json({ success: true, message: `Deleted ${snapshot.docs.length} violations` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;