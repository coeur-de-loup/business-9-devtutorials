import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth Library Stub
 *
 * TODO: Replace with actual NextAuth.js implementation
 * This is a placeholder for payment processing development
 */

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: 'STUDENT' | 'CREATOR' | 'ADMIN';
}

export interface Session {
  user: User;
}

/**
 * Auth function stub
 *
 * Returns mock session for development.
 * TODO: Implement actual NextAuth.js session management
 */
export async function auth(): Promise<Session | null> {
  // For development, return null (no auth)
  // In production, this would use NextAuth.js
  return null;
}

/**
 * Middleware stub for route protection
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: User } | NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return { user: session.user };
}

/**
 * Require specific role
 */
export async function requireRole(
  request: NextRequest,
  role: User['role']
): Promise<{ user: User } | NextResponse> {
  const result = await requireAuth(request);

  if (result instanceof NextResponse) {
    return result;
  }

  if (result.user.role !== role && result.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return result;
}
