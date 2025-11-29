import { useState, useEffect, useRef } from 'react'
import { apiGet } from '../lib/axios'
import { API_ENDPOINTS, GameByCategoryResponse } from '../types/api'
import { useAppSelector } from '../store/hooks'

interface UseGamesByCategoryReturn {
  games: any[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  total: number
}

/**
 * Custom hook to fetch games by category name
 * @param categoryName - The name of the category (will be used as extraGameType)
 */
export const useGamesByCategory = (
  categoryName: string | null
): UseGamesByCategoryReturn => {
  const [games, setGames] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)
  const isMountedRef = useRef(true)
  
  // Get selected language from Redux store
  const selectedLanguage = useAppSelector(state => state.userSettings.selectedLanguage)
  
  // Parse language code from stored language
  const getLanguageCode = (): number | null => {
    if (!selectedLanguage) return null
    try {
      const parsed = JSON.parse(selectedLanguage)
      return parsed.languageCode !== undefined ? parsed.languageCode : null
    } catch {
      return null
    }
  }

  const fetchGames = async () => {
    if (!categoryName) {
      setGames([])
      setTotal(0)
      setIsLoading(false)
      return
    }

    // Mark as mounted for this request
    isMountedRef.current = true
    const currentCategory = categoryName

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('[useGamesByCategory] Fetching games for category:', categoryName)
      
      // Create a minimum 2-second delay promise
      const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2000))
      
      // Get language code for visibility filtering
      const languageCode = getLanguageCode()
      
      // Build query parameters
      const params = new URLSearchParams()
      params.append('extraGameType', categoryName)
      params.append('page', '1')
      params.append('limit', '100')
      if (languageCode !== null && languageCode !== undefined) {
        params.append('visibility', languageCode.toString())
      } else {
        params.append('visibility', 'null') // Explicitly send null for English (all games)
      }
      
      // Fetch games from API
      const apiPromise = apiGet<GameByCategoryResponse>(
        `${API_ENDPOINTS.GAMES_BY_CATEGORY}?${params.toString()}`
      )
      
      // Wait for both the API call and the minimum delay
      const [response] = await Promise.all([apiPromise, minDelayPromise])
      
      // Check if category changed or component unmounted during fetch
      if (!isMountedRef.current || currentCategory !== categoryName) {
        return
      }
      
      console.log('[useGamesByCategory] Response received:', {
        code: response.code,
        message: response.message,
        gamesCount: response.data?.length || 0,
        total: response.meta?.total || 0
      })
      
      if (response.code === 200 && response.data) {
        setGames(response.data)
        setTotal(response.meta?.total || response.data.length)
      } else {
        throw new Error(response.message || 'Failed to fetch games')
      }
    } catch (err) {
      // Don't update state if category changed or component unmounted
      if (!isMountedRef.current || currentCategory !== categoryName) {
        return
      }
      
      const error =
        err instanceof Error ? err : new Error('Failed to fetch games by category')
      setError(error)
      console.error('[useGamesByCategory] Error fetching games:', {
        error: error.message,
        categoryName,
        fullError: err
      })
      setGames([])
      setTotal(0)
    } finally {
      // Only update loading state if this is still the current request
      if (isMountedRef.current && currentCategory === categoryName) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchGames()
    
    // Cleanup: mark as unmounted if category changes
    return () => {
      isMountedRef.current = false
    }
  }, [categoryName, selectedLanguage]) // Refetch when language changes

  return {
    games,
    isLoading,
    error,
    refetch: fetchGames,
    total,
  }
}

export default useGamesByCategory
