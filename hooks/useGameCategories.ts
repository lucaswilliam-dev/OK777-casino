import { useState, useEffect } from 'react'
import { apiGet } from '../lib/axios'
import { API_ENDPOINTS, GameCategory, GameCategoriesResponse } from '../types/api'

interface UseGameCategoriesReturn {
  categories: GameCategory[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Custom hook to fetch game categories from the API
 */
export const useGameCategories = (): UseGameCategoriesReturn => {
  const [categories, setCategories] = useState<GameCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('[useGameCategories] Fetching categories from:', API_ENDPOINTS.GAME_CATEGORIES)
      
      const response = await apiGet<GameCategoriesResponse>(
        API_ENDPOINTS.GAME_CATEGORIES
      )
      
      console.log('[useGameCategories] Response received:', {
        code: response.code,
        message: response.message,
        categoriesCount: response.data?.length || 0
      })
      
      // Handle both response formats for backward compatibility
      const categories = response.data || []
      setCategories(categories)
      
      if (categories.length === 0) {
        console.warn('[useGameCategories] No categories returned from API')
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch categories')
      setError(error)
      console.error('[useGameCategories] Error fetching game categories:', {
        error: error.message,
        endpoint: API_ENDPOINTS.GAME_CATEGORIES,
        fullError: err
      })
      // Set empty array on error to prevent breaking the UI
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  }
}

export default useGameCategories
