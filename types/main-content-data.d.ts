declare module '*/main-content-data.json' {
  interface CardItem {
    badge: string
    views?: string
    user?: string
    image: string
    link?: string
  }

  interface MainContentData {
    newGames: CardItem[]
    hotGames: CardItem[]
    trendingGames: CardItem[]
    aviationGames: CardItem[]
    sportsGames: CardItem[]
    animalGames: CardItem[]
    bountyGames: CardItem[]
    tableGames: CardItem[]
    hashGames: CardItem[]
    brand: string[]
    latestBets: Array<{
      game: string
      player: string
      time: string
      bet: string
      multiplier: string
      payout: string
    }>
  }

  const data: MainContentData
  export = data
}
