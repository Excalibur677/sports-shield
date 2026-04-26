require("dotenv").config();
const express = require("express");
const cors = require("cors");

const assetRoutes = require("./routes/assets");
const scanRoutes = require("./routes/scan");
const violationRoutes = require("./routes/violations");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/assets", assetRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/violations", violationRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Sports Shield API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});