
import { Skeleton } from '@/components/ui/skeleton';

const AdminSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Quick loading skeleton for immediate feedback */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="space-y-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSkeleton;
