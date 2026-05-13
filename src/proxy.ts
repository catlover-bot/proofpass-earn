import { NextRequest, NextResponse } from "next/server";
import { hasAdminBasicAuthEnv } from "@/lib/admin-env";

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};

function constantTimeEquals(left: string, right: string) {
  let mismatch = left.length ^ right.length;
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

function parseBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = atob(header.slice("Basic ".length).trim());
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex < 0) {
      return null;
    }

    return {
      user: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1)
    };
  } catch {
    return null;
  }
}

function unauthorizedResponse() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="ProofPass Admin", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}

function setupErrorResponse() {
  return new NextResponse(
    "Admin access is not configured. Set ADMIN_BASIC_AUTH_USER and ADMIN_BASIC_AUTH_PASSWORD.",
    {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    }
  );
}

export function proxy(request: NextRequest) {
  if (!hasAdminBasicAuthEnv()) {
    if (process.env.NODE_ENV === "production") {
      return setupErrorResponse();
    }

    return NextResponse.next();
  }

  const credentials = parseBasicAuth(request.headers.get("authorization"));
  const expectedUser = process.env.ADMIN_BASIC_AUTH_USER ?? "";
  const expectedPassword = process.env.ADMIN_BASIC_AUTH_PASSWORD ?? "";

  if (
    !credentials ||
    !constantTimeEquals(credentials.user, expectedUser) ||
    !constantTimeEquals(credentials.password, expectedPassword)
  ) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}
