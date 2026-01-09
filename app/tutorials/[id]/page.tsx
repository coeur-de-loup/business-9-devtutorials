import { notFound } from 'next/navigation';
import TutorialDetail from './TutorialDetail';

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tutorials/${params.id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        title: 'Tutorial Not Found - DevTutorials',
      };
    }

    const tutorial = await res.json();

    return {
      title: `${tutorial.title} - DevTutorials`,
      description: tutorial.description,
      openGraph: {
        title: tutorial.title,
        description: tutorial.description,
        images: tutorial.thumbnail ? [tutorial.thumbnail] : [],
      },
    };
  } catch {
    return {
      title: 'Tutorial - DevTutorials',
    };
  }
}

export default function TutorialPage({ params }: { params: { id: string } }) {
  return <TutorialDetail tutorialId={params.id} />;
}
