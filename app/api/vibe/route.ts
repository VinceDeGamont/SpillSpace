import { NextResponse } from "next/server";
import type { MoodId } from "@/components/SpillSpace/data";
import {
  getHrOverviewData,
  getPersonalPsychologicalData,
  saveAnonymousPsychBooking,
  savePersonalVibeEntry,
} from "@/lib/db";
import { getAuthenticatedEmployee } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const employee = await getAuthenticatedEmployee();
    if (!employee) {
      return NextResponse.json(
        { ok: false, error: "Sesi berakhir. Silakan login kembali." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "save_vibe");

    if (action === "save_vibe") {
      const moodId = (body.moodId as MoodId) ?? "okay";
      const workloadScore = Math.max(1, Math.min(10, Number(body.workloadScore ?? 4)));
      const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
      const reflection = String(body.reflection ?? "");
      const triggerSource = String(body.triggerSource ?? "daily");

      const entry = savePersonalVibeEntry({
        employeeId: employee.employeeId,
        moodId,
        workloadScore,
        tags,
        reflection,
        triggerSource,
      });

      const psychData = getPersonalPsychologicalData(employee.employeeId);
      const hrOverview = getHrOverviewData();

      return NextResponse.json({
        ok: true,
        entry,
        psychData,
        hrOverview,
      });
    }

    if (action === "book_psychologist") {
      const psychologistId = String(body.psychologistId ?? "nadia");
      const psychologistName = String(body.psychologistName ?? "Nadia Prameswari");
      const slotLabel = String(body.slotLabel ?? "Today · 16:00");
      const isPriority = Boolean(body.isPriority);

      const booking = saveAnonymousPsychBooking({
        employeeId: employee.employeeId,
        psychologistId,
        psychologistName,
        slotLabel,
        isPriority,
      });

      const psychData = getPersonalPsychologicalData(employee.employeeId);
      return NextResponse.json({
        ok: true,
        booking,
        psychData,
      });
    }

    return NextResponse.json({ ok: false, error: "Aksi tidak valid." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan data psikologis.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
