import { prisma } from '@/lib/prisma';
import StudentsClient from './StudentsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Students - Admin Portal',
};

export default async function AdminStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: 'ASPIRANT' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      mockTestPlan: true,
      _count: {
        select: { mockTestResults: true }
      },
      mockTestResults: {
        select: { score: true, max: true }
      }
    },
  });

  // Map to a simpler type that StudentsClient can digest
  const shapedStudents = students.map((s) => {
    let avgScore = 0;
    if (s.mockTestResults.length > 0) {
      const totalPercentage = s.mockTestResults.reduce((acc, curr) => {
        return acc + (curr.max > 0 ? (curr.score / curr.max) * 100 : 0);
      }, 0);
      avgScore = Math.round(totalPercentage / s.mockTestResults.length);
    }

    return {
      id: s.id,
      name: s.name,
      email: s.email || 'No Email',
      createdAt: s.createdAt,
      mockTestPlan: s.mockTestPlan || 'free',
      mockTestsTaken: s._count.mockTestResults,
      mockTestAvgScore: avgScore,
    };
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#000666] tracking-tight">Students</h1>
        <p className="text-sm text-[#454652] mt-1">Manage users registered in the Mock Test portal</p>
      </div>

      <StudentsClient initialStudents={shapedStudents} />
    </div>
  );
}
