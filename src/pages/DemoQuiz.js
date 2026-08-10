import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Question from "../components/Question";

function DemoQuiz() {
  const { moduleId } = useParams();
  const nav = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD QUESTIONS =================
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:8282/api/quiz/demo/${moduleId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load demo questions");
        }

        const data = await response.json();

        // Make sure questions is always an array
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error loading demo questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [moduleId]);

  // ================= SUBMIT TEST =================
  const submitTest = () => {
    let score = 0;
    let attempted = 0;

    questions.forEach((q, i) => {
      if (answers[i]) {
        attempted++;

        if (answers[i] === q.correctOption) {
          score++;
        }
      }
    });

    setResult({
      total: questions.length,
      attempted,
      unattempted: questions.length - attempted,
      score
    });

    setSubmitted(true);
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="container text-center mt-5">
        <h3>Loading Demo Test...</h3>
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

          <div className="mt-3">
            <button
              className="btn btn-primary px-4"
              onClick={() => nav("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= RESULT VIEW =================
  if (submitted) {
    return (
      <div className="container mt-4">
        <div className="card p-4 shadow">
          <h3>Demo Practice Test Result</h3>

          <p>
            <b>Total Questions:</b> {result.total}
          </p>

          <p>
            <b>Attempted:</b> {result.attempted}
          </p>

          <p>
            <b>Unattempted:</b> {result.unattempted}
          </p>

          <p>
            <b>Correct Answers:</b> {result.score}
          </p>

          <h4 className="text-success mt-3">
            Score: {result.score} / {result.total}
          </h4>

          <p className="text-dark mt-3 fs-5">
            🔒 Please login to access full practice tests and mock exams.
          </p>

          <div className="text-center mt-3">
            <button
              className="btn btn-primary btn-sm px-4 fs-6"
              onClick={() => nav("/login")}
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN QUIZ UI =================
  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-white">Practice Test (Demo)</h3>

      <div className="row">
        {/* LEFT PANEL */}
        <div className="col-md-8">
          <div className="card p-4 shadow">
            <h5>
              Question {current + 1} of {questions.length}
            </h5>

            <Question
              q={questions[current]}
              index={current}
              answers={answers}
              setAnswers={setAnswers}
            />

            <div className="d-flex justify-content-between mt-4">
              <button
                className="btn btn-secondary"
                disabled={current === 0}
                onClick={() => setCurrent(current - 1)}
              >
                Previous
              </button>

              <button
                className="btn btn-warning"
                onClick={() => {
                  const temp = { ...answers };
                  delete temp[current];
                  setAnswers(temp);
                }}
              >
                Clear Answer
              </button>

              <button
                className="btn btn-secondary"
                disabled={current === questions.length - 1}
                onClick={() => setCurrent(current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-md-4">
          <div className="card p-3 shadow">
            <h6 className="text-center">Question Status</h6>

            <div className="d-flex flex-wrap gap-2 justify-content-center">
              {questions.map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${
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

            <p>
              <b>Attempted:</b> {Object.keys(answers).length}
            </p>

            <p>
              <b>Unattempted:</b>{" "}
              {questions.length - Object.keys(answers).length}
            </p>

            <button
              className="btn btn-success w-100 mt-2"
              onClick={submitTest}
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoQuiz;