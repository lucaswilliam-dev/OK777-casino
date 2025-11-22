'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useModal } from '../../../context/ModalProvider'
import { useI18n } from '../../../context/I18nProvider'
import { useMainContent } from '../../../context/MainContentProvider'
import { Swiper as SwiperType } from 'swiper'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import {
  setLatestEarningsSlide,
  setGameManufacturersSlide,
} from '../../../store/slices/carouselSlice'
import CasinoCard from '../../../components/ui/cards/CasinoCard'
import GameCard from '../../../components/ui/cards/GameCard'
import EarningCard from '../../../components/ui/cards/EarningCard'
import SwiperSlider from '../../../components/ui/slider/SwiperSlider'
import { Icon } from '@iconify/react'
import { X } from 'lucide-react'
import { apiGet } from '../../../lib/axios'
import { API_ENDPOINTS, GameByCategoryResponse } from '../../../types/api'
import {
  StatusDropdown,
  StatusDropdownTrigger,
  StatusDropdownContent,
  StatusDropdownItem,
} from '@/components/ui/StatusDropdown'

const statusOptions = [
  'Up to date',
  'Daily',
  'Checking for updates...',
  'Installing updates',
  'Update failed',
  'Connected',
  'Disconnected',
]

// Game Grid Component
const GameGrid: React.FC<{
  data: any[]
  renderCard: (item: any, index: number) => React.ReactNode
  isLoading?: boolean
}> = ({ data, renderCard, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 pb-4">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-[rgba(255,255,255,0.04)] rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#A7B5CA] text-sm">No games found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 pb-4">
      {data.map((item, index) => renderCard(item, index))}
    </div>
  )
}

// Filtered Page Header Component
const FilteredPageHeader: React.FC<{
  title: string
  count: number
  icon: string
  searchValue: string
  onSearchChange: (value: string) => void
}> = ({ title, count, icon, searchValue, onSearchChange }) => {
  const { openGameProviderModal, openChooseModal } = useModal()
  const { t } = useI18n()
  const [isOpenSearch, setIsOpenSearch] = useState(true)

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4 [@media(max-width:1024px)]:mt-[-4px]">
        <div className="bg-[rgba(255,255,255,0.08)] rounded-lg p-[7px]">
          <h1 className="text-white text-[14px] font-bold flex items-center gap-2">
            <img src={icon} className="w-6 hidden lg:block h-6" alt="game" />
            {title}{' '}
            <span className="text-[#2283F6] text-[12px] bg-[#111923] px-2 py-0.5 rounded-[4px]">
              {count}
            </span>
          </h1>
        </div>
        <div
          onClick={() => setIsOpenSearch(!isOpenSearch)}
          className="p-[10px] bg-[#111923] lg:hidden lg:bg-[rgba(255,255,255,0.04)] flex gap-1 items-center lg:w-50 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
        >
          {!isOpenSearch ? (
            <X className="w-[18px] h-[18px] text-white" />
          ) : (
            <img
              src="/icons/search.svg"
              alt="search"
              className="w-[18px] h-[18px]"
            />
          )}
          <span className="text-[#A7B5CA] hidden lg:block text-sm">Search</span>
        </div>
        <div className="flex gap-4 [@media(max-width:1024px)]:hidden">
          <div
            onClick={openGameProviderModal}
            className="hidden lg:flex w-50 items-center justify-between h-12 px-3 bg-white-4 rounded-lg hover:bg-white-8 transition-colors cursor-pointer"
          >
            <span className="text-[#A7B5CA] text-sm">Game provider</span>
            <svg
              className="w-4 h-4 text-casper"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          <div
            onClick={openChooseModal}
            className="hidden lg:flex w-50 items-center justify-between h-12 px-3 bg-white-4 rounded-lg hover:bg-white-8 transition-colors cursor-pointer"
          >
            <span className="text-casper text-sm">All</span>
            <svg
              className="w-4 h-4 text-casper"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <div
            onClick={() => setIsOpenSearch(!isOpenSearch)}
            className="p-[10px] bg-[#111923] lg:bg-[rgba(255,255,255,0.04)] flex gap-1 items-center lg:w-50 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          >
            <img
              src="/icons/search.svg"
              alt="search"
              className="w-[18px] h-[18px]"
            />
            <span className="text-[#A7B5CA] hidden lg:block text-sm">
              {t('app.search')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex xl:hidden items-center gap-3">
        {isOpenSearch ? (
          <>
            <div
              onClick={openGameProviderModal}
              className="flex w-[50%] items-center justify-between h-10 px-3 bg-[rgba(255,255,255,0.04)] rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
            >
              <span className="text-[#A7B5CA] text-sm">
                {t('games.providers')}
              </span>
              <svg
                className="w-4 h-4 text-casper"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            <div
              onClick={openChooseModal}
              className="flex w-[50%] items-center justify-between h-10 px-3 bg-[rgba(255,255,255,0.04)] rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
            >
              <span className="text-casper text-sm">All</span>
              <svg
                className="w-4 h-4 text-casper"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </>
        ) : (
          <>
            <div className="flex w-full items-center gap-2 h-10 px-3 bg-[rgba(255,255,255,0.04)] rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors">
              <img
                src="/icons/search.svg"
                alt="search"
                className="w-[18px] h-[18px] flex-shrink-0"
              />
              <input
                type="text"
                placeholder={t('app.search')}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 bg-transparent text-[#A7B5CA] text-sm placeholder:text-[#A7B5CA] border-none outline-none min-w-0"
              />
            </div>
          </>
        )}
      </div>

      {/* Desktop Search */}
      <div className="hidden xl:flex items-center gap-3 mt-3">
        <div className="flex w-full items-center gap-2 h-10 px-3 bg-[rgba(255,255,255,0.04)] rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors">
          <img
            src="/icons/search.svg"
            alt="search"
            className="w-[18px] h-[18px] flex-shrink-0"
          />
          <input
            type="text"
            placeholder={t('app.search')}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-[#A7B5CA] text-sm placeholder:text-[#A7B5CA] border-none outline-none min-w-0"
          />
        </div>
      </div>
    </div>
  )
}

// Latest bets table component
const LatestBetsTable: React.FC = () => {
  const { latestBets } = useMainContent()
  const { t } = useI18n()
  const [selectedStatus, setSelectedStatus] = useState('Up to date')
  return (
    <>
      <div className="text-4.5 font-bold flex items-center w-full justify-between text-white mb-4 gap-2">
        <span>{t('app.latestBetting')}</span>
        <StatusDropdown>
          <StatusDropdownTrigger className="bg-[#2A3546] border-none ring-0 focus:ring-0 outline-none">
            {selectedStatus}
          </StatusDropdownTrigger>
          <StatusDropdownContent
            className="bg-[#2A3546] border-none"
            align="center"
          >
            {statusOptions.map(status => (
              <StatusDropdownItem
                key={status}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </StatusDropdownItem>
            ))}
          </StatusDropdownContent>
        </StatusDropdown>
      </div>
      <div
        className={`grid lg:md:grid-cols-[15%_15%_20%_15%_25%_10%] grid-cols-[20%_20%_20%_40%] gap-[6px] lg:px-8 px-[6px] ${
          selectedStatus !== 'Daily'
            ? 'grid-cols-[20%_20%_20%_40%]'
            : 'grid-cols-[30%_30%_40%]'
        }`}
      >
        <div className="text-left text-[12px] font-bold py-2 text-white">
          Game
        </div>
        <div className="text-left text-[12px] font-bold py-2 text-white">
          Player
        </div>
        <div className="text-left text-[12px] hidden md:lg:block font-bold py-2 text-white">
          Time
        </div>
        <div className="text-left text-[12px] hidden md:lg:block font-bold py-2 truncate text-white">
          Bet Amount
        </div>
        <div className="text-left text-[12px] font-bold py-2 text-white">
          Multiplier
        </div>
        {selectedStatus !== 'Daily' && (
          <div className="text-left text-[12px] font-bold py-2 text-white">
            Payout
          </div>
        )}
      </div>
      <div className="w-full relative h-[462px] z-[-1] lg:mb-16 mb-8">
        <SwiperSlider
          data={latestBets}
          allowTouchMove={false}
          renderSlide={(bet, index) => (
            <div
              className={`bg-[#1C2532] lg:px-8 gap-[6px] px-[6px] w-full grid lg:md:grid-cols-[15%_15%_20%_15%_25%_10%] grid-cols-[20%_20%_20%_40%] rounded-[16px] h-[48px] overflow-hidden mb-[6px] ${
                selectedStatus !== 'Daily'
                  ? 'grid-cols-[20%_20%_20%_40%]'
                  : 'grid-cols-[30%_30%_40%]'
              } items-center`}
              key={index}
            >
              <div className="text-white flex text-[12px] font-bold truncate items-center gap-2">
                <img
                  src="/images/gameLogo.png"
                  alt="game"
                  className="w-6 h-6"
                />
                {bet.game}
              </div>
              <div className="text-gray-300 text-[12px] font-bold truncate flex items-center gap-2">
                <img
                  src="/images/avatar(1).png"
                  alt="avatar"
                  className="w-6 h-6 hidden md:lg:block"
                />
                {bet.player}
              </div>
              <div className="text-gray-300 text-[12px] hidden md:lg:flex items-center font-bold truncate">
                {bet.time}
              </div>
              <div className="text-gray-300 text-[12px] hidden md:lg:flex font-bold truncate items-center gap-2">
                <img
                  src="/icons/coin-icon/BTC.svg"
                  alt="coin"
                  className="w-6 h-6"
                />
                {bet.bet}
              </div>
              {selectedStatus !== 'Daily' && (
                <div className="text-[#2283F6] text-[12px] font-bold truncate flex items-center">
                  {bet.multiplier}
                </div>
              )}
              <div className="text-green-400 text-[12px] font-bold truncate flex items-center gap-2">
                {bet.payout}
                <div className="rounded-[8px] overflow-hidden !w-6 !h-6">
                  <img
                    src="/icons/coin-icon/BTC.svg"
                    alt="coin"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          )}
          direction="vertical"
          slidesPerView={9.1}
          spaceBetween={6}
          autoplayDelay={1000}
          className="h-full"
        />
        <div className="absolute bottom-0 left-0 w-full h-[254px] bg-gradient-to-b z-[30] from-transparent to-[#111923] pointer-events-none"></div>
      </div>
    </>
  )
}

// Game manufacturers section component
const GameManufacturersSection: React.FC = () => {
  const { gameManufacturers } = useMainContent()
  const { t } = useI18n()
  const swiperRef = useRef<SwiperType | null>(null)
  const dispatch = useAppDispatch()
  const carouselState = useAppSelector(state => state.carousel)

  const handleGameManufacturersSlideChange = (swiper: SwiperType) => {
    dispatch(setGameManufacturersSlide(swiper.realIndex ?? swiper.activeIndex))
  }

  return (
    <div className="lg:mb-16 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4.5 font-bold text-white mb-4 flex gap-2">
          {t('app.gameProvider')}
        </h2>
        <div className="flex justify-end mb-4">
          <div
            className="hover:bg-gray-600 active:bg-gray-600 w-9 h-9 flex items-center justify-center rounded-l-lg transition-colors cursor-pointer"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <Icon icon="mdi:chevron-left" className="text-white text-[24px]" />
          </div>
          <div
            className="hover:bg-gray-600 active:bg-gray-600 w-9 h-9 flex items-center justify-center rounded-r-lg transition-colors cursor-pointer"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <Icon
              icon="mdi:chevron-right"
              className="text-white text-[24px]"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto">
        <SwiperSlider
          data={gameManufacturers}
          renderSlide={(manufacturer, index) => (
            <GameCard {...manufacturer} gameCount={manufacturer.gamesCount} />
          )}
          slidesPerView={4.4}
          spaceBetween={12}
          breakpoints={{
            320: { slidesPerView: 1.2 },
            375: { slidesPerView: 1.4 },
            425: { slidesPerView: 1.8 },
            768: { slidesPerView: 3.6 },
            1024: { slidesPerView: 4.2, spaceBetween: 20 },
            1440: { slidesPerView: 4.8 },
          }}
          navigationRef={swiperRef}
          initialSlide={carouselState.gameManufacturersCurrentSlide}
          onSlideChange={handleGameManufacturersSlideChange}
          carouselId="game-manufacturers"
        />
      </div>
    </div>
  )
}

export default function ViewAllGamesPage() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const carouselState = useAppSelector(state => state.carousel)
  const { bountyGames: apiBountyGames } = useMainContent()
  
  // Static data for latest earnings (app.latestEarining)
  const staticBountyGames = [
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
    {
      price: '75',
      title: 'QueenofBounty',
      id: '75808045',
      image: '/images/queen.png',
    },
  ]

  // Use static data for latest earnings (always show static content)
  const bountyGames = staticBountyGames
  
  const [games, setGames] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const [totalGames, setTotalGames] = useState(0)

  // Get category from URL params (optional)
  const category = searchParams.get('category') || 'Live Casino'
  const categoryType = searchParams.get('categoryType') || undefined

  // Fetch all games (no pagination)
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true)
      try {
        // Use the same endpoint as sidebar category click for consistency
        // This filters by extra_gameType field, matching the sidebar behavior
        const params = new URLSearchParams()
        params.append('page', '1')
        params.append('limit', '1000') // Fetch all games
        
        if (categoryType) {
          // Use extraGameType parameter to match sidebar filtering (filters by extra_gameType field)
          params.append('extraGameType', categoryType)
        }

        const response = await apiGet<GameByCategoryResponse>(
          `${API_ENDPOINTS.GAMES_BY_CATEGORY}?${params.toString()}`
        )

        // Handle API response structure: { code: 200, data: [...], meta: {...} }
        let gamesData: any[] = []

        if (response.code === 200 && response.data && Array.isArray(response.data)) {
          gamesData = response.data
        } else if (response.data && Array.isArray(response.data)) {
          gamesData = response.data
        } else if (Array.isArray(response)) {
          gamesData = response
        }

        // Filter to only show games with inManager: true (if needed)
        // Note: The by-category endpoint should already filter by inManager, but we keep this for safety
        const filteredGames = gamesData.filter((game: any) => game.inManager !== false)

        // Apply client-side search filter if searchValue is provided
        let finalGames = filteredGames
        if (searchValue) {
          const searchLower = searchValue.toLowerCase()
          finalGames = filteredGames.filter((game: any) => {
            const gameName = (game.gameName || game.extra_gameName || game.game_name || '').toLowerCase()
            return gameName.includes(searchLower)
          })
        }

        setGames(finalGames)
        setTotalGames(finalGames.length)
      } catch (error) {
        console.error('Error fetching games:', error)
        setGames([])
        setTotalGames(0)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchGames()
    }, searchValue ? 500 : 0)

    return () => clearTimeout(timeoutId)
  }, [searchValue, categoryType])

  const handleLatestEarningsSlideChange = (swiper: SwiperType) => {
    dispatch(setLatestEarningsSlide(swiper.realIndex ?? swiper.activeIndex))
  }

  // Transform games for display
  // Note: Games from by-category endpoint use camelCase (gameName, imageUrl, gameCode)
  // while provided-games endpoint uses snake_case (game_name, image_url, game_code)
  const transformedGames = useMemo(() => {
    return games.map((game) => ({
      badge: game.isHot ? 'Hot' : game.isNew ? 'New' : undefined,
      views: game.views?.toString() || undefined,
      user: game.user || undefined,
      // Handle both camelCase (from by-category) and snake_case (from provided-games)
      image: game.imageUrl || game.extra_imageUrl || game.image_url || '/images/placeholder-game.jpg',
      title: game.gameName || game.extra_gameName || game.game_name || 'Game',
      gameCode: game.gameCode || game.game_code,
      provider: game.provider || game.extra_provider,
      link: game.link || `#`,
    }))
  }, [games])

  return (
    <div
      className="lg:px-6 w-full max-w-[1920px] mx-auto overflow-x-hidden"
      style={{ margin: 'auto' }}
    >
      <FilteredPageHeader
        title={category}
        icon="/icons/Casino1.svg"
        count={totalGames}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <GameGrid
        data={transformedGames}
        isLoading={isLoading}
        renderCard={(card, index) => <CasinoCard key={index} {...card} />}
      />

      {/* Latest Bets Section */}
      <div className="lg:mb-16 mb-8">
        <LatestBetsTable />
      </div>

      {/* Game Manufacturers Section */}
      <GameManufacturersSection />

      {/* Latest Earnings Section */}
      <div className="lg:mb-16 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-4.5 font-bold flex items-center text-white">
            {t('app.latestEarining')}
          </h2>
          <span className="font-bold flex items-center text-[14px] text-[#2283F6]">
            <span>online users 36</span>
          </span>
        </div>
        <SwiperSlider
          data={bountyGames}
          autoplayDelay={1000000}
          renderSlide={(card, index) => <EarningCard {...card} />}
          slidesPerView={7}
          spaceBetween={12}
          breakpoints={{
            320: { slidesPerView: 3.3 },
            375: { slidesPerView: 3.5 },
            425: { slidesPerView: 4.1 },
            768: { slidesPerView: 4.3 },
            1024: { slidesPerView: 5, spaceBetween: 20 },
            1440: { slidesPerView: 7.3 },
          }}
          initialSlide={carouselState.latestEarningsCurrentSlide}
          onSlideChange={handleLatestEarningsSlideChange}
          carouselId="latest-earnings"
        />
      </div>
    </div>
  )
}
