'use client'

import React from 'react'

const FutureCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-2 border-t-2 border-[#FFFFFF29] animate-pulse">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
        <div>
          <div className="h-4 w-12 bg-gray-700 rounded mb-1"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-5 w-20 bg-gray-700 rounded"></div>
        <div className="h-4 w-16 bg-gray-700 rounded"></div>
      </div>
    </div>
  )
}

export default FutureCardSkeleton

