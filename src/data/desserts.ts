// ─────────────────────────────────────────────────────────────────────────────
//  DESSERTS — PRODUCT DATA
//  Edit ONLY this array to update products on the page.
//
//  • name         full product name (shown in hero headline and cards)
//  • shortName    short keyword for the giant background text
//  • description  one-line tagline
//  • price        price string  e.g. "$3"
//  • image        null = shows placeholder; replace with "/your-image.png" or URL
//  • themeColor   hex background for this product's slide; used when image is null
//                 TIP: once you add a real PNG, extract its dominant color and put it here
//  • decorations  animated background elements — mix and match:
//                 'choco-drip' | 'choco-piece' | 'berry' | 'cream-swirl' | 'honey-drop' | 'crumb'
// ─────────────────────────────────────────────────────────────────────────────

export type DecorationType =
  | 'choco-drip'
  | 'choco-piece'
  | 'berry'
  | 'cream-swirl'
  | 'honey-drop'
  | 'crumb'

export interface Dessert {
  name: string
  shortName: string
  description: string
  price: string
  image: string | null
  themeColor: string
  decorations: DecorationType[]
}

export const desserts: Dessert[] = [
  {
    name: 'Choco Cake',
    shortName: 'CHOCO',
    description: 'Taste the best chocolate in Lebanon.',
    price: '$3',
    image: 'https://i.imgur.com/57LvFzR.png',
    themeColor: '#2E0F05',
    decorations: ['choco-drip', 'choco-piece', 'berry'],
  },
]
