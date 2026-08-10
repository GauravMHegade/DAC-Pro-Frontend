import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const nav = useNavigate();

    // ==========================================
    // EMAIL VALIDATION
    // ==========================================

    const isValidEmail = (email) => {
        return email.endsWith("@gmail.com");
    };

    // ==========================================
    // PASSWORD VALIDATION
    // ==========================================

    const isStrongPassword = (password) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/;

        return regex.test(password);
    };

    // ==========================================
    // REGISTER
    // ==========================================

    const submit = async (e) => {

        e.preventDefault();

        // ------------------------------------------
        // REQUIRED FIELDS
        // ------------------------------------------

        if (
            !fullName ||
            !email ||
            !mobile ||
            !password ||
            !confirmPassword
        ) {
            alert("All fields are required");
            return;
        }

        // ------------------------------------------
        // EMAIL VALIDATION
        // ------------------------------------------

        if (!isValidEmail(email)) {
            alert(
                "Email must be a valid @gmail.com address"
            );
            return;
        }

        // ------------------------------------------
        // MOBILE VALIDATION
        // ------------------------------------------

        if (!/^\d{10}$/.test(mobile)) {
            alert(
                "Mobile number must be exactly 10 digits"
            );
            return;
        }

        // ------------------------------------------
        // PASSWORD VALIDATION
        // ------------------------------------------

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

        // ------------------------------------------
        // CONFIRM PASSWORD
        // ------------------------------------------

        if (password !== confirmPassword) {
            alert(
                "Password and Confirm Password do not match"
            );
            return;
        }

        // ------------------------------------------
        // API REQUEST
        // ------------------------------------------

        try {

            const response = await registerUser({

                fullName: fullName,

                email: email,

                mobileNumber: mobile,

                password: password

            });

            console.log(
                "Registration successful:",
                response
            );

            alert(
                "Registration successful. Please login."
            );

            nav("/login");

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            alert(
                error.message ||
                "Registration failed"
            );
        }
    };

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-6">

                    <div className="card p-4 shadow">

                        <h2 className="text-center mb-4">
                            Register
                        </h2>

                        {/* FULL NAME */}

                        <input
                            className="form-control mb-3"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) =>
                                setFullName(
                                    e.target.value
                                )
                            }
                        />

                        {/* EMAIL */}

                        <input
                            type="email"
                            className="form-control mb-3"
                            placeholder="Email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                        />

                        {/* MOBILE NUMBER */}

                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Mobile Number"
                            value={mobile}
                            maxLength={10}
                            onChange={(e) => {

                                const value =
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    );

                                setMobile(value);
                            }}
                        />

                        {/* PASSWORD */}

                        <input
                            type="password"
                            className="form-control mb-3"
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                        />

                        {/* CONFIRM PASSWORD */}

                        <input
                            type="password"
                            className="form-control mb-3"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                        />

                        {/* REGISTER BUTTON */}

                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={submit}
                        >
                            Register
                        </button>

                        {/* LOGIN LINK */}

                        <p className="text-center mt-3">

                            Already registered?{" "}

                            <Link to="/login">
                                Login here
                            </Link>

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;