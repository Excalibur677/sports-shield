import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Upload, ScanSearch, Trash2, ImagePlay } from "lucide-react";

const API = "http://localhost:5000/api";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(null);
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Assets</h1>
        <p className="text-gray-400 text-sm mt-1">
          Upload and manage your official sports media
        </p>
      </div>

      {/* Upload Form */}
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

      {/* Assets Table */}
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
                  <tr
                    key={asset.assetId}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="py-3 text-white font-medium">
                      {asset.assetName}
                    </td>
                    <td className="py-3 text-gray-400">{asset.sport}</td>
                    <td className="py-3 text-gray-400">{asset.organization}</td>
                    <td className="py-3 text-gray-400">{asset.scanCount}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          asset.violationCount > 0
                            ? "bg-red-900 text-red-300"
                            : "bg-green-900 text-green-300"
                        }`}
                      >
                        {asset.violationCount}
                      </span>
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