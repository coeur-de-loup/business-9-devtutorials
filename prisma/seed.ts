import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devtutorials.com' },
    update: {},
    create: {
      email: 'admin@devtutorials.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user');

  // Create sample creators
  const creator1Password = await bcrypt.hash('creator123', 10);
  const creator1 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      name: 'Sarah Chen',
      image: 'https://i.pravatar.cc/150?img=1',
      password: creator1Password,
      role: 'CREATOR',
    },
  });
  console.log('✅ Created creator: Sarah Chen');

  const creator2Password = await bcrypt.hash('creator123', 10);
  const creator2 = await prisma.user.upsert({
    where: { email: 'marcus@example.com' },
    update: {},
    create: {
      email: 'marcus@example.com',
      name: 'Marcus Rodriguez',
      image: 'https://i.pravatar.cc/150?img=2',
      password: creator2Password,
      role: 'CREATOR',
    },
  });
  console.log('✅ Created creator: Marcus Rodriguez');

  const creator3Password = await bcrypt.hash('creator123', 10);
  const creator3 = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: {
      email: 'alex@example.com',
      name: 'Alex Kim',
      image: 'https://i.pravatar.cc/150?img=3',
      password: creator3Password,
      role: 'CREATOR',
    },
  });
  console.log('✅ Created creator: Alex Kim');

  // Create sample tutorials
  const tutorial1 = await prisma.tutorial.create({
    data: {
      title: 'Build a Real-Time Chat App with React & WebSocket',
      description:
        'Learn to build a production-ready real-time chat application from scratch. You\'ll implement WebSocket connections, message persistence, user authentication, and a beautiful responsive UI using React and Tailwind CSS.',
      price: 1900, // $19.00
      creatorId: creator1.id,
      status: 'PUBLISHED',
      category: 'React',
      level: 'Intermediate',
      duration: 270, // 4.5 hours in minutes
      tags: ['React', 'WebSocket', 'TypeScript', 'Tailwind CSS'],
      requirements: [
        'Basic React knowledge (components, hooks, state)',
        'Understanding of JavaScript ES6+',
        'Familiarity with npm and command line',
      ],
      learningGoals: [
        'Implement real-time communication with WebSockets',
        'Build responsive UIs with React and Tailwind CSS',
        'Handle user authentication and sessions',
        'Persist messages in a database',
        'Deploy a real-time app to production',
      ],
      curriculum: [
        {
          title: 'Project Setup & Architecture',
          duration: 1800, // 30 minutes
          description:
            'Set up the project structure, configure dependencies, and plan the architecture.',
        },
        {
          title: 'Building the Chat Interface',
          duration: 3600, // 1 hour
          description:
            'Create the chat UI with message list, input field, and user avatars.',
        },
        {
          title: 'Implementing WebSocket Connection',
          duration: 2700, // 45 minutes
          description:
            'Add real-time messaging using WebSocket and handle connection lifecycle.',
        },
        {
          title: 'User Authentication',
          duration: 2400, // 40 minutes
          description: 'Implement login/registration with JWT tokens.',
        },
        {
          title: 'Message Persistence',
          duration: 2100, // 35 minutes
          description: 'Store and retrieve messages from a PostgreSQL database.',
        },
        {
          title: 'Deployment & Production Setup',
          duration: 1800, // 30 minutes
          description: 'Deploy the app to Vercel and set up production WebSocket server.',
        },
      ],
      stripeAccountId: 'acct_sample_1',
      publishedAt: new Date('2025-10-15'),
      lastUpdated: new Date('2025-12-01'),
      freshnessExpires: new Date('2026-04-15'),
    },
  });
  console.log('✅ Created tutorial: Build a Real-Time Chat App');

  const tutorial2 = await prisma.tutorial.create({
    data: {
      title: 'Mastering Next.js 14: Build a Full-Stack E-Commerce App',
      description:
        'Deep dive into Next.js 14 App Router, Server Components, and Server Actions. Build a complete e-commerce application with product catalog, shopping cart, checkout, and admin dashboard.',
      price: 2900, // $29.00
      creatorId: creator2.id,
      status: 'PUBLISHED',
      category: 'Next.js',
      level: 'Intermediate',
      duration: 420, // 7 hours
      tags: ['Next.js', 'App Router', 'Server Components', 'Prisma', 'Stripe'],
      requirements: [
        'Solid React fundamentals',
        'Basic understanding of full-stack concepts',
        'Experience with TypeScript',
      ],
      learningGoals: [
        'Master Next.js 14 App Router and Server Components',
        'Implement Server Actions for mutations',
        'Build performant database queries with Prisma',
        'Integrate Stripe for payments',
        'Create admin dashboard with role-based access',
      ],
      curriculum: [
        {
          title: 'Introduction to Next.js 14',
          duration: 1200,
          description:
            'Overview of App Router, Server Components, and Server Actions.',
        },
        {
          title: 'Project Setup & Database Schema',
          duration: 2400,
          description:
            'Set up Next.js with Prisma and design the database schema for e-commerce.',
        },
        {
          title: 'Product Catalog with Server Components',
          duration: 3600,
          description:
            'Build the product listing and detail pages using Server Components.',
        },
        {
          title: 'Shopping Cart with Server Actions',
          duration: 3000,
          description:
            'Implement cart functionality using Server Actions and React state.',
        },
        {
          title: 'Stripe Integration',
          duration: 2700,
          description:
            'Integrate Stripe Checkout for payment processing.',
        },
        {
          title: 'Admin Dashboard',
          duration: 3600,
          description:
            'Build admin panel for product management and order viewing.',
        },
        {
          title: 'Performance & Deployment',
          duration: 2100,
          description:
            'Optimize performance and deploy to Vercel with production database.',
        },
      ],
      stripeAccountId: 'acct_sample_2',
      publishedAt: new Date('2025-11-01'),
      lastUpdated: new Date('2025-12-10'),
      freshnessExpires: new Date('2026-05-01'),
    },
  });
  console.log('✅ Created tutorial: Mastering Next.js 14');

  const tutorial3 = await prisma.tutorial.create({
    data: {
      title: 'TypeScript Best Practices: Build Scalable React Apps',
      description:
        'Learn advanced TypeScript patterns and best practices for building type-safe, scalable React applications. Covers generics, utility types, custom hooks, and error handling patterns.',
      price: 1900, // $19.00
      creatorId: creator3.id,
      status: 'PUBLISHED',
      category: 'TypeScript',
      level: 'Intermediate',
      duration: 300, // 5 hours
      tags: ['TypeScript', 'React', 'Generics', 'Type Safety'],
      requirements: [
        'Intermediate React knowledge',
        'Basic TypeScript experience',
        'Understanding of JavaScript types',
      ],
      learningGoals: [
        'Master TypeScript generics and utility types',
        'Build type-safe React components and hooks',
        'Implement proper error handling patterns',
        'Create reusable type-safe utilities',
        'Write maintainable typed codebases',
      ],
      curriculum: [
        {
          title: 'Advanced TypeScript Types',
          duration: 2700,
          description:
            'Deep dive into generics, conditional types, and utility types.',
        },
        {
          title: 'Type-Safe React Patterns',
          duration: 3000,
          description:
            'Build strongly typed React components, hooks, and context.',
        },
        {
          title: 'API Layer Type Safety',
          duration: 2400,
          description:
            'Create type-safe API clients with Zod validation.',
        },
        {
          title: 'Error Handling Patterns',
          duration: 2100,
          description:
            'Implement robust error handling with discriminated unions.',
        },
        {
          title: 'Testing Type-Safe Code',
          duration: 2700,
          description:
            'Write tests for type-safe code and catch type errors.',
        },
      ],
      stripeAccountId: 'acct_sample_3',
      publishedAt: new Date('2025-09-20'),
      lastUpdated: new Date('2025-11-15'),
      freshnessExpires: new Date('2026-03-20'),
    },
  });
  console.log('✅ Created tutorial: TypeScript Best Practices');

  const tutorial4 = await prisma.tutorial.create({
    data: {
      title: 'Node.js Microservices: Build a Scalable API Architecture',
      description:
        'Learn to design and implement microservices architecture using Node.js. Build distributed systems with service communication, data management, and deployment strategies.',
      price: 2900, // $29.00
      creatorId: creator1.id,
      status: 'PUBLISHED',
      category: 'Node.js',
      level: 'Advanced',
      duration: 480, // 8 hours
      tags: ['Node.js', 'Microservices', 'Docker', 'Redis', 'API Gateway'],
      requirements: [
        'Advanced Node.js knowledge',
        'Understanding of REST APIs',
        'Basic Docker experience',
        'Database fundamentals',
      ],
      learningGoals: [
        'Design microservices architecture',
        'Implement service-to-service communication',
        'Handle data consistency across services',
        'Deploy microservices with Docker',
        'Implement API gateway patterns',
      ],
      curriculum: [
        {
          title: 'Introduction to Microservices',
          duration: 1800,
          description:
            'Understand microservices architecture, pros/cons, and when to use it.',
        },
        {
          title: 'Designing the Architecture',
          duration: 2400,
          description:
            'Design service boundaries, communication patterns, and data flows.',
        },
        {
          title: 'Building the User Service',
          duration: 3600,
          description:
            'Create first microservice with authentication and user management.',
        },
        {
          title: 'Building the Order Service',
          duration: 3600,
          description:
            'Create second microservice with order processing and inventory.',
        },
        {
          title: 'Service Communication',
          duration: 3000,
          description:
            'Implement synchronous (REST) and asynchronous (message queue) communication.',
        },
        {
          title: 'Data Management',
          duration: 2700,
          description:
            'Handle distributed transactions and data consistency.',
        },
        {
          title: 'API Gateway',
          duration: 2400,
          description:
            'Implement API Gateway for routing, rate limiting, and aggregation.',
        },
        {
          title: 'Deployment with Docker',
          duration: 2700,
          description:
            'Containerize services and deploy with Docker Compose.',
        },
      ],
      stripeAccountId: 'acct_sample_1',
      publishedAt: new Date('2025-08-10'),
      lastUpdated: new Date('2025-11-01'),
      freshnessExpires: new Date('2026-02-10'),
    },
  });
  console.log('✅ Created tutorial: Node.js Microservices');

  const tutorial5 = await prisma.tutorial.create({
    data: {
      title: 'Building APIs with Prisma and PostgreSQL',
      description:
        'Master database design and API development with Prisma ORM and PostgreSQL. Learn to design schemas, write efficient queries, implement relationships, and build performant REST APIs.',
      price: 900, // $9.00
      creatorId: creator2.id,
      status: 'PUBLISHED',
      category: 'Database',
      level: 'Intermediate',
      duration: 180, // 3 hours
      tags: ['Prisma', 'PostgreSQL', 'Database Design', 'API'],
      requirements: [
        'Basic SQL knowledge',
        'Node.js fundamentals',
        'Understanding of REST APIs',
      ],
      learningGoals: [
        'Design efficient database schemas',
        'Write complex queries with Prisma',
        'Implement one-to-many and many-to-many relationships',
        'Build performant REST APIs',
        'Handle database migrations',
      ],
      curriculum: [
        {
          title: 'Introduction to Prisma',
          duration: 1200,
          description:
            'Set up Prisma and understand the schema file.',
        },
        {
          title: 'Schema Design',
          duration: 1800,
          description:
            'Design database schema with relationships and indexes.',
        },
        {
          title: 'Querying Data',
          duration: 1800,
          description:
            'Learn Prisma query API and write complex queries.',
        },
        {
          title: 'Building the API',
          duration: 2400,
          description:
            'Create REST API endpoints with Express.js and Prisma.',
        },
        {
          title: 'Migrations & Deployment',
          duration: 1200,
          description:
            'Handle migrations and deploy database to production.',
        },
      ],
      stripeAccountId: 'acct_sample_2',
      publishedAt: new Date('2025-12-01'),
      lastUpdated: new Date('2025-12-20'),
      freshnessExpires: new Date('2026-06-01'),
    },
  });
  console.log('✅ Created tutorial: Building APIs with Prisma');

  // Create some sample reviews
  await prisma.review.create({
    data: {
      userId: admin.id,
      tutorialId: tutorial1.id,
      rating: 5,
      comment:
        'Excellent tutorial! The WebSocket implementation was explained clearly and the code is production-ready.',
    },
  });

  await prisma.review.create({
    data: {
      userId: admin.id,
      tutorialId: tutorial2.id,
      rating: 5,
      comment:
        'Best Next.js 14 course I\'ve taken. Server Actions finally make sense!',
    },
  });

  await prisma.review.create({
    data: {
      userId: admin.id,
      tutorialId: tutorial3.id,
      rating: 4,
      comment:
        'Great coverage of advanced TypeScript patterns. More examples on utility types would be helpful.',
    },
  });

  console.log('✅ Created sample reviews');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Test Accounts:');
  console.log('   Admin: admin@devtutorials.com / admin123');
  console.log('   Creator: sarah@example.com / creator123');
  console.log('   Creator: marcus@example.com / creator123');
  console.log('   Creator: alex@example.com / creator123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
