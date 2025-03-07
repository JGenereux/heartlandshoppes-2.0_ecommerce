interface Item {
    name: String,
    price: Number,
    category: String[],
    options: Record<string, string[]>,
    quantity: Number,
    description: String,
    photos: String[]
}
export {Item}