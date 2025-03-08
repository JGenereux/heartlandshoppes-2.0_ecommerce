interface Review {
    fullName: string,
    stars: number,
    description: string,
    photos: String[]
}

interface Item {
    name: String,
    price: Number,
    category: String[],
    options: Record<string, string[]>,
    quantity: Number,
    description: String,
    photos: String[],
    reviews: Review[]
}
export {Item}