import { GameCategory } from '../types/api'
import { SidebarItem } from '../components/sidebar-data'

/**
 * Maps category names to their corresponding icons and tab parameters
 */
const categoryIconMap: Record<string, { icon: string; tab: string }> = {
  slots: { icon: '/icons/dice.svg', tab: 'slots' },
  'live casino': { icon: '/icons/casino.svg', tab: 'casino' },
  'live-casino': { icon: '/icons/casino.svg', tab: 'casino' },
  casino: { icon: '/icons/casino.svg', tab: 'casino' },
  futures: { icon: '/icons/Futures.svg', tab: 'futures' },
  'p/f futures': { icon: '/icons/Futures.svg', tab: 'futures' },
  crypto: { icon: '/icons/Cryptogra.svg', tab: 'crypto' },
  'crypto games': { icon: '/icons/Cryptogra.svg', tab: 'crypto' },
  sport: { icon: '/icons/football.svg', tab: 'sport' },
  sports: { icon: '/icons/football.svg', tab: 'sport' },
  table: { icon: '/icons/tablegame.svg', tab: 'table' },
  'table games': { icon: '/icons/tablegame.svg', tab: 'table' },
  'table-games': { icon: '/icons/tablegame.svg', tab: 'table' },
}

/**
 * Default icon for categories that don't have a specific mapping
 */
const DEFAULT_ICON = '/icons/game.svg'

/**
 * Converts API game categories to sidebar items
 * @param categories - Array of game categories from the API
 * @param t - Translation function
 * @returns Array of sidebar items
 */
export const mapCategoriesToSidebarItems = (
  categories: GameCategory[],
  t: (key: string) => string
): SidebarItem[] => {
  return categories
    .map(category => {
      // Normalize category name for lookup (lowercase, trim)
      const normalizedName = category.name.toLowerCase().trim()
      
      // Get icon and tab from mapping, or use defaults
      const mapping = categoryIconMap[normalizedName]
      const icon = category.icon || mapping?.icon || DEFAULT_ICON
      const tab = mapping?.tab || normalizedName.replace(/\s+/g, '-')
      
      // Generate a safe ID from the category name
      const id = `category-${category.id}-${normalizedName.replace(/\s+/g, '-')}`
      
      return {
        id,
        icon,
        label: category.name, // Use the category name as-is from the API
        href: `/?tab=${tab}`,
      }
    })
    .filter(item => {
      // Filter out any categories that might conflict with Hash Games
      // We'll keep Hash Games static, so exclude it if it appears in the API
      const normalizedLabel = item.label.toLowerCase().trim()
      return !normalizedLabel.includes('hash')
    })
}

/**
 * Maps a tab parameter back to the category name
 * @param tab - The tab parameter from URL (e.g., "slots", "casino")
 * @param categories - Array of game categories from the API
 * @returns The category name that matches the tab, or null if not found
 */
export const getCategoryNameFromTab = (
  tab: string | null,
  categories: GameCategory[]
): string | null => {
  if (!tab) return null

  // Find category where the tab matches
  for (const category of categories) {
    const normalizedName = category.name.toLowerCase().trim()
    const mapping = categoryIconMap[normalizedName]
    const categoryTab = mapping?.tab || normalizedName.replace(/\s+/g, '-')
    
    if (categoryTab === tab) {
      // Return the actual category name (not normalized) to match database
      return category.name
    }
  }

  // If no exact match, try to find by tab directly in categoryIconMap
  for (const [categoryName, mapping] of Object.entries(categoryIconMap)) {
    if (mapping.tab === tab) {
      // Find the category with this name
      const category = categories.find(
        cat => cat.name.toLowerCase().trim() === categoryName
      )
      if (category) {
        return category.name
      }
    }
  }

  return null
}
