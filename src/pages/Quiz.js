import { useEffect, useState, useRef } from "react";
import { getQuestions, saveResult } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";

function Quiz() {
  const { moduleId } = useParams();
  const nav = useNavigate();

  // ================= STATE =================
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔑 REF TO ALWAYS HOLD LATEST ANSWERS
  const answersRef = useRef({});

  const user = JSON.parse(sessionStorage.getItem("user"));

  // ================= KEEP REF UPDATED =================
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // ================= LOAD QUESTIONS =================
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);

        const data = await getQuestions(moduleId);

        console.log("Practice questions:", data);

        // Make sure questions is always an array
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error loading practice questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [moduleId]);

  // ================= CLEAR ANSWER =================
  const clearAnswer = () => {
    const copy = { ...answers };
    delete copy[current];
    setAnswers(copy);
  };

  // ================= SUBMIT TEST =================
  const submitTestInternal = async (isAuto = false) => {
    const latestAnswers = answersRef.current;

    const attempted = Object.keys(latestAnswers).length;
    const unattempted = questions.length - attempted;

    if (!isAuto && unattempted > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unattempted} unattempted questions.\nDo you want to submit?`
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
      testType: "Practice"
    });

    sessionStorage.setItem("score", score);

    nav("/dashboard");
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="container text-center mt-5">
        <h3>Loading Practice Test...</h3>
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
            There are no questions available for this module.
          </p>

          <button
            className="btn btn-primary px-4 mt-3"
            onClick={() => nav("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ================= CURRENT QUESTION =================
  if (!questions[current]) {
    return (
      <div className="container text-center mt-5">
        <div className="card p-5 shadow">
          <h3>No questions found</h3>

          <p className="text-muted mt-3">
            The selected question is not available.
          </p>

          <button
            className="btn btn-primary px-4 mt-3"
            onClick={() => nav("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  const attemptedCount = Object.keys(answers).length;
  const unattemptedCount =
    questions.length - attemptedCount;

  // ================= MAIN QUIZ UI =================
  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="mb-3 px-3 text-white">
        <h5>Welcome, {user.fullName}</h5>
        <p>Practice Test</p>
      </div>

      <div className="row">

        {/* ================= QUESTION AREA ================= */}
        <div className="col-md-9">
          <div className="card p-4">

            <h5>
              Question {current + 1} of {questions.length}
            </h5>

            <p className="mt-3">
              {q.questionText}
            </p>

            {["A", "B", "C", "D"].map(opt => (
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

          {/* ================= NAV BUTTONS ================= */}
          <div className="d-flex justify-content-between mt-3">

            <button
              className="quiz-btn-prev"
              disabled={current === 0}
              onClick={() =>
                setCurrent(current - 1)
              }
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
              onClick={() =>
                submitTestInternal(false)
              }
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
                  onClick={() =>
                    setCurrent(i)
                  }
                >
                  {i + 1}
                </button>
              ))}

            </div>

            <hr />

            <div className="mt-3">

              {/* Attempted */}
              <div className="mb-2">

                <div className="d-flex justify-content-between">

                  <small>
                    <b>Attempted</b>
                  </small>

                  <small>
                    {attemptedCount}
                  </small>

                </div>

                <div
                  className="progress"
                  style={{ height: "22px" }}
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

                <div className="d-flex justify-content-between">

                  <small>
                    <b>Unattempted</b>
                  </small>

                  <small>
                    {unattemptedCount}
                  </small>

                </div>

                <div
                  className="progress"
                  style={{ height: "22px" }}
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
    </div>
  );
}

export default Quiz;