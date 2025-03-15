/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bill, ItemInvoice, Order } from "../interfaces/orderInterface"
import { useCallback, useEffect, useRef, useState } from "react"
import axios from "axios"
import Loading from "../Loading/Loading"

export default function Orders() {
    const [statusFilter, setStatusFilter] = useState('All')
    const [orders, setOrders] = useState<Order[]>([])

    const { isPending, error, data: ordersData = [] } = useQuery<Order[], Error>({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await axios.get<Order[]>('http://localhost:5000/orders/')
            return res.data
        },
        staleTime: 60 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 60 * 1000
    })

    useEffect(() => {
        if (!ordersData || ordersData.length === 0) return
        setOrders(ordersData)
    }, [ordersData])

    useEffect(() => {
        if (!statusFilter || !ordersData) return

        if (statusFilter === "All") {
            setOrders(ordersData)
            return
        }

        const currOrders = ordersData.filter((order) => order.status.toLowerCase().trim() === statusFilter.toLowerCase().trim())
        setOrders(currOrders)
    }, [statusFilter, ordersData])

    if (error) return 'Error'

    return <div className="mb-2">
        <StatusNavbar setStatus={setStatusFilter} />
        {(isPending) ? <div className="flex flex-col w-full items-center justify-center p-12 space-y-1.5">
            <p className="font-regular font-bold text-xl">Loading Orders</p>
            <Loading />
        </div> : <OrderMenu orders={orders} ordersData={ordersData} setOrders={setOrders} />}
    </div>
}

interface OrderMenuProps {
    orders: Order[],
    ordersData: Order[],
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>
}
function OrderMenu({ orders, ordersData, setOrders }: OrderMenuProps) {

    return <div>
        <SearchBar ordersData={ordersData} setOrders={setOrders} />
        <div className="flex items-center justify-center">
            <DisplayOrders orders={orders} />
        </div>
    </div>
}

interface StatusNavbarProps {
    setStatus: React.Dispatch<React.SetStateAction<string>>
}
function StatusNavbar({ setStatus }: StatusNavbarProps) {
    return <div className="flex flex-row w-full border-black border-b-2 items-center justify-center py-2 space-x-6 font-button">
        <button onClick={() => setStatus('All')} className="hover:text-blue-500 transition-colors duration-300 cursor-pointer">All</button>
        <button onClick={() => setStatus('Added')} className="hover:text-blue-500 transition-colors duration-300 cursor-pointer">Added</button>
        <button onClick={() => setStatus('In_Progress')} className="hover:text-blue-500 transition-colors duration-300 cursor-pointer">In Progress</button>
        <button onClick={() => setStatus('Fulfilled')} className="hover:text-blue-500 transition-colors duration-300 cursor-pointer">Fulfilled</button>
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
        <div className="flex flex-row w-fit items-center relative">
            <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value, filter as keyof Order)}
                className="px-2.5 py-1.5 w-fit rounded-full bg-white border shadow-black  border-gray-200  hover:border-pink-300 focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-all duration-200 shadow-sm text-gray-800 placeholder-gray-400"
            />
            <button className="absolute right-3 text-gray-400 hover:text-pink-500 ">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
        </div>
        <label className="border-gray-600 border-2 px-2 py-1 rounded-full w-fit">
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
    return <div className="grid grid-cols-1 md:grid-cols-3 my-4 pl-2 overflow-y-auto">
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

        window.location.reload()
    }

    return <div className="flex flex-col border-gray-800 border-1 rounded-xl w-fit p-2 font-headerFont">
        <div className="flex flex-row border-black border-b-1 w-full space-x-4 pb-2">
            <div className="flex flex-col">
                <label className="flex flex-row">
                    Order ID:
                    <p className="ml-1 font-regular">{order._id}</p>
                </label>
                <label className="flex flex-row">
                    Tracking Number:
                    {editOrder ? <input className="w-fit ml-1 border-gray-700 border-2 rounded-lg font-regular hover:ring-blue-500 hover:ring-1 hover:border-blue-500" defaultValue={order.trackingNumber || ''} onChange={(e) => setTrackingNumber(e.target.value)}></input>
                        :
                        <p className="ml-1 font-regular">{order.trackingNumber || 'Not Available'}</p>}
                </label>
            </div>
            <label className="flex flex-row items-center self-start ml-auto">
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

                                <p className="ml-2 font-regular">Price: ${item.amount / 100}</p>
                            </label>
                        })}
                    </div>
                </label>
            </div>
            <div className="flex flex-col self-start space-y-2 w-full">
                <button className="self-end border-black border-1 shadow-gray-500 shadow-sm w-fit  px-3 py-1 rounded-full font-bold font-button cursor-pointer" onClick={() => setEditOrder((order) => !order)}>Edit</button>
                {editOrder && <button className="self-end border-black border-1 shadow-gray-500 shadow-sm  w-fit px-3 py-1 rounded-full font-bold font-button cursor-pointer" onClick={handleOrderUpdate}>Confirm</button>}
            </div>
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
        status.toLowerCase() === 'in_progress' ? '#FFA500' :
            '#008000';

    return editOrder ? <div>
        <label>
            Select Status:
            <div className="flex flex-col space-y-1 font-bold font-button text-white">
                <button className="bg-[#FF0000] cursor-pointer rounded-full px-2 py-1 transition ease-in-out duration-300 hover:translate-y-1 hover:scale-110" onClick={() => setStatus('added')}>Added</button>
                <button className="bg-[#FFA500] cursor-pointer rounded-full px-2 py-1 transition ease-in-out duration-300 hover:translate-y-1 hover:scale-110" onClick={() => setStatus('in_progress')}>In Progress</button>
                <button className="bg-[#008000] cursor-pointer rounded-full px-2 py-1 transition ease-in-out duration-300 hover:translate-y-1 hover:scale-110" onClick={() => setStatus('fulfilled')}>Fulfilled</button>
            </div>
        </label>
    </div> : <div style={{ backgroundColor: `${statusColor}` }} className="rounded-full px-2 py-1 text-white font-bold font-button border-black border-2 shadow-gray-500 shadow-sm">
        <p>{status.charAt(0).toUpperCase() + status.slice(1)}</p>
    </div>;
}
