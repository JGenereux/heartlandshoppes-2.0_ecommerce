interface Review {
    fullName: string,
    stars: number,
    description: string,
    photos: string[]
}

interface Photo {
    photo: string
    tag?: string
}

interface Item {
    name: string,
    price: number,
    category: string[],
    options: Record<string, string[]>,
    quantity: number,
    description: string,
    priceOptions: Record<string, number>
    photos: Photo[],
    isBundle: boolean,
    reviews: Review[]
}
export {Item, Photo}