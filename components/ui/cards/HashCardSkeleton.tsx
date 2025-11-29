'use client'

import React from 'react'

const HashCardSkeleton: React.FC = () => {
  return (
    <div className="relative rounded-lg w-full p-3 sm:p-2 overflow-hidden animate-pulse">
      <div className="absolute w-full h-full bg-gray-800 opacity-60 top-0 left-0 rounded-lg"></div>
      <div className="relative z-10 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            <div className="h-4 w-24 bg-gray-600 rounded"></div>
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-600 flex-shrink-0"></div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="h-4 w-16 bg-gray-600 rounded"></div>
            <div className="h-6 w-12 bg-gray-600 rounded"></div>
          </div>
        </div>

        {/* Betting Address Section */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between py-2">
            <div className="h-4 w-24 bg-gray-600 rounded"></div>
            <div className="h-4 w-20 bg-gray-600 rounded"></div>
          </div>
          <div className="relative">
            <div className="bg-gray-700 rounded-lg w-full h-8 flex items-center">
              <div className="h-3 w-32 bg-gray-600 rounded ml-2"></div>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 bg-gray-600 rounded"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 sm:gap-2 mt-auto py-2">
          <div className="flex-1 h-7 sm:h-8 bg-gray-600 rounded"></div>
          <div className="flex-1 h-7 sm:h-8 bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default HashCardSkeleton

