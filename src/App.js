import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Quiz from "./pages/Quiz";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import MockQuiz from "./pages/MockQuiz";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DemoQuiz from "./pages/DemoQuiz";
import AdminPanel from "./pages/AdminPanel";   // ← NEW
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-bg">
        <Navbar />
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/about"         element={<About />} />
          <Route path="/contact"       element={<Contact />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/quiz/:moduleId" element={<Quiz />} />
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/mock/:moduleId/:mockNumber" element={<MockQuiz />} />
          <Route path="/demo/:moduleId" element={<DemoQuiz />} />
          <Route path="/admin"         element={<AdminPanel />} />  {/* ← NEW */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
