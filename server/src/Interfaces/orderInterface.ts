interface Bill {
    fullName:  String,
    address:  String,
    country:  String,
    province:  String,
    city:  String,
    postalCode:  String,
    email:  String,
    phone:  String
}

interface Order {
    orderId: String,
    items: String,
    totalPrice: Number,
    billingInfo: Bill,
    status: Boolean,
    trackingNumber: String,
    date: String
}

export {Bill, Order}