import type { DrillScenario } from "./card-types"

// Drill 1: The "To Bì or Not to Bì" Dilemma (The Trumping Decision)
export const drill01TrumpingDecision: DrillScenario = {
  scenarioId: "drill01-bi-or-not-to-bi",
  title: "The Trumping Decision",
  description:
    "Mid-game as a Defender. Trump is Hearts (rank 7). 20 points on the table from C_K and C_10. Your partner played C_8 and cannot win. West (attacker) led C_K, your partner (North) followed with C_8, East played C_10. What do you play?",
  gameState: {
    trumpSuit: "HEARTS",
    trumpRank: "7",
    dealer: "NORTH",
    turnToPlay: "SOUTH",
  },
  players: [
    {
      position: "NORTH",
      role: "DEFENDER",
      cards: ["face-down-12"],
    },
    {
      position: "SOUTH",
      role: "DEFENDER",
      cards: ["S_3", "S_4", "D_Q", "H_5", "H_J", "BIG_JOKER"],
    },
    {
      position: "EAST",
      role: "ATTACKER",
      cards: ["face-down-11"],
    },
    {
      position: "WEST",
      role: "ATTACKER",
      cards: ["face-down-12"],
    },
  ],
  currentTrick: {
    leadSuit: "CLUBS",
    cardsPlayed: [
      { player: "WEST", card: "C_K" },
      { player: "NORTH", card: "C_8" },
      { player: "EAST", card: "C_10" },
    ],
  },
  solutions: [
    {
      move: "S_3",
      isCorrect: true,
      feedback:
        "Excellent decision! You wisely chose to sacrifice these 20 points rather than waste precious trump cards. Your Heart Jack and Big Joker are extremely valuable - they should be saved for tricks worth 40+ points or critical control moments. Discarding a worthless Spade preserves your team's trump strength for when it really matters.",
    },
    {
      move: "S_4",
      isCorrect: true,
      feedback:
        "Perfect play! Discarding a low Spade is the optimal strategic choice. You preserve your powerful trumps (Heart Jack and Big Joker) for more important battles later. Remember: 20 points isn't worth spending high-value trump resources. Those cards could win you 40-60 point tricks later!",
    },
    {
      move: "D_Q",
      isCorrect: true,
      feedback:
        "Smart choice! Throwing the Diamond Queen (0 points) while preserving all your trump cards is excellent defense. The 20 points on this trick aren't worth burning a trump, especially when you hold such powerful ones. Your trump strength remains intact for crucial moments.",
    },
    {
      move: "H_J",
      isCorrect: false,
      feedback:
        "Mistake! While you captured 20 points, you spent a Heart Jack - one of the strongest trump cards in the game. The Jack ranks just below the Jokers and trump-rank cards. Now the attackers know you've used this power card, weakening your position significantly. Rule of thumb: never use high trumps for less than 30-40 points.",
    },
    {
      move: "BIG_JOKER",
      isCorrect: false,
      feedback:
        "Critical error! The Big Joker is the most powerful card in the entire deck, and you used it to win just 20 points. This card should only be played in decisive moments - winning 50+ points, securing the last trick, or taking control at a critical juncture. This is a massive waste of your team's strongest asset.",
    },
    {
      move: "H_5",
      isCorrect: "partial",
      feedback:
        "Acceptable but not optimal. You won 20 points without spending a power trump, which is reasonable. However, in this scenario, it's often better to let the attackers have these points entirely. Even low trumps have value for maintaining trump length and flexibility. Consider: if you save this trump, you might win a more valuable trick later.",
    },
  ],
}

// Drill 2: The Art of the Bury - now with richer analysis
export const drill02ArtOfBury: DrillScenario = {
  scenarioId: "drill02-art-of-bury",
  title: "The Art of the Bury",
  description:
    "You are the declaring attacker and just picked up 8 cards from the bottom. Trump is Diamonds (rank 8). You have 26 cards total and must bury 8 back. Strategic goals: bury points safely, create voids for trumping, preserve long suits for later.",
  gameState: {
    trumpSuit: "DIAMONDS",
    trumpRank: "8",
    dealer: "SOUTH",
    turnToPlay: "SOUTH",
  },
  players: [
    {
      position: "NORTH",
      role: "DEFENDER",
      cards: ["face-down-25"],
    },
    {
      position: "SOUTH",
      role: "ATTACKER",
      cards: [
        "S_3",
        "S_5",
        "S_9",
        "S_J",
        "S_Q",
        "S_K",
        "H_4",
        "H_6",
        "H_10",
        "H_K",
        "C_3",
        "C_4",
        "C_6",
        "C_9",
        "C_J",
        "D_2",
        "D_3",
        "D_4",
        "D_5",
        "D_6",
        "D_9",
        "D_10",
        "D_J",
        "D_Q",
        "D_A",
        "SMALL_JOKER",
      ],
    },
    {
      position: "EAST",
      role: "DEFENDER",
      cards: ["face-down-25"],
    },
    {
      position: "WEST",
      role: "ATTACKER",
      cards: ["face-down-25"],
    },
  ],
  currentTrick: {
    leadSuit: "HEARTS",
    cardsPlayed: [],
  },
  solutions: [
    {
      move: "ideal-bury",
      isCorrect: true,
      feedback:
        "Excellent bury! You buried high-point cards totaling 40+ points (putting pressure on defenders), created voids in Hearts for trumping opportunities, and preserved your 6-card Spade suit for powerful plays after drawing trumps. This is strategic excellence!",
    },
    {
      move: "poor-bury",
      isCorrect: false,
      feedback:
        "This bury has issues. Key principles: (1) Bury vulnerable points - Kings and 10s you can't protect, (2) Create voids - bury all cards from your shortest side suit, (3) Keep long suits - your 6+ card suits become winners after trumps are exhausted.",
    },
  ],
}

// Drill 3: The Optimal Lead - expanded scenarios
export const drill03OptimalLead: DrillScenario = {
  scenarioId: "drill03-optimal-lead",
  title: "The Optimal Lead",
  description:
    "Opening the first trick as a Defender. Trump is Spades (rank 2). You have a powerful 7-card Heart suit. Your goal: force attackers to use their trumps on your strong suit, weakening their control. What do you lead?",
  gameState: {
    trumpSuit: "SPADES",
    trumpRank: "2",
    dealer: "EAST",
    turnToPlay: "SOUTH",
  },
  players: [
    {
      position: "NORTH",
      role: "DEFENDER",
      cards: ["face-down-25"],
    },
    {
      position: "SOUTH",
      role: "DEFENDER",
      cards: [
        "H_3",
        "H_4",
        "H_6",
        "H_9",
        "H_10",
        "H_J",
        "H_K",
        "D_5",
        "D_9",
        "C_4",
        "C_7",
        "C_Q",
        "S_3",
        "S_6",
        "S_10",
      ],
    },
    {
      position: "EAST",
      role: "ATTACKER",
      cards: ["face-down-25"],
    },
    {
      position: "WEST",
      role: "ATTACKER",
      cards: ["face-down-25"],
    },
  ],
  currentTrick: {
    leadSuit: "HEARTS",
    cardsPlayed: [],
  },
  solutions: [
    {
      move: "H_3",
      isCorrect: true,
      feedback:
        "Excellent opening lead! Leading low from your 7-card Heart suit is textbook defensive play. You're testing the waters while preserving your high cards. With 7 Hearts, you can likely exhaust everyone else's Hearts in 2-3 rounds, then your remaining Hearts become winners. This forces attackers to spend trumps to stop you.",
    },
    {
      move: "H_4",
      isCorrect: true,
      feedback:
        "Great choice! Leading from your long Heart suit immediately puts pressure on the attackers. They'll eventually run out of Hearts and must trump or concede tricks to you. Starting with a low card preserves your King and Jack for winning points later.",
    },
    {
      move: "H_K",
      isCorrect: true,
      feedback:
        "Strong aggressive lead! Leading the King from your 7-card suit tests whether attackers have the Ace. If they do, you've drawn it out early. If they don't, you win 10 points immediately. Either way, you're establishing your dominant suit. Bold but valid strategy.",
    },
    {
      move: "H_6",
      isCorrect: true,
      feedback:
        "Good lead from your long suit. Any Heart lead is correct here - you're establishing your 7-card suit, which will become a major weapon once trumps are partially exhausted. The attackers will be forced to trump your Hearts repeatedly.",
    },
    {
      move: "S_3",
      isCorrect: false,
      feedback:
        "Critical mistake! As a defender, leading trump is almost always wrong. You're doing the attackers' job for them - they WANT trumps drawn out so they can run their suits uncontested. By leading trump, you weaken your own team's trump holdings while helping attackers establish control. Lead your strong Hearts instead!",
    },
    {
      move: "S_6",
      isCorrect: false,
      feedback:
        "No! Never lead trump as a defender. The attackers' main strategy is to draw out defensive trumps - you're literally helping them win. Your 3 trumps are valuable defensive resources for stopping attacker tricks later. Lead your 7-card Heart suit to make THEM use their trumps.",
    },
    {
      move: "S_10",
      isCorrect: false,
      feedback:
        "Terrible play! Not only are you leading trump (helping attackers), but you're also giving them 10 free points. The S_10 should be saved to throw on a trick your partner is winning, not led where attackers can easily capture it. Lead Hearts!",
    },
    {
      move: "D_5",
      isCorrect: "partial",
      feedback:
        "Safe but suboptimal. Leading from a weak doubleton won't hurt you, but it doesn't help either. You have a monster 7-card Heart suit that should be your primary weapon. Long suits win games - establish your Hearts to force attackers to burn their trumps.",
    },
    {
      move: "D_9",
      isCorrect: "partial",
      feedback:
        "Passive choice. This won't lose the game, but you're missing an opportunity. Your 7-card Heart suit is your best asset - lead from it! Make the attackers suffer by forcing them to trump your strong suit repeatedly.",
    },
    {
      move: "C_4",
      isCorrect: "partial",
      feedback:
        "An okay but uninspired lead. With only 3 Clubs, this suit won't apply much pressure. Compare to your 7 Hearts - that's where your power lies. Lead Hearts to maximize your defensive potential.",
    },
    {
      move: "C_7",
      isCorrect: "partial",
      feedback:
        "Mediocre choice. Your Club suit is weak (only 3 cards) and won't accomplish much. Your 7-card Heart suit should be your go-to lead. Long suits are the key to strong defense - use them!",
    },
    {
      move: "C_Q",
      isCorrect: "partial",
      feedback:
        "Not recommended. Leading the Queen from a short suit risks losing it for little gain. If an opponent has the King or Ace, your Queen is wasted. Save high cards for tricks you're likely to win, and lead from your powerful 7-card Heart suit instead.",
    },
  ],
}

export const allDrills: Record<string, DrillScenario> = {
  "trumping-decision": drill01TrumpingDecision,
  "art-of-bury": drill02ArtOfBury,
  "optimal-lead": drill03OptimalLead,
}
