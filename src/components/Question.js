function Question({ q, index, answers, setAnswers }) {
  const handleChange = (option) => {
    setAnswers({
      ...answers,
      [index]: option
    });
  };

  return (
    <div className="mt-3">
      {/* QUESTION TEXT */}
      <p className="fw-semibold">
        {index + 1}. {q.questionText}
      </p>

      {/* OPTIONS */}
      <div className="form-check mt-2">
        <input
          className="form-check-input"
          type="radio"
          name={`q${index}`}
          id={`q${index}A`}
          checked={answers[index] === "A"}
          onChange={() => handleChange("A")}
        />
        <label className="form-check-label" htmlFor={`q${index}A`}>
          {q.optionA}
        </label>
      </div>

      <div className="form-check mt-2">
        <input
          className="form-check-input"
          type="radio"
          name={`q${index}`}
          id={`q${index}B`}
          checked={answers[index] === "B"}
          onChange={() => handleChange("B")}
        />
        <label className="form-check-label" htmlFor={`q${index}B`}>
          {q.optionB}
        </label>
      </div>

      <div className="form-check mt-2">
        <input
          className="form-check-input"
          type="radio"
          name={`q${index}`}
          id={`q${index}C`}
          checked={answers[index] === "C"}
          onChange={() => handleChange("C")}
        />
        <label className="form-check-label" htmlFor={`q${index}C`}>
          {q.optionC}
        </label>
      </div>

      <div className="form-check mt-2">
        <input
          className="form-check-input"
          type="radio"
          name={`q${index}`}
          id={`q${index}D`}
          checked={answers[index] === "D"}
          onChange={() => handleChange("D")}
        />
        <label className="form-check-label" htmlFor={`q${index}D`}>
          {q.optionD}
        </label>
      </div>
    </div>
  );
}

export default Question;
