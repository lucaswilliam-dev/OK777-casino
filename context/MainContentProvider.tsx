'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import mainContentData from '../main-content-data.json'
import { apiGet } from '../lib/axios'
import { API_ENDPOINTS, ApiResponse } from '../types/api'

// Define types for dynamic data
interface DynamicMainContentData {
  newGames: Array<{
    badge?: string
    views?: string
    user?: string
    image: string
    title?: string
    gameCode?: string
    provider?: string
    link?: string
  }>
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
  cryptoCards: typeof mainContentData.cryptoCards
  hashGames: typeof mainContentData.hashGames
  brand: typeof mainContentData.brand
  latestBets: typeof mainContentData.latestBets
  gameManufacturers: typeof mainContentData.gameManufacturers
  footerContent: typeof mainContentData.footerContent
  // Dynamic data from API
  newGames: DynamicMainContentData['newGames']
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
  newGames: [],
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
        
        let mainContentData: DynamicMainContentData = defaultDynamicData
        
        // Fetch main content data from API (optional - don't block if it fails)
        try {
          const response = await apiGet<ApiResponse<DynamicMainContentData>>(
            API_ENDPOINTS.MAIN_CONTENT
          )
          
          if (response.code === 200 && response.data) {
            mainContentData = { ...defaultDynamicData, ...response.data }
          }
        } catch (mainContentError) {
          console.warn('[MainContentProvider] Main content API not available, using defaults:', mainContentError)
          // Continue with default data - don't block the rest
        }
        
        // Fetch new games from database (where isNew is true and inManager is true)
        try {
          const newGamesResponse = await apiGet<any>(
            `/api/v1/operators/provided-games?page=1&limit=1000`
          )
          
          console.log('[MainContentProvider] New games API response structure:', {
            hasData: !!newGamesResponse.data,
            hasProviderGames: !!(newGamesResponse.data && newGamesResponse.data.provider_games),
            isArray: Array.isArray(newGamesResponse.data),
            responseKeys: Object.keys(newGamesResponse || {}),
          })
          
          // Handle API response structure: { data: { provider_games: [...] }, pagination: {...} }
          let newGamesData: any[] = []

          if (newGamesResponse.data && newGamesResponse.data.provider_games && Array.isArray(newGamesResponse.data.provider_games)) {
            newGamesData = newGamesResponse.data.provider_games
          } else if (newGamesResponse.data && Array.isArray(newGamesResponse.data)) {
            newGamesData = newGamesResponse.data
          } else if (Array.isArray(newGamesResponse)) {
            newGamesData = newGamesResponse
          }
          
          console.log('[MainContentProvider] Total games fetched:', newGamesData.length, "newGames==========>>>")
          
          if (newGamesData.length > 0) {
            const sampleGame = newGamesData[0]
            console.log('[MainContentProvider] Sample game:', {
              game_name: sampleGame.game_name || sampleGame.gameName,
              isNew: sampleGame.isNew,
              isNewType: typeof sampleGame.isNew,
              inManager: sampleGame.inManager,
              inManagerType: typeof sampleGame.inManager,
            })
            
             // Count games with isNew
             const gamesWithIsNew = newGamesData.filter((g: any) => g.isNew === true || g.isNew === 'true' || g.isNew === 1)
             const gamesWithInManager = newGamesData.filter((g: any) => g.inManager === true || g.inManager === 'true' || g.inManager === 1)
             console.log('[MainContentProvider] Games with isNew:', gamesWithIsNew.length)
             console.log('[MainContentProvider] Games with inManager:', gamesWithInManager.length)
          }
          
          // Filter games where isNew is true and inManager is true
          const filteredNewGames = newGamesData
            .filter((game: any) => {
              // Check isNew - handle boolean, string, and number formats
              const isNew = game.isNew === true || game.isNew === 'true' || game.isNew === 1 || game.isNew === '1'
              // Check inManager - handle boolean, string, and number formats  
              const inManager = game.inManager === true || game.inManager === 'true' || game.inManager === 1 || game.inManager === '1'
              
              return isNew && inManager
            })
            .map((game: any) => ({
              badge: 'New',
              views: game.views?.toString() || undefined,
              user: game.user || undefined,
              image: game.image_url || game.extra_imageUrl || game.imageUrl || '/images/placeholder-game.jpg',
              title: game.game_name || game.extra_gameName || game.gameName || 'Game',
              gameCode: game.game_code || game.gameCode,
              provider: game.provider || game.extra_provider,
              link: game.link || `#`,
            }))
          
          console.log('[MainContentProvider] Filtered new games count:', filteredNewGames.length)
          if (filteredNewGames.length > 0) {
            console.log('[MainContentProvider] First filtered game:', filteredNewGames[0])
          }
          
          mainContentData.newGames = filteredNewGames
        } catch (newGamesError) {
          console.error('[MainContentProvider] Error fetching new games:', newGamesError)
          // Continue with other data even if new games fetch fails
        }
        
        setDynamicData(mainContentData)
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
    cryptoCards: mainContentData.cryptoCards,
    hashGames: mainContentData.hashGames,
    brand: mainContentData.brand,
    latestBets: mainContentData.latestBets,
    gameManufacturers: mainContentData.gameManufacturers,
    footerContent: mainContentData.footerContent,
    // Dynamic data from API
    newGames: dynamicData.newGames,
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