import React, { useMemo } from "react";

function getLastNMonths(n = 6) {
  const res = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    res.push({
      label: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return res;
}

export default function HistoryAnalytics({ users = [] }) {
  const data = useMemo(() => {
    const all = [];
    users.forEach((u) => {
      (u.carBooking || []).forEach((b) => all.push({ ...b, type: "car" }));
      (u.packageBook || []).forEach((b) => all.push({ ...b, type: "package" }));
    });

    const totalBookings = all.length;
    const totalRevenue = all.reduce((s, b) => s + (Number(b.price) || 0), 0);
    const byType = {
      car: all.filter((a) => a.type === "car").length,
      package: all.filter((a) => a.type === "package").length,
    };

    const months = getLastNMonths(6);
    const monthCounts = months.map((m) => {
      const count = all.filter((b) => {
        const d = new Date(b.bookingDate);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      }).length;
      return count;
    });

    const monthRevenue = months.map((m) => {
      return all
        .filter((b) => {
          const d = new Date(b.bookingDate);
          return d.getMonth() === m.month && d.getFullYear() === m.year;
        })
        .reduce((s, b) => s + (Number(b.price) || 0), 0);
    });

    return {
      totalBookings,
      totalRevenue,
      byType,
      months,
      monthCounts,
      monthRevenue,
    };
  }, [users]);

  const maxCount = Math.max(...data.monthCounts, 1);

  const sparkPoints = data.monthCounts
    .map(
      (c, i) =>
        `${(i / (data.monthCounts.length - 1)) * 100},${100 - (c / maxCount) * 100}`,
    )
    .join(" ");

  const packagePct = data.totalBookings
    ? (data.byType.package / data.totalBookings) * 100
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 fade-in">
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="stat-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Bookings</div>
              <div className="text-3xl font-bold text-slate-800 mt-1">
                {data.totalBookings}
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-blue-400 to-indigo-600 text-white">
              📈
            </div>
          </div>
          <div className="mt-4">
            <svg
              viewBox="0 0 100 30"
              preserveAspectRatio="none"
              className="w-full h-12"
            >
              <polyline
                points={sparkPoints}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2"
                className="sparkline"
              />
            </svg>
            <div className="text-xs text-gray-500 mt-2">Last 6 months</div>
          </div>
        </div>

        <div className="stat-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-3xl font-bold text-emerald-600 mt-1">
                ₹{data.totalRevenue}
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-green-400 to-emerald-600 text-white">
              💰
            </div>
          </div>
          <div className="mt-4 flex gap-2 items-center">
            <div className="donut" aria-hidden>
              <svg viewBox="0 0 36 36" className="w-20 h-20">
                <path
                  className="donut-ring"
                  d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eef2ff"
                  strokeWidth="4"
                />
                <path
                  className="donut-segment"
                  stroke="#7c3aed"
                  strokeWidth="4"
                  strokeDasharray={`${packagePct} ${100 - packagePct}`}
                  d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                />
                <text x="18" y="20" textAnchor="middle" className="donut-text">
                  {Math.round(packagePct)}%
                </text>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">Booking Types</div>
              <div className="mt-2">
                <div className="text-sm">
                  Packages: <strong>{data.byType.package}</strong>
                </div>
                <div className="text-sm">
                  Cars: <strong>{data.byType.car}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Monthly Breakdown</div>
              <div className="text-lg font-semibold text-slate-800 mt-1">
                {data.months.map((m) => m.label).join(" • ")}
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
              📊
            </div>
          </div>

          <div className="mt-4 grid grid-cols-6 gap-2 items-end h-28">
            {data.monthCounts.map((c, i) => (
              <div
                key={i}
                className="bar"
                style={{ height: `${(c / maxCount) * 100}%` }}
                title={`${data.months[i].label}: ${c}`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Revenue Chart */}
      <div className="mt-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">Revenue (Last 6 months)</div>
            <div className="text-2xl font-bold text-slate-800">
              ₹{data.monthRevenue.reduce((s, n) => s + n, 0)}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: ₹{data.totalRevenue}
          </div>
        </div>

        <div className="revenue-chart">
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="w-full"
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* axes grid */}
            <g className="grid-lines" stroke="#f1f5f9" strokeWidth="0.3">
              <line x1="0" y1="8" x2="100" y2="8" />
              <line x1="0" y1="18" x2="100" y2="18" />
              <line x1="0" y1="28" x2="100" y2="28" />
            </g>
            {/* compute points */}
            {(() => {
              const vals = data.monthRevenue;
              const max = Math.max(...vals, 1);
              const n = vals.length;
              const points = vals.map((v, i) => {
                const x = (i / (n - 1)) * 100;
                const y = 35 - (v / max) * 26; // pad top/bottom
                return { x, y };
              });

              const lineD = points
                .map(
                  (p, i) =>
                    `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
                )
                .join(" ");

              const areaD = `${lineD} L 100 36 L 0 36 Z`;

              return (
                <g>
                  <path
                    d={areaD}
                    fill="url(#areaGrad)"
                    className="revenue-area"
                  />
                  <path
                    d={lineD}
                    fill="none"
                    stroke="#6d28d9"
                    strokeWidth="0.9"
                    className="revenue-line"
                  />
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="0.7" fill="#6d28d9" />
                  ))}
                  <g className="x-labels" fill="#94a3b8" fontSize="2.5">
                    {data.months.map((m, i) => (
                      <text
                        key={i}
                        x={(i / (data.months.length - 1)) * 100}
                        y="39"
                        textAnchor="middle"
                      >
                        {m.label}
                      </text>
                    ))}
                  </g>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
}
