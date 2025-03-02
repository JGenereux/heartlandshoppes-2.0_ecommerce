import { useEffect, useState } from "react";
import Drawer from "../Navbar/Drawer";
import email from '../assets/email.png'
import fblogo from '../assets/facebooklogo.png'
import iglogo from '../assets/iglogo.png'
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="h-screen">
            <Drawer />
            <Header />
            <Featured />
            <CustomProduct />
            <Footer />
        </div>
    )
}

function Header() {
    return (
        <div className="flex justify-center w-[100%] h-[30%] sm:h-[20%] md:h-[30%]">
            <div className="w-full h-full  relative border-b-2 border-black">
                <div className="w-[100%] h-full">
                </div>
                <div className="flex flex-col w-full justify-between h-full absolute top-0 py-2 pl-2">
                    <div>
                        <p className="text-2xl md:text-[2.8rem] font-headerFont ">Heartland Shoppes</p>
                    </div>
                    <p className="font-regular text-lg">Discover the heart of shopping at heartland shoppes where quality meets community</p>
                    <Link to="/shop" className="font-button mb-2 font-semibold bg-[#f8b4c4] w-fit mx-auto p-0.5 md:p-1.5 rounded-sm md:text-lg shadow-gray-500 shadow-sm text-white">Shop now</Link>
                </div>
            </div>
        </div>
    )
}

function Featured() {
    const arr = [1, 2, 3]
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
    const amountOfItems = isDesktop ? 3 : 2
    const modarr = arr.slice(0, amountOfItems)

    const handleResize = () => {
        setIsDesktop(window.innerWidth >= 768)
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })

    return (
        <div className="flex flex-col w-full h-fit items-center justify-center pb-2 space-y-1.5 my-2">
            <h3 className="text-lg md:text-xl">Featured Products</h3>
            <div className="w-full flex flex-row space-x-2 items-center justify-center">
                <button className="bg-[#f8b4c4] font-semibold rounded-lg p-0.5 pl-1 pr-1 text-white shadow-gray-400 shadow-md">{'<-'}</button>
                <div className="w-[70%] grid grid-cols-2 md:grid-cols-3 gap-2 ">
                    {modarr?.map((item, index) =>
                        <Item key={index} />
                    )}
                </div>
                <button className="bg-[#f8b4c4] font-semibold rounded-lg p-0.5 pl-1 pr-1 text-white shadow-gray-400 shadow-md">{'->'}</button>
            </div>
        </div>
    )
}

function Item() {
    return (
        <div className="flex flex-col w-full pl-2 pt-2 shadow-gray-400 shadow-md font-regular">
            <div className="w-[90%] h-[160px] md:h-[200px] border-black border-2">
            </div>
            <p>Item Name</p>
            <p>$Item Price</p>
        </div>
    )
}

function CustomProduct() {
    return (
        <div className="flex flex-col w-full pb-2 pl-2 py-2 md:py-4">
            <h3 className="text-2xl lg:text-3xl font-headerFont">Express yourself with a unique homemade gift</h3>
            <div className="flex flex-col space-y-2 text-lg w-[95%] self-center font-regular my-1">
                <p>How would you like to express yourself? Guaranteed, family and friends will admire and appreciate your custom handmade item, as intended. Many of these custom handmade gifts are very personal and do not appear in our catalogue. Don't let what you see in our catalogue limit your creativity and inspiration. If you can dream it, Heartland Shoppes can help bring it to life.</p>
                <p>We create t-shirt concepts for charity teams, clubs and small businesses. No order is to small for Heartland Shoppes. Our designs have shown up at Spin Classes, Charity T-Rex runs, our regional Neo-natal Unit, rare diseases month and similar worthwhile causes. Teams sporting our designs get noticed. Whether its a t-shirt and/or a water bottle, the competitors proudly display their custom handmade items, as they rise to the challenges ahead of them; as competitors and supporters of these events. Heartland Shoppes applauds all participants in these noble initiatives.</p>
            </div>
            <div className="flex flex-col mx-auto space-y-1 my-2">
                <p className="font-regular text-xl">Want a custom product?</p>
                <button className="bg-[#f8b4c4] font-semibold text-md md:text-lg text-white p-1 rounded-md font-button">Request Product</button>
            </div>
        </div>
    )
}

function Footer() {
    return (
        <div className="flex flex-col w-full bg-gray-600 p-2 items-center">
            <img src={email} className="w-14 h-10"></img>
            <p className="text-white text-xl">Connect with me</p>
            <div className="flex flex-row space-x-4">
                <img src={iglogo} className="w-10 h-10"></img>
                <img src={fblogo} className="w-11 h-10"></img>
            </div>
        </div>
    )
}