'use client'

import React, { useEffect, useState } from 'react'
import { useI18n } from '../context/I18nProvider'
import { useMainContent } from '../context/MainContentProvider'
import { useGameCategories } from '../hooks/useGameCategories'
import { apiGet } from '../lib/axios'
import { API_ENDPOINTS, GameByCategoryResponse } from '../types/api'
import { useAppSelector } from '../store/hooks'
import CasinoCard from './ui/cards/CasinoCard'
import HashCard from './ui/cards/HashCard'
import FutureCard from './ui/cards/FutureCard'
import CasinoCardSkeleton from './ui/cards/CasinoCardSkeleton'
import HashCardSkeleton from './ui/cards/HashCardSkeleton'
import FutureCardSkeleton from './ui/cards/FutureCardSkeleton'
import SwiperSlider from './ui/slider/SwiperSlider'

// Section header component
const SectionHeader: React.FC<{
  icon: string
  title: string
  alt: string
  count?: number
}> = ({ icon, title, alt, count }) => {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-4.5 font-bold flex items-center text-white gap-2">
        <img className="grayscale" src={icon} alt={alt} />
        {title}
      </h2>
      {count && (
        <span className="cursor-pointer font-bold flex items-center text-[14px] text-[#2283F6]">
          <span>
            {t('app.all')} {count}
          </span>
        </span>
      )}
    </div>
  )
}

type GameBreakpointsProps = {
  [width: number]: { slidesPerView: number }
}

type GameBreakpointsTwoRows = {
  [width: number]: {
    slidesPerView: number
    grid: {
      rows: 2
      fill: 'row'
    }
  }
}

export const GameBreakpoints: GameBreakpointsProps = {
  320: { slidesPerView: 3.3 },
  375: { slidesPerView: 3.3 },
  425: { slidesPerView: 3.3 },
  768: { slidesPerView: 6.3 },
  1024: { slidesPerView: 6.3 },
  1440: { slidesPerView: 8.3 },
  1640: { slidesPerView: 9.3 },
}

const GameBreakpointsTwoRows: GameBreakpointsTwoRows = {
  320: { slidesPerView: 3.3, grid: { rows: 2, fill: 'row' } },
  375: { slidesPerView: 3.3, grid: { rows: 2, fill: 'row' } },
  425: { slidesPerView: 3.3, grid: { rows: 2, fill: 'row' } },
  768: { slidesPerView: 6.3, grid: { rows: 2, fill: 'row' } },
  1024: { slidesPerView: 6.3, grid: { rows: 2, fill: 'row' } },
  1440: { slidesPerView: 8.3, grid: { rows: 2, fill: 'row' } },
  1640: { slidesPerView: 9.3, grid: { rows: 2, fill: 'row' } },
}

const HashBreakpoints: GameBreakpointsProps = {
  320: { slidesPerView: 1.1 },
  375: { slidesPerView: 1.1 },
  425: { slidesPerView: 1.2 },
  768: { slidesPerView: 2.3 },
  1024: { slidesPerView: 2.3 },
  1440: { slidesPerView: 3.3 },
  1640: { slidesPerView: 4.3 },
}

const FutureBreakpoints: GameBreakpointsProps = {
  320: { slidesPerView: 2.3 },
  375: { slidesPerView: 2.3 },
  425: { slidesPerView: 3.8 },
  768: { slidesPerView: 5.3 },
  1024: { slidesPerView: 6.3 },
  1440: { slidesPerView: 7.3 },
}

// Homepage sections with SwiperSlider
export const HomepageSections: React.FC = () => {
  const { t } = useI18n()

  // Get static data from main-content-data.json
  const { newGames, cryptoCards, hashGames, isLoading: isLoadingMainContent } = useMainContent()  

  // Get dynamic categories and games from database
  const { categories } = useGameCategories()
  const [categoryGamesMap, setCategoryGamesMap] = useState<
    Record<string, any[]>
  >({})
  const [isLoading, setIsLoading] = useState(true)
  
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

  // Fetch games for all categories
  useEffect(() => {
    const fetchAllCategoryGames = async () => {
      if (categories.length === 0) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const gamesMap: Record<string, any[]> = {}
      
      // Get language code for visibility filtering
      const languageCode = getLanguageCode()

      try {
        // Fetch games for each category in parallel
        const fetchPromises = categories.map(async category => {
          try {
            // Build query parameters with visibility
            const params = new URLSearchParams()
            params.append('extraGameType', category.name)
            params.append('page', '1')
            params.append('limit', '20')
            if (languageCode !== null && languageCode !== undefined) {
              params.append('visibility', languageCode.toString())
            } else {
              params.append('visibility', 'null') // Explicitly send null for English (all games)
            }
            
            const response = await apiGet<GameByCategoryResponse>(
              `${API_ENDPOINTS.GAMES_BY_CATEGORY}?${params.toString()}`
            )
            if (response.code === 200 && response.data) {
              return { categoryName: category.name, games: response.data }
            }
            return { categoryName: category.name, games: [] }
          } catch (error) {
            console.error(
              `Error fetching games for category ${category.name}:`,
              error
            )
            return { categoryName: category.name, games: [] }
          }
        })

        const results = await Promise.all(fetchPromises)
        results.forEach(({ categoryName, games }) => {
          gamesMap[categoryName] = games
        })
      } catch (error) {
        console.error('Error fetching category games:', error)
      } finally {
        setCategoryGamesMap(gamesMap)
        setIsLoading(false)
      }
    }

    fetchAllCategoryGames()
  }, [categories, selectedLanguage]) // Refetch when language changes

  // Transform API games to match the format expected by cards
  const transformGamesForDisplay = (games: any[]) => {
    return games.map(game => ({
      badge: game.isHot ? 'Hot' : game.isNew ? 'New' : undefined,
      views: game.views?.toString() || undefined,
      user: game.user || undefined,
      image:
        game.image_url ||
        game.extra_imageUrl ||
        game.imageUrl ||
        '/images/placeholder-game.jpg',
      title: game.game_name || game.extra_gameName || game.gameName || 'Game',
      gameCode: game.game_code || game.gameCode,
      provider: game.provider || game.extra_provider,
      link: game.link || `#`,
      // For HashCard
      chances: game.chances || '1.95',
      background:
        game.background ||
        game.image_url ||
        game.extra_imageUrl ||
        game.imageUrl ||
        '/images/placeholder-game.jpg',
      bettingAddress:
        game.bettingAddress || 'TXS3PfAU9hemKkoBWRUfsUkGBSrZGagh6X',
      leftButtonLink: game.leftButtonLink || `#`,
      rightButtonLink: game.rightButtonLink || `#`,
      // For FutureCard
      price: game.price || '0',
    }))
  }

  // Note: No need to duplicate data for two rows - Swiper's grid layout handles this automatically

  // Get icon for category (matches category-mapper logic)
  const getCategoryIcon = (category: any) => {
    const normalized = category.name.toLowerCase().trim()
    const iconMap: Record<string, string> = {
      slots: '/icons/Slots.svg',
      'live casino': '/icons/Casino1.svg',
      'live-casino': '/icons/Casino1.svg',
      casino: '/icons/Casino1.svg',
      futures: '/icons/Futures1.svg',
      'p/f futures': '/icons/Futures1.svg',
      crypto: '/icons/Cryptogra1.svg',
      'crypto games': '/icons/Cryptogra1.svg',
      sport: '/icons/Sport.svg',
      sports: '/icons/Sport.svg',
      table: '/icons/tablegame.svg',
      'table games': '/icons/tablegame.svg',
      'table-games': '/icons/tablegame.svg',
    }
    // Use category icon from database if available, otherwise use mapping
    return category.icon || iconMap[normalized] || '/icons/game.svg'
  }

  // Determine card type based on category
  const getCardType = (categoryName: string) => {
    const normalized = categoryName.toLowerCase().trim()
    if (normalized.includes('hash')) return 'hash'
    if (normalized.includes('futures') || normalized.includes('p/f'))
      return 'future'
    return 'casino'
  }

  // Determine if section should use two rows
  const shouldUseTwoRows = (categoryName: string) => {
    const normalized = categoryName.toLowerCase().trim().replace(/[_\s-]/g, '')
    return (
      normalized === 'slots' ||
      normalized === 'slot' ||
      normalized === 'livecasino' ||
      normalized === 'casino'
    )
  }

  // Generate skeleton data for loading states
  const generateSkeletonData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({ id: i }))
  }

  const skeletonCount = 7 // Number of skeleton cards to show

  // Filter out categories that match static sections and remove duplicates
  const normalizeCategoryName = (name: string) => {
    return name.toLowerCase().trim().replace(/[_\s-]/g, '')
  }

  const staticSectionNames = [
    'hash',
    'hashgames',
    'new',
    'newgames',
    'crypto',
    'cryptogra',
    'cryptocards',
  ]

  // Filter out categories that match static sections and remove duplicates
  const seenCategories = new Set<string>()
  const dynamicCategories = categories
    .filter(cat => {
      const normalized = normalizeCategoryName(cat.name)
      // Filter out hash games (static)
      if (normalized.includes('hash')) return false
      // Filter out exact matches with static sections
      if (staticSectionNames.includes(normalized)) return false
      // Remove duplicates by normalized name
      if (seenCategories.has(normalized)) return false
      seenCategories.add(normalized)
      return true
    })
    // Sort by name for consistent ordering
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      {/* New Games Section - from main-content-data.json */}
      <div className="lg:mb-16 mb-8">
        <SectionHeader
          icon="/icons/Home.svg"
          title={t('games.new')}
          alt="lobby"
          count={isLoadingMainContent ? 0 : newGames.length}
        />
        {isLoadingMainContent ? (
          <SwiperSlider
            key="homepage-new-launches-swiper-skeleton"
            autoplay={false}
            data={generateSkeletonData(skeletonCount)}
            renderSlide={(_, index) => <CasinoCardSkeleton key={index} />}
            slidesPerView={7}
            spaceBetween={8}
            breakpoints={GameBreakpoints}
            showProgressBars={false}
          />
        ) : (
          <SwiperSlider
            key="homepage-new-launches-swiper"
            autoplay={false}
            data={newGames.map((game: any) => ({
              badge: game.badge || 'NEW',
              views: game.views,
              user: game.user,
              image: game.image || '/images/placeholder-game.jpg',
            }))}
            renderSlide={(card, index) => <CasinoCard key={index} {...card} />}
            slidesPerView={7}
            spaceBetween={8}
            breakpoints={GameBreakpoints}
            showProgressBars={true}
          />
        )}
      </div>

      {/* Cryptogra Section - from main-content-data.json */}
      <div className="lg:mb-16 mb-8">
        <SectionHeader
          icon="/icons/Cryptogra1.svg"
          title={t('games.crypto')}
          alt="cryptogra"
          count={cryptoCards.length}
        />
        <SwiperSlider
          key="homepage-crypto-games-swiper"
          data={cryptoCards}
          renderSlide={(card, index) => (
            <FutureCard key={index} {...(card as any)} />
          )}
          slidesPerView={7}
          spaceBetween={8}
          breakpoints={FutureBreakpoints}
          showProgressBars={true}
          autoplay={false}
        />
      </div>

      {/* Hash Games Section - from main-content-data.json */}
      <div className="lg:mb-16 mb-8">
        <SectionHeader
          icon="/icons/Hash.svg"
          title={t('games.hashgames')}
          alt="hash"
          count={hashGames.length}
        />
        <SwiperSlider
          key="homepage-hash-games-swiper"
          data={hashGames.map((game: any) => ({
            title: game.title || 'Hash Game',
            chances: game.chances || '1.95',
            bettingAddress:
              game.bettingAddress || 'TXS3PfAU9hemKkoBWRUfsUkGBSrZGagh6X',
            leftButtonLink:
              game.leftButtonLink ||
              game.link?.replace('/page-betting', '/transfer-betting') ||
              '#',
            rightButtonLink: game.rightButtonLink || game.link || '#',
            background:
              game.background || game.image || '/images/placeholder-game.jpg',
          }))}
          renderSlide={(card, index) => (
            <HashCard key={index} {...(card as any)} />
          )}
          slidesPerView={7}
          spaceBetween={8}
          breakpoints={HashBreakpoints}
          showProgressBars={true}
          autoplay={false}
        />
      </div>

      {/* Dynamic Category Sections - from database */}
      {isLoading ? (
        // Show skeleton sections while loading categories
        dynamicCategories.map(category => {
          const cardType = getCardType(category.name)
          const useTwoRows = shouldUseTwoRows(category.name)
          const icon = getCategoryIcon(category)

          return (
            <div key={category.id} className="lg:mb-16 mb-8">
              <SectionHeader
                icon={icon}
                title={category.name}
                alt={category.name}
                count={0}
              />
              <SwiperSlider
                key={`homepage-${category.id}-swiper-skeleton`}
                data={generateSkeletonData(skeletonCount)}
                renderSlide={(_, index) => {
                  if (cardType === 'hash') {
                    return <HashCardSkeleton key={index} />
                  } else if (cardType === 'future') {
                    return <FutureCardSkeleton key={index} />
                  } else {
                    return <CasinoCardSkeleton key={index} />
                  }
                }}
                slidesPerView={7}
                spaceBetween={8}
                grid={useTwoRows ? { rows: 2, fill: 'row' } : undefined}
                breakpoints={
                  cardType === 'hash'
                    ? HashBreakpoints
                    : cardType === 'future'
                      ? FutureBreakpoints
                      : useTwoRows
                        ? GameBreakpointsTwoRows
                        : GameBreakpoints
                }
                showProgressBars={false}
                autoplay={false}
              />
            </div>
          )
        })
      ) : (
        dynamicCategories.map(category => {
          const games = categoryGamesMap[category.name] || []
          const transformedGames = transformGamesForDisplay(games)
          const cardType = getCardType(category.name)
          const useTwoRows = shouldUseTwoRows(category.name)
          const icon = getCategoryIcon(category)

          if (games.length === 0) return null

          return (
            <div key={category.id} className="lg:mb-16 mb-8">
              <SectionHeader
                icon={icon}
                title={category.name}
                alt={category.name}
                count={games.length}
              />
              <SwiperSlider
                key={`homepage-${category.id}-swiper`}
                data={transformedGames}
                renderSlide={(card, index) => {
                  if (cardType === 'hash') {
                    return <HashCard key={index} {...(card as any)} />
                  } else if (cardType === 'future') {
                    return <FutureCard key={index} {...(card as any)} />
                  } else {
                    return <CasinoCard key={index} {...(card as any)} />
                  }
                }}
                slidesPerView={7}
                spaceBetween={8}
                grid={useTwoRows ? { rows: 2, fill: 'row' } : undefined}
                breakpoints={
                  cardType === 'hash'
                    ? HashBreakpoints
                    : cardType === 'future'
                      ? FutureBreakpoints
                      : useTwoRows
                        ? GameBreakpointsTwoRows
                        : GameBreakpoints
                }
                showProgressBars={true}
                autoplay={false}
              />
            </div>
          )
        })
      )}
    </>
  )
}
