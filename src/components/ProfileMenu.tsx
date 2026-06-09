"use client";

import { useState, useRef, useEffect } from "react";
import { User, Lock, Loader2, Moon, Sun, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface ProfileMenuProps {
  email: string;
  userPlan: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  mounted: boolean;
}

export function ProfileMenu({
  email,
  userPlan,
  isDarkMode,
  onToggleDarkMode,
  mounted,
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowLogoutConfirm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showLogoutConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowLogoutConfirm(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutConfirm]);

  const getPlanName = (plan: string) => {
    if (plan === "3m") return "3 Months (Pro)";
    if (plan === "6m") return "6 Months (Pro +)";
    if (plan === "12m") return "12 Months (Ultra)";
    if (plan === "free") return "Free";
    return "Free";
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 12) {
      setMessage({
        type: "error",
        text: "New password must be at least 12 characters",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "New Password and Confirm New Password do not match",
      });
      return;
    }

    setIsChangingPassword(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Failed to change password",
        });
      } else {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) {
            setShowLogoutConfirm(false);
          }
        }}
        className="flex items-center justify-center w-8.5 h-8.5 rounded-2xl bg-slate-100 dark:bg-white/7 border border-slate-200 dark:border-white/12 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
      >
        <User />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeUp">
          <div className="p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <p className="text-xs text-slate-500 dark:text-white/50 uppercase font-bold tracking-widest mb-1">
              Account Details
            </p>
            <p
              className="text-sm font-semibold text-slate-800 dark:text-white truncate"
              title={email}
            >
              {email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-white/60">
                Plan:
              </span>
              <span
                className={`text-[10px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full ${
                  userPlan !== "free"
                    ? "bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/15 dark:text-orange-500 dark:border-orange-500/40"
                    : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/10 dark:text-white/60 dark:border-white/20"
                }`}
              >
                {getPlanName(userPlan)}
              </span>
            </div>
          </div>

          <div className="p-4">
            <p className="text-xs text-slate-500 dark:text-white/50 uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Change Password
            </p>
            <form
              onSubmit={handlePasswordChange}
              className="flex flex-col gap-2.5"
            >
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500/50 dark:bg-white/5 dark:border-white/10 rounded-lg px-3 py-2 text-sm dark:text-white dark:placeholder-white/30"
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500/50 dark:bg-white/5 dark:border-white/10 rounded-lg px-3 py-2 text-sm dark:text-white dark:placeholder-white/30"
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500/50 dark:bg-white/5 dark:border-white/10 rounded-lg px-3 py-2 text-sm dark:text-white dark:placeholder-white/30"
                required
              />
              {message && (
                <div
                  className={`text-xs p-2 rounded-lg ${
                    message.type === "error"
                      ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                      : "bg-green-50 text-green-600 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                  }`}
                >
                  {message.text}
                </div>
              )}
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isChangingPassword && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Update Password
              </button>
            </form>
          </div>

          <div className="p-2 border-t border-slate-100 dark:border-white/10">
            {showLogoutConfirm ? (
              <div className="flex flex-col gap-2 p-2 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-950/30 text-center animate-fadeUp">
                <p className="text-xs font-bold text-red-600 dark:text-red-400">Are you sure you want to log out?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold rounded-md transition-colors cursor-pointer"
                  >
                    Yes, Log Out
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-1.5 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-extrabold rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-extrabold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-dashed border-red-200 dark:border-red-500/20 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-white/10 p-2 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-white/70 px-2">
              Appearance
            </span>
            <button
              onClick={onToggleDarkMode}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-white/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10 flex items-center gap-2 transition-colors text-xs font-bold cursor-pointer"
            >
              {mounted ? (
                isDarkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5" /> Dark Mode
                  </>
                )
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" /> Dark Mode
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
