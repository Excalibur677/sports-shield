import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ShieldAlert, ExternalLink, Filter } from "lucide-react";

const API = "http://localhost:5000/api";

const statusColors = {
  flagged: "bg-red-900 text-red-300",
  reviewed: "bg-yellow-900 text-yellow-300",
  resolved: "bg-green-900 text-green-300",
  false_positive: "bg-gray-700 text-gray-300",
};

function ViolationCard({ v, onUpdate }) {
  const url = v.sourceUrl;
  const thumb = v.thumbnail;
  const score = v.confidenceScore;
  const color = score > 75 ? "text-red-400" : "text-yellow-400";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row gap-4">
      {thumb ? (
        <img
          src={thumb}
          alt="thumbnail"
          className="w-24 h-24 object-cover rounded-lg border border-gray-700 flex-shrink-0"
          onError={(e) => (e.target.style.display = "none")}
        />
      ) : (
        <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
          <ShieldAlert size={24} className="text-gray-600" />
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="text-white font-semibold">{v.assetName}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {v.sport} · {v.organization}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[v.status] || "bg-gray-700 text-gray-300"}`}>
            {v.status.replace("_", " ")}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
          <span>Domain: <span className="text-white">{v.domain}</span></span>
          <span>Confidence: <span className={color}>{score}%</span></span>
          <span>Detected: <span className="text-white">{new Date(v.detectedAt).toLocaleDateString()}</span></span>
        </div>

        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2 transition"
          >
            <ExternalLink size={12} />
            View Source
          </a>
        ) : null}

        <div className="flex flex-wrap gap-2 mt-3">
          {v.status !== "resolved" && (
            <button
              onClick={() => onUpdate(v.violationId, "resolved")}
              className="px-3 py-1.5 bg-green-900 hover:bg-green-800 text-green-300 rounded-lg text-xs transition"
            >
              Mark Resolved
            </button>
          )}
          {v.status !== "reviewed" && (
            <button
              onClick={() => onUpdate(v.violationId, "reviewed")}
              className="px-3 py-1.5 bg-yellow-900 hover:bg-yellow-800 text-yellow-300 rounded-lg text-xs transition"
            >
              Mark Reviewed
            </button>
          )}
          {v.status !== "false_positive" && (
            <button
              onClick={() => onUpdate(v.violationId, "false_positive")}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs transition"
            >
              False Positive
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Violations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchViolations();
  }, []);

  async function fetchViolations() {
    try {
      const res = await axios.get(`${API}/violations`);
      setViolations(res.data.violations || []);
    } catch {
      toast.error("Failed to load violations");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(violationId, status) {
    try {
      await axios.patch(`${API}/violations/${violationId}/status`, { status });
      toast.success("Status updated");
      fetchViolations();
    } catch {
      toast.error("Failed to update status");
    }
  }

  const filtered = filter === "all" ? violations : violations.filter((v) => v.status === filter);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Violations</h1>
        <p className="text-gray-400 text-sm mt-1">
          All detected unauthorized uses of your media
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Filter size={16} className="text-gray-400" />
        {["all", "flagged", "reviewed", "resolved", "false_positive"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === s ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading violations...</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <ShieldAlert size={40} className="mb-3" />
          <p>No violations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((v) => (
            <ViolationCard key={v.violationId} v={v} onUpdate={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
