interface priceOptions {
    priceOptions: Record<string, number>
}
interface Review {
    fullName: string,
    stars: number,
    description: string,
    photos: String[]
}

interface Item {
    name: string,
    price: number,
    category: string[],
    options: Record<string, string[]>,
    quantity: number,
    description: string,
    priceOptions: Record<string, number>
    photos: string[],
    isBundle: boolean,
    reviews: Review[]
}
export {Item}