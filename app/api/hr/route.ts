import { NextResponse } from "next/server";
import { getHrOverviewData } from "@/lib/db";
import { getAuthenticatedEmployee } from "@/lib/session";

export async function GET() {
  const employee = await getAuthenticatedEmployee();
  if (!employee) {
    return NextResponse.json(
      { ok: false, error: "Tidak terautentikasi." },
      { status: 401 },
    );
  }
  const hrOverview = getHrOverviewData();
  return NextResponse.json({
    ok: true,
    hrOverview,
  });
}
