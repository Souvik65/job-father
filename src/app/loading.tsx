import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function GlobalLoading() {
  return (
    <LoadingSpinner
      minHeight="min-h-[85vh]"
      title="JOBFATHER"
      subtitle="Loading page content..."
      showBackground={true}
    />
  );
}
