'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Clock,
  Bookmark,
  Check,
  X,
  AlertTriangle,
  Trophy,
  Lock
} from 'lucide-react';

interface Question {
  q: string;
  opts: string[];
  ans: number;
  exp: string;
  diff: 'easy' | 'medium' | 'hard';
}

interface SubjectRecord {
  score: number;
  wrong: number;
  skip: number;
  max: number;
  time: number;
}

type DbState = Record<string, Record<string, SubjectRecord>>;

type Subject = {
  id: string;
  name: string;
  short: string;
  icon: string;
  color: string;
};

const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Mathematics', short: 'Math', icon: '📐', color: '#f97316' },
  { id: 'reasoning', name: 'Reasoning Ability', short: 'Reason', icon: '🧩', color: '#7c3aed' },
  { id: 'english', name: 'English Language', short: 'English', icon: '📖', color: '#16a34a' },
  { id: 'gk', name: 'General Knowledge', short: 'GK', icon: '🌍', color: '#1a4fd6' },
  { id: 'pyq', name: 'Previous Year Qs', short: 'PYQ', icon: '📋', color: '#dc2626' }
];

const QB: Record<string, Question[]> = {
  math: [
    { q: "A train travels 360 km in 4 hours. What is its speed?", opts: ["80 km/h", "90 km/h", "100 km/h", "70 km/h"], ans: 1, exp: "Speed = Distance / Time = 360 / 4 = 90 km/h", diff: "easy" },
    { q: "If 15% of a number is 45, what is the number?", opts: ["300", "250", "350", "280"], ans: 0, exp: "Number = 45 × 100 / 15 = 300", diff: "easy" },
    { q: "Simple Interest on Rs 5000 at 8% p.a. for 3 years?", opts: ["Rs 1000", "Rs 1200", "Rs 1400", "Rs 1600"], ans: 1, exp: "SI = P × R × T / 100 = 5000 × 8 × 3 / 100 = Rs 1200", diff: "easy" },
    { q: "Bought at Rs 800, sold at Rs 1000. Profit percentage?", opts: ["20%", "25%", "15%", "30%"], ans: 1, exp: "Profit% = (200/800) × 100 = 25%", diff: "easy" },
    { q: "LCM of 12, 16, and 24?", opts: ["48", "96", "36", "72"], ans: 0, exp: "LCM(12,16,24) = 48", diff: "easy" },
    { q: "A pipe fills a tank in 6 hours, another empties in 8 hours. Together how long to fill the tank?", opts: ["24 hrs", "20 hrs", "18 hrs", "22 hrs"], ans: 0, exp: "Net rate = 1/6 - 1/8 = 1/24. Tank fills in 24 hrs.", diff: "medium" },
    { q: "Two numbers are in ratio 3:4. Their HCF is 8. Find their LCM.", opts: ["96", "64", "84", "108"], ans: 0, exp: "Numbers are 24 & 32. LCM = 96.", diff: "medium" },
    { q: "A sum doubles in 5 years at simple interest. Rate% p.a.?", opts: ["20%", "15%", "25%", "10%"], ans: 0, exp: "SI = P means R = 100/T = 100/5 = 20%", diff: "medium" },
    { q: "If (x+1/x)=5, find (x²+1/x²).", opts: ["23", "27", "25", "21"], ans: 0, exp: "(x+1/x)² = x²+2+1/x² = 25, so x²+1/x² = 23", diff: "hard" },
    { q: "A boat goes 30 km upstream in 3 hrs and downstream in 1.5 hrs. Speed of stream?", opts: ["5 km/h", "4 km/h", "6 km/h", "3 km/h"], ans: 0, exp: "US=10, DS=20. Stream = (20-10)/2 = 5 km/h", diff: "hard" }
  ],
  reasoning: [
    { q: "APPLE coded as BQQMF. How is MANGO coded?", opts: ["NBOQH", "NBOHP", "NBPOH", "OBOQH"], ans: 1, exp: "Each letter shifts +1. M→N, A→B, N→O, G→H, O→P = NBOHP", diff: "easy" },
    { q: "Odd one out: 2, 3, 5, 7, 9, 11", opts: ["9", "11", "5", "7"], ans: 0, exp: "9=3×3 is composite. All others are prime.", diff: "easy" },
    { q: "Series: 1, 4, 9, 16, 25, ?", opts: ["36", "30", "49", "32"], ans: 0, exp: "Perfect squares: 1,4,9,16,25,36", diff: "easy" },
    { q: "Priya is 8th from left, 12th from right. Total students?", opts: ["19", "20", "18", "21"], ans: 0, exp: "Total = 8 + 12 - 1 = 19", diff: "easy" },
    { q: "Doctor:Hospital :: Teacher:?", opts: ["School", "Books", "Chalk", "Students"], ans: 0, exp: "A doctor works in a hospital; a teacher works in a school.", diff: "easy" },
    { q: "If A+B means A is mother of B; A-B means A is brother of B; A×B means A is father of B. In P+Q-R, what is P to R?", opts: ["Mother", "Aunt", "Sister", "Grandmother"], ans: 1, exp: "P is mother of Q, Q is brother of R, so P is Aunt of R.", diff: "medium" },
    { q: "Point A is 10m East of B. C is 6m South of A. D is 4m West of C. Distance B to D?", opts: ["10m", "8m", "6m", "12m"], ans: 1, exp: "D is at 6m East & 6m South of B. Hypotenuse = √(36+36) = 6√2 ≈ 8.49 ≈ 8m", diff: "medium" },
    { q: "If all roses are flowers and some flowers are red, which is definitely true?", opts: ["Some roses are red", "All flowers are roses", "Some roses are flowers", "None of the above"], ans: 2, exp: "All roses are flowers is given, so some roses are definitely flowers.", diff: "medium" },
    { q: "Series: 2, 6, 12, 20, 30, ?", opts: ["42", "44", "40", "46"], ans: 0, exp: "Differences are 4,6,8,10,12. Next = 30+12 = 42", diff: "hard" },
    { q: "Water image of 3:25 on a clock?", opts: ["8:35", "9:35", "8:45", "9:25"], ans: 0, exp: "Water image of clock = 6:30 → time = 12:00 - 3:25 + 12:00 = (12:00 - given). 12:00 - 3:25 = 8:35", diff: "hard" }
  ],
  english: [
    { q: "Correct spelling?", opts: ["Accomodation", "Accommodation", "Acommodation", "Acomodation"], ans: 1, exp: "Accommodation: double 'c' and double 'm'", diff: "easy" },
    { q: "She ___ to the market yesterday.", opts: ["go", "goes", "went", "going"], ans: 2, exp: "'Yesterday' = past tense. Past form of 'go' is 'went'", diff: "easy" },
    { q: "Antonym of ABUNDANT:", opts: ["Scarce", "Plenty", "Ample", "Bountiful"], ans: 0, exp: "Abundant = plentiful. Antonym = Scarce", diff: "easy" },
    { q: "'Laconic' means?", opts: ["Brief and to the point", "Long-winded", "Unclear", "Dramatic"], ans: 0, exp: "Laconic = using very few words; brief and concise", diff: "easy" },
    { q: "'___ umbrella is kept there.' — Correct article?", opts: ["A", "An", "The", "No article"], ans: 1, exp: "'Umbrella' starts with a vowel sound. Use 'An'", diff: "easy" },
    { q: "Choose the correct sentence:", opts: ["Neither he nor I are wrong", "Neither he nor I am wrong", "Neither he nor I is wrong", "Neither he nor I were wrong"], ans: 1, exp: "With neither...nor, the verb agrees with the nearest subject (I), so 'am'", diff: "medium" },
    { q: "Synonym of AMELIORATE:", opts: ["Worsen", "Improve", "Ignore", "Complicate"], ans: 1, exp: "Ameliorate means to make something better = Improve", diff: "medium" },
    { q: "The passive voice of 'She was writing a letter':", opts: ["A letter was being written by her", "A letter was written by her", "A letter is written by her", "A letter had been written by her"], ans: 0, exp: "Past continuous passive = was/were being + V3. 'A letter was being written by her'", diff: "medium" },
    { q: "Identify the figure of speech: 'The pen is mightier than the sword'", opts: ["Simile", "Metaphor", "Hyperbole", "Personification"], ans: 1, exp: "A metaphor makes a direct comparison without 'like' or 'as'", diff: "hard" },
    { q: "One word for 'a person who hates mankind':", opts: ["Misanthrope", "Philanthropist", "Egoist", "Pessimist"], ans: 0, exp: "Misanthrope = a person who dislikes humankind", diff: "hard" }
  ],
  gk: [
    { q: "Who is the current President of India?", opts: ["Droupadi Murmu", "Ram Nath Kovind", "Pratibha Patil", "APJ Abdul Kalam"], ans: 0, exp: "Droupadi Murmu became the 15th President on July 25, 2022", diff: "easy" },
    { q: "Largest state of India by area?", opts: ["Rajasthan", "Madhya Pradesh", "Maharashtra", "Uttar Pradesh"], ans: 0, exp: "Rajasthan is largest at 342,239 sq km", diff: "easy" },
    { q: "Who wrote India's national anthem?", opts: ["Rabindranath Tagore", "Bankim Chandra", "Subramanya Bharati", "Sarojini Naidu"], ans: 0, exp: "Jana Gana Mana was composed by Rabindranath Tagore", diff: "easy" },
    { q: "Planet closest to the Sun?", opts: ["Mercury", "Venus", "Earth", "Mars"], ans: 0, exp: "Mercury is closest to the Sun at ~57.9 million km", diff: "easy" },
    { q: "ISRO headquarters is located in?", opts: ["Bengaluru", "Chennai", "Ahmedabad", "Hyderabad"], ans: 0, exp: "ISRO headquarters is in Bengaluru, Karnataka", diff: "easy" },
    { q: "Which Constitutional article gives Right to Education?", opts: ["Article 21A", "Article 19", "Article 21", "Article 32"], ans: 0, exp: "Article 21A, added by 86th Amendment in 2002, gives free education to children 6-14 years", diff: "medium" },
    { q: "'Operation Flood' is associated with?", opts: ["Milk production", "Flood control", "Irrigation", "Wheat production"], ans: 0, exp: "Operation Flood (1970) was a programme to create a national milk grid", diff: "medium" },
    { q: "Which planet has the most moons in our solar system?", opts: ["Saturn", "Jupiter", "Uranus", "Neptune"], ans: 0, exp: "Saturn has 146 confirmed moons, the most in the solar system", diff: "medium" },
    { q: "Palk Strait separates India from?", opts: ["Sri Lanka", "Maldives", "Indonesia", "Bangladesh"], ans: 0, exp: "Palk Strait separates India (Tamil Nadu) from Sri Lanka", diff: "hard" },
    { q: "The 'Doctrine of Lapse' was introduced by?", opts: ["Lord Dalhousie", "Lord Canning", "Lord Wellesley", "Lord Hastings"], ans: 0, exp: "Doctrine of Lapse was introduced by Governor General Lord Dalhousie in 1848", diff: "hard" }
  ],
  pyq: [
    { q: "SSC CGL 2023: If x+y=10 and xy=21, find x-y.", opts: ["2", "4", "3", "5"], ans: 1, exp: "(x-y)²=(x+y)²-4xy=100-84=16. x-y=4", diff: "medium" },
    { q: "IBPS PO 2022: 'Ephemeral' means?", opts: ["Long lasting", "Short-lived", "Very strong", "Extremely weak"], ans: 1, exp: "Ephemeral = lasting very short time; short-lived", diff: "medium" },
    { q: "RRB 2023: Which article abolished untouchability?", opts: ["Article 17", "Article 14", "Article 21", "Article 19"], ans: 0, exp: "Article 17 of Indian Constitution abolishes untouchability", diff: "easy" },
    { q: "CDS 2022: Binary of decimal 12?", opts: ["1100", "1010", "1001", "1110"], ans: 0, exp: "12 = 8+4 = 1100 in binary", diff: "easy" },
    { q: "NDA 2023: Speed of light in vacuum?", opts: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], ans: 0, exp: "Speed of light = 3 × 10⁸ metres per second", diff: "easy" },
    { q: "SSC CHSL 2023: A cistern is 2/3 full. Pipe A fills in 6 min, B drains in 10 min. How long to empty?", opts: ["15 min", "12 min", "18 min", "20 min"], ans: 0, exp: "Net drain via B only: 2/3 × 10 = 15 min.", diff: "hard" },
    { q: "IBPS Clerk 2022: Ratio of present ages of A:B = 4:5. After 5 years ratio = 5:6. Find A's current age.", opts: ["20", "25", "15", "30"], ans: 0, exp: "4x+5/5x+5=5/6 → 24x+30=25x+25 → x=5. A=20", diff: "medium" },
    { q: "SSC GD 2023: Deepest lake in the world?", opts: ["Baikal", "Caspian Sea", "Titicaca", "Superior"], ans: 0, exp: "Lake Baikal in Siberia, Russia is the world's deepest lake at 1,642 m", diff: "easy" },
    { q: "RRB NTPC 2022: Which gas is used in fire extinguishers?", opts: ["CO₂", "O₂", "N₂", "SO₂"], ans: 0, exp: "Carbon dioxide (CO₂) is used in fire extinguishers to smother fire", diff: "easy" },
    { q: "CDS 2023: Transformer works on principle of?", opts: ["Mutual induction", "Self induction", "Resonance", "Piezoelectric"], ans: 0, exp: "Transformers work on Faraday's principle of mutual electromagnetic induction", diff: "medium" }
  ]
};

export default function StartTestPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const defaultSubj = searchParams.get('subject');
  const router = useRouter();

  // Settings State
  const [testMode, setTestMode] = useState<'timed' | 'practice'>('timed');
  const [testDiff, setTestDiff] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Custom DB-loaded Question Bank
  const [customQB, setCustomQB] = useState<Record<string, Question[]> | null>(null);

  // Client-side state hydration
  const [dbState, setDbState] = useState<DbState>({});
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free');

  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        if (data.qb) {
          setCustomQB(data.qb);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      const p2 = (n: number) => String(n).padStart(2, '0');
      const today = `${new Date().getFullYear()}-${p2(new Date().getMonth() + 1)}-${p2(new Date().getDate())}`;
      fetch(`/api/user/mock-test-stats?clientDate=${today}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setDbState(data.db || {});
            setUserPlan(data.plan || 'free');
          }
        })
        .catch(console.error);
    }
  }, [session]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Engine overlay state
  const [testActive, setTestActive] = useState(false);
  const [currentSubj, setCurrentSubj] = useState<Subject | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<boolean[]>([]);
  const [overallTimeLeft, setOverallTimeLeft] = useState(600);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(35);
  const [testStartTime, setTestStartTime] = useState(0);

  // Results State
  const [resultsActive, setResultsActive] = useState(false);
  const [resultScore, setResultScore] = useState({ correct: 0, wrong: 0, skipped: 0, timeTaken: 0 });

  const mainTimerRef = useRef<NodeJS.Timeout | null>(null);
  const qTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Declare submitTest with useCallback BEFORE the effects that reference it
  const submitTest = useCallback(() => {
    if (mainTimerRef.current) clearInterval(mainTimerRef.current);
    if (qTimerRef.current) clearInterval(qTimerRef.current);

    setSelectedAnswers(prevAnswers => {
      setCurrentQuestions(prevQs => {
        let correct = 0, wrong = 0, skipped = 0;
        prevAnswers.forEach((ans, i) => {
          if (ans === null) skipped++;
          else if (ans === prevQs[i].ans) correct++;
          else wrong++;
        });

        const timeTaken = Math.round((Date.now() - testStartTime) / 1000);
        setResultScore({ correct, wrong, skipped, timeTaken });

        const p2 = (n: number) => String(n).padStart(2, '0');
        const today = `${new Date().getFullYear()}-${p2(new Date().getMonth() + 1)}-${p2(new Date().getDate())}`;

        setCurrentSubj(prevSubj => {
          if (!prevSubj) return prevSubj;
          setDbState(prevDb => {
            const updatedState = { ...prevDb };
            if (!updatedState[today]) updatedState[today] = {} as Record<string, SubjectRecord>;
            if (!updatedState[today][prevSubj.id] || correct > updatedState[today][prevSubj.id].score) {
              updatedState[today][prevSubj.id] = { score: correct, wrong, skip: skipped, max: prevQs.length, time: Date.now() };
            }
            return updatedState;
          });

          // --- Sync to DB for authenticated users ---
          if (session?.user?.id) {
            const payload = {
              date: today,
              subject: prevSubj.id,
              score: correct,
              wrong,
              skip: skipped,
              max: prevQs.length,
              timeSecs: timeTaken,
              mode: testMode,
              plan: userPlan,
            };
            fetch('/api/mock-tests/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            .then(() => {
              window.dispatchEvent(new Event("stats-updated"));
            })
            .catch(err => console.error('[mock-test] Failed to sync result to DB:', err));
          }

          return prevSubj;
        });

        return prevQs;
      });
      return prevAnswers;
    });

    setTestActive(false);
    setResultsActive(true);
  }, [testStartTime, session, testMode, userPlan]);

  // Declare startTest with useCallback BEFORE the effect that references it
  const startTest = useCallback((subj: Subject) => {
    const isPrem = userPlan !== 'free';
    const maxQ = isPrem ? 10 : 3;
    let pool = (customQB && customQB[subj.id]) || QB[subj.id] || [];
    if (testDiff !== 'all') {
      pool = pool.filter(q => q.diff === testDiff);
    }
    if (!pool.length) {
      showToast(`No ${testDiff} questions available for this subject`);
      return;
    }

    const shuffled = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(maxQ, pool.length));

    setCurrentSubj(subj);
    setCurrentQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(shuffled.length).fill(null));
    setBookmarkedQuestions(new Array(shuffled.length).fill(false));
    setTestStartTime(Date.now());
    setResultsActive(false);

    if (testMode === 'practice') {
      setOverallTimeLeft(600);
    } else {
      const initTime = shuffled.length * 45;
      setOverallTimeLeft(initTime);
      setQuestionTimeLeft(35);
    }
    setTestActive(true);
  }, [userPlan, testDiff, testMode, customQB, showToast]);

  // Handle direct start from URL — runs after startTest is declared
  useEffect(() => {
    if (defaultSubj) {
      const match = SUBJECTS.find(s => s.id === defaultSubj);
      if (match) {
        // Defer to avoid synchronous cascading renders
        setTimeout(() => startTest(match), 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSubj]); // intentionally omit startTest — only trigger on mount

  // Main overall timer ticks
  useEffect(() => {
    if (testActive && testMode === 'timed') {
      mainTimerRef.current = setInterval(() => {
        setOverallTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(mainTimerRef.current!);
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (mainTimerRef.current) clearInterval(mainTimerRef.current); };
  }, [testActive, testMode, submitTest]);

  // Per-question timer ticks
  useEffect(() => {
    if (testActive && testMode === 'timed' && selectedAnswers[currentQuestionIndex] === null) {
      // Defer state update to avoid synchronous cascading renders during render phase transitions
      const timer = setTimeout(() => {
        setQuestionTimeLeft(35);
      }, 0);

      qTimerRef.current = setInterval(() => {
        setQuestionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(qTimerRef.current!);
            if (currentQuestionIndex < currentQuestions.length - 1) {
              setCurrentQuestionIndex(p => p + 1);
            } else {
              submitTest();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(timer);
        if (qTimerRef.current) clearInterval(qTimerRef.current);
      };
    }
  }, [testActive, testMode, currentQuestionIndex, selectedAnswers, currentQuestions.length, submitTest]);

  const selectAnswer = (ansIdx: number) => {
    if (testMode === 'practice' && selectedAnswers[currentQuestionIndex] !== null) return;
    if (qTimerRef.current) clearInterval(qTimerRef.current);

    const updated = [...selectedAnswers];
    updated[currentQuestionIndex] = ansIdx;
    setSelectedAnswers(updated);
  };

  const skipQuestion = () => {
    if (qTimerRef.current) clearInterval(qTimerRef.current);
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(p => p + 1);
    } else {
      submitTest();
    }
  };

  const toggleBookmark = () => {
    const updated = [...bookmarkedQuestions];
    updated[currentQuestionIndex] = !updated[currentQuestionIndex];
    setBookmarkedQuestions(updated);
    showToast(updated[currentQuestionIndex] ? 'Question bookmarked!' : 'Bookmark removed');
  };

  const p2 = (n: number) => String(n).padStart(2, '0');
  const today = `${new Date().getFullYear()}-${p2(new Date().getMonth() + 1)}-${p2(new Date().getDate())}`;

  return (
    <>
      {toastMessage && (
        <div className="fixed bottom-18.5 sm:bottom-6 left-1/2 -translate-x-1/2 bg-[#0d1b2a] border border-white/8 text-white text-xs font-black tracking-wide uppercase px-5 py-2.5 rounded-full shadow-lg z-50 animate-fadeUp">
          {toastMessage}
        </div>
      )}

      {testActive && currentSubj && currentQuestions[currentQuestionIndex] ? (
        <div className="fixed inset-0 z-50 flex flex-col animate-slideInRight bg-slate-50 dark:bg-[#0a1628] w-full h-full">
          {/* ── TOP HEADER: Dark, branded ── */}
          <div className="bg-[#0d1b2a] shrink-0 select-none pt-safe">
            {/* Row 1: Exit | Subject | Timer */}
            <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-3">
              <button
                onClick={() => {
                  if (mainTimerRef.current) clearInterval(mainTimerRef.current);
                  if (qTimerRef.current) clearInterval(qTimerRef.current);
                  setTestActive(false);
                }}
                className="text-xs font-black text-white/60 tracking-wider uppercase bg-white/5 border border-white/10 px-4 py-2.5 rounded-full hover:bg-white/10 hover:text-white flex items-center gap-1.5 transition-colors shrink-0 min-h-[44px]"
              >
                ← Exit
              </button>
              <div className="flex flex-col items-center">
                <span className="font-extrabold text-xs sm:text-[13px] text-white uppercase tracking-widest leading-none">
                  {currentSubj.name}
                </span>
                <span className="text-[8px] font-bold text-white/30 tracking-widest uppercase mt-1">Mock Test</span>
              </div>
              <div className={`rounded-xl px-4 py-2.5 text-xs font-black tracking-wider flex items-center gap-1.5 shrink-0 min-h-[44px] ${
                testMode === 'practice'
                  ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
                  : overallTimeLeft < 30
                  ? 'bg-red-500/20 border border-red-500/30 text-red-400 animate-pulse'
                  : 'bg-orange-500/15 border border-orange-500/25 text-orange-400'
              }`}>
                <Clock className="w-4 h-4" />
                {testMode === 'practice'
                  ? 'Practice'
                  : `${String(Math.floor(overallTimeLeft / 60)).padStart(2, '0')}:${String(overallTimeLeft % 60).padStart(2, '0')}`}
              </div>
            </div>

            {/* Row 2: Progress bar */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
                    className="h-full bg-linear-to-r from-orange-500 to-amber-400 transition-all duration-500 rounded-full"
                  />
                </div>
                <span className="text-[9px] font-black text-white/40 tracking-widest whitespace-nowrap">
                  {currentQuestionIndex + 1} / {currentQuestions.length}
                </span>
              </div>
            </div>

            {/* Row 3: Question dot grid */}
            <div className="flex gap-2 sm:gap-1.5 flex-wrap px-4 pb-4 border-b border-white/5">
              {currentQuestions.map((_, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const ans = selectedAnswers[idx];
                const isCorrect = ans !== null && ans === currentQuestions[idx].ans;

                let dotClass = 'bg-white/5 border border-white/12 text-white/30';
                if (isCurrent) {
                  dotClass = 'bg-orange-50 border border-orange-500 text-orange-600 shadow-sm shadow-orange-500/40';
                } else if (ans !== null) {
                  if (testMode === 'timed') {
                    dotClass = 'bg-orange-500 border border-orange-500 text-white shadow-sm';
                  } else {
                    dotClass = isCorrect ? 'bg-emerald-500 border border-emerald-500 text-white' : 'bg-red-500 border border-red-500 text-white';
                  }
                } else if (idx < currentQuestionIndex) {
                  dotClass = 'bg-amber-500/20 border border-amber-500/40 text-amber-400';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-11 h-11 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-[10px] font-black transition-all hover:scale-110 relative ${dotClass}`}
                  >
                    {idx + 1}
                    {bookmarkedQuestions[idx] && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 border border-[#0d1b2a]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── BODY: Light, scrollable ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5">

              {/* Q meta + bookmark row */}
              <div className="flex items-center justify-between gap-3 select-none">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                    currentQuestions[currentQuestionIndex].diff === 'easy'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25'
                      : currentQuestions[currentQuestionIndex].diff === 'medium'
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/25'
                      : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/25'
                  }`}>
                    {currentQuestions[currentQuestionIndex].diff}
                  </span>
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full px-2.5 py-1 text-[9px] font-black">
                    <Check className="w-3 h-3" />
                    {selectedAnswers.filter((a, i) => a === currentQuestions[i].ans).length} correct
                  </div>
                </div>
                <button
                  onClick={toggleBookmark}
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                    bookmarkedQuestions[currentQuestionIndex]
                      ? 'text-orange-500 border-orange-400 bg-orange-50 dark:bg-orange-500/10'
                      : 'text-slate-400 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-400 hover:text-orange-500'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Per-question timer bar */}
              {testMode === 'timed' && selectedAnswers[currentQuestionIndex] === null && (
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(questionTimeLeft / 35) * 100}%` }}
                    className={`h-full rounded-full transition-all duration-1000 linear ${
                      questionTimeLeft < 12 ? 'bg-red-500 animate-pulse' : 'bg-linear-to-r from-emerald-400 to-orange-400'
                    }`}
                  />
                </div>
              )}

              {/* ── QUESTION CARD ── */}
              <div className="bg-white dark:bg-[#111d2e] rounded-2xl border border-slate-200 dark:border-slate-800 px-6 py-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 bg-orange-500 text-white text-[9px] font-black w-6 h-6 rounded-md flex items-center justify-center">
                    {currentQuestionIndex + 1}
                  </span>
                  <p className="font-semibold text-[15px] sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed tracking-tight">
                    {currentQuestions[currentQuestionIndex].q}
                  </p>
                </div>
              </div>

              {/* Explanation card - placed right below question card so it is always above fold and visible */}
              {testMode === 'practice' && selectedAnswers[currentQuestionIndex] !== null && (
                <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-300/50 dark:border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start animate-slideDown">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <span className="block text-[8.5px] font-black text-amber-500 uppercase tracking-widest mb-1.5">Explanation</span>
                    <p className="text-[12.5px] font-medium text-amber-900 dark:text-amber-300 leading-relaxed">
                      {currentQuestions[currentQuestionIndex].exp}
                    </p>
                  </div>
                </div>
              )}

              {/* ── ANSWER OPTIONS ── */}
              <div className="flex flex-col gap-2.5">
                {currentQuestions[currentQuestionIndex].opts.map((opt, oIdx) => {
                  const ans = selectedAnswers[currentQuestionIndex];
                  const isSelected = ans === oIdx;
                  const correctIdx = currentQuestions[currentQuestionIndex].ans;
                  const isCorrect = oIdx === correctIdx;
                  const answered = ans !== null;

                  let wrapClass = 'border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111d2e] hover:border-orange-400 hover:shadow-sm cursor-pointer active:scale-[0.99]';
                  let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700';
                  let textClass = 'text-slate-700 dark:text-slate-200';
                  let trailingIcon = null;

                  if (answered) {
                    if (testMode === 'timed') {
                      if (isSelected) {
                        wrapClass = 'border-2 border-orange-500 bg-orange-50 dark:bg-orange-500/8 cursor-pointer';
                        badgeClass = 'bg-orange-500 text-white border-orange-500';
                        textClass = 'text-orange-800 dark:text-orange-300 font-bold';
                      }
                    } else {
                      if (isCorrect) {
                        wrapClass = 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/8 cursor-default';
                        badgeClass = 'bg-emerald-500 text-white border-emerald-500';
                        textClass = 'text-emerald-800 dark:text-emerald-300 font-bold';
                        trailingIcon = <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>;
                      } else if (isSelected) {
                        wrapClass = 'border-2 border-red-500 bg-red-50 dark:bg-red-500/8 cursor-default';
                        badgeClass = 'bg-red-500 text-white border-red-500';
                        textClass = 'text-red-700 dark:text-red-300 font-bold';
                        trailingIcon = <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-white" /></div>;
                      } else {
                        wrapClass = 'border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1626] opacity-45 cursor-not-allowed';
                      }
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => selectAnswer(oIdx)}
                      disabled={testMode === 'practice' && answered}
                      className={`w-full text-left px-4 py-4 rounded-xl transition-all flex items-center justify-between gap-4 ${wrapClass}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 transition-all ${badgeClass}`}>
                          {['A', 'B', 'C', 'D'][oIdx]}
                        </div>
                        <span className={`text-[13px] sm:text-sm leading-snug ${textClass}`}>{opt}</span>
                      </div>
                      {trailingIcon}
                    </button>
                  );
                })}
              </div>

              {/* Bottom padding for sticky footer */}
              <div className="h-4" />
            </div>
          </div>

          {/* ── STICKY FOOTER NAV ── */}
          <div className="bg-white dark:bg-[#0d1b2a] border-t border-slate-100 dark:border-slate-800 px-4 py-3 shrink-0 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-none pb-safe">
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              <button
                onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(q => q - 1)}
                disabled={currentQuestionIndex === 0}
                className="text-xs font-black text-slate-600 dark:text-slate-300 tracking-widest uppercase px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-orange-400 hover:text-orange-500 transition-all disabled:opacity-25 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center"
              >
                ← Prev
              </button>
              <div className="flex-1">
                {currentQuestionIndex < currentQuestions.length - 1 ? (
                  <button
                    onClick={skipQuestion}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black tracking-widest uppercase rounded-xl hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 transition-colors min-h-[48px] flex items-center justify-center"
                  >
                    Skip →
                  </button>
                ) : (
                  <button
                    onClick={submitTest}
                    className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-xs font-black tracking-widest uppercase rounded-xl shadow-lg shadow-orange-500/20 transition-all min-h-[48px] flex items-center justify-center"
                  >
                    Submit Test ✓
                  </button>
                )}
              </div>
              <button
                onClick={() => currentQuestionIndex < currentQuestions.length - 1 && setCurrentQuestionIndex(q => q + 1)}
                disabled={currentQuestionIndex === currentQuestions.length - 1}
                className="text-xs font-black text-slate-600 dark:text-slate-300 tracking-widest uppercase px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-orange-400 hover:text-orange-500 transition-all disabled:opacity-25 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      ) : resultsActive && currentSubj ? (
        <div className="fixed inset-0 z-50 flex flex-col animate-slideInRight bg-slate-50 dark:bg-[#0a1628] w-full h-full overflow-y-auto">
          <div className="max-w-175 mx-auto w-full p-4 sm:p-6 pb-12 flex flex-col gap-5 items-center">
            {/* Concentric rings trophy header */}
            <div className="relative flex items-center justify-center p-8 w-full mt-4 select-none">
              <div className="absolute rounded-full border border-orange-500/10 w-35 h-35 animate-pulse" />
              <div className="absolute rounded-full border border-orange-500/5 w-45 h-45 animate-pulse delay-500" />
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-orange-500 to-amber-400 flex items-center justify-center relative z-10 shadow-lg shadow-orange-500/20">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="text-center select-none">
              <div className="font-extrabold text-5xl sm:text-6xl text-slate-800 dark:text-white leading-none tracking-tight">
                {resultScore.correct} <span className="text-xl font-bold text-slate-400">/{currentQuestions.length}</span>
              </div>
              <span className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mt-2.5">
                {currentSubj.name.toUpperCase()} COMPLETED
              </span>
              <span className={`block text-[15px] font-black mt-1.5 ${resultScore.correct >= currentQuestions.length * 0.8 ? 'text-green-500' : resultScore.correct >= currentQuestions.length * 0.6 ? 'text-orange-500' : 'text-red-500'}`}>
                {resultScore.correct >= currentQuestions.length * 0.8 ? 'Outstanding!' : resultScore.correct >= currentQuestions.length * 0.6 ? 'Steady Progress — Keep Going' : 'Foundation Needs Work'}
              </span>
            </div>

            {/* Results Grid counters */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="bg-white dark:bg-[#111d2e] rounded-xl p-3 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="font-extrabold text-2xl text-green-500 leading-none">{resultScore.correct}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1.5">Correct</div>
              </div>
              <div className="bg-white dark:bg-[#111d2e] rounded-xl p-3 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="font-extrabold text-2xl text-red-500 leading-none">{resultScore.wrong}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1.5">Wrong</div>
              </div>
              <div className="bg-white dark:bg-[#111d2e] rounded-xl p-3 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="font-extrabold text-2xl text-amber-500 leading-none">{resultScore.skipped}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1.5">Skipped</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-white dark:bg-[#111d2e] rounded-xl p-3.5 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="font-extrabold text-2xl text-orange-500 leading-none">
                  {Math.round((resultScore.correct / currentQuestions.length) * 100)}%
                </div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1.5">Accuracy</div>
              </div>
              <div className="bg-white dark:bg-[#111d2e] rounded-xl p-3.5 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="font-extrabold text-2xl text-blue-500 leading-none">
                  {testMode === 'practice' ? '—' : `${resultScore.timeTaken}s`}
                </div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1.5">Time Taken</div>
              </div>
            </div>

            {/* Performance insights block */}
            <div className="bg-white dark:bg-[#111d2e] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden w-full transition-colors">
              <div className="bg-[#0d1b2a] px-4 py-2.5 text-white text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5">
                💡 Performance Insights
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {resultScore.correct >= currentQuestions.length * 0.8 ? (
                  <>
                    <div className="p-3.5 flex gap-3 items-start">
                      <div className="w-7.5 h-7.5 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">🏆</div>
                      <div>
                        <span className="block text-[9.5px] font-black text-green-500 uppercase tracking-wide">Excellent Score</span>
                        <p className="text-[11.5px] font-bold text-slate-500 leading-relaxed mt-0.5">Your fundamentals in {currentSubj.name} are robust and competitive.</p>
                      </div>
                    </div>
                    <div className="p-3.5 flex gap-3 items-start">
                      <div className="w-7.5 h-7.5 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">🎯</div>
                      <div>
                        <span className="block text-[9.5px] font-black text-blue-500 uppercase tracking-wide">Study Goal</span>
                        <p className="text-[11.5px] font-bold text-slate-500 leading-relaxed mt-0.5">Explore hard difficulty filters and PYQ sets to solidify your preparation.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3.5 flex gap-3 items-start">
                      <div className="w-7.5 h-7.5 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">📈</div>
                      <div>
                        <span className="block text-[9.5px] font-black text-orange-500 uppercase tracking-wide">Needs Practice</span>
                        <p className="text-[11.5px] font-bold text-slate-500 leading-relaxed mt-0.5">Push your accuracy target rate above 80% with focused subject revision.</p>
                      </div>
                    </div>
                    <div className="p-3.5 flex gap-3 items-start">
                      <div className="w-7.5 h-7.5 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">🔍</div>
                      <div>
                        <span className="block text-[9.5px] font-black text-red-500 uppercase tracking-wide">Review Errors</span>
                        <p className="text-[11.5px] font-bold text-slate-500 leading-relaxed mt-0.5">You committed {resultScore.wrong} mistake{resultScore.wrong !== 1 ? 's' : ''}. Thoroughly read each question breakdown below.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Answer review list */}
            <div className="bg-white dark:bg-[#111d2e] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden w-full transition-colors">
              <div className="bg-[#0d1b2a] px-4 py-2.5 text-white text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5">
                📝 Questions &amp; Answers Review
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentQuestions.map((q, idx) => {
                  const ans = selectedAnswers[idx];
                  const ok = ans === q.ans;
                  const skipped = ans === null;

                  return (
                    <div key={idx} className={`p-4 flex gap-3.5 items-start ${skipped ? 'bg-amber-500/3' : ok ? 'bg-green-500/3' : 'bg-red-500/3'}`}>
                      <div className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${skipped ? 'bg-amber-500 text-white' : ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 text-xs">
                        <span className="block font-black text-slate-800 dark:text-white leading-relaxed">
                          {q.q}
                        </span>
                        <span className={`block font-black tracking-wide uppercase text-[9.5px] mt-1.5 ${skipped ? 'text-amber-500' : ok ? 'text-green-500' : 'text-red-500'}`}>
                          {skipped ? 'Skipped' : ok ? `✓ Correct: ${q.opts[q.ans]}` : `✗ Your Ans: ${q.opts[ans as number]}`}
                        </span>
                        {!ok && !skipped && (
                          <span className="block font-black text-green-500 uppercase tracking-wide text-[9.5px] mt-1">
                            ✓ Correct: {q.opts[q.ans]}
                          </span>
                        )}
                        <p className="text-[11px] font-medium text-slate-400 leading-normal mt-2">
                          {q.exp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Results Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full mt-2 select-none">
              <button
                onClick={() => {
                  setResultsActive(false);
                  router.push('/mock-tests');
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-[10.5px] font-black tracking-widest uppercase py-3.5 rounded-xl shadow-md transition-all"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => currentSubj && startTest(currentSubj)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[10.5px] font-black tracking-widest uppercase py-3.5 rounded-xl hover:border-orange-500 transition-colors"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>

      ) : (
        <div className="animate-fadeUp flex flex-col gap-8 max-w-5xl mx-auto w-full p-4 sm:p-8">
          
          {/* SECTION: TEST MODE & DIFFICULTY */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase whitespace-nowrap">
                TEST MODE
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Mode Config */}
              <div className="bg-white dark:bg-[#111d2e] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Mode</span>
                <div className="flex bg-slate-50 dark:bg-slate-900/50 rounded-full p-1.5 gap-1 border border-slate-100 dark:border-slate-800/50">
                  <button
                    onClick={() => setTestMode('timed')}
                    className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all ${testMode === 'timed' ? 'bg-[#0d1b2a] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Timed
                  </button>
                  <button
                    onClick={() => setTestMode('practice')}
                    className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all ${testMode === 'practice' ? 'bg-[#0d1b2a] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Practice
                  </button>
                </div>
                <p className="text-xs font-medium text-slate-400">
                  {testMode === 'timed' ? '35 sec per question — live timer' : 'Practice mode — no timers'}
                </p>
              </div>

              {/* Difficulty Config */}
              <div className="bg-white dark:bg-[#111d2e] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Difficulty</span>
                <div className="flex bg-slate-50 dark:bg-slate-900/50 rounded-full p-1.5 gap-1 border border-slate-100 dark:border-slate-800/50">
                  {(['all', 'easy', 'medium', 'hard'] as const).map(diff => {
                    const isActive = testDiff === diff;
                    return (
                      <button
                        key={diff}
                        onClick={() => setTestDiff(diff)}
                        className={`flex-1 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider rounded-full transition-all ${isActive ? 'bg-[#0d1b2a] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {diff === 'medium' ? 'MED' : diff}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-medium text-slate-400">
                  {testDiff === 'all' ? 'All difficulty levels' : `Selected: ${testDiff.toUpperCase()} questions only`}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION: CHOOSE A SUBJECT */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase whitespace-nowrap">
                CHOOSE A SUBJECT
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SUBJECTS.map(s => {
                const records = dbState[today] || {};
                const done = !!records[s.id];
                const score = done ? records[s.id].score : 0;
                const max = done ? records[s.id].max : 0;
                const qCount = userPlan !== 'free' ? 10 : 3;

                return (
                  <div
                    key={s.id}
                    onClick={() => startTest(s)}
                    className="bg-white dark:bg-[#111d2e] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-orange-500 hover:shadow-md cursor-pointer transition-all flex flex-col relative group"
                  >
                    {/* Top row: Icon and Start pill */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0d1b2a] flex items-center justify-center text-2xl shadow-inner">
                        {s.icon}
                      </div>
                      <div className="px-3 py-1 rounded-full border border-orange-200 text-orange-500 text-[9px] font-bold uppercase tracking-widest bg-orange-50 dark:bg-orange-500/10 dark:border-orange-500/30 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        START
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex flex-col gap-1.5 mt-auto">
                      <h3 className="font-extrabold text-[#0d1b2a] dark:text-white text-[15px] leading-tight">
                        {s.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <span>{done ? `Done: ${score}/${max}` : `${qCount} Qs`}</span>
                        <span>·</span>
                        <span>{testMode === 'timed' ? 'Timed' : 'Practice'}</span>
                      </div>
                    </div>
                    
                    {/* Bottom Progress Line */}
                    <div className="h-1 w-full bg-slate-50 dark:bg-slate-800/50 rounded-full mt-4 overflow-hidden">
                      {done && (
                        <div 
                          className="h-full bg-orange-500 rounded-full" 
                          style={{ width: `${(score / max) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PREMIUM BLOCK */}
          {userPlan === 'free' && (
            <div className="bg-[#0d1b2a] rounded-3xl p-10 flex flex-col items-center text-center shadow-xl relative overflow-hidden mt-6">
              {/* Background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 mb-4 text-orange-500 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                  <Lock />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">Upgrade to Premium</h2>
                <p className="text-sm font-medium text-slate-400 mb-1">Free: 3 questions per subject.</p>
                <p className="text-sm font-medium text-slate-400 mb-8">Premium: 10 questions + all difficulty levels + full analytics + history.</p>
                
                <a
                  href="/mock-tests/upgrade"
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white text-[11px] font-black tracking-[0.15em] uppercase px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-95"
                >
                  SEE PLANS FROM RS 75
                </a>
              </div>
            </div>
          )}
        </div>
      )}
  </>
  );
}
