import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = waitlistSchema.parse(body);

    // Check if email already exists
    const existing = await prisma.waitlist.findUnique({
      where: { email: validatedData.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email: validatedData.email,
        name: validatedData.name || null,
        source: validatedData.source || 'landing-page',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined waitlist',
        data: {
          id: waitlistEntry.id,
          email: waitlistEntry.email,
          createdAt: waitlistEntry.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for admin to view waitlist count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'count') {
      const count = await prisma.waitlist.count();
      return NextResponse.json({ count }, { status: 200 });
    }

    // For admin viewing - you'd want auth here in production
    const entries = await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit results
    });

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    console.error('Waitlist fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
