import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMockQuestions, saveResult } from "../services/api";

function MockQuiz() {
  const { moduleId, mockNumber } = useParams();
  const navigate = useNavigate();

  // ================= STATE =================
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [time, setTime] = useState(3600); // 60 minutes
  const [loading, setLoading] = useState(true);

  const answersRef = useRef({});
  const timerRef = useRef(null);

  const user = JSON.parse(sessionStorage.getItem("user"));

  // ================= KEEP ANSWERS REF UPDATED =================
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // ================= LOAD MOCK QUESTIONS =================
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);

        const data = await getMockQuestions(
          moduleId,
          mockNumber
        );

        console.log(data);

        // Make sure questions is always an array
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error(
          "Error loading mock test questions:",
          error
        );

        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [moduleId, mockNumber]);

  // ================= START TIMER AFTER QUESTIONS LOAD =================
  useEffect(() => {
    if (questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          autoSubmit();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [questions]);

  // ================= AUTO SUBMIT =================
  const autoSubmit = async () => {
    alert(
      "Time is over. Mock test will be submitted automatically."
    );

    await submitTest(true);
  };

  // ================= SUBMIT =================
  const submitTest = async (isAuto = false) => {
    const latestAnswers = answersRef.current;

    const attempted = Object.keys(latestAnswers).length;
    const unattempted = questions.length - attempted;

    if (!isAuto && unattempted > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unattempted} unattempted questions.\nDo you want to submit the mock test?`
      );

      if (!confirmSubmit) return;
    }

    let score = 0;

    questions.forEach((q, i) => {
      const userAnswer = latestAnswers[i];
      const correctAnswer = q.correctOption;

      if (
        userAnswer &&
        correctAnswer &&
        userAnswer.trim().toUpperCase() ===
          correctAnswer.trim().toUpperCase()
      ) {
        score++;
      }
    });

    await saveResult({
      userId: user.userId,
      moduleId: parseInt(moduleId),
      score: score,
      attempted: attempted,
      unattempted: unattempted,
      testType: "Mock",
      mockNo: parseInt(mockNumber)
    });

    sessionStorage.setItem("score", score);

    navigate("/dashboard");
  };

  // ================= CLEAR ANSWER =================
  const clearAnswer = () => {
    const copy = { ...answers };

    delete copy[current];

    setAnswers(copy);
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="container text-center mt-5">
        <h3>Loading Mock Test...</h3>
      </div>
    );
  }

  // ================= NO QUESTIONS =================
  if (questions.length === 0) {
    return (
      <div className="container text-center mt-5">
        <div className="card p-5 shadow">
          <h3>No questions found</h3>

          <p className="text-muted mt-3">
            There are no questions available for Mock Test{" "}
            {mockNumber} in this module.
          </p>

          <div className="mt-3">
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];

  const attemptedCount = Object.keys(answers).length;

  const unattemptedCount =
    questions.length - attemptedCount;

  // ================= MAIN UI =================
  return (
    <div className="container">
      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-3 text-white">
        <h5>Welcome, {user.fullName}</h5>

        <h5 className="text-white">
          Time Left: {Math.floor(time / 60)}:
          {String(time % 60).padStart(2, "0")}
        </h5>
      </div>

      <div className="row">
        {/* ================= QUESTION AREA ================= */}
        <div className="col-md-9">
          <div className="card p-4">
            <h5>
              Mock Test {mockNumber} – Question{" "}
              {current + 1} of {questions.length}
            </h5>

            <p className="mt-3">{q.questionText}</p>

            {["A", "B", "C", "D"].map((opt) => (
              <div className="form-check" key={opt}>
                <input
                  className="form-check-input"
                  type="radio"
                  name={`q${current}`}
                  checked={answers[current] === opt}
                  onChange={() =>
                    setAnswers({
                      ...answers,
                      [current]: opt
                    })
                  }
                />

                <label className="form-check-label">
                  {q["option" + opt]}
                </label>
              </div>
            ))}
          </div>

          {/* ================= NAVIGATION ================= */}
          <div className="d-flex justify-content-between mt-3">
            <button
              className="quiz-btn-prev"
              disabled={current === 0}
              onClick={() => setCurrent(current - 1)}
            >
              Previous
            </button>

            <button
              className="quiz-btn-clear"
              disabled={!answers[current]}
              onClick={clearAnswer}
            >
              Clear Answer
            </button>

            <button
              className="quiz-btn-next"
              disabled={
                current === questions.length - 1
              }
              onClick={() =>
                setCurrent(current + 1)
              }
            >
              Next
            </button>

            <button
              className="quiz-btn-submit"
              onClick={() => submitTest(false)}
            >
              Submit Test
            </button>
          </div>
        </div>

        {/* ================= QUESTION STATUS ================= */}
        <div className="col-md-3">
          <div className="card p-3">
            <h6 className="text-center">
              Question Status
            </h6>

            <div className="d-flex flex-wrap justify-content-center">
              {questions.map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm m-1 ${
                    answers[i]
                      ? "btn-success"
                      : "btn-outline-danger"
                  }`}
                  onClick={() => setCurrent(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <hr />

            {/* Attempted */}
            <div className="mb-2">
              <small>
                <b>Attempted</b>
              </small>

              <div
                className="progress"
                style={{ height: "20px" }}
              >
                <div
                  className="progress-bar bg-success"
                  style={{
                    width: `${
                      (attemptedCount /
                        questions.length) *
                      100
                    }%`
                  }}
                >
                  {attemptedCount}
                </div>
              </div>
            </div>

            {/* Unattempted */}
            <div>
              <small>
                <b>Unattempted</b>
              </small>

              <div
                className="progress"
                style={{ height: "20px" }}
              >
                <div
                  className="progress-bar bg-danger"
                  style={{
                    width: `${
                      (unattemptedCount /
                        questions.length) *
                      100
                    }%`
                  }}
                >
                  {unattemptedCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockQuiz;