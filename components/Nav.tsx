"use client";

import Link from "next/link";
import { Baby, BookOpen, Download, LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function Nav() {
  const { user } = useAuth();

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="BabyShop home">
        <span className="brand-mark">
          <Baby size={20} />
        </span>
        <span>BabyShop</span>
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/downloads">
          <Download size={16} />
          Downloads
        </Link>
        <Link href="/docs/documentation">
          <BookOpen size={16} />
          Docs
        </Link>
        {user ? (
          <Link className="nav-profile" href={user.role === "admin" ? "/admin" : "/shop"}>
            <span>{user.displayName.slice(0, 1).toUpperCase()}</span>
            {user.displayName}
          </Link>
        ) : (
          <Link className="nav-action" href="/login">
            <LogIn size={16} />
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
