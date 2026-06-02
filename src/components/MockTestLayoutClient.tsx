"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BarChart3,
  Award,
  LayoutDashboard,
  ArrowBigLeftDashIcon,
  Crown,
  Flame,
  ClipboardPenLine,
} from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";
import Image from "next/image";

const getUpgradeText = (plan: string): string => {
  if (plan === "6m") return "Upgrade to Ultra";
  if (plan === "3m") return "Upgrade to Pro + or Ultra";
  return "5 questions per subject + full analytics";
};

interface MockTestLayoutClientProps {
  children: React.ReactNode;
}

function calcInitialState() {
  const isDark =
    typeof window !== "undefined"
      ? localStorage.getItem("jf_dark") === "1"
      : false;
  return { isDark };
}

export function MockTestLayoutClient({
  children,
}: MockTestLayoutClientProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [streakVal, setStreakVal] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStats = () => {
      if (session?.user?.id) {
        const p2 = (n: number) => String(n).padStart(2, '0');
        const today = `${new Date().getFullYear()}-${p2(new Date().getMonth() + 1)}-${p2(new Date().getDate())}`;
        fetch(`/api/user/mock-test-stats?clientDate=${today}`, { signal: controller.signal })
          .then((res) => res.json())
          .then((data) => {
            if (!data.error) {
              setUserPlan(data.plan || "free");
              setStreakVal(data.streak || 0);
            }
          })
          .catch((err) => {
            if (err.name !== 'AbortError') {
              console.error("Error fetching stats", err);
            }
          });
      }
    };

    const timer = setTimeout(() => setMounted(true), 0);
    fetchStats();

    window.addEventListener("stats-updated", fetchStats);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("stats-updated", fetchStats);
      controller.abort();
    };
  }, [session]);

  // Lazy initialiser — runs once on mount, no cascading renders
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const { isDark } = calcInitialState();
    return isDark;
  });

  // Apply dark class to <html> on first render and on toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Re-sync streak when navigating between pages by calculating them directly during render
  // (We now fetch it from the API above)

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem("jf_dark", nextDark ? "1" : "0");
  };

  const getButtonClass = (route: string) => {
    const isActive = pathname === route;
    return `flex items-center gap-3 py-2.5 px-4 mx-2 rounded-lg text-xs font-extrabold tracking-wide transition-all ${
      isActive
        ? "bg-white/10 text-white border border-white/5 shadow-inner"
        : "text-white/50 hover:bg-white/5 hover:text-white"
    }`;
  };

  const getMobileButtonClass = (route: string) => {
    const isActive = pathname === route;
    return `flex flex-col items-center justify-center gap-1 h-full ${
      isActive ? "text-orange-500" : "text-white/40"
    }`;
  };

  const getPlanName = (plan: string) => {
    if (plan === "3m") return "Pro";
    if (plan === "6m") return "Pro +";
    if (plan === "12m") return "Ultra";
    if (plan === "free") return "Free";
    return "Free";
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-[#0d1b2a] border-b-[2.5px] border-orange-500 px-4 sm:px-6 h-14.5 flex items-center justify-between gap-4 shadow-lg select-none shrink-0 pt-safe">
        <Link
          href="/"
          className="flex items-center gap-2 hover:scale-102 transition-transform duration-200"
        >
          <div className="flex flex-col">
            <span className="font-extrabold text-[20px] sm:text-[28px] tracking-wider text-white leading-none">
              JOBFATHER
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">

          {/* Right buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mock Test Button */}
            <Link
              href="/"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 bg-[#ee6f14] hover:bg-[#d5580e] text-white text-[9px] sm:text-xs font-black uppercase rounded-lg tracking-wider transition-colors shadow-sm min-h-[28px] sm:min-h-[32px]"
              title="Go Back"
            >
              <ArrowBigLeftDashIcon className="shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Go Back</span>
              <span className="sm:hidden">BACK</span>
            </Link>

            {/* Job Alert Button */}
            {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
              <Link
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Job Alert"
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-[9px] sm:text-xs font-black uppercase rounded-lg tracking-wider transition-colors shadow-sm min-h-[28px] sm:min-h-[30px]"
                title="WhatsApp Group Alert"
              >
                <Image
                  src="/whatsapp.svg"
                  alt="whatsapp"
                  aria-hidden="true"
                  width={18}
                  height={18}
                  className="shrink-0"
                />
                <span className="hidden sm:inline">JOB ALERT</span>
                <span className="sm:hidden">ALERT</span>
              </Link>
            )}
          </div>

          <ProfileMenu
            email={session?.user?.email || "User"}
            userPlan={userPlan}
            isDarkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            mounted={mounted}
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-58px)] relative">
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <nav className="w-54 shrink-0 bg-[#0d1b2a] border-r border-white/5 hidden md:flex flex-col select-none relative">
          {/* Sidebar Header from the reference image */}
          <div className="p-4 flex flex-col gap-3.5">

            <div className="mx-1 border border-dashed border-white/10 rounded-xl p-1.5 flex items-center justify-start gap-2">
              {/* Plan status */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-orange-500 text-orange-500 text-[12px] font-black uppercase tracking-wider bg-orange-500/5">
                <Crown className="w-4 h-4 shrink-0" />
                {getPlanName(userPlan)}
              </div>
              {/* Streak */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 text-white/70 text-[12px] font-black uppercase tracking-wider bg-white/5">
                <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                {streakVal}d
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-1.5">
            <Link href="/mock-tests" className={getButtonClass("/mock-tests")}>
              <LayoutDashboard className="w-4 h-4 shrink-0" /> Home
            </Link>

            <Link
              href="/mock-tests/start-test"
              className={getButtonClass("/mock-tests/start-test")}
            >
              <ClipboardPenLine className="w-4 h-4 shrink-0" /> Start Test
            </Link>

            <Link
              href="/mock-tests/analytics"
              className={getButtonClass("/mock-tests/analytics")}
            >
              <BarChart3 className="w-4 h-4 shrink-0" /> Analytics
            </Link>

            <Link
              href="/mock-tests/books"
              className={getButtonClass("/mock-tests/books")}
            >
              <BookOpen className="w-4 h-4 shrink-0" /> Books
            </Link>
          </div>

          <div className="p-2 border-t border-white/5 bg-[#0b1622]/40 flex flex-col gap-2 shrink-0 pb-4">
            {userPlan !== "12m" && (
              <Link
                href="/mock-tests/upgrade"
                className="mx-2 bg-[#f97316] hover:bg-orange-600 rounded-xl p-4.5 cursor-pointer transition-colors block shadow-md"
              >
                <span className="block text-[11px] font-black text-white uppercase tracking-wider mb-0.5">
                  {userPlan === "free" ? "Unlock Premium" : "Upgrade Plan"}
                </span>
                <span className="block text-[9.5px] font-bold text-white/90 leading-tight mt-1">
                  {getUpgradeText(userPlan)}
                </span>
              </Link>
            )}
          </div>
        </nav>

        {/* CONTENT MAIN VIEWER */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:p-6 pb-20 md:pb-6 bg-slate-50 dark:bg-[#0a1628] transition-colors duration-200">
          <div className="max-w-220 mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 h-14.5 bg-[#0d1b2a] border-t border-white/7 flex md:hidden items-center justify-around z-40 select-none pb-safe">
        <Link
          href="/mock-tests"
          className={getMobileButtonClass("/mock-tests")}
        >
          <LayoutDashboard className="w-4.5 h-4.5" />
          <span className="text-[8px] font-black uppercase tracking-wider">
            Home
          </span>
        </Link>
        <Link
          href="/mock-tests/start-test"
          className={getMobileButtonClass("/mock-tests/start-test")}
        >
          <ClipboardPenLine className="w-4.5 h-4.5" />
          <span className="text-[8px] font-black uppercase tracking-wider">
            Test
          </span>
        </Link>
        <Link
          href="/mock-tests/analytics"
          className={getMobileButtonClass("/mock-tests/analytics")}
        >
          <BarChart3 className="w-4.5 h-4.5" />
          <span className="text-[8px] font-black uppercase tracking-wider">
            Stats
          </span>
        </Link>
        <Link
          href="/mock-tests/books"
          className={getMobileButtonClass("/mock-tests/books")}
        >
          <BookOpen className="w-4.5 h-4.5" />
          <span className="text-[8px] font-black uppercase tracking-wider">
            Books
          </span>
        </Link>
        {userPlan !== "12m" && (
          <Link
            href="/mock-tests/upgrade"
            className={getMobileButtonClass("/mock-tests/upgrade")}
          >
            <Award className="w-4.5 h-4.5" />
            <span className="text-[8px] font-black uppercase tracking-wider">
              Upgrade
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}
