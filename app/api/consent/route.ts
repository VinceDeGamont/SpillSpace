import { NextResponse } from "next/server";
import {
  getConsentAuditHistory,
  getHrOverviewData,
  getPersonalPsychologicalData,
  updateEmployeeConsentAndData,
} from "@/lib/db";
import {
  clearSessionCookie,
  getAuthenticatedEmployee,
  getRequestClientMetadata,
} from "@/lib/session";

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
    const mode = String(body.mode ?? "") as
      | "grant_psych"
      | "withdraw_psych_only"
      | "withdraw_all_and_delete";

    if (!["grant_psych", "withdraw_psych_only", "withdraw_all_and_delete"].includes(mode)) {
      return NextResponse.json(
        { ok: false, error: "Mode perubahan persetujuan tidak valid." },
        { status: 400 },
      );
    }

    const { ipAddress, userAgent } = await getRequestClientMetadata();
    const result = updateEmployeeConsentAndData({
      employeeId: employee.employeeId,
      mode,
      ipAddress,
      userAgent,
    });

    if (mode === "withdraw_all_and_delete") {
      await clearSessionCookie();
      return NextResponse.json({
        ok: true,
        signedOut: true,
        confirmationNumber: result.confirmationNumber,
        deletedVibeLogs: result.deletedVibeLogs,
        deletedBookings: result.deletedBookings,
        message: `Penarikan seluruh persetujuan & penghapusan ${result.deletedVibeLogs} catatan psikologis selesai (Bukti Konfirmasi #${result.confirmationNumber}). Akun Anda kini dinonaktifkan.`,
      });
    }

    const psychData = result.updatedProfile.psychConsent
      ? getPersonalPsychologicalData(employee.employeeId)
      : { vibeLogs: [], bookings: [] };
    const consentHistory = getConsentAuditHistory(employee.employeeId);
    const hrOverview = getHrOverviewData();

    return NextResponse.json({
      ok: true,
      signedOut: false,
      confirmationNumber: result.confirmationNumber,
      deletedVibeLogs: result.deletedVibeLogs,
      deletedBookings: result.deletedBookings,
      employee: result.updatedProfile,
      psychData,
      consentHistory,
      hrOverview,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui persetujuan.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
