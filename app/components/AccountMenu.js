"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function AccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadSession() {
    setIsLoading(true);

    const response = await fetch("/api/auth/session", {
      cache: "no-store"
    });
    const payload = await response.json();

    setUser(payload.user || null);
    setIsLoading(false);
  }

  useEffect(() => {
    loadSession();
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsLoginOpen(false);
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Could not log in.");
      setIsSubmitting(false);
      return;
    }

    setUser(payload.user || null);
    setEmail("");
    setPassword("");
    setIsSubmitting(false);
    setIsLoginOpen(false);
    setIsMenuOpen(false);
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    setIsMenuOpen(false);
    window.location.assign("/");
  }

  function handleNavigate(href) {
    setIsMenuOpen(false);
    window.location.assign(href);
  }

  const isAdmin = user?.role === "admin";
  const isSupport = user?.role === "support" || user?.role === "admin";

  return (
    <div
      ref={rootRef}
      className="account-menu"
    >
      <button
        type="button"
        className="account-menu__button"
        onClick={() => {
          if (user) {
            setIsMenuOpen((current) => !current);
            return;
          }

          setIsLoginOpen(true);
        }}
        aria-label={user ? "Open account menu" : "Log in"}
        aria-expanded={user ? isMenuOpen : undefined}
      >
        <UserIcon />
      </button>

      {user && isMenuOpen ? (
        <div className="account-menu__dropdown">
          <div className="account-menu__identity">
            <strong>{user.displayName || user.email}</strong>
            <span>{user.email}</span>
          </div>

          {isAdmin ? (
            <>
              <button
                type="button"
                className="account-menu__link"
                onClick={() => handleNavigate("/admin?view=dashboard")}
              >
                Dashboard
              </button>
              <button
                type="button"
                className="account-menu__link"
                onClick={() => handleNavigate("/admin?view=menu")}
              >
                Edit Website
              </button>
              <button
                type="button"
                className="account-menu__link"
                onClick={() => handleNavigate("/support")}
              >
                Support Tickets
              </button>
            </>
          ) : null}

          {!isAdmin && isSupport ? (
            <button
              type="button"
              className="account-menu__link"
              onClick={() => handleNavigate("/support")}
            >
              Support Tickets
            </button>
          ) : null}

          <button
            type="button"
            className="account-menu__logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      ) : null}

      {isLoginOpen ? (
        <div className="account-login-modal" role="dialog" aria-modal="true">
          <div className="account-login-modal__card">
            <div className="account-login-modal__header">
              <div>
                <p className="eyebrow">Welcome Back</p>
                <h2>Log in</h2>
              </div>
              <button
                type="button"
                className="support-chat__close"
                onClick={() => setIsLoginOpen(false)}
                aria-label="Close login"
              >
                ×
              </button>
            </div>

            <p className="account-login-modal__text">
              Enter your email and password to open your account tools.
            </p>

            <form className="support-login" onSubmit={handleLogin}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="username"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                autoComplete="current-password"
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>
            </form>

            {error ? <p className="support-error">{error}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
