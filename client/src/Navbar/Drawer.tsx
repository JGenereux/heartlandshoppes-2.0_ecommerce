import { useEffect, useState } from 'react'
import menuIcon from '../assets/menuicon.png'
import { Link } from 'react-router-dom'
import Cart from './Cart'
import { useAuth } from '../Contexts/authContext'

export default function Drawer() {
    const { user } = useAuth()
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)

    const [isOpen, setIsOpen] = useState(false)

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
                {(isOpen && !isDesktop) && <SearchBar />}
            </div>
            {isOpen && <div className="flex flex-col md:flex-row md:items-center space-x-4 pr-2 md:pr-0 pb-2 md:pb-0 ml-2 md:ml-3 md:w-full font-button">
                <Link to="/">Home</Link>
                <Link to="/shop">Shop</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                {isDesktop && <SearchBar />}
                <div className="flex flex-col md:flex-row md:ml-auto mr-6 space-x-6">
                    <Link to="/inventory">Inventory</Link>
                    {user ? <Link to="/account">Account</Link> : <Link to="/login">Login</Link>}
                    <Cart />
                </div>
            </div>}
        </div>
    </div>
}


function SearchBar() {
    return <div className="flex w-full justify-center">
        <div className="flex flex-row w-fit items-center relative">
            <input
                type="text"
                placeholder="Search"
                className="px-2.5 py-1.5 w-fit rounded-full bg-white border shadow-black  border-gray-200  hover:border-pink-300 focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-all duration-200 shadow-sm text-gray-800 placeholder-gray-400"
            />
            <button className="absolute right-3 text-gray-400 hover:text-pink-500 ">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
        </div>
    </div>
}