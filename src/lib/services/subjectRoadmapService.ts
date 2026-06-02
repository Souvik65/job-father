import { prisma } from '@/lib/prisma';

export interface RoadmapPhase {
  id: number;
  title: string;
  ph: string;
  stat: string;
  status: 'done' | 'active' | 'locked';
  prog?: number;
}

export async function getSubjectRoadmap(userId: string | undefined): Promise<RoadmapPhase[]> {
  const defaultRoadmap: RoadmapPhase[] = [
    { id: 1, title: 'Beginner', ph: 'Phase 1', stat: 'Locked', status: 'locked' },
    { id: 2, title: 'Foundation', ph: 'Phase 2', stat: 'Locked', status: 'locked' },
    { id: 3, title: 'Intermediate', ph: 'Phase 3', stat: 'Locked', status: 'locked' },
    { id: 4, title: 'Advanced', ph: 'Phase 4', stat: 'Locked', status: 'locked' },
    { id: 5, title: 'Expert', ph: 'Phase 5', stat: 'Locked', status: 'locked' },
    { id: 6, title: 'Final Revision', ph: 'Phase 6', stat: 'Locked', status: 'locked' }
  ];

  if (!userId) {
    return defaultRoadmap;
  }

  // Fetch mock test results
  const results = await prisma.mockTestResult.findMany({
    where: { userId },
    select: { score: true, max: true }
  });

  const totalTests = results.length;
  if (totalTests === 0) {
    // Return default but activate the first phase with 0% progress
    return [
      { id: 1, title: 'Beginner', ph: 'Phase 1', stat: '0%', status: 'active', prog: 0 },
      ...defaultRoadmap.slice(1)
    ];
  }

  // Calculate high accuracy counts
  const testsWith50pct = results.filter(r => r.max > 0 && (r.score / r.max) >= 0.50).length;
  const testsWith60pct = results.filter(r => r.max > 0 && (r.score / r.max) >= 0.60).length;
  const testsWith70pct = results.filter(r => r.max > 0 && (r.score / r.max) >= 0.70).length;
  const testsWith80pct = results.filter(r => r.max > 0 && (r.score / r.max) >= 0.80).length;
  const testsWith85pct = results.filter(r => r.max > 0 && (r.score / r.max) >= 0.85).length;

  const phasesConfig = [
    { id: 1, title: 'Beginner', ph: 'Phase 1', target: 1, actual: totalTests },
    { id: 2, title: 'Foundation', ph: 'Phase 2', target: 3, actual: testsWith50pct },
    { id: 3, title: 'Intermediate', ph: 'Phase 3', target: 8, actual: testsWith60pct },
    { id: 4, title: 'Advanced', ph: 'Phase 4', target: 15, actual: testsWith70pct },
    { id: 5, title: 'Expert', ph: 'Phase 5', target: 25, actual: testsWith80pct },
    { id: 6, title: 'Final Revision', ph: 'Phase 6', target: 35, actual: testsWith85pct }
  ];

  const roadmap: RoadmapPhase[] = [];
  let foundActive = false;

  for (const conf of phasesConfig) {
    const isDone = conf.actual >= conf.target;

    if (isDone) {
      roadmap.push({
        id: conf.id,
        title: conf.title,
        ph: conf.ph,
        stat: '✓ Done',
        status: 'done'
      });
    } else if (!foundActive) {
      // First phase that is not done becomes the active one
      const prog = Math.min(Math.round((conf.actual / conf.target) * 100), 99);
      roadmap.push({
        id: conf.id,
        title: conf.title,
        ph: conf.ph,
        stat: `${prog}%`,
        status: 'active',
        prog
      });
      foundActive = true;
    } else {
      // Rest are locked
      roadmap.push({
        id: conf.id,
        title: conf.title,
        ph: conf.ph,
        stat: 'Locked',
        status: 'locked'
      });
    }
  }

  return roadmap;
}
