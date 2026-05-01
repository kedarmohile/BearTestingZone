export const questCatalog = [
  {
    id: 'brave_honey_basket_rescue',
    title: 'Brave Honey Basket Rescue',
    chapter: 1,
    giver: 'Memi Bear',
    recommendedCharacter: 'bruno',
    story:
      'Ranger Magnus scattered the Brave Honey before the family picnic. Bruno must collect it and bring it back to the picnic basket.',
    objectives: [
      {
        id: 'collect_honey',
        type: 'collect',
        target: 'brave_honey',
        required: 5,
        label: 'Collect 5 Brave Honey',
      },
      {
        id: 'reach_basket',
        type: 'reach',
        target: 'picnic_basket',
        required: 1,
        label: 'Return to the Picnic Basket',
      },
    ],
    rewards: {
      coins: 75,
      equipment: ['berry_bow'],
      unlocks: ['mumma_intro'],
      storyFlag: 'festival_table_restored',
    },
  },
];

export const offlineBotProfiles = [
  {
    id: 'memi_helper',
    characterId: 'memi',
    role: 'support',
    behavior: 'follows player, cheers quest progress, boosts honey pickups',
  },
  {
    id: 'papa_helper',
    characterId: 'papa',
    role: 'builder',
    behavior: 'patrols near the basket and protects the upgrade area',
  },
];
