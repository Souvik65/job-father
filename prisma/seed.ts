/**
 * prisma/seed.ts
 * Seeds the database with initial government job data migrated from the static jobs.ts file.
 * Run with: npx prisma db seed
 */

// Official Prisma v7 pattern: PrismaNeon accepts connectionString config directly
// See: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction#3-importing-prisma-client
import { PrismaClient, Category, Stage } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ──────────────────────────────────────────────
// Helper: create a URL-safe slug from job title
// ──────────────────────────────────────────────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ──────────────────────────────────────────────
// Seed data: migrated from src/lib/jobs.ts
// Extended with ExamTimeline and organization data
// ──────────────────────────────────────────────
const seedJobs = [
  {
    title: 'TPSC Senior Administrative Officer (SAO)',
    organization: 'Tripura Public Service Commission',
    category: Category.TPSC,
    totalVacancies: 25,
    description:
      'Tripura Public Service Commission (TPSC) is recruiting Senior Administrative Officers. Eligibility: Graduate from a recognized university. Selection process: Written exam followed by personal interview. Salary: Pay Level 10 (₹56,100 – ₹1,77,500).',
    syllabusUrl: 'https://tpsc.tripura.gov.in/syllabus',
    sourceUrl: 'https://tpsc.tripura.gov.in',
    applyUrl: 'https://tpsc.tripura.gov.in/apply',
    isVerified: true,
    isPrivate: false,
    timeline: {
      notificationDate: new Date('2026-05-15'),
      applicationStart: new Date('2026-05-16'),
      applicationEnd: new Date('2026-06-30'),
      admitCardDate: new Date('2026-07-20'),
      examDate: new Date('2026-08-10'),
      resultDate: new Date('2026-09-15'),
      currentStage: Stage.APPLICATION_OPEN,
    },
  },
  {
    title: 'JRBT Constable (Male)',
    organization: 'Jagannath Rajpathon Bridging Training',
    category: Category.POLICE,
    totalVacancies: 200,
    description:
      'JRBT police recruitment for constable positions. Eligibility: 10th pass, age 18–25 years. Selection process: Physical fitness test, written exam, and medical examination.',
    syllabusUrl: null,
    sourceUrl: 'https://jrbt.tripura.gov.in',
    applyUrl: 'https://jrbt.tripura.gov.in/apply',
    isVerified: true,
    isPrivate: false,
    timeline: {
      notificationDate: new Date('2026-05-14'),
      applicationStart: new Date('2026-05-15'),
      applicationEnd: new Date('2026-06-15'),
      admitCardDate: new Date('2026-07-01'),
      examDate: new Date('2026-07-15'),
      resultDate: new Date('2026-08-20'),
      currentStage: Stage.APPLICATION_OPEN,
    },
  },
  {
    title: 'Government School Teacher (TET)',
    organization: 'Tripura Board of Secondary Education',
    category: Category.TEACHING,
    totalVacancies: 500,
    description:
      'Teaching positions across Tripura government schools. Candidates must pass TET (Teacher Eligibility Test). Eligibility: B.Ed or D.El.Ed with relevant subject graduation. Salary: ₹22,000–₹58,000.',
    syllabusUrl: 'https://tripuratet.nic.in/syllabus',
    sourceUrl: 'https://tripuratet.nic.in',
    applyUrl: 'https://tripuratet.nic.in/apply',
    isVerified: true,
    isPrivate: false,
    timeline: {
      notificationDate: new Date('2026-05-10'),
      applicationStart: new Date('2026-05-12'),
      applicationEnd: new Date('2026-07-20'),
      admitCardDate: new Date('2026-08-15'),
      examDate: new Date('2026-09-01'),
      resultDate: new Date('2026-10-15'),
      currentStage: Stage.APPLICATION_OPEN,
    },
  },
  {
    title: 'SSC CGL 2026 (Combined Graduate Level)',
    organization: 'Staff Selection Commission',
    category: Category.SSC,
    totalVacancies: 17727,
    description:
      'SSC CGL 2026 recruitment for various posts in Central Government Ministries, Departments, and Organizations. Eligibility: Bachelor\'s Degree. Exam: Tier I (Computer Based) + Tier II (Computer Based) + Document Verification.',
    syllabusUrl: 'https://ssc.nic.in/Portal/SchemeExamination',
    sourceUrl: 'https://ssc.nic.in',
    applyUrl: 'https://ssc.nic.in/Portal/CandidateRegistration',
    isVerified: true,
    isPrivate: false,
    timeline: {
      notificationDate: new Date('2026-04-01'),
      applicationStart: new Date('2026-04-05'),
      applicationEnd: new Date('2026-05-05'),
      admitCardDate: new Date('2026-06-10'),
      examDate: new Date('2026-07-01'),
      resultDate: null,
      currentStage: Stage.APPLICATION_CLOSED,
    },
  },
  {
    title: 'IBPS PO 2026 (Probationary Officer)',
    organization: 'Institute of Banking Personnel Selection',
    category: Category.BANKING,
    totalVacancies: 4455,
    description:
      'IBPS PO 2026 recruitment for Probationary Officers in participating banks. Eligibility: Graduation in any discipline. Three-phase exam: Prelims → Mains → Interview.',
    syllabusUrl: 'https://ibps.in/syllabus',
    sourceUrl: 'https://ibps.in',
    applyUrl: 'https://ibps.in/apply',
    isVerified: true,
    isPrivate: false,
    timeline: {
      notificationDate: new Date('2026-07-01'),
      applicationStart: new Date('2026-07-05'),
      applicationEnd: new Date('2026-07-25'),
      admitCardDate: null,
      examDate: null,
      resultDate: null,
      currentStage: Stage.NOTIFICATION,
    },
  },
];

// ──────────────────────────────────────────────
// Main seed runner
// ──────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (safe for dev; do NOT use in production)
  await prisma.examWatch.deleteMany();
  await prisma.examTimeline.deleteMany();
  await prisma.job.deleteMany();

  console.log('🗑️  Cleared existing job data\n');

  for (const jobData of seedJobs) {
    const { timeline, ...jobFields } = jobData;
    const slug = generateSlug(jobFields.title);

    const job = await prisma.job.create({
      data: {
        ...jobFields,
        slug,
        syllabusUrl: jobFields.syllabusUrl ?? null,
        timeline: {
          create: timeline,
        },
      },
      include: { timeline: true },
    });

    console.log(`✅ Created: [${job.category}] ${job.title}`);
    console.log(`   Stage: ${job.timeline?.currentStage} | Slug: ${job.slug}\n`);
  }

  const total = await prisma.job.count();
  console.log(`\n🎉 Seed complete — ${total} jobs in database.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
