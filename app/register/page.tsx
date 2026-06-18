"use client";

import { Baby, Mail, LockKeyhole, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const profile = await register(name.trim(), email.trim(), password);
      router.push(profile.role === "admin" ? "/admin" : "/shop");
    } catch (err: any) {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        setError("Account created! Please verify your email using the link sent to your inbox before logging in.");
      } else {
        setError("Could not create account. Check the email and password.");
      }
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
          <h1>Create Account</h1>
          <p>Join BabyShopHub and start shopping essentials</p>
          <label><span>Full Name</span><div><UserRound size={18} /><input required value={name} onChange={(e) => setName(e.target.value)} /></div></label>
          <label><span>Email Address</span><div><Mail size={18} /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div></label>
          <label><span>Password</span><div><LockKeyhole size={18} /><input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div></label>
          {error && <strong className="auth-error">{error}</strong>}
          <button className="auth-submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
          <p className="auth-switch">Already have an account? <a href="/login">Login</a></p>
        </form>
      </main>
      <Footer />
    </>
  );
}
