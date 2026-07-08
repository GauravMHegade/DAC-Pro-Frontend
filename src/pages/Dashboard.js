import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import {
  getAttemptSummary,
  getLatestResultStats,
  getModules
} from "../services/api";

ChartJS.register(ArcElement, Tooltip, Legend);

// 🎨 PURPLE THEME COLORS
const THEME_COLORS = [
  "#ba90e7",
  "#8a86fb",
  "#a78bfa",
  "#c4b5fd",
  "#ddd6fe",
  "#b794f4",
  "#9f7aea",
  "#805ad5",
  "#6b46c1"
];

function Dashboard() {
  const nav = useNavigate();

  // ✅ Make user stable (IMPORTANT FIX)
  const [user] = useState(() =>
    JSON.parse(sessionStorage.getItem("user"))
  );

  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [modules, setModules] = useState([]);

  // ✅ FIXED useEffect (RUNS ONLY ONCE)
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const attemptData = await getAttemptSummary(user.userId);
        const statsData = await getLatestResultStats(user.userId);
        const moduleData = await getModules();

        setAttempts(attemptData || []);
        setStats(statsData);
        setModules(moduleData || []);
      } catch (err) {
        console.error("Dashboard API Error:", err);
      }
    };

    loadData();
  }, []); // ✅ VERY IMPORTANT FIX

  // ✅ Safety checks
  if (!user)
    return <h4 className="text-center mt-5">Please login first</h4>;

  if (!stats)
    return <h4 className="text-center mt-5">Loading Dashboard...</h4>;

  // ================= PIE CHART =================

  const moduleMap = {};

  attempts.forEach(a => {
    const module = modules.find(m => m.moduleId === a.moduleId);

    if (!module) return;

    const name = module.moduleName;

    if (!moduleMap[name]) {
      moduleMap[name] = 0;
    }

    moduleMap[name] += 1;
  });

  const pieData = {
    labels: Object.keys(moduleMap),
    datasets: [
      {
        data: Object.values(moduleMap),
        backgroundColor: Object.keys(moduleMap).map(
          (_, index) => THEME_COLORS[index % THEME_COLORS.length]
        ),
        borderColor: "#ffffff",
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="page-container">

      {/* HEADER */}
      <h3>
        Welcome, {user.fullName}{" "}
        <span className="fs-5">(UserID: {user.userId})</span>
      </h3>

      <div className="row g-4">

        {/* CURRENT RESULT */}
        <div className="col-md-4">
          <div className="card p-3 h-100 dashboard-card">
            <h5>Current Test Result</h5>

            <p className="mt-2">
              <b>{stats.moduleName}</b>
            </p>

            <p>Score: <b>{stats.score} / 40</b></p>
            <p>Attempted: {stats.attempted}</p>
            <p>Unattempted: {stats.unattempted}</p>

            <div className="d-grid gap-2 mt-3">
              <button
                className="dashboard-practice-btn dashboard-btn"
                onClick={() => nav("/#modules-section")}
              >
                Start Test
              </button>
            </div>
          </div>
        </div>

        {/* PERFORMANCE */}
        <div className="col-md-4">
          <div className="card p-3 h-100 dashboard-card performance-center">
            <h5>Performance Summary</h5>

            <p>Total Tests: <b>{stats.totalTests}</b></p>
            <p>Practice Tests: <b>{stats.practiceTests}</b></p>
            <p>Mock Tests: <b>{stats.mockTests}</b></p>
            <p>Best Score: <b>{stats.bestScore}</b></p>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="col-md-4">
          <div className="card p-3 h-100 dashboard-card">
            <h5 className="text-center">Test Attempts Distribution</h5>
            <Pie data={pieData} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;