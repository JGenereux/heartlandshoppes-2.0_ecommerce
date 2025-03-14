/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react'
import menuIcon from '../assets/menuicon.png'
import { Link } from 'react-router-dom'
import Cart from './Cart'
import { useAuth } from '../Contexts/authContext'
import { Item } from '../interfaces/iteminterface'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function Drawer() {
    const { user } = useAuth()
    const [viewAccount, setViewAccount] = useState(false)
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)

    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState(false)


    const handleResize = () => {
        setIsDesktop(window.innerWidth >= 768)
    }

    const handleDrawer = () => {
        setIsOpen((open) => !open)
    }

    useEffect(() => {
        // on desktop set navbar open on mount
        if (window.innerWidth >= 768) {
            setIsOpen(true)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return <div className={isOpen ? "flex flex-row w-fit md:w-full h-fit  bg-backgroundColor shadow-gray-500 shadow-sm items-center fixed md:static z-50" : "flex flex-row w-full h-fit items-center md:static z-50"}>
        <div className="flex flex-col md:flex-row w-full h-full my-1">
            <div className={isOpen ? "flex flex-row cursor-pointer w-fit items-center pr-2 md:pr-0" : "cursor-pointer w-8 h-full border-black border-2"}>
                {(!isDesktop) && <img src={menuIcon} onClick={handleDrawer} className="w-8 h-8"></img>}
                {(isOpen && !isDesktop) && <SearchBar search={search} setSearch={setSearch} />}
            </div>
            {isOpen && <div className="flex flex-col md:flex-row md:items-center space-x-4 pr-2 md:pr-0 pb-2 md:pb-0 ml-2 md:ml-3 md:w-full font-button">
                <Link to="/" className="hover:text-blue-500 transition-colors duration-300">Home</Link>
                <Link to="/shop" className="hover:text-blue-500 transition-colors duration-300">Shop</Link>
                <Link to="/about" className="hover:text-blue-500 transition-colors duration-300">About</Link>
                <Link to="/contact" className="hover:text-blue-500 transition-colors duration-300">Contact</Link>
                {isDesktop && <SearchBar search={search} setSearch={setSearch} />}
                <div className="flex flex-col md:flex-row md:ml-auto mr-6 space-x-6">
                    <Link to="/inventory" className="hover:text-blue-500 transition-colors duration-300">Inventory</Link>
                    {user ?
                        viewAccount ? <Account setViewAccount={setViewAccount} /> :
                            <button onClick={() => setViewAccount((view) => !view)} className="cursor-pointer hover:text-blue-500 transition-colors duration-300">Account</button>
                        :
                        <Link to="/login" className="hover:text-blue-500 transition-colors duration-300">Login</Link>}
                    <Cart />
                </div>
            </div>}
        </div>
    </div>
}

interface AccountProps {
    setViewAccount: React.Dispatch<React.SetStateAction<boolean>>
}

function Account({ setViewAccount }: AccountProps) {
    const { logout } = useAuth()

    const handleLogout = () => {
        logout()
    }

    return <div className="relative w-full">
        <div className="absolute top-0 left-0 md:left-auto md:right-0 z-10 bg-white shadow-gray-500 shadow-sm rounded-lg">
            <div className="flex flex-col p-2">
                <button onClick={() => setViewAccount((view) => !view)} className="self-end mr-2 cursor-pointer hover:text-blue-500 transition-colors duration-300">Account</button>
                <div className="flex flex-row space-x-6">
                    <Link to="/account" className="hover:text-blue-500 transition-colors duration-300">Settings</Link>
                    <button onClick={handleLogout} className="cursor-pointer hover:text-blue-500 transition-colors duration-300">Logout</button>
                </div>
            </div>
        </div>
    </div>
}

interface SearchBarProps {
    search: boolean,
    setSearch: React.Dispatch<React.SetStateAction<boolean>>
}

function SearchBar({ search, setSearch }: SearchBarProps) {
    const [query, setQuery] = useState('')
    const [items, setItems] = useState<Item[]>([])

    const { isFetching, isError, data: inventoryData = [] } = useQuery<Item[], Error>({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await axios.get<Item[]>('http://localhost:5000/inventory')
            return res.data
        },
        staleTime: 60 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 45 * 1000
    })

    useEffect(() => {
        setItems(inventoryData.slice(0, 2))
    }, [inventoryData])

    useEffect(() => {
        console.log('items: ', items)
    }, [items])

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

    const handleSearch = useCallback((searchTerm: string) => {
        setItems(
            searchTerm.length === 0
                ? inventoryData.slice(0, 5)
                : inventoryData.filter((item) =>
                    item.name.toLowerCase().trim().includes(searchTerm.toLowerCase().trim())
                )
        );
    }, [inventoryData])

    const debounceSearch = useDebounce(handleSearch, 600)

    const handleSearchChange = (searchTerm: string) => {
        // Update the search input immediately
        setQuery(searchTerm);
        debounceSearch(searchTerm)
    };

    if (isFetching) return '...'
    if (isError) return 'Error...'

    return <div className="flex w-full justify-center">
        <div className="flex flex-col items-center">
            <div className="flex flex-row items-center relative">
                <input
                    type="text"
                    placeholder="Search"
                    value={query}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setSearch(true)}
                    className="px-2.5 py-1.5 w-full rounded-full bg-white border shadow-black  border-gray-200  hover:border-pink-300 focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-all duration-200 shadow-sm text-gray-800 placeholder-gray-400"
                />
                <button className="absolute right-3 text-gray-400 hover:text-pink-500 ">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>

            {search && <div className="w-[120%] relative z-10">
                <div className="flex flex-col w-full shadow-gray-800 shadow-sm absolute h-fit right-0 rounded-tl-xl rounded-tr-xl">
                    {items.map((item) => {
                        return <DisplayItem key={item.name} item={item} />
                    })}
                </div>
            </div>}
        </div>
    </div>
}

interface DisplayItemProps {
    item: Item
}

function DisplayItem({ item }: DisplayItemProps) {

    const handleNav = () => {
        window.location.href = `/shop/item/${item.name}`
    }

    return <div className="flex flex-row h-18 bg-white p-1.5 cursor-pointer" onClick={handleNav}>
        <img src={item.photos[0]} className="w-[25%] h-full"></img>
        <div className="flex flex-col h-full">
            <p>{item.name}</p>
            <p>{item.price}</p>
        </div>
    </div>
}