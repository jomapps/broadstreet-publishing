export default function AdvertiserGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
