import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShieldAlert, ImagePlay, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/assets", icon: ImagePlay, label: "Assets" },
  { to: "/violations", icon: ShieldAlert, label: "Violations" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-56"
      } transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        {!collapsed && (
          <span className="text-white font-bold text-lg tracking-tight">
            Sports<span className="text-blue-500">Shield</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1 mt-4 px-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto px-4 py-4 border-t border-gray-800">
        {!collapsed && (
          <p className="text-xs text-gray-600">Sports Shield v1.0</p>
        )}
      </div>
    </aside>
  );
}