import { NextResponse } from "next/server";
import {
  getEmployeeAttendance,
  getHrOverviewData,
  recordClockIn,
  recordClockOut,
  type WorkMode,
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
    const action = String(body.action ?? "");

    if (action === "clock_in") {
      const workMode = (body.workMode as WorkMode) ?? "WFO";
      const note = String(body.note ?? "");
      const record = recordClockIn({
        employeeId: employee.employeeId,
        workMode,
        note,
      });
      const attendance = getEmployeeAttendance(employee.employeeId);
      const hrOverview = getHrOverviewData();
      return NextResponse.json({
        ok: true,
        message: `Absen Masuk berhasil dicatat pukul ${record.clockInAt} (${record.workMode}).`,
        attendance,
        hrOverview,
      });
    }

    if (action === "clock_out") {
      const note = String(body.note ?? "");
      const record = recordClockOut({
        employeeId: employee.employeeId,
        note,
      });
      const attendance = getEmployeeAttendance(employee.employeeId);
      const hrOverview = getHrOverviewData();
      return NextResponse.json({
        ok: true,
        message: `Absen Pulang berhasil dicatat pukul ${record.clockOutAt}. Terima kasih atas kerja keras Anda hari ini!`,
        attendance,
        hrOverview,
      });
    }

    return NextResponse.json({ ok: false, error: "Aksi absensi tidak valid." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memproses absensi.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
