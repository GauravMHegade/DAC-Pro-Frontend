import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminGetModules, adminAddModule, adminUpdateModule, adminDeleteModule,
  adminGetQuestions, adminAddQuestion, adminUpdateQuestion, adminDeleteQuestion,
  adminGetUsers, adminGetResults
} from "../services/api";
import "./AdminPanel.css";

const TABS = ["Modules", "Questions", "Users", "Results"];

function AdminPanel() {
  const nav = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Redirect non-admins
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      alert("Access denied. Admins only.");
      nav("/");
    }
  }, []);

  const [activeTab, setActiveTab] = useState("Modules");

  return (
    <div className="page-container">
      <h3 className="admin-heading">🛠 Admin Panel</h3>

      {/* TAB BAR */}
      <div className="admin-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`admin-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="admin-content">
        {activeTab === "Modules"   && <ModulesTab />}
        {activeTab === "Questions" && <QuestionsTab />}
        {activeTab === "Users"     && <UsersTab />}
        {activeTab === "Results"   && <ResultsTab />}
      </div>
    </div>
  );
}

/* ================================================================
   MODULES TAB
================================================================ */
function ModulesTab() {
  const [modules, setModules]   = useState([]);
  const [name, setName]         = useState("");
  const [editId, setEditId]     = useState(null);
  const [editName, setEditName] = useState("");

  const load = () => adminGetModules().then(setModules);
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return alert("Module name is required");
    await adminAddModule({ moduleName: name });
    setName("");
    load();
  };

  const startEdit = (m) => { setEditId(m.moduleId); setEditName(m.moduleName); };
  const cancelEdit = ()  => { setEditId(null); setEditName(""); };

  const save = async (id) => {
    await adminUpdateModule(id, { moduleName: editName });
    cancelEdit();
    load();
  };

  const del = async (id) => {
    if (!window.confirm("Delete this module?")) return;
    await adminDeleteModule(id);
    load();
  };

  return (
    <div>
      {/* ADD FORM */}
      <div className="admin-form-row">
        <input
          className="form-control"
          placeholder="New Module Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button className="btn btn-success" onClick={add}>Add Module</button>
      </div>

      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr><th>#</th><th>Module Name</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {modules.map(m => (
            <tr key={m.moduleId}>
              <td>{m.moduleId}</td>
              <td>
                {editId === m.moduleId ? (
                  <input
                    className="form-control form-control-sm"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                ) : m.moduleName}
              </td>
              <td>
                {editId === m.moduleId ? (
                  <>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => save(m.moduleId)}>Save</button>
                    <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(m)}>Edit</button>
                    <button className="btn btn-sm btn-danger"   onClick={() => del(m.moduleId)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   QUESTIONS TAB
================================================================ */
const EMPTY_Q = {
  moduleId: "", questionText: "", optionA: "", optionB: "",
  optionC: "", optionD: "", correctOption: "A", mockNo: ""
};

function QuestionsTab() {
  const [modules, setModules]     = useState([]);
  const [filterMod, setFilterMod] = useState("");
  const [questions, setQuestions] = useState([]);
  const [form, setForm]           = useState(EMPTY_Q);
  const [editId, setEditId]       = useState(null);
  const [showForm, setShowForm]   = useState(false);

  useEffect(() => {
    adminGetModules().then(setModules);
    loadQ(filterMod);
  }, []);

  const loadQ = (modId) =>
    adminGetQuestions(modId || null).then(setQuestions);

  const handleFilter = (e) => {
    setFilterMod(e.target.value);
    loadQ(e.target.value);
  };

  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const payload = {
      ...form,
      moduleId: parseInt(form.moduleId),
      mockNo: form.mockNo ? parseInt(form.mockNo) : null
    };
    if (editId) {
      await adminUpdateQuestion(editId, payload);
    } else {
      await adminAddQuestion(payload);
    }
    setForm(EMPTY_Q);
    setEditId(null);
    setShowForm(false);
    loadQ(filterMod);
  };

  const startEdit = (q) => {
    setForm({
      moduleId: q.moduleId, questionText: q.questionText,
      optionA: q.optionA,   optionB: q.optionB,
      optionC: q.optionC,   optionD: q.optionD,
      correctOption: q.correctOption, mockNo: q.mockNo || ""
    });
    setEditId(q.questionId);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await adminDeleteQuestion(id);
    loadQ(filterMod);
  };

  const cancelForm = () => {
    setForm(EMPTY_Q);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div>
      {/* FILTER + ADD BUTTON */}
      <div className="admin-form-row mb-3">
        <select className="form-select" value={filterMod} onChange={handleFilter}>
          <option value="">All Modules</option>
          {modules.map(m => (
            <option key={m.moduleId} value={m.moduleId}>{m.moduleName}</option>
          ))}
        </select>
        <button className="btn btn-success" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_Q); }}>
          + Add Question
        </button>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="admin-question-form">
          <h6>{editId ? "Edit Question" : "New Question"}</h6>

          <select className="form-select mb-2" name="moduleId" value={form.moduleId} onChange={handleForm}>
            <option value="">Select Module</option>
            {modules.map(m => (
              <option key={m.moduleId} value={m.moduleId}>{m.moduleName}</option>
            ))}
          </select>

          <textarea
            className="form-control mb-2"
            rows={2}
            name="questionText"
            placeholder="Question Text"
            value={form.questionText}
            onChange={handleForm}
          />

          <div className="row g-2 mb-2">
            {["A","B","C","D"].map(opt => (
              <div className="col-md-6" key={opt}>
                <input
                  className="form-control"
                  name={`option${opt}`}
                  placeholder={`Option ${opt}`}
                  value={form[`option${opt}`]}
                  onChange={handleForm}
                />
              </div>
            ))}
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <select className="form-select" name="correctOption" value={form.correctOption} onChange={handleForm}>
                {["A","B","C","D"].map(o => <option key={o} value={o}>Correct: {o}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <input
                className="form-control"
                name="mockNo"
                type="number"
                placeholder="Mock No (leave blank for practice)"
                value={form.mockNo}
                onChange={handleForm}
              />
            </div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={submit}>{editId ? "Update" : "Save"} Question</button>
            <button className="btn btn-secondary" onClick={cancelForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <p className="text-white mt-3"><b>{questions.length}</b> question(s) found</p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th><th>Module</th><th>Question</th>
            <th>A</th><th>B</th><th>C</th><th>D</th>
            <th>Correct</th><th>Mock#</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(q => {
            const mod = modules.find(m => m.moduleId === q.moduleId);
            return (
              <tr key={q.questionId}>
                <td>{q.questionId}</td>
                <td>{mod ? mod.moduleName : q.moduleId}</td>
                <td className="q-text">{q.questionText}</td>
                <td>{q.optionA}</td>
                <td>{q.optionB}</td>
                <td>{q.optionC}</td>
                <td>{q.optionD}</td>
                <td><span className="badge bg-success">{q.correctOption}</span></td>
                <td>{q.mockNo ?? "—"}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-1" onClick={() => startEdit(q)}>Edit</button>
                  <button className="btn btn-sm btn-danger"        onClick={() => del(q.questionId)}>Del</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   USERS TAB
================================================================ */
function UsersTab() {
  const [users, setUsers] = useState([]);
  useEffect(() => { adminGetUsers().then(setUsers); }, []);

  return (
    <div>
      <p className="text-white"><b>{users.length}</b> registered user(s)</p>
      <table className="admin-table">
        <thead>
          <tr><th>#</th><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.mobileNumber}</td>
              <td>
                <span className={`badge ${u.role === "ADMIN" ? "bg-danger" : "bg-primary"}`}>
                  {u.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   RESULTS TAB
================================================================ */
function ResultsTab() {
  const [results, setResults] = useState([]);
  useEffect(() => { adminGetResults().then(setResults); }, []);

  return (
    <div>
      <p className="text-white"><b>{results.length}</b> test result(s)</p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th><th>User ID</th><th>Module ID</th>
            <th>Type</th><th>Mock#</th><th>Score</th>
            <th>Attempted</th><th>Unattempted</th>
          </tr>
        </thead>
        <tbody>
          {results.map(r => (
            <tr key={r.resultId}>
              <td>{r.resultId}</td>
              <td>{r.userId}</td>
              <td>{r.moduleId}</td>
              <td><span className={`badge ${r.testType === "Mock" ? "bg-warning text-dark" : "bg-info text-dark"}`}>{r.testType}</span></td>
              <td>{r.mockNo ?? "—"}</td>
              <td><b>{r.score}</b></td>
              <td>{r.attempted}</td>
              <td>{r.unattempted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPanel;
