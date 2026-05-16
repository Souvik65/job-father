import { prisma } from '@/lib/prisma';
import { PostJobFormData } from '@/types/job';
import { slugify } from '@/lib/utils';
import { Category } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const formData: PostJobFormData = await request.json();

    // Validate required fields
    if (!formData.title || !formData.category || !formData.fromDate || !formData.untilDate) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = slugify(formData.title);
    const slug = `${baseSlug}-${Date.now()}`;

    // Create the job in database
    const job = await prisma.job.create({
      data: {
        title: formData.title,
        slug,
        organization: 'Private Employer',
        category: Category.PRIVATE,
        description: formData.description,
        sourceUrl: '#', // Placeholder for private jobs
        isPrivate: true,
        isVerified: false, // Needs manual approval
        timeline: {
          create: {
            applicationStart: new Date(formData.fromDate),
            applicationEnd: new Date(formData.untilDate),
          },
        },
      },
      include: {
        timeline: true,
      },
    });

    console.log('Job saved to database:', job.id);

    // Forward to Google Apps Script (as backup/notification)
    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
    if (appsScriptUrl) {
      try {
        const response = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'postJob',
            jobId: job.id,
            ...formData,
          }),
        });

        if (!response.ok) {
          throw new Error(`Apps Script returned status: ${response.status}`);
        }
      } catch (err) {
        console.error('Failed to submit to Apps Script:', err);
      }
    }

    return Response.json(
      {
        success: true,
        message: 'Job submitted successfully! It will appear after review.',
        data: {
          id: job.id,
          title: job.title,
          category: job.category,
          postedAt: job.postedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error posting job:', error);
    return Response.json(
      { success: false, error: 'Failed to post job' },
      { status: 500 }
    );
  }
}
