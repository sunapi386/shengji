import type { DrillScenario, CardString, Suit, Solution } from "./card-types"

const SUITS: Suit[] = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"]
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

function generateDeck(): CardString[] {
  const deck: CardString[] = []
  const suitShort: Record<Suit, string> = {
    HEARTS: "H",
    DIAMONDS: "D",
    CLUBS: "C",
    SPADES: "S",
  }

  // Two decks for Shengji
  for (let i = 0; i < 2; i++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push(`${suitShort[suit]}_${rank}`)
      }
    }
    deck.push("SMALL_JOKER")
    deck.push("BIG_JOKER")
  }

  return deck
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getCardPoints(card: CardString): number {
  if (card.includes("K") || card.includes("10")) return 10
  if (card.includes("5")) return 5
  return 0
}

function getSuit(card: CardString): Suit | null {
  if (card.includes("JOKER")) return null
  const prefix = card.split("_")[0]
  const suitMap: Record<string, Suit> = { H: "HEARTS", D: "DIAMONDS", C: "CLUBS", S: "SPADES" }
  return suitMap[prefix] || null
}

export function generateTrumpingDecisionScenario(): DrillScenario {
  const trumpSuit = SUITS[Math.floor(Math.random() * 4)]
  const trumpRank = RANKS[Math.floor(Math.random() * 13)]
  const nonTrumpSuits = SUITS.filter((s) => s !== trumpSuit)
  const leadSuit = nonTrumpSuits[Math.floor(Math.random() * 3)]

  const suitShort: Record<Suit, string> = { HEARTS: "H", DIAMONDS: "D", CLUBS: "C", SPADES: "S" }

  // Generate cards played on trick with 20-30 points
  const leadCard = `${suitShort[leadSuit]}_K` // King leads
  const followCard1 = `${suitShort[leadSuit]}_${RANKS[Math.floor(Math.random() * 6) + 1]}` // Low card
  const followCard2 = `${suitShort[leadSuit]}_10` // 10 for points

  // Generate player hand - mix of low cards and high trumps
  const otherSuits = nonTrumpSuits.filter((s) => s !== leadSuit)
  const hand: CardString[] = [
    `${suitShort[otherSuits[0]]}_3`,
    `${suitShort[otherSuits[0]]}_4`,
    `${suitShort[otherSuits[1]]}_Q`,
    `${suitShort[trumpSuit]}_5`,
    `${suitShort[trumpSuit]}_J`,
    "BIG_JOKER",
  ]

  const solutions: Solution[] = hand.map((card) => {
    const isTrump = getSuit(card) === trumpSuit || card.includes("JOKER")
    const isHighTrump =
      card.includes("JOKER") || card.includes("_J") || card.includes("_Q") || card.includes("_K") || card.includes("_A")
    const points = getCardPoints(card)

    if (!isTrump) {
      return {
        move: card,
        isCorrect: true,
        feedback: `Good choice! Discarding a non-trump card preserves your valuable trump cards for more important battles. The ${points > 0 ? `${points} points on this trick aren't` : "points on this trick aren't"} worth spending high-value resources.`,
      }
    } else if (isTrump && isHighTrump) {
      return {
        move: card,
        isCorrect: false,
        feedback: `Mistake! This is one of your most powerful trump cards. Spending it on 20 points is wasteful - save it for tricks worth 40+ points or critical control moments.`,
      }
    } else {
      return {
        move: card,
        isCorrect: "partial",
        feedback: `Acceptable but not optimal. You won the trick without spending a power trump, but consider whether it's worth using any trump for just 20 points.`,
      }
    }
  })

  return {
    scenarioId: `generated-trumping-${Date.now()}`,
    title: "The Trumping Decision",
    description: `Mid-game as a Defender. Trump is ${trumpSuit} (rank ${trumpRank}). 20 points on the table. Your partner cannot win this trick. What do you play?`,
    gameState: {
      trumpSuit,
      trumpRank,
      dealer: "NORTH",
      turnToPlay: "SOUTH",
    },
    players: [
      { position: "NORTH", role: "DEFENDER", cards: ["face-down-12"] },
      { position: "SOUTH", role: "DEFENDER", cards: hand },
      { position: "EAST", role: "ATTACKER", cards: ["face-down-11"] },
      { position: "WEST", role: "ATTACKER", cards: ["face-down-12"] },
    ],
    currentTrick: {
      leadSuit,
      cardsPlayed: [
        { player: "WEST", card: leadCard },
        { player: "NORTH", card: followCard1 },
        { player: "EAST", card: followCard2 },
      ],
    },
    solutions,
  }
}

export function generateOptimalLeadScenario(): DrillScenario {
  const trumpSuit = SUITS[Math.floor(Math.random() * 4)]
  const trumpRank = RANKS[Math.floor(Math.random() * 13)]
  const nonTrumpSuits = SUITS.filter((s) => s !== trumpSuit)

  const suitShort: Record<Suit, string> = { HEARTS: "H", DIAMONDS: "D", CLUBS: "C", SPADES: "S" }

  // Pick a long suit for the player (6-7 cards)
  const longSuit = nonTrumpSuits[Math.floor(Math.random() * 3)]
  const shortSuits = nonTrumpSuits.filter((s) => s !== longSuit)

  // Generate hand with long suit
  const longSuitRanks = shuffle(RANKS).slice(0, 7)
  const hand: CardString[] = [
    ...longSuitRanks.map((r) => `${suitShort[longSuit]}_${r}`),
    `${suitShort[shortSuits[0]]}_5`,
    `${suitShort[shortSuits[0]]}_9`,
    `${suitShort[shortSuits[1]]}_4`,
    `${suitShort[shortSuits[1]]}_7`,
    `${suitShort[shortSuits[1]]}_Q`,
    `${suitShort[trumpSuit]}_3`,
    `${suitShort[trumpSuit]}_6`,
    `${suitShort[trumpSuit]}_10`,
  ]

  const solutions: Solution[] = hand.map((card) => {
    const cardSuit = getSuit(card)
    const isTrump = cardSuit === trumpSuit
    const isLongSuit = cardSuit === longSuit

    if (isTrump) {
      return {
        move: card,
        isCorrect: false,
        feedback: `Critical mistake! As a defender, leading trump helps the attackers by drawing out defensive trump power. Lead from your long ${longSuit} suit instead!`,
      }
    } else if (isLongSuit) {
      return {
        move: card,
        isCorrect: true,
        feedback: `Excellent lead! Your 7-card ${longSuit} suit will force attackers to spend their trumps. After 2-3 rounds, your remaining ${longSuit}s become winners.`,
      }
    } else {
      return {
        move: card,
        isCorrect: "partial",
        feedback: `Safe but suboptimal. Leading from a short suit won't hurt, but your 7-card ${longSuit} suit is your primary weapon. Long suits win games!`,
      }
    }
  })

  return {
    scenarioId: `generated-lead-${Date.now()}`,
    title: "The Optimal Lead",
    description: `Opening as a Defender. Trump is ${trumpSuit} (rank ${trumpRank}). You have a powerful 7-card ${longSuit} suit. What do you lead?`,
    gameState: {
      trumpSuit,
      trumpRank,
      dealer: "EAST",
      turnToPlay: "SOUTH",
    },
    players: [
      { position: "NORTH", role: "DEFENDER", cards: ["face-down-25"] },
      { position: "SOUTH", role: "DEFENDER", cards: hand },
      { position: "EAST", role: "ATTACKER", cards: ["face-down-25"] },
      { position: "WEST", role: "ATTACKER", cards: ["face-down-25"] },
    ],
    currentTrick: {
      leadSuit: longSuit,
      cardsPlayed: [],
    },
    solutions,
  }
}

export function generateRandomScenario(drillType: string): DrillScenario {
  switch (drillType) {
    case "trumping-decision":
      return generateTrumpingDecisionScenario()
    case "optimal-lead":
      return generateOptimalLeadScenario()
    default:
      return generateTrumpingDecisionScenario()
  }
}

export function exportScenario(scenario: DrillScenario): string {
  return JSON.stringify(scenario, null, 2)
}

export function importScenario(json: string): DrillScenario | null {
  try {
    const parsed = JSON.parse(json)
    // Basic validation
    if (parsed.scenarioId && parsed.title && parsed.gameState && parsed.players && parsed.solutions) {
      return parsed as DrillScenario
    }
    return null
  } catch {
    return null
  }
}
