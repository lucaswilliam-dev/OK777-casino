import { useState, useEffect } from 'react'
import { apiGet } from '../lib/axios'
import { API_ENDPOINTS, GameByCategoryResponse } from '../types/api'

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

  const fetchGames = async () => {
    if (!categoryName) {
      setGames([])
      setTotal(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('[useGamesByCategory] Fetching games for category:', categoryName)
      
      const response = await apiGet<GameByCategoryResponse>(
        `${API_ENDPOINTS.GAMES_BY_CATEGORY}?extraGameType=${encodeURIComponent(categoryName)}&page=1&limit=100`
      )
      
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
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [categoryName])

  return {
    games,
    isLoading,
    error,
    refetch: fetchGames,
    total,
  }
}

export default useGamesByCategory
