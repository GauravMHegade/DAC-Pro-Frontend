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

  useEffect(() => {
    fetch(`https://dac-pro-backend.onrender.com/api/quiz/demo/${moduleId}`)
      .then(res => res.json())
      .then(setQuestions);
  }, [moduleId]);

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

  if (questions.length === 0) {
    return <h4 className="text-center mt-5">Loading Demo Test...</h4>;
  }

  // ================= RESULT VIEW =================
  if (submitted) {
    return (
      <div className="page-container">
        <div className="card p-4 shadow text-center">
          <h3>Demo Practice Test Result</h3>

          <p><b>Total Questions:</b> {result.total}</p>
          <p><b>Attempted:</b> {result.attempted}</p>
          <p><b>Unattempted:</b> {result.unattempted}</p>
          <p><b>Correct Answers:</b> {result.score}</p>

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
    <div className="page-container">
      <h4 className="mb-3">Practice Test (Demo)</h4>

      <div className="row">
        {/* LEFT PANEL */}
        <div className="col-md-8">
          <div className="card p-4 shadow">
            <h5>Question {current + 1} of {questions.length}</h5>

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
                    answers[i] ? "btn-success" : "btn-outline-danger"
                  }`}
                  onClick={() => setCurrent(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <hr />

            <p><b>Attempted:</b> {Object.keys(answers).length}</p>
            <p><b>Unattempted:</b> {questions.length - Object.keys(answers).length}</p>

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
