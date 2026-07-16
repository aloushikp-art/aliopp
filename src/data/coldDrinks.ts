export interface ColdDrink {
  name: string
  description: string
  price: string
  image: string | null
  bgColor: string
}

// ─────────────────────────────────────────────────────────────────────────
//  COLD DRINKS PRODUCT DATA
//  Replace any value here to update the product on the page.
//  • name        → product name (shown in slider + card)
//  • description → short tagline under the name
//  • price       → price string, e.g. "$5.49"
//  • image       → set to a URL or import path once you have the transparent PNG
//  • bgColor     → warm caramel/orange background for the slider section
// ─────────────────────────────────────────────────────────────────────────
export const coldDrinks: ColdDrink[] = [
  {
    name: 'Iced Vanilla Latte',
    description: 'A chilled espresso drink with milk and vanilla.',
    price: '$5.49',
    image: null,
    bgColor: '#d4926a',
  },
  {
    name: 'Iced Caramel Latte',
    description: 'Smooth espresso, cold milk, and rich caramel.',
    price: '$5.99',
    image: null,
    bgColor: '#c47a4f',
  },
  {
    name: 'Iced Mocha',
    description: 'Espresso, chocolate, and chilled milk over ice.',
    price: '$5.79',
    image: null,
    bgColor: '#a8623a',
  },
  {
    name: 'Cold Brew',
    description: 'Slow-steeped for 18 hours, bold and smooth.',
    price: '$4.99',
    image: null,
    bgColor: '#d4926a',
  },
  {
    name: 'Iced Americano',
    description: 'Espresso shots over cold water and ice.',
    price: '$4.49',
    image: null,
    bgColor: '#c47a4f',
  },
  {
    name: 'Matcha Latte',
    description: 'Stone-ground matcha whisked with chilled milk.',
    price: '$6.49',
    image: null,
    bgColor: '#b5c49a',
  },
]
