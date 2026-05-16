import { getJobs } from '@/lib/jobs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'ALL';
  const search = searchParams.get('search')?.toLowerCase() || '';

  try {
    const jobs = await getJobs({ category, search });

    return Response.json(
      {
        success: true,
        data: jobs,
        count: jobs.length,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
      },
      { status: 500 }
    );
  }
}
