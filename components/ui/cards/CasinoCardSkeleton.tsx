'use client'

import React from 'react'

const CasinoCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-[0.5rem] overflow-hidden w-full animate-pulse">
      <div className="relative rounded-[0.5rem] overflow-hidden">
        <div className="w-full aspect-square bg-gray-700 rounded-[0.5rem]"></div>
        {/* Badge skeleton */}
        <div className="absolute top-2 left-2 w-12 h-5 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  )
}

export default CasinoCardSkeleton

