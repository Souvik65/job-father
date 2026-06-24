import { prisma } from '@/lib/prisma';

export interface PrepBook {
  id: string | number;
  subj: string;
  name: string;
  author: string;
  desc?: string;
  link: string;
  tag?: string;
}

export interface RecommendationResponse {
  weakSubjectId: string | null;
  weakSubjectName: string | null;
  recommendedBook: PrepBook | null;
  accuracy: number | null;
  reason: string;
}

const DEFAULT_BOOKS: PrepBook[] = [
  { id: 1, subj: 'math', name: 'Fast Track Objective Arithmetic', author: 'Rajesh Verma', desc: 'Best for SSC/Banking Maths. Covers all topics with shortcuts.', link: 'https://amazon.in', tag: 'Bestseller' },
  { id: 2, subj: 'reasoning', name: 'Verbal & Non-Verbal Reasoning', author: 'R.S. Aggarwal', desc: 'Complete reasoning with 5000+ questions for all competitive exams.', link: 'https://amazon.in', tag: 'Top Rated' },
  { id: 3, subj: 'english', name: 'Objective General English', author: 'S.P. Bakshi', desc: 'Grammar, comprehension, vocabulary for SSC, IBPS, RRB and more.', link: 'https://amazon.in', tag: 'Popular' },
  { id: 4, subj: 'gk', name: 'Manorama Yearbook 2026', author: 'Manorama', desc: 'Complete general awareness and current affairs for all govt exams.', link: 'https://amazon.in', tag: 'Must Have' },
  { id: 5, subj: 'pyq', name: '25 Years SSC Chapterwise Solved Papers', author: 'Arihant Experts', desc: 'Previous year questions with detailed solutions for SSC CGL/CHSL.', link: 'https://amazon.in', tag: 'Recommended' }
];

const SUBJECTS_MAP: Record<string, string> = {
  math: 'Quantitative Aptitude',
  reasoning: 'Reasoning Ability',
  english: 'English Language',
  gk: 'General Knowledge',
  pyq: 'Previous Year Qs'
};

export async function getBookRecommendation(userId: string | undefined): Promise<RecommendationResponse> {
  // 1. Fetch custom books from site settings or fallback to DEFAULT_BOOKS
  let books = DEFAULT_BOOKS;
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { key: 'recommended_books' }
    });
    if (row && row.value) {
      const parsed = JSON.parse(row.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        books = parsed;
      }
    }
  } catch (err) {
    console.error('Error fetching custom recommended books:', err);
  }

  // If no user is logged in, recommend the default bestseller (first book)
  if (!userId) {
    return {
      weakSubjectId: null,
      weakSubjectName: null,
      recommendedBook: books[0] || DEFAULT_BOOKS[0],
      accuracy: null,
      reason: 'Register or log in to track mock test performance and receive personalized book recommendations.'
    };
  }

  // 2. Fetch all mock test results for the user
  const results = await prisma.mockTestResult.findMany({
    where: { userId },
    select: { subject: true, score: true, max: true }
  });

  // If no results yet, recommend the first default book
  if (!results.length) {
    return {
      weakSubjectId: null,
      weakSubjectName: null,
      recommendedBook: books[0] || DEFAULT_BOOKS[0],
      accuracy: null,
      reason: 'Take your first mock test to identify weak areas and get personalized study book recommendations!'
    };
  }

  // 3. Calculate accuracy for each subject
  const subjectTotals: Record<string, { score: number; max: number }> = {};
  results.forEach(r => {
    if (!subjectTotals[r.subject]) {
      subjectTotals[r.subject] = { score: 0, max: 0 };
    }
    subjectTotals[r.subject].score += r.score;
    subjectTotals[r.subject].max += r.max;
  });

  // Calculate accuracies
  const accuracies = Object.entries(subjectTotals).map(([subj, data]) => {
    return {
      subj,
      accuracy: data.max > 0 ? (data.score / data.max) * 100 : 0
    };
  });

  // Sort by accuracy (lowest first)
  accuracies.sort((a, b) => a.accuracy - b.accuracy);

  const weakest = accuracies[0];
  const weakSubjectName = SUBJECTS_MAP[weakest.subj] || weakest.subj;
  const recommendedBook = books.find(b => b.subj === weakest.subj) || books[0] || DEFAULT_BOOKS[0];

  return {
    weakSubjectId: weakest.subj,
    weakSubjectName,
    recommendedBook,
    accuracy: Math.round(weakest.accuracy),
    reason: `Identified Weak Subject: ${weakSubjectName} with an average accuracy of ${Math.round(weakest.accuracy)}%.`
  };
}
