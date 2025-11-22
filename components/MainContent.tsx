'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useMainContent } from '../context/MainContentProvider'
import { useSidebar } from '../context/SidebarProvider'
import { useI18n } from '../context/I18nProvider'
import { Swiper as SwiperType } from 'swiper'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { useGameCategories } from '../hooks/useGameCategories'
import { useGamesByCategory } from '../hooks/useGamesByCategory'
import { getCategoryNameFromTab } from '../lib/category-mapper'
import {
  setMainBannerSlide,
  setNewLaunchesSlide,
  setLatestEarningsSlide,
  setGameManufacturersSlide,
} from '../store/slices/carouselSlice'
import CasinoCard from './ui/cards/CasinoCard'
import RewardCard from './ui/cards/RewardCard'
import FutureCard from './ui/cards/FutureCard'
import GameCard from './ui/cards/GameCard'
import { SuccessForm } from './auth/SuccessForm'
import SwiperSlider from './ui/slider/SwiperSlider'
import { HomepageSections } from './HomepageSections'

import {
  StatusDropdown,
  StatusDropdownTrigger,
  StatusDropdownContent,
  StatusDropdownItem,
} from '@/components/ui/StatusDropdown'
import EarningCard from './ui/cards/EarningCard'
import { GameBreakpoints } from '@/components/HomepageSections'

const statusOptions = [
  'Up to date',
  'Daily',
  'Checking for updates...',
  'Installing updates',
  'Update failed',
  'Connected',
  'Disconnected',
  'Syncing...',
  'Sync complete',
]

// Generate extended hash games data (30 total)
const generateHashGames = (tableGames: any[]) => {
  const baseGames = tableGames
  const extendedGames = []

  // Add the original 5 games
  extendedGames.push(...baseGames)

  // Generate 25 more hash games with variations
  const gameTemplates = [
    { title: 'Dice Roll', chances: '1.95' },
    { title: 'Coin Flip', chances: '1.98' },
    { title: 'Number Guess', chances: '1.92' },
    { title: 'Color Pick', chances: '1.96' },
    { title: 'Card Draw', chances: '1.94' },
    { title: 'Lucky 7', chances: '1.97' },
    { title: 'High Low', chances: '1.93' },
    { title: 'Sum Total', chances: '1.91' },
    { title: 'Pattern Match', chances: '1.99' },
    { title: 'Random Pick', chances: '1.89' },
    { title: 'Double Up', chances: '1.88' },
    { title: 'Triple Win', chances: '1.87' },
    { title: 'Mega Roll', chances: '1.86' },
    { title: 'Super Flip', chances: '1.85' },
    { title: 'Ultra Guess', chances: '1.84' },
    { title: 'Pro Pick', chances: '1.83' },
    { title: 'Elite Draw', chances: '1.82' },
    { title: 'Master 7', chances: '1.81' },
    { title: 'Champion Low', chances: '1.80' },
    { title: 'Legend Sum', chances: '1.79' },
    { title: 'Hero Match', chances: '1.78' },
    { title: 'King Pick', chances: '1.77' },
    { title: 'Queen Up', chances: '1.76' },
    { title: 'Ace Win', chances: '1.75' },
    { title: 'Joker Roll', chances: '1.74' },
  ]

  gameTemplates.forEach((template, index) => {
    extendedGames.push({
      title: template.title,
      chances: template.chances,
      background: '/images/games/6850b36f2bd45516f6329cf19663fc91b6440882.png',
      bettingAddress: 'TXS3PfAU9hemKkoBWRUfsUkGBSrZGagh6X',
      leftButtonLink: `/hashgames/${template.title
        .toLowerCase()
        .replace(/\s+/g, '')}/transfer-betting`,
      rightButtonLink: `/hashgames/${template.title
        .toLowerCase()
        .replace(/\s+/g, '')}/page-betting`,
    })
  })

  return extendedGames
}

// Generate game data with images
const generateGameImages = () => {
  const gameImages = []
  for (let i = 1; i <= 15; i++) {
    const gameNumber = i.toString().padStart(2, '0')
    gameImages.push({
      id: `game-${gameNumber}`,
      image: `/images/games/Game${gameNumber}.jpg`,
      title: `Game ${gameNumber}`,
      link: `/hashgames/game${gameNumber}`,
    })
  }
  return gameImages
}

const gameImages = generateGameImages()

// Game Image Card Component
const GameImageCard: React.FC<{
  id: string
  image: string
  title: string
  link: string
}> = ({ image, title, link }) => (
  <Link href={link} className="block">
    <div className="relative group cursor-pointer">
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={e => {
            // Fallback if image doesn't exist
            e.currentTarget.src = '/images/placeholder-game.jpg'
          }}
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold">
            {title}
          </div>
        </div>
      </div>
    </div>
  </Link>
)

// Latest bets table component
const LatestBetsTable: React.FC = () => {
  const { latestBets } = useMainContent()
  const { t } = useI18n()
  const [selectedStatus, setSelectedStatus] = useState('Up to date')
  return (
    <>
      <div className="text-4.5 font-bold flex items-center w-full justify-between text-white mb-4  gap-2">
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
        className={` grid lg:md:grid-cols-[15%_15%_20%_15%_25%_10%] grid-cols-[20%_20%_20%_40%] gap-[6px] lg:px-8 px-[6px] ${
          selectedStatus !== 'Daily'
            ? 'grid-cols-[20%_20%_20%_40%]'
            : 'grid-cols-[30%_30%_40%]'
        } `}
      >
        <div className="text-left text-sm font-bold py-2 text-white">
          {t('games.title')}
        </div>
        <div className="text-left text-sm font-bold py-2 text-white">
          {t('games.player')}
        </div>
        <div className="text-left text-sm hidden md:lg:block font-bold py-2 text-white">
          {t('games.betTime')}
        </div>
        <div className="text-left text-sm hidden md:lg:block font-bold py-2 truncate text-white">
          {t('games.betAmount')}
        </div>
        <div className="text-left text-sm font-bold py-2 text-white">
          {t('games.multiplier')}
        </div>
        {selectedStatus !== 'Daily' && (
          <div className="text-left text-sm font-bold py-2 text-white">
            {t('games.payout')}
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
          autoplayDelay={1500}
          className="h-full"
        />
        <div className="absolute bottom-0 left-0 w-full h-[254px] bg-gradient-to-b z-[30] from-transparent to-[#111923] pointer-events-none"></div>
      </div>
    </>
  )
}

const MainContent: React.FC = () => {
  const { activeGameCategory } = useSidebar()
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const tabFromQuery = searchParams.get('tab')

  // Fetch categories to map tab to category name
  const { categories: gameCategories } = useGameCategories()
  
  // Get category name from tab parameter
  const categoryName = getCategoryNameFromTab(tabFromQuery, gameCategories)
  
  // Fetch games for the selected category
  const { games: categoryGames, isLoading: isLoadingGames, total: totalGames } = useGamesByCategory(
    categoryName
  )

  // Get data from context
  const {
    newGames,
    hotGames,
    trendingGames,
    cryptoCards,
    aviationGames,
    sportsGames,
    animalGames,
    bountyGames: apiBountyGames,
    tableGames,
    latestBets,
    gameManufacturers,
  } = useMainContent()

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

  // Generate extended hash games
  const extendedHashGames = generateHashGames(tableGames)

  // Redux state and dispatch
  const dispatch = useAppDispatch()
  const carouselState = useAppSelector(state => state.carousel)

  // Helper function to get category display labels

  // Carousel slide change handlers
  const handleMainBannerSlideChange = (swiper: SwiperType) => {
    dispatch(setMainBannerSlide(swiper.realIndex ?? swiper.activeIndex))
  }

  const handleNewLaunchesSlideChange = (swiper: SwiperType) => {
    dispatch(setNewLaunchesSlide(swiper.realIndex ?? swiper.activeIndex))
  }

  const handleLatestEarningsSlideChange = (swiper: SwiperType) => {
    dispatch(setLatestEarningsSlide(swiper.realIndex ?? swiper.activeIndex))
  }

  const handleGameManufacturersSlideChange = (swiper: SwiperType) => {
    dispatch(setGameManufacturersSlide(swiper.realIndex ?? swiper.activeIndex))
  }

  // Transform API games to match the format expected by CasinoCard
  const transformGamesForDisplay = (games: any[]) => {
    return games.map((game) => ({
      badge: game.isHot ? 'Hot' : game.isNew ? 'New' : undefined,
      views: game.views?.toString() || undefined,
      user: game.user || undefined,
      image: game.image_url || game.extra_imageUrl || game.imageUrl || '/images/placeholder-game.jpg',
      title: game.game_name || game.extra_gameName || game.gameName || 'Game',
      gameCode: game.game_code || game.gameCode,
      provider: game.provider || game.extra_provider,
      link: game.link || `#`,
    }))
  }

  // Function to determine which sections to show based on query parameter
  const shouldShowSection = (sectionType: string) => {
    // If no tab parameter, show all sections (lobby page)
    if (!tabFromQuery) {
      return true
    }

    // For dynamic categories, show the category section and common sections
    if (categoryName) {
      // Show category games section
      if (sectionType === 'category-games') {
        return true
      }
      // Show common sections: latest-bets, game-manufacturers, latest-earnings
      if (['latest-bets', 'game-manufacturers', 'latest-earnings'].includes(sectionType)) {
        return true
      }
      // Don't show other sections for dynamic categories
      return false
    }

    // Map tab parameters to section types (for static categories)
    const tabToSectionMap: { [key: string]: string[] } = {
      hash: ['hash', 'latest-bets', 'game-manufacturers', 'latest-earnings'],
      slots: ['slots', 'latest-bets', 'game-manufacturers', 'latest-earnings'],
      casino: [
        'live-casino',
        'latest-bets',
        'game-manufacturers',
        'latest-earnings',
      ],
      sport: ['sport', 'latest-bets', 'game-manufacturers', 'latest-earnings'],
      futures: [
        'futures',
        'latest-bets',
        'game-manufacturers',
        'latest-earnings',
      ],
      crypto: [
        'crypto',
        'latest-bets',
        'game-manufacturers',
        'latest-earnings',
      ],
      table: ['table', 'latest-bets', 'game-manufacturers', 'latest-earnings'],
    }

    const allowedSections = tabToSectionMap[tabFromQuery] || []
    return allowedSections.includes(sectionType)
  }

  // Game Grid Component
  const GameGrid: React.FC<{
    data: unknown[]
    renderCard: (item: unknown, index: number) => React.ReactNode
    viewAllLink: string
    maxCards?: number
  }> = ({ data, renderCard, viewAllLink, maxCards }) => {
    // Mobile: 3 per row, 6 rows = 18 cards max
    // Desktop: 6 per row, 4 rows = 24 cards max
    const mobileMaxCards = 18 // 6 rows × 3 cards
    const desktopMaxCards = 24 // 4 rows × 6 cards

    // Use responsive max cards - show 18 on mobile, 24 on desktop
    const maxDisplayCards = maxCards || desktopMaxCards
    const displayData = data.slice(0, maxDisplayCards)

    return (
      <div className="space-y-4">
        {/* Mobile: 3 cards per row, max 18 cards (6 rows) */}
        <div className="grid grid-cols-3 md:hidden gap-3">
          {displayData
            .slice(0, mobileMaxCards)
            .map((item, index) => renderCard(item, index))}
        </div>

        {/* Desktop: 6 cards per row, max 24 cards (4 rows) */}
        <div className="hidden md:grid grid-cols-6 gap-3 xl:grid-cols-8">
          {displayData.map((item, index) => renderCard(item, index))}
        </div>

        {/* Show View All button if there are more cards than the mobile limit */}
        {data.length > mobileMaxCards && (
          <div className="flex justify-center">
            <Link
              href={viewAllLink}
              className="h-9 bg-ebony-clay w-[157px] gap-2 text-casper font-montserrat text-[14px] flex items-center justify-center font-bold rounded-[8px] hover:bg-ebony-clay/80 transition-colors"
            >
              {t('app.viewall')}
            </Link>
          </div>
        )}
      </div>
    )
  }

  // Section header component
  const SectionHeader: React.FC<{
    icon: string
    title: string
    alt: string
    count?: number
  }> = ({ icon, title, alt, count }) => {
    return (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-4.5 font-bold flex items-center text-white gap-2">
          <img className="grayscale" src={icon} alt={alt} />
          {title}
        </h2>
        {count && (
          <span className="font-bold flex items-center text-[14px] text-[#2283F6]">
            <span>
              {t('app.all')} {count}
            </span>
          </span>
        )}
      </div>
    )
  }
  const bannerCards = [
    {
      button: t('banner.firstDepost.button'),
      image: '/images/banner/banner-first-depost.jpg',
      mainTitle: t('banner.firstDepost.mainTitle'),
      subTitle: t('banner.firstDepost.subTitle'),
      description: '',
      link: '#',
    },
    {
      button: t('banner.cryptoGame.button'),
      image: '/images/banner/banner-crypto-game.jpg',
      mainTitle: t('banner.cryptoGame.mainTitle'),
      subTitle: t('banner.cryptoGame.subTitle'),
      description: '',
      link: '#',
    },
    {
      button: t('banner.dailyDepost.button'),
      image: '/images/banner/banner-daily-depost.jpg',
      mainTitle: t('banner.dailyDepost.mainTitle'),
      subTitle: t('banner.dailyDepost.subTitle'),
      description: '',
      link: '#',
    },
    {
      button: t('banner.dailyQuests.button'),
      image: '/images/banner/banner-daily-quests.jpg',
      mainTitle: t('banner.dailyQuests.mainTitle'),
      subTitle: t('banner.dailyQuests.subTitle'),
      description: '',
      link: '#',
    },
    {
      button: t('banner.footerball.button'),
      image: '/images/banner/banner-footerball.jpg',
      mainTitle: t('banner.footerball.mainTitle'),
      subTitle: t('banner.footerball.subTitle'),
      description: '',
      link: '#',
    },
    {
      button: t('banner.hash.button'),
      image: '/images/banner/banner-hash.jpg',
      mainTitle: t('banner.hash.mainTitle'),
      subTitle: t('banner.hash.subTitle'),
      description: '',
      link: '#',
    },
    {
      button: t('banner.live.button'),
      image: '/images/banner/banner-live.jpg',
      mainTitle: t('banner.live.mainTitle'),
      subTitle: t('banner.live.subTitle'),
      description: '',
      link: '#',
    },
    {
      button: t('banner.rebate.button'),
      image: '/images/banner/banner-rebate.jpg',
      mainTitle: t('banner.rebate.mainTitle'),
      subTitle: t('banner.rebate.subTitle'),
      description: '',
      link: '#',
    },
    {
      button: t('banner.solts.button'),
      image: '/images/banner/banner-solts.jpg',
      mainTitle: t('banner.solts.mainTitle'),
      subTitle: t('banner.solts.subTitle'),
      description: '',
      link: '#',
    },
  ] as const

  // Render lobby view
  return (
    <div
      className="w-full mx-auto overflow-x-hidden p-2 pt-6 lg:p-6"
      style={{ margin: 'auto' }}
    >
      <SuccessForm isOpen={false} />

      {/* Main Banner Section */}
      <div className="lg:mb-16 mb-8 lg:mt-0 mt-[2rem]">
        <SwiperSlider
          key={`banner-swiper-${activeGameCategory}`}
          data={bannerCards}
          renderSlide={(card, index) => <RewardCard {...card} />}
          slidesPerView="auto"
          slideClassName="!w-[min(486.76px,100%)]"
          showProgressBars={true}
          customPagination={true}
          initialSlide={carouselState.mainBannerCurrentSlide}
          onSlideChange={handleMainBannerSlideChange}
          carouselId="main-banner"
        />
      </div>

      {/* Lobbypage Sections with SwiperSlider - only show on lobbypage */}
      {!searchParams.get('tab') && <HomepageSections />}

      {/* Game Grid Sections for other pages */}
      {tabFromQuery && (
        <>
          {/* Dynamic Category Games Section */}
          {categoryName && shouldShowSection('category-games') && (
            <div className="lg:mb-16 mb-8">
              <SectionHeader
                icon="/icons/game.svg"
                title={categoryName}
                alt="category"
                count={totalGames}
              />
              {isLoadingGames ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-white">Loading games...</div>
                </div>
              ) : categoryGames.length > 0 ? (
                <GameGrid
                  data={transformGamesForDisplay(categoryGames)}
                  renderCard={(card, index) => (
                    <CasinoCard key={index} {...(card as any)} />
                  )}
                  viewAllLink={`/casino/view-all?category=${encodeURIComponent(categoryName)}&categoryType=${encodeURIComponent(categoryName)}`}
                />
              ) : (
                <div className="flex justify-center items-center py-12">
                  <div className="text-white">No games found for this category.</div>
                </div>
              )}
            </div>
          )}

          {/* New Launches Section */}
          {shouldShowSection('new-launches') && (
            <div className="lg:mb-16 mb-8">
              <SectionHeader
                icon="/icons/Home.svg"
                title={t('games.new')}
                alt="lobby"
                count={newGames.length}
              />
              <SwiperSlider
                key="new-launches-swiper"
                autoplay={false}
                data={newGames}
                renderSlide={(card, index) => <CasinoCard {...card} />}
                slidesPerView={7}
                spaceBetween={12}
                breakpoints={{
                  320: { slidesPerView: 3.3 },
                  375: { slidesPerView: 3.5 },
                  425: { slidesPerView: 4.1 },
                  768: { slidesPerView: 4.3 },
                  1024: {
                    slidesPerView: 5,
                    spaceBetween: 20,
                  },
                  1440: { slidesPerView: 7.3 },
                }}
                showProgressBars={true}
                initialSlide={carouselState.newLaunchesCurrentSlide}
                onSlideChange={handleNewLaunchesSlideChange}
                carouselId="new-launches"
              />
            </div>
          )}
          {/* Homepage Sections */}
          {/* Live Casino Section */}
          {shouldShowSection('live-casino') && (
            <div className="lg:mb-16 mb-8">
              <SectionHeader
                icon="/icons/Casino1.svg"
                title={t('games.live')}
                alt="lobby"
                count={hotGames.length}
              />
              <GameGrid
                data={hotGames}
                renderCard={(card, index) => (
                  <CasinoCard key={index} {...(card as any)} />
                )}
                viewAllLink="/casino/view-all?category=Live Casino&categoryType=Live Casino"
              />
            </div>
          )}

          {/* Hash Section */}
          {shouldShowSection('hash') && (
            <div className="lg:mb-16 mb-8">
              <SectionHeader
                icon="/icons/Hash.svg"
                title={t('games.hashgames')}
                alt="hash"
                count={gameImages.length}
              />
              <GameGrid
                data={gameImages}
                renderCard={(card: any) => (
                  <GameImageCard key={card.id} {...card} />
                )}
                viewAllLink="/hash-games"
              />
            </div>
          )}

          {/* Slots Section */}
          {shouldShowSection('slots') && (
            <div className="lg:mb-16 mb-8">
              <SectionHeader
                icon="/icons/Slots.svg"
                title={t('games.slots')}
                alt="slots"
                count={trendingGames.length}
              />
              <GameGrid
                data={trendingGames}
                renderCard={(card, index) => (
                  <CasinoCard key={index} {...(card as any)} />
                )}
                viewAllLink="/slots"
              />
            </div>
          )}

          {/* P/F Futures Section */}
          {shouldShowSection('futures') && (
            <div className="lg:mb-16 mb-8">
              <SectionHeader
                icon="/icons/Futures1.svg"
                title={t('games.pfFutures')}
                alt="future"
                count={aviationGames.length}
              />

              <GameGrid
                data={cryptoCards}
                renderCard={(card, index) => (
                  <FutureCard key={index} {...(card as any)} />
                )}
                viewAllLink="/futures"
              />
            </div>
          )}

          {/* Cryptogra Section */}
          {shouldShowSection('crypto') && (
            <div className="lg:mb-16 mb-8">
              <SectionHeader
                icon="/icons/Cryptogra1.svg"
                title={t('games.crypto')}
                alt="cryptogra"
                count={cryptoCards.length}
              />
              <GameGrid
                data={aviationGames}
                renderCard={(card, index) => (
                  <CasinoCard key={index} {...(card as any)} />
                )}
                viewAllLink="/crypto-games"
              />
            </div>
          )}

          {/* Sport Section */}
          {shouldShowSection('sport') && (
            <div className="lg:mb-16 mb-8">
              <SectionHeader
                icon="/icons/Sport.svg"
                title={t('games.sports')}
                alt="Sport"
                count={sportsGames.length}
              />
              <GameGrid
                data={sportsGames}
                renderCard={(card, index) => (
                  <CasinoCard key={index} {...(card as any)} />
                )}
                viewAllLink="/sports"
              />
            </div>
          )}

          {/* Chess and cards Section */}
          {shouldShowSection('table') && (
            <div className="lg:mb-16 mb-8">
              <SectionHeader
                icon="/icons/tablegame.svg"
                title={t('games.table')}
                alt="tablegame"
                count={animalGames.length}
              />
              <GameGrid
                data={animalGames}
                renderCard={(card, index) => (
                  <CasinoCard key={index} {...(card as any)} />
                )}
                viewAllLink="/table-games"
              />
            </div>
          )}
        </>
      )}

      {/* Latest Bets Section */}
      {shouldShowSection('latest-bets') && <LatestBetsTable />}

      {/* Game Manufacturers Section */}
      {shouldShowSection('game-manufacturers') && (
        <div className="lg:mb-16 mb-8">
          <SectionHeader
            icon="/icons/game.svg"
            title={t('app.gameProvider')}
            alt="gameProvider"
          />
          <SwiperSlider
            key={`game-manufacturers-swiper-${activeGameCategory}`}
            data={gameManufacturers}
            autoplay={false}
            renderSlide={(card, index) => <GameCard key={index} {...card} />}
            spaceBetween={12}
            slidesPerView={6}
            breakpoints={{
              320: { slidesPerView: 1.3 },
              375: { slidesPerView: 1.5 },
              425: { slidesPerView: 2.3 },
              768: { slidesPerView: 3.3 },
              1024: { slidesPerView: 3.3 },
              1440: { slidesPerView: 4.5 },
            }}
            initialSlide={carouselState.gameManufacturersCurrentSlide}
            onSlideChange={handleGameManufacturersSlideChange}
            carouselId="game-manufacturers"
          />
        </div>
      )}

      {/* Latest earnings Section */}
      {shouldShowSection('latest-earnings') && (
        <div className="lg:mb-16 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-4.5 font-bold flex items-center text-white ">
              {t('app.latestEarining')}
            </h2>
            <span className="font-bold flex items-center text-[14px] text-[#2283F6]">
              <span>{t('app.onlinePlayer')} 36</span>
            </span>
          </div>
          <SwiperSlider
            data={bountyGames}
            autoplay={false}
            renderSlide={(card, index) => <EarningCard {...card} />}
            slidesPerView={7}
            spaceBetween={12}
            breakpoints={GameBreakpoints}
            initialSlide={carouselState.latestEarningsCurrentSlide}
            onSlideChange={handleLatestEarningsSlideChange}
            carouselId="latest-earnings"
          />
        </div>
      )}
    </div>
  )
}

export default MainContent
