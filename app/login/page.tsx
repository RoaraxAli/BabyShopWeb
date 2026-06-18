"use client";

import { Baby, Eye, EyeOff, Mail, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push(user.role === "admin" ? "/admin" : "/shop");
    }
  }, [user, authLoading, router]);

  async function routeByRole(profile: { role: string }) {
    router.push(profile.role === "admin" ? "/admin" : "/shop");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const profile = await login(email.trim(), password);
      await routeByRole(profile);
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError("");
    setLoading(true);
    try {
      const profile = await googleLogin();
      await routeByRole(profile);
    } catch {
      setError("Google sign-in was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="auth-page">
        <form className="auth-card" onSubmit={onSubmit}>
          <div className="auth-logo"><Baby size={38} /></div>
          <h1>Welcome Back!</h1>
          <p>Log in to continue shopping baby essentials</p>
          <label>
            <span>Email Address</span>
            <div><Mail size={18} /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          </label>
          <label>
            <span>Password</span>
            <div>
              <LockKeyhole size={18} />
              <input required minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </label>
          {error && <strong className="auth-error">{error}</strong>}
          <button className="auth-submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
          <div className="auth-divider">OR</div>
          <button className="google-button" type="button" disabled={loading} onClick={onGoogle}>Continue with Google</button>
          <p className="auth-switch">New parent here? <a href="/register">Create Account</a></p>
        </form>
      </main>
      <Footer />
    </>
  );
}
