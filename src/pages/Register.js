import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const nav = useNavigate();

  // Email validation
  const isValidEmail = (email) => {
    return email.endsWith("@gmail.com");
  };

  // Password validation
  const isStrongPassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/;
    return regex.test(password);
  };

  const submit = async () => {
    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Email must be a valid @gmail.com address");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      alert("Mobile number must be exactly 10 digits");
      return;
    }

    if (!isStrongPassword(password)) {
      alert(
        "Password must contain:\n" +
          "- Minimum 8 characters\n" +
          "- Uppercase letter\n" +
          "- Lowercase letter\n" +
          "- Number\n" +
          "- Symbol"
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Password and Confirm Password do not match");
      return;
    }

    const res = await fetch("https://dac-pro-backend.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        password,
        mobileNumber: mobile
      })
    });

    if (res.ok) {
      alert("Registration successful. Please login.");
      nav("/login");
    } else {
      alert("Registration failed");
    }
  };

  return (
    <div className="page-container">
      <div className="card col-md-5 mx-auto p-4 shadow">
        <h3 className="text-center mb-4">Register</h3>

        <input
          className="form-control mb-3"
          placeholder="Full Name"
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          className="form-control mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* 🔑 MOBILE NUMBER: NUMBERS ONLY + MAX 10 */}
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Mobile Number"
          value={mobile}
          maxLength={10}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setMobile(value);
          }}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="btn btn-primary w-100" onClick={submit}>
          Register
        </button>

        <p className="text-center mt-3">
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
