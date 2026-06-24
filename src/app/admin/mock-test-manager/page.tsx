import { MockTestQuestionManager } from '@/components/MockTestQuestionManager';

export const metadata = {
  title: 'Mock Test Manager | Admin',
};

export default function MockTestManagerPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#000666] mb-8">Mock Test Manager</h1>
      <MockTestQuestionManager />
    </div>
  );
}
