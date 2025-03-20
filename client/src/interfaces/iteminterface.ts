interface Review {
    fullName: string,
    stars: number,
    description: string,
    photos: string[]
}

interface Item {
    name: string,
    price: number,
    category: string[],
    options: Record<string, string[]>,
    quantity: number,
    description: string,
    photos: string[],
    reviews: Review[]
}
export type {Item, Review}