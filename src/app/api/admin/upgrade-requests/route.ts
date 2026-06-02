import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

export async function GET(request: Request) {
  try {
    const session = await auth();
    // Assuming you have an admin check. If not, just ensure role is ADMIN

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";
    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    const requests = await prisma.upgradeRequest.findMany({
      where: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true, mockTestPlan: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching upgrade requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action } = await request.json();

    if (!id || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const upgradeReq = await prisma.upgradeRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!upgradeReq) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (upgradeReq.status !== "PENDING") {
      return NextResponse.json(
        { error: "Request is already processed" },
        { status: 400 },
      );
    }

    // Determine new expiry if approved
    let newExpiry = null;
    if (action === "APPROVE") {
      const monthsToAdd =
        upgradeReq.planId === "12m" ? 12 : upgradeReq.planId === "6m" ? 6 : 3;
      const baseDate =
        upgradeReq.user.mockTestPlanExpiry &&
        upgradeReq.user.mockTestPlanExpiry > new Date()
          ? upgradeReq.user.mockTestPlanExpiry
          : new Date();

      newExpiry = new Date(baseDate);
      const targetMonth = newExpiry.getMonth() + monthsToAdd;
      newExpiry.setMonth(targetMonth);
      // Clamp if month overflowed (e.g., Jan 31 + 1 month → Mar 2)
      if (newExpiry.getMonth() !== targetMonth % 12) {
        newExpiry.setDate(0); // Set to last day of previous month
      }
    }

    const updatedReq = await prisma.$transaction(async (tx) => {
      if (action === "APPROVE") {
        await tx.user.update({
          where: { id: upgradeReq.userId },
          data: {
            mockTestPlan: upgradeReq.planId,
            mockTestPlanExpiry: newExpiry,
          },
        });
      }

      return await tx.upgradeRequest.update({
        where: { id },
        data: { status: action === "APPROVE" ? "APPROVED" : "REJECTED" },
      });
    });

    // Delete the temporary screenshot if it's a legacy local file
    if (
      upgradeReq.screenshotUrl &&
      !upgradeReq.screenshotUrl.startsWith("data:")
    ) {
      try {
        const fileName = upgradeReq.screenshotUrl.split("/").pop();
        // Ensure filename is safe (no path separators, reasonable format)
        if (fileName && /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(fileName)) {
          const filePath = join(
            process.cwd(),
            "public",
            "uploads",
            "upgrade-requests",
            fileName,
          );
          await unlink(filePath);
        }
      } catch (err) {
        console.error("Failed to delete legacy screenshot file:", err);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({ success: true, request: updatedReq });
  } catch (error) {
    console.error("Error processing upgrade request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
