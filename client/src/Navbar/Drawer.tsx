import { useEffect, useState } from 'react'
import menuIcon from '../assets/menuicon.png'
import { Link } from 'react-router-dom'
import Cart from './Cart'

export default function Drawer() {
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

    return <div className={isOpen ? "flex flex-row w-fit md:w-full h-fit border-black  bg-white border-2 items-center fixed md:static z-50" : "flex flex-row w-full h-fit items-center md:static z-50"}>
        <div className={"flex flex-col md:flex-row w-full h-full"}>
            <div className={isOpen ? "flex flex-row cursor-pointer w-fit items-center pr-2 md:pr-0" : "cursor-pointer w-8 h-full border-black border-2"}>
                <img src={menuIcon} onClick={handleDrawer} className="w-8 h-8"></img>
                {(isOpen && !isDesktop) && <SearchBar />}
            </div>
            {isOpen && <div className="flex flex-col md:flex-row md:items-center space-x-4 pr-2 md:pr-0 pb-2 md:pb-0 ml-2 md:w-full font-button">
                <Link to="/">Home</Link>
                <Link to="/shop">Shop</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                {isDesktop && <SearchBar />}
                <div className="flex flex-col md:flex-row md:ml-auto mr-6 space-x-6">
                    <Link to="/inventory">Inventory</Link>
                    <Link to="/login">Login</Link>
                    <p>🛒</p>
                    <Cart />
                </div>
            </div>}
        </div>
    </div>
}


function SearchBar() {
    return <div className="flex w-full justify-center">
        <input type="text" placeholder="Search" className="border-b border-2 pl-2 rounded-md"></input>
    </div>
}