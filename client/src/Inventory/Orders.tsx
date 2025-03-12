/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bill, ItemInvoice, Order } from "../interfaces/orderInterface"
import { useCallback, useEffect, useRef, useState } from "react"
import axios from "axios"

export default function Orders() {

    return <div className="mb-2">
        <StatusNavbar />
        <OrderMenu />
    </div>
}

function OrderMenu() {
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

    return <div>
        <SearchBar ordersData={ordersData} setOrders={setOrders} />
        <DisplayOrders orders={orders} />
    </div>
}

function StatusNavbar() {
    return <div className="flex flex-row w-full border-black border-b-2 items-center justify-center space-x-6">
        <p>New</p>
        <p>In Progress</p>
        <p>Fulfilled</p>
    </div>
}

interface SearchBarProps {
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
    ordersData: Order[]
}

function SearchBar({ ordersData, setOrders }: SearchBarProps) {
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("_id")

    const useDebounce = (fn: any, delay: number) => {
        const timerRef = useRef<NodeJS.Timeout | null>(null);

        return useCallback((...args: Parameters<any>) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                fn(...args);
            }, delay);
        }, [fn, delay]);
    };

    // Inside your component:
    const handleSearch = useCallback((searchTerm: string, property: keyof Order) => {
        setOrders(
            ordersData.filter((order) => {
                const value = order[property];
                if (typeof value === "string") {
                    return value.toLowerCase().includes(searchTerm.toLowerCase());
                }
                if (typeof value === "number") {
                    return value.toString().includes(searchTerm);
                }
                return false;
            })
        );
    }, [ordersData]);

    // Create the debounced version
    const debouncedSearch = useDebounce(handleSearch, 600);

    // Handler for input changes
    const handleSearchChange = (searchTerm: string, property: keyof Order) => {
        // Update the search input immediately
        setSearch(searchTerm);
        // Debounce the expensive filtering operation
        debouncedSearch(searchTerm, property);
    };


    return <div className="flex flex-row items-center my-2 pl-2 space-x-2">
        <input type="text" className="border-black border-2 w-fit pl-1" value={search} onChange={(e) => handleSearchChange(e.target.value, filter as keyof Order)}></input>
        <label className="border-black border-1 pl-1">
            Filter:
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value='_id'>ID</option>
                <option value='trackingNumber'>Tracking Number</option>
                <option value='date'>Date</option>
            </select>
        </label>
    </div>
}

interface DisplayOrdersProps {
    orders: Order[],
}

function DisplayOrders({ orders }: DisplayOrdersProps) {
    return <div className="grid grid-cols-1 md:grid-cols-2 my-2 pl-2">
        {orders?.map((order) => {
            return <DisplayOrder key={order._id} order={order} />
        })}
    </div>
}

interface DisplayOrderProps {
    order: Order
}

interface MutationProps {
    orderId: string,
    status?: string,
    trackingNumber?: string
}

function DisplayOrder({ order }: DisplayOrderProps) {
    const [editOrder, setEditOrder] = useState(false)
    const [status, setStatus] = useState(order.status || ' ')
    const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || ' ')

    const queryClient = useQueryClient()

    const statusMutation = useMutation(
        {
            mutationFn: async ({ orderId, status }: MutationProps) => {
                await axios.put(`http://localhost:5000/orders/${orderId}/status`, { status: status })
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['orders'] })
            }
        }
    )

    const trackingNumberMutation = useMutation(
        {
            mutationFn: async ({ orderId, trackingNumber }: MutationProps) => {
                await axios.put(`http://localhost:5000/orders/${orderId}/trackingNumber`, { trackingNumber: trackingNumber })
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['orders'] })
            }
        }
    )

    async function handleOrderUpdate() {
        if (!order._id) return

        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1)

        if (formattedStatus && formattedStatus !== order.status.charAt(0).toUpperCase() + status.slice(1)) {
            statusMutation.mutate({ orderId: order._id, status: status })
        }

        if (trackingNumber && trackingNumber !== order.trackingNumber) {
            trackingNumberMutation.mutate({ orderId: order._id, trackingNumber: trackingNumber })
        }
    }

    return <div className="flex flex-col border-black border-2 w-fit p-2 font-headerFont">
        <div className="flex flex-row border-black border-b-1 w-full space-x-4 pb-2">
            <div className="flex flex-col">
                <label className="flex flex-row">
                    Order ID:
                    <p className="ml-1 font-regular">{order._id}</p>
                </label>
                <label className="flex flex-row">
                    Tracking Number:
                    {editOrder ? <input className="w-fit ml-1 border-black border-1 font-regular" onChange={(e) => setTrackingNumber(e.target.value)}></input>
                        :
                        <p className="ml-1 font-regular">{order.trackingNumber || 'Not Available'}</p>}
                </label>
            </div>
            <label className="flex flex-row items-center self-start">
                <Status status={status} setStatus={setStatus} editOrder={editOrder} />
            </label>
        </div>
        <div className="flex flex-row space-x-12 my-2">
            <div className="flex flex-col">
                <label className="flex flex-row ">
                    Order placed on:
                    <p className="ml-1 font-regular">{new Date(order.date).toLocaleDateString()}</p>
                </label>
                <label className="flex flex-row ">
                    Total Price:
                    <p className="ml-1 font-regular">${order.totalPrice / 100}</p>
                </label>
                <label className="flex flex-col">
                    Billing Info:
                    <div className="flex flex-col ml-2">
                        {(Object.keys(order.billingInfo) as Array<keyof Bill>).map((billingInfoKey: keyof Bill) => {
                            return order.billingInfo[billingInfoKey] && <label key={billingInfoKey} className="flex flex-row">
                                {billingInfoKey.replace(/([A-Z])/g, ' $1')
                                    .replace(/_/g, ' ')
                                    .trim()
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}:
                                <p className="ml-2 font-regular">{order.billingInfo[billingInfoKey]}</p>
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

                                <p className="ml-2 font-regular">Quantity: {item.quantity}</p>

                                <p className="ml-2 font-regular">Price: ${item.amount}</p>
                            </label>
                        })}
                    </div>
                </label>
            </div>
            <button className="self-start bg-actionColor text-white p-1 rounded-lg font-bold font-button" onClick={() => setEditOrder((order) => !order)}>Edit</button>
            <button className="self-start bg-actionColor text-white p-1 rounded-lg font-bold font-button" onClick={handleOrderUpdate}>Confirm</button>
        </div>
    </div>
}

interface StatusProps {
    status: string;
    setStatus: React.Dispatch<React.SetStateAction<string>>;
    editOrder: boolean
}

function Status({ status, setStatus, editOrder }: StatusProps) {
    const statusColor = status.toLowerCase() === 'added' ? '#FF0000' :
        status.toLowerCase() === 'in_progress' ? '#FFFF00' :
            '#008000';

    return editOrder ? <div>
        <label>
            Select Status:
            <div className="flex flex-col space-y-1 font-bold font-button">
                <button className="bg-[#FF0000]" onClick={() => setStatus('added')}>Added</button>
                <button className="bg-[#FFFF00]" onClick={() => setStatus('in_progress')}>In Progress</button>
                <button className="bg-[#008000]" onClick={() => setStatus('fulfilled')}>Fulfilled</button>
            </div>
        </label>
    </div> : <div style={{ backgroundColor: `${statusColor}` }} className="rounded-lg text-white p-1 font-bold font-button">
        <p>{status.charAt(0).toUpperCase() + status.slice(1)}</p>
    </div>;
}
