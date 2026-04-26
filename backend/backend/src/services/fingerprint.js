const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

// send image to python microservice and get back its hash
async function generateFingerprint(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const response = await axios.post(`${PYTHON_URL}/fingerprint`, form, {
    headers: form.getHeaders(),
  });

  return response.data;
}

// compare two hashes and get similarity score
async function compareFingerprints(hash1, hash2) {
  const response = await axios.post(`${PYTHON_URL}/compare`, {
    hash1,
    hash2,
  });

  return response.data;
}

module.exports = { generateFingerprint, compareFingerprints };