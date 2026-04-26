import { useEffect, useState } from "react";
import { ShieldAlert, ImagePlay, ScanSearch, CheckCircle } from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [a, v] = await Promise.all([
          axios.get(`${API}/assets`),
          axios.get(`${API}/violations`),
        ]);
        setAssets(a.data.assets || []);
        setViolations(v.data.violations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const resolved = violations.filter((v) => v.status === "resolved").length;
  const flagged = violations.filter((v) => v.status === "flagged").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Overview of your protected sports media assets
        </p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={ImagePlay}
            label="Total Assets"
            value={assets.length}
            color="bg-blue-600"
          />
          <StatCard
            icon={ScanSearch}
            label="Total Scans"
            value={assets.reduce((a, b) => a + (b.scanCount || 0), 0)}
            color="bg-purple-600"
          />
          <StatCard
            icon={ShieldAlert}
            label="Violations Found"
            value={flagged}
            color="bg-red-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Resolved"
            value={resolved}
            color="bg-green-600"
          />
        </div>
      )}

      {/* Recent Violations */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold text-lg mb-4">
          Recent Violations
        </h2>
        {violations.length === 0 ? (
          <p className="text-gray-500 text-sm">No violations detected yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left pb-3">Asset</th>
                  <th className="text-left pb-3">Domain</th>
                  <th className="text-left pb-3">Confidence</th>
                  <th className="text-left pb-3">Status</th>
                  <th className="text-left pb-3">Detected</th>
                </tr>
              </thead>
              <tbody>
                {violations.slice(0, 8).map((v) => (
                  <tr
                    key={v.violationId}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="py-3 text-white">{v.assetName}</td>
                    <td className="py-3 text-gray-400">{v.domain}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          v.confidenceScore > 75
                            ? "bg-red-900 text-red-300"
                            : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {v.confidenceScore}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          v.status === "resolved"
                            ? "bg-green-900 text-green-300"
                            : v.status === "flagged"
                            ? "bg-red-900 text-red-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(v.detectedAt).toLocaleDateString()}
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