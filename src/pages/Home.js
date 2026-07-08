import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getModules, checkMockAttempt } from "../services/api";
import "./Home.css";
import landing from "../logos/landingillustration1.png";

// features icon
import easyIcon from "../logos/features/easy.png";
import time from "../logos/features/time.png";
import secure from "../logos/features/secure.png";
import improve from "../logos/features/improve.png";
import performance from "../logos/features/performance.png";
import prepare from "../logos/features/prepare.png";

function Home() {
  const [modules, setModules] = useState([]);
  const nav = useNavigate();
  const location = useLocation();
  const modulesRef = useRef(null);


  const user = sessionStorage.getItem("user");

  // ================= LOAD MODULES =================
  useEffect(() => {
    getModules().then(setModules);
  }, []);

  // ================= SCROLL TO MODULES IF HASH EXISTS =================
  useEffect(() => {
  if (
    location.hash === "#modules-section" &&
    modules.length > 0 &&
    modulesRef.current
  ) {
    // ⏱ wait for layout to fully settle
    setTimeout(() => {
      modulesRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 200);
  }
}, [location, modules]);


  // ================= NAVIGATION HANDLERS =================
  const startPractice = (moduleId) => {
    if (!user) nav("/login");
    else nav(`/quiz/${moduleId}`);
  };

  const startDemo = (moduleId) => {
    nav(`/demo/${moduleId}`);
  };

//   const startMock = async (moduleId, mockNo) => {
//     const userObj = JSON.parse(sessionStorage.getItem("user"));

//     const res = await checkMockAttempt(
//       userObj.userId,
//       moduleId,
//       mockNo
//     );

//     if (res.attempted) {
//       const confirmRetry = window.confirm(
//         `You have already attempted Mock ${mockNo}.
// Do you want to reattempt?`
//       );
//       if (!confirmRetry) return;
//     }

//     nav(`/mock/${moduleId}/${mockNo}`);
//   };

const startMock = (moduleId, mockNo) => {
  nav(`/mock/${moduleId}/${mockNo}`);
};

  return (
    <div className="page-container">

      <h2 className="page-title text-center mt-5">
        CDAC DAC – Online Quiz & Mock Tests
      </h2>

      {/* ================= HERO SECTION ================= */}
      <div className="hero-container">
        <div className="hero-left">
          <h1>Online Quiz Management System</h1>

          <p>
            Conduct quizzes and manage practice tests online with ease.
            Designed especially for CDAC DAC students to improve accuracy
            and performance.
          </p>

          <div className="hero-buttons">
            <button
              className="btn btn-primary px-5"
              onClick={() =>
                document
                  .getElementById("modules-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="hero-right">
          <img src={landing} alt="Quiz Illustration" />
        </div>
      </div>

      {/* ================= KEY FEATURES ================= */}
      <h3 className="section-title">Key Features</h3>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <img src={easyIcon} alt="Easy to use" />
          </div>
          Easy to use
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src={secure} alt="Secure platform" />
          </div>
          Secure platform
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src={performance} alt="Analytics" />
          </div>
          Real time performance analytics
        </div>
      </div>

      {/* ================= WHY CHOOSE US ================= */}
      <h3 className="section-title">Why Choose Us?</h3>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <img src={time} alt="Save time" />
          </div>
          Save time with automated evaluations
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src={improve} alt="Improve learning" />
          </div>
          Improve learning outcomes with detailed insights
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src={prepare} alt="Exam prep" />
          </div>
          Makes CCEE-DAC Exam preparation easier
        </div>
      </div>

      {/* ================= MODULE SECTION ================= */}
      <div id="modules-section" ref={modulesRef} className="row g-4">

        {modules.map((m) => (
          <div className="col-md-4" key={m.moduleId}>
            <div className="module-card">

              <h5 className="module-title">{m.moduleName}</h5>

              {!user && (
                <button
                  className="btn btn-outline-primary w-100 mb-2"
                  onClick={() => startDemo(m.moduleId)}
                >
                  Attempt Free Test
                </button>
              )}

              <button
                className="btn btn-primary w-100"
                onClick={() => startPractice(m.moduleId)}
              >
                Practice Test
              </button>

              <hr />

              <div className={`mock-section ${!user ? "blur-disabled" : ""}`}>
                <p className="mock-title">Mock Tests</p>

                <div className="mock-buttons">
                  {[1, 2, 3, 4, 5].map((mockId) => (
                    <button
                      key={mockId}
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => startMock(m.moduleId, mockId)}
                    >
                      Mock {mockId}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Home;
