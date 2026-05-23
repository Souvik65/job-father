import { prisma } from '@/lib/prisma';
import { PostJobFormData } from '@/types/job';
import { slugify } from '@/lib/utils';
import { Category } from '@prisma/client';

const sanitize = (str: string | undefined | null) => {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (match) => {
    const escape: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return escape[match];
  });
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const formData: PostJobFormData = body;
    const screenshot = body.screenshot; // base64 payload
    const screenshotName = body.screenshotName || 'payment_screenshot.png';

    // Validate screenshot size (e.g., max 5MB base64 ≈ 6.8MB actual)
    if (screenshot && screenshot.length > 5 * 1024 * 1024 * 1.37) {
      return Response.json(
        { success: false, error: 'Screenshot file too large (max 5MB)' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!formData.title || !formData.fromDate || !formData.untilDate) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = slugify(formData.title);
    const slug = `${baseSlug}-${Date.now()}`;

    // Structure description with employer and payment details
    const structuredDescription = `
${sanitize(formData.description)}

--- Employer Contact Info ---
Email: ${sanitize(formData.contactEmail) || 'N/A'}
Phone: ${sanitize(formData.contactPhone) || 'N/A'}

--- Payment Info (Manual UPI) ---
Screenshot Submitted: ${screenshot ? 'Yes' : 'No'}
File Name: ${sanitize(screenshotName)}
`;

    // Create the job in database
    const job = await prisma.job.create({
      data: {
        title: formData.title,
        slug,
        organization: 'Private Employer',
        category: Category.PRIVATE,
        description: structuredDescription.trim(),
        sourceUrl: '#', // Placeholder for private jobs
        applyUrl: formData.contactEmail || null, // Used for Send CV/Resume mailto
        isPrivate: true,
        isVerified: false, // Needs manual approval
        paymentScreenshot: screenshot || null,
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
            screenshot,
            screenshotName,
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
        message: 'Job listing submitted successfully! It will appear online after manual review.',
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
