import { useQuery } from "@tanstack/react-query"
import { Bill, ItemInvoice, Order } from "../interfaces/orderInterface"
import { useEffect, useState } from "react"
import axios from "axios"

export default function Orders() {

    return <div className="mb-2">
        <StatusNavbar />
        <SearchBar />
        <DisplayOrders />
    </div>
}

function StatusNavbar() {
    return <div className="flex flex-row w-full border-black border-b-2 items-center justify-center space-x-6">
        <p>New</p>
        <p>In Progress</p>
        <p>Fulfilled</p>
    </div>
}

function SearchBar() {
    return <div>
        <label className="flex flex-col pl-4">
            Search for order:
            <input type="text" className="border-black border-2 w-fit pl-1"></input>
        </label>
    </div>
}

function DisplayOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const { isPending, error, data: ordersData = [] } = useQuery<Order[], Error>({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await axios.get<Order[]>('http://localhost:5000/orders/')
            return res.data
        },
        staleTime: 60 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 15 * 1000
    })

    useEffect(() => {
        if (!ordersData || ordersData.length === 0) return
        setOrders(ordersData)
    }, [ordersData])


    if (isPending) return '...Loading'
    if (error) return 'Error'

    return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 my-2 pl-2">
        {orders?.map((order) => {
            return <DisplayOrder key={order._id} order={order} />
        })}
    </div>
}

interface DisplayOrderProps {
    order: Order
}
function DisplayOrder({ order }: DisplayOrderProps) {
    return <div className="flex flex-col border-black border-2 w-fit p-2">
        <label className="flex flex-col">
            Order ID:
            <p className="ml-1">{order._id}</p>
        </label>
        <label className="flex flex-row ">
            Status:
            <p className="ml-1">{order.status}</p>
        </label>
        <label className="flex flex-row ">
            Tracking Number:
            <p className="ml-1">{order.trackingNumber || 'Not Available'}</p>
        </label>
        <label className="flex flex-row ">
            Order placed on:
            <p className="ml-1">{new Date(order.date).toLocaleDateString()}</p>
        </label>
        <label className="flex flex-row ">
            Total Price:
            <p className="ml-1">${order.totalPrice / 100}</p>
        </label>
        <label className="flex flex-col">
            Billing Info:
            <div className="flex flex-col ml-2">
                {(Object.keys(order.billingInfo) as Array<keyof Bill>).map((billingInfoKey: keyof Bill) => {
                    return <label key={billingInfoKey}>
                        {billingInfoKey.replace(/([A-Z])/g, ' $1')
                            .replace(/_/g, ' ')
                            .trim()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                        <p className="ml-2">{order.billingInfo[billingInfoKey]}</p>
                    </label>
                })}
            </div>
        </label>
        <label className="flex flex-col">
            Items:
            <div className="flex flex-col ml-2">
                {order.items.map((item: ItemInvoice, index) => {
                    return <label key={`${item.description}-${index}`}>
                        {item.description.replace(/([A-Z])/g, ' $1')
                            .replace(/_/g, ' ')
                            .trim()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                        <p className="ml-2">{item.quantity}</p>
                        <p className="ml-2">${item.amount}</p>
                    </label>
                })}
            </div>
        </label>
    </div>
}