
interface Bill {
    fullName:  string,
    address:  string,
    country:  string,
    province:  string,
    city:  string,
    postalCode:  string,
    email:  string,
    phone?:  string | null
}

interface Order {
    orderId: string,
    items: string[],
    totalPrice: number,
    billingInfo: Bill,
    status: Boolean,
    trackingNumber?: string | null,
    date: Date
}

export {Bill, Order}