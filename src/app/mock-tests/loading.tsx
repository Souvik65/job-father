import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function MockTestsLoading() {
  return (
    <LoadingSpinner
      minHeight="min-h-[70vh]"
      title="JOBFATHER PORTAL"
      subtitle="Syncing resources..."
      showBackground={false}
    />
  );
}
