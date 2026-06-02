import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getBookRecommendation } from '@/lib/services/bookRecommendationService';

const DEFAULT_BOOKS = [
  { id: 1, subj: 'math', name: 'Fast Track Objective Arithmetic', author: 'Rajesh Verma', desc: 'Best for SSC/Banking Maths. Covers all topics with shortcuts.', link: 'https://amazon.in', tag: 'Bestseller' },
  { id: 2, subj: 'reasoning', name: 'Verbal & Non-Verbal Reasoning', author: 'R.S. Aggarwal', desc: 'Complete reasoning with 5000+ questions for all competitive exams.', link: 'https://amazon.in', tag: 'Top Rated' },
  { id: 3, subj: 'english', name: 'Objective General English', author: 'S.P. Bakshi', desc: 'Grammar, comprehension, vocabulary for SSC, IBPS, RRB and more.', link: 'https://amazon.in', tag: 'Popular' },
  { id: 4, subj: 'gk', name: 'Manorama Yearbook 2026', author: 'Manorama', desc: 'Complete general awareness and current affairs for all govt exams.', link: 'https://amazon.in', tag: 'Must Have' },
  { id: 5, subj: 'pyq', name: '25 Years SSC Chapterwise Solved Papers', author: 'Arihant Experts', desc: 'Previous year questions with detailed solutions for SSC CGL/CHSL.', link: 'https://amazon.in', tag: 'Recommended' }
];

export async function GET() {
  try {
    const session = await auth();
    const recommendation = await getBookRecommendation(session?.user?.id);

    const row = await prisma.siteSettings.findUnique({
      where: { key: 'recommended_books' }
    });

    const books = row && row.value ? JSON.parse(row.value) : DEFAULT_BOOKS;

    return NextResponse.json({
      books,
      recommendation
    });
  } catch (error) {
    console.error("Error fetching recommended books:", error);
    return NextResponse.json({
      books: DEFAULT_BOOKS,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
