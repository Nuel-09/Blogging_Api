import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api";
import "../styles/Auth.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z0-9_\- ]{2,30}$/;
    const passwordMinLength = 6;

    if (!name.trim() || !email.trim() || !password) {
      setError("Fill in all fields");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }
    if (!nameRegex.test(name.trim())) {
      setError("Name must be 2-30 characters, no special symbols");
      return;
    }
    if (password.length < passwordMinLength) {
      setError(`Password must be at least ${passwordMinLength} characters`);
      return;
    }
    if (/\s/.test(password)) {
      setError("Password cannot contain spaces");
      return;
    }
    if (name.trim().length !== name.length) {
      setError("Name cannot start or end with spaces");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.signup(email, password, name);
      console.log("Signup successful:", response.data);
      window.dispatchEvent(new Event("auth-change"));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Sign Up</h1>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}
