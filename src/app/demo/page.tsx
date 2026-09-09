import type { Metadata } from 'next';
import { DemoApp } from '@/components/demo/DemoApp';

export const metadata: Metadata = {
  title: 'Interactive demo',
  description:
    'Walk one adaptive route: say how much time you have, answer one question about today’s lesson, and watch the route compress or bend. No sign-in, nothing recorded.',
};

export default function DemoPage() {
  return <DemoApp />;
}
