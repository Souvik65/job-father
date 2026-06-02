"use server";

import { prisma } from "@/lib/prisma";
import { auth, isAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  if (!session || !isAdmin(session)) throw new Error("Unauthorized");
  return session;
}

// ── Account Security ───────────────────────────────────────────────────────

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; message: string }> {
  const session = await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { email: session.user!.email! },
    select: { id: true, password: true },
  });

  if (!user?.password) {
    return {
      ok: false,
      message: "Cannot update password for this account type.",
    };
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return { ok: false, message: "Current password is incorrect." };
  }

  if (newPassword.length < 12) {
    return {
      ok: false,
      message: "New password must be at least 12 characters.",
    };
  }
  if (!/[A-Z]/.test(newPassword)) {
    return {
      ok: false,
      message: "New password must include at least one uppercase letter.",
    };
  }
  if (!/[a-z]/.test(newPassword)) {
    return {
      ok: false,
      message: "New password must include at least one lowercase letter.",
    };
  }
  if (!/[0-9]/.test(newPassword)) {
    return {
      ok: false,
      message: "New password must include at least one number.",
    };
  }
  if (!/[^A-Za-z0-9]/.test(newPassword)) {
    return {
      ok: false,
      message: "New password must include at least one special character.",
    };
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return { ok: true, message: "Password updated successfully." };
}

// ── Site Settings helpers ──────────────────────────────────────────────────

async function setSetting(key: string, value: string) {
  await prisma.siteSettings.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getSiteSettings(): Promise<Record<string, string>> {
  await requireAdmin();
  const rows = await prisma.siteSettings.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

// ── Platform Identity ─────────────────────────────────────────────────

export async function saveIdentitySettings(
  portalName: string,
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();

  if (!portalName.trim()) {
    return { ok: false, message: "Portal name cannot be empty." };
  }

  await setSetting("portalName", portalName.trim());
  return { ok: true, message: "Portal identity saved successfully." };
}

// ── Frontend Controls ──────────────────────────────────────────────────────

export async function saveFrontendSettings(
  subscriptionPopup: boolean,
  popupDelay: number,
  fabEnabled: boolean,
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();

  if (popupDelay < 1 || popupDelay > 300) {
    return {
      ok: false,
      message: "Popup delay must be between 1 and 300 seconds.",
    };
  }

  await Promise.all([
    setSetting("subscriptionPopup", String(subscriptionPopup)),
    setSetting("popupDelay", String(popupDelay)),
    setSetting("fabEnabled", String(fabEnabled)),
  ]);

  return { ok: true, message: "Frontend settings applied successfully." };
}

// ── Books Management ──────────────────────────────────────────────────────

export async function saveBooksSettings(
  booksJson: string,
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  try {
    const parsed = JSON.parse(booksJson);
    if (!Array.isArray(parsed)) {
      return { ok: false, message: "Books must be a valid JSON array." };
    }
    await setSetting("recommended_books", booksJson);
    return {
      ok: true,
      message: "Recommended prep books updated successfully.",
    };
  } catch (err) {
    return { ok: false, message: "Invalid books configuration JSON format." };
  }
}

// ── Question Bank Management ──────────────────────────────────────────────

export async function saveQBSettings(
  qbJson: string,
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  try {
    const parsed = JSON.parse(qbJson);
    // Validate QB structure: Record<string, Question[]>
    for (const [subj, qList] of Object.entries(parsed)) {
      if (!Array.isArray(qList)) {
        return {
          ok: false,
          message: `Subject "${subj}" must have a list of questions.`,
        };
      }
      for (const [qIdx, qItem] of qList.entries()) {
        const item = qItem as Record<string, unknown>;
        if (
          !item ||
          typeof item.q !== "string" ||
          !Array.isArray(item.opts) ||
          typeof item.ans !== "number"
        ) {
          return {
            ok: false,
            message: `Invalid question format at "${subj}" question index ${qIdx + 1}. Required: q (string), opts (string[]), ans (number).`,
          };
        }
        if (item.ans < 0 || item.ans >= item.opts.length) {
          return {
            ok: false,
            message: `Invalid answer index at "${subj}" question index ${qIdx + 1}. ans must be 0-${item.opts.length - 1}.`,
          };
        }
      }
    }
    await setSetting("mock_test_qb", qbJson);
    return { ok: true, message: "Question bank JSON updated successfully." };
  } catch (err) {
    return { ok: false, message: "Invalid JSON file format." };
  }
}
