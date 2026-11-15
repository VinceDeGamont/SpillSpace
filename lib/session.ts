import { cookies, headers } from "next/headers";
import { signSessionToken, verifySessionToken } from "./crypto";
import { getEmployeeById, type EmployeeProfile } from "./db";

export const SESSION_COOKIE_NAME = "spillspace_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function getAuthenticatedEmployee(): Promise<EmployeeProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifySessionToken(token);
  if (!payload) return null;

  const employee = getEmployeeById(payload.employeeId);
  if (!employee || employee.accountStatus !== "active") {
    return null;
  }
  return employee;
}

export async function setSessionCookie(employee: EmployeeProfile): Promise<void> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const token = signSessionToken({
    employeeId: employee.employeeId,
    role: employee.role,
    exp: expiresAt,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getRequestClientMetadata(): Promise<{
  ipAddress: string;
  userAgent: string;
}> {
  const hdrs = await headers();
  const forwarded = hdrs.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const userAgent = hdrs.get("user-agent") ?? "SpillSpace-Web-Client";
  return { ipAddress, userAgent };
}
