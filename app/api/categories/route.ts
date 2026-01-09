import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockCategories } from '@/lib/mock-data';

export async function GET() {
  try {
    let categories: Array<{ name: string; count: number }>;

    try {
      // Try database first
      const dbCategories = await prisma.tutorial.groupBy({
        by: ['category'],
        where: {
          status: 'PUBLISHED',
          category: {
            not: null,
          },
        },
        _count: {
          category: true,
        },
      });

      categories = dbCategories
        .filter((cat) => cat.category !== null)
        .map((cat) => ({
          name: cat.category as string,
          count: cat._count.category,
        }))
        .sort((a, b) => b.count - a.count);
    } catch (dbError) {
      // Fall back to mock data
      console.warn('Database unavailable, using mock data:', dbError);
      categories = mockCategories;
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
