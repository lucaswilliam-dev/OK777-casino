'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import mainContentData from '../main-content-data.json'
import { apiGet } from '../lib/axios'
import { API_ENDPOINTS, ApiResponse } from '../types/api'

// Define types for dynamic data
interface DynamicMainContentData {
  hotGames: Array<{
    badge: string
    views?: string
    user?: string
    image: string
  }>
  trendingGames: Array<{
    badge: string
    views?: string
    user?: string
    image: string
  }>
  aviationGames: Array<{
    badge: string
    views?: string
    user?: string
    image: string
  }>
  sportsGames: Array<{
    badge: string
    views?: string
    user?: string
    image: string
  }>
  animalGames: Array<{
    badge: string
    views?: string
    user?: string
    image: string
  }>
  bountyGames: Array<{
    price: string
    title: string
    id: string
    image: string
  }>
  tableGames: Array<{
    title: string
    chances: string
    background: string
    bettingAddress: string
    leftButtonLink: string
    rightButtonLink: string
  }>
}

interface MainContentContextType {
  // Static data from JSON
  newGames: typeof mainContentData.newGames
  cryptoCards: typeof mainContentData.cryptoCards
  hashGames: typeof mainContentData.hashGames
  brand: typeof mainContentData.brand
  latestBets: typeof mainContentData.latestBets
  gameManufacturers: typeof mainContentData.gameManufacturers
  footerContent: typeof mainContentData.footerContent
  // Dynamic data from API
  hotGames: DynamicMainContentData['hotGames']
  trendingGames: DynamicMainContentData['trendingGames']
  aviationGames: DynamicMainContentData['aviationGames']
  sportsGames: DynamicMainContentData['sportsGames']
  animalGames: DynamicMainContentData['animalGames']
  bountyGames: DynamicMainContentData['bountyGames']
  tableGames: DynamicMainContentData['tableGames']
  // Loading and error states
  isLoading: boolean
  error: string | null
}

const MainContentContext = createContext<MainContentContextType | undefined>(
  undefined
)

// Default empty arrays for dynamic data
const defaultDynamicData: DynamicMainContentData = {
  hotGames: [],
  trendingGames: [],
  aviationGames: [],
  sportsGames: [],
  animalGames: [],
  bountyGames: [],
  tableGames: [],
}

export function MainContentProvider({
  children,
}: {
  children: ReactNode
}) {
  const [dynamicData, setDynamicData] = useState<DynamicMainContentData>(defaultDynamicData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await apiGet<ApiResponse<DynamicMainContentData>>(
          API_ENDPOINTS.MAIN_CONTENT
        )
        
        if (response.code === 200 && response.data) {
          setDynamicData(response.data)
        } else {
          throw new Error(response.message || 'Failed to fetch main content data')
        }
      } catch (err: any) {
        console.error('Error fetching dynamic main content data:', err)
        setError(err?.message || 'Failed to load dynamic content')
        // Keep default empty arrays on error
        setDynamicData(defaultDynamicData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDynamicData()
  }, [])

  const value: MainContentContextType = {
    // Static data from JSON
    newGames: mainContentData.newGames,
    cryptoCards: mainContentData.cryptoCards,
    hashGames: mainContentData.hashGames,
    brand: mainContentData.brand,
    latestBets: mainContentData.latestBets,
    gameManufacturers: mainContentData.gameManufacturers,
    footerContent: mainContentData.footerContent,
    // Dynamic data from API
    hotGames: dynamicData.hotGames,
    trendingGames: dynamicData.trendingGames,
    aviationGames: dynamicData.aviationGames,
    sportsGames: dynamicData.sportsGames,
    animalGames: dynamicData.animalGames,
    bountyGames: dynamicData.bountyGames,
    tableGames: dynamicData.tableGames,
    // Loading and error states
    isLoading,
    error,
  }

  return (
    <MainContentContext.Provider value={value}>
      {children}
    </MainContentContext.Provider>
  )
}

export function useMainContent() {
  const context = useContext(MainContentContext)
  if (context === undefined) {
    throw new Error(
      'useMainContent must be used within a MainContentProvider'
    )
  }
  return context
}