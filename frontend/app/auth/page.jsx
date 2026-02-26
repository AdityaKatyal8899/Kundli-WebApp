"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      if (activeTab === "signup") {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        const signupToast = toast.loading("Creating your account...");

        // 1. Register
        await api.post("/register", {
          email: formData.email,
          password: formData.password,
        });

        // 2. Auto Login
        const params = new URLSearchParams();
        params.append("username", formData.email);
        params.append("password", formData.password);

        const loginRes = await api.post("/login", params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const { access_token } = loginRes.data;
        localStorage.setItem("token", access_token);
        document.cookie = `token=${access_token}; path=/;`;

        toast.dismiss(signupToast);
        toast.success("Account created successfully! ✨");
        router.push("/dashboard");
      } else {
        // Log In flow
        const loginToast = toast.loading("Logging you in...");
        const params = new URLSearchParams();
        params.append("username", formData.email);
        params.append("password", formData.password);

        const response = await api.post("/login", params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        const { access_token } = response.data;
        localStorage.setItem("token", access_token);
        document.cookie = `token=${access_token}; path=/;`;

        toast.dismiss(loginToast);
        toast.success("Welcome back! ✨");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Auth failed:", error);
      // The Axios interceptor handles the error toast automatically
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      toast.loading("Authenticating with Google...");
      const response = await api.post("/google", {
        id_token: credentialResponse.credential,
      });
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      document.cookie = `token=${access_token}; path=/;`;

      toast.dismiss();
      toast.success("Google login successful! ✨");
      router.push("/dashboard");
    } catch (error) {
      console.error("Google login failed:", error);
      toast.dismiss();
      // The Axios interceptor handles the error toast
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(160deg, #fff5fa 0%, #ffffff 50%, #fff0f6 100%)",
      }}
    >
      {/* Background dots */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
              background: "#ff4fa3",
              top: `${8 + i * 7.5}%`,
              left: `${5 + ((i * 17) % 90)}%`,
            }}
          />
        ))}
      </div>

      <div
        className="animate-fade-in-up relative w-full"
        style={{ maxWidth: "420px" }}
      >
        <div
          className="flex flex-col rounded-[20px]"
          style={{
            background: "#ffffff",
            border: "1px solid #ffd1e6",
            boxShadow:
              "0 8px 40px rgba(255, 79, 163, 0.08), 0 2px 12px rgba(90, 0, 90, 0.04)",
            padding: "40px 32px",
            gap: "32px",
          }}
        >
          <div
            className="flex flex-col items-center text-center"
            style={{ gap: "8px" }}
          >
            <h1
              className="font-serif font-bold"
              style={{ fontSize: "32px", color: "#5a005a", letterSpacing: "-0.02em" }}
            >
              KUNDLI
            </h1>
            <p
              className="font-sans"
              style={{ fontSize: "14px", color: "#7a3a6a" }}
            >
              {activeTab === "signup"
                ? "Create your account to get started"
                : "Welcome back! Sign in to continue"}
            </p>
          </div>

          <div
            className="flex w-full"
            style={{
              borderBottom: "2px solid #ffd1e6",
            }}
          >
            <button
              onClick={() => setActiveTab("signup")}
              className="flex-1 cursor-pointer pb-3 font-sans font-semibold transition-colors duration-200"
              style={{
                fontSize: "15px",
                color: activeTab === "signup" ? "#ff4fa3" : "#b8829e",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === "signup"
                    ? "2px solid #ff4fa3"
                    : "2px solid transparent",
                marginBottom: "-2px",
              }}
            >
              Sign Up
            </button>
            <button
              onClick={() => setActiveTab("login")}
              className="flex-1 cursor-pointer pb-3 font-sans font-semibold transition-colors duration-200"
              style={{
                fontSize: "15px",
                color: activeTab === "login" ? "#ff4fa3" : "#b8829e",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === "login"
                    ? "2px solid #ff4fa3"
                    : "2px solid transparent",
                marginBottom: "-2px",
              }}
            >
              Log In
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col"
            style={{ gap: "24px" }}
          >
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <label
                htmlFor="email"
                className="font-sans font-medium"
                style={{ fontSize: "13px", color: "#5a005a" }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full font-sans outline-none transition-all duration-200"
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  color: "#5a005a",
                  background: "#ffffff",
                  border: "1.5px solid #ffd1e6",
                }}
              />
            </div>

            <div className="flex flex-col" style={{ gap: "8px" }}>
              <label
                htmlFor="password"
                className="font-sans font-medium"
                style={{ fontSize: "13px", color: "#5a005a" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full font-sans outline-none transition-all duration-200"
                  style={{
                    padding: "14px 48px 14px 16px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    color: "#5a005a",
                    background: "#ffffff",
                    border: "1.5px solid #ffd1e6",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ background: "none", border: "none", padding: "4px" }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: "#b8829e" }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: "#b8829e" }} />
                  )}
                </button>
              </div>
            </div>

            {activeTab === "signup" && (
              <div className="flex flex-col" style={{ gap: "8px" }}>
                <label
                  htmlFor="confirmPassword"
                  className="font-sans font-medium"
                  style={{ fontSize: "13px", color: "#5a005a" }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full font-sans outline-none transition-all duration-200"
                    style={{
                      padding: "14px 48px 14px 16px",
                      borderRadius: "12px",
                      fontSize: "15px",
                      color: "#5a005a",
                      background: "#ffffff",
                      border: "1.5px solid #ffd1e6",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ background: "none", border: "none", padding: "4px" }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" style={{ color: "#b8829e" }} />
                    ) : (
                      <Eye className="h-5 w-5" style={{ color: "#b8829e" }} />
                    )}
                  </button>
                </div>
              </div>
            )}

            <LoadingButton
              type="submit"
              loading={loading}
              className="w-full cursor-pointer transition-all duration-300 ease-out hover:-translate-y-[2px] hover:scale-[1.01]"
              style={{
                padding: "18px 36px",
                borderRadius: "999px",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "0.6px",
                background: "linear-gradient(90deg, #ff4fa3, #ff2d55)",
                color: "#ffffff",
                border: "none",
                boxShadow: "0 8px 24px rgba(255, 45, 85, 0.35)",
              }}
            >
              {activeTab === "signup" ? "Create Account" : "Sign In"}
            </LoadingButton>
          </form>

          <div className="flex items-center" style={{ gap: "16px" }}>
            <div className="flex-1" style={{ height: "1px", background: "#ffd1e6" }} />
            <span className="font-sans" style={{ fontSize: "13px", color: "#b8829e" }}>
              or continue with
            </span>
            <div className="flex-1" style={{ height: "1px", background: "#ffd1e6" }} />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log("Login Failed");
                toast.error("Google login failed. Please try again.");
              }}
              useOneTap
              theme="outline"
              shape="pill"
              text="continue_with"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer font-sans transition-colors duration-200"
            style={{ fontSize: "14px", color: "#7a3a6a", background: "none", border: "none" }}
          >
            &larr; Back to Home
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <Heart
            className="h-5 w-5 animate-float opacity-40"
            style={{ color: "#ff4fa3" }}
            fill="#ff4fa3"
          />
        </div>
      </div>
    </div>
  );
}
