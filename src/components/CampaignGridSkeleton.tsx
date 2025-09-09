const CampaignGridSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>

            {/* Dates */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-10 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-14"></div>
              </div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-8 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-10"></div>
              </div>
            </div>

            {/* Action indicator */}
            <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignGridSkeleton;
