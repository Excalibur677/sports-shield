import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Upload, ScanSearch, Trash2, ImagePlay, X, ExternalLink } from "lucide-react";

const API = "https://sports-shield-backend.onrender.com/api";

const statusColors = {
  flagged: "bg-red-900 text-red-300",
  reviewed: "bg-yellow-900 text-yellow-300",
  resolved: "bg-green-900 text-green-300",
  false_positive: "bg-gray-700 text-gray-300",
};

function ViolationDrawer({ asset, onClose, onStatusUpdate }) {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${API}/violations/${asset.assetId}`);
        setViolations(res.data.violations || []);
      } catch {
        toast.error("Failed to load violations");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [asset.assetId]);

  async function updateStatus(violationId, status) {
    try {
      await axios.patch(`${API}/violations/${violationId}/status`, { status });
      toast.success("Status updated");
      setViolations((prev) =>
        prev.map((v) => (v.violationId === violationId ? { ...v, status } : v))
      );
      onStatusUpdate();
    } catch {
      toast.error("Failed to update");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black bg-opacity-60" onClick={onClose} />
      <div className="w-full max-w-lg bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <p className="text-white font-semibold">{asset.assetName}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {asset.sport} · {asset.organization}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading violations...</p>
          ) : violations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
              <ImagePlay size={36} className="mb-3" />
              <p className="text-sm">No violations found for this asset</p>
              <p className="text-xs mt-1 text-gray-700">Try scanning it first</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-gray-400 text-xs">
                {violations.length} violation{violations.length > 1 ? "s" : ""} detected
              </p>
              {violations.map((v) => (
                <div key={v.violationId} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-white text-sm font-medium">{v.domain}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{v.title}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusColors[v.status] || "bg-gray-700 text-gray-300"}`}>
                      {v.status.replace("_", " ")}
                    </span>
                  </div>

                  {v.thumbnail && (
                    <img
                      src={v.thumbnail}
                      alt="thumbnail"
                      className="w-full h-28 object-cover rounded-lg border border-gray-700 mb-3"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>
                      Confidence:{" "}
                      <span className={v.confidenceScore > 75 ? "text-red-400 font-semibold" : "text-yellow-400 font-semibold"}>
                        {v.confidenceScore}%
                      </span>
                    </span>
                    <span>{new Date(v.detectedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-col gap-1 mt-2 mb-3">
                    {v["pageUrl"] && (
                      <a
                        href={v["pageUrl"]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 text-xs hover:text-blue-300 transition"
                      >
                        <ExternalLink size={11} />
                        View Page Where Found
                      </a>
                    )}
                    {v["sourceUrl"] && v["sourceUrl"] !== v["pageUrl"] && (
                      <a
                        href={v["sourceUrl"]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 text-xs hover:text-blue-300 transition"
                      >
                        <ExternalLink size={11} />
                        View Source
                      </a>
                    )}
                    {v["directImageUrl"] && (
                      <a
                        href={v["directImageUrl"]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-gray-400 text-xs hover:text-gray-300 transition"
                      >
                        <ExternalLink size={11} />
                        View Direct Image
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {v.status !== "resolved" && (
                      <button
                        onClick={() => updateStatus(v.violationId, "resolved")}
                        className="px-3 py-1 bg-green-900 hover:bg-green-800 text-green-300 rounded-lg text-xs transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {v.status !== "reviewed" && (
                      <button
                        onClick={() => updateStatus(v.violationId, "reviewed")}
                        className="px-3 py-1 bg-yellow-900 hover:bg-yellow-800 text-yellow-300 rounded-lg text-xs transition"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    {v.status !== "false_positive" && (
                      <button
                        onClick={() => updateStatus(v.violationId, "false_positive")}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition"
                      >
                        False Positive
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [form, setForm] = useState({
    assetName: "",
    sport: "",
    organization: "",
    file: null,
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    try {
      const res = await axios.get(`${API}/assets`);
      setAssets(res.data.assets || []);
    } catch {
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!form.file || !form.assetName) {
      toast.error("Please fill in asset name and select a file");
      return;
    }
    const data = new FormData();
    data.append("file", form.file);
    data.append("assetName", form.assetName);
    data.append("sport", form.sport);
    data.append("organization", form.organization);

    setUploading(true);
    try {
      await axios.post(`${API}/assets/upload`, data);
      toast.success("Asset uploaded successfully!");
      setForm({ assetName: "", sport: "", organization: "", file: null });
      fetchAssets();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleScan(assetId) {
    setScanning(assetId);
    try {
      const res = await axios.post(`${API}/scan/${assetId}`);
      toast.success(res.data.message);
      fetchAssets();
    } catch {
      toast.error("Scan failed");
    } finally {
      setScanning(null);
    }
  }

  async function handleDelete(assetId) {
    try {
      await axios.delete(`${API}/assets/${assetId}`);
      toast.success("Asset deleted");
      fetchAssets();
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="p-8">
      {selectedAsset && (
        <ViolationDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onStatusUpdate={fetchAssets}
        />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Assets</h1>
        <p className="text-gray-400 text-sm mt-1">
          Upload and manage your official sports media
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-4">Upload New Asset</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Asset Name *"
            value={form.assetName}
            onChange={(e) => setForm({ ...form, assetName: e.target.value })}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Sport (e.g. Cricket, Football)"
            value={form.sport}
            onChange={(e) => setForm({ ...form, sport: e.target.value })}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Organization (e.g. IPL, FIFA)"
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            className="bg-gray-800 border border-gray-700 text-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload Asset"}
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Your Assets</h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading assets...</p>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <ImagePlay size={40} className="mb-3" />
            <p>No assets uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left pb-3">Name</th>
                  <th className="text-left pb-3">Sport</th>
                  <th className="text-left pb-3">Organization</th>
                  <th className="text-left pb-3">Scans</th>
                  <th className="text-left pb-3">Violations</th>
                  <th className="text-left pb-3">Uploaded</th>
                  <th className="text-left pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.assetId} className="border-b border-gray-800 hover:bg-gray-800 transition">
                    <td className="py-3">
                      <button
                        onClick={() => setSelectedAsset(asset)}
                        className="text-white font-medium hover:text-blue-400 transition text-left"
                      >
                        {asset.assetName}
                      </button>
                    </td>
                    <td className="py-3 text-gray-400">{asset.sport}</td>
                    <td className="py-3 text-gray-400">{asset.organization}</td>
                    <td className="py-3 text-gray-400">{asset.scanCount}</td>
                    <td className="py-3">
                      <button
                        onClick={() => setSelectedAsset(asset)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition hover:opacity-80 ${
                          asset.violationCount > 0
                            ? "bg-red-900 text-red-300"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {asset.violationCount} {asset.violationCount === 1 ? "violation" : "violations"}
                      </button>
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(asset.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleScan(asset.assetId)}
                          disabled={scanning === asset.assetId}
                          className="flex items-center gap-1 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          <ScanSearch size={13} />
                          {scanning === asset.assetId ? "Scanning..." : "Scan"}
                        </button>
                        <button
                          onClick={() => handleDelete(asset.assetId)}
                          className="flex items-center gap-1 bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
