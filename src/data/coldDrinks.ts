export interface ColdDrink {
  name: string
  shortName: string   // short word for the giant background text
  description: string
  price: string
  image: string | null
  bgColor: string
}

// ─────────────────────────────────────────────────────────────────────────────
//  COLD DRINKS — PRODUCT DATA
//  Edit ONLY this array to update products on the page.
//
//  • name        full product name (shown in slider headline and cards)
//  • shortName   short keyword for the giant background text
//  • description one-line tagline
//  • price       price string  e.g. "$5.49"
//  • image       null = shows placeholder; replace with "/your-image.png" or URL
//  • bgColor     background hex color for each product slide and card
// ─────────────────────────────────────────────────────────────────────────────
export const coldDrinks: ColdDrink[] = [
  {
    name: 'Iced Vanilla Latte',
    shortName: 'VANILLA',
    description: 'A chilled espresso drink with milk and vanilla.',
    price: '$5.49',
    image: null,
    bgColor: '#c8884a',
  },
  {
    name: 'Iced Caramel Latte',
    shortName: 'CARAMEL',
    description: 'Smooth espresso, cold milk, and rich caramel.',
    price: '$5.99',
    image: null,
    bgColor: '#b5641c',
  },
  {
    name: 'Iced Mocha',
    shortName: 'MOCHA',
    description: 'Espresso, chocolate, and chilled milk over ice.',
    price: '$5.79',
    image: null,
    bgColor: '#5c3012',
  },
  {
    name: 'Cold Brew',
    shortName: 'BREW',
    description: 'Slow-steeped for 18 hours, bold and smooth.',
    price: '$4.99',
    image: null,
    bgColor: '#3c200c',
  },
  {
    name: 'Iced Americano',
    shortName: 'AMERICAN',
    description: 'Espresso shots over cold water and ice.',
    price: '$4.49',
    image: null,
    bgColor: '#7c4a28',
  },
  {
    name: 'Matcha Latte',
    shortName: 'MATCHA',
    description: 'Stone-ground matcha whisked with chilled milk.',
    price: '$6.49',
    image: null,
    bgColor: '#4e7e2e',
  },
]
