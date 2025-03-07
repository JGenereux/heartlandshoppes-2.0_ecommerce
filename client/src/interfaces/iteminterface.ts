interface Item {
    name: string,
    price: number,
    category: string[],
    options: Record<string, string[]>,
    quantity: number,
    description: string,
    photos: string[]
}
export type {Item}