import { useEffect, useState } from "react";
import Drawer from "../Navbar/Drawer";
import email from '../assets/email.png'
import fblogo from '../assets/facebooklogo.png'
import iglogo from '../assets/iglogo.png'
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Item } from "../interfaces/iteminterface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";


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
                <div className="flex flex-col w-full justify-between h-full absolute top-0 py-2">
                    <div>
                        <p className="text-2xl md:text-[3rem] font-headerFont pl-6">Heartland Shoppes</p>
                    </div>
                    <p className="font-regular text-lg md:text-xl lg:text-[1.4rem] ml-12">Discover the heart of shopping at heartland shoppes where quality meets community</p>
                    <Link to="/shop" className="font-button mb-2 font-semibold bg-[#f8b4c4] w-fit mx-auto p-0.5 md:p-1.5 rounded-sm md:text-lg shadow-gray-500 shadow-sm text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 ">Shop now</Link>
                </div>
            </div>
        </div>
    )
}

function Featured() {
    const { data: featuredItems = [], isError, error, isFetching } = useQuery<Item[]>({
        queryKey: ['inventory', 'Featured'],
        queryFn: async () => {
            const res = await axios.get<Item[]>('http://localhost:5000/inventory/Featured')
            return res.data
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
    })
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
    const [leftIndex, setLeftIndex] = useState(0)
    const [rightIndex, setRightIndex] = useState(isDesktop ? 2 : 1)
    const featuredItemsSlice = featuredItems.slice(leftIndex, rightIndex + 1)

    const handleResize = () => {
        setIsDesktop(window.innerWidth >= 768)
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })

    const handleMoveLeft = () => {
        if (leftIndex > 0) {
            setLeftIndex(leftIndex - 1)
            if ((rightIndex + 1) - leftIndex > 2) {
                setRightIndex(rightIndex - 1)
            }
        }
    }

    const handleMoveRight = () => {
        if (rightIndex < featuredItems.length - 1) {
            setRightIndex(rightIndex + 1)
            if ((rightIndex + 1) - leftIndex > 2) {
                setLeftIndex(leftIndex + 1)
            }
        }
    }

    if (isFetching) return "Loading"
    if (isError) return `${error.message}`

    return (
        <div className="flex flex-col w-full h-fit items-center justify-center pb-2 space-y-1.5 my-2">
            <h3 className="text-lg md:text-2xl font-button">Featured Products</h3>
            <div className="w-[80%] flex flex-row space-x-2 items-center justify-center">
                <button
                    className="bg-[#f8b4c4] font-semibold rounded-full p-2 pt-1 pb-1 text-white shadow-md shadow-gray-400 cursor-pointer transition-transform transform hover:scale-110 active:scale-95"
                    onClick={handleMoveLeft}
                >
                    <FontAwesomeIcon icon={faAnglesLeft

                    } />
                </button>

                <div className="flex flex-row space-x-4 items-center">
                    {featuredItemsSlice?.map((item, index) => (
                        <DisplayItem key={index} item={item} />
                    ))}
                </div>

                <button
                    className="bg-[#f8b4c4] font-semibold rounded-full p-2 pt-1 pb-1 text-white shadow-md shadow-gray-400 cursor-pointer transition-transform transform hover:scale-110 active:scale-95"
                    onClick={handleMoveRight}
                >
                    <FontAwesomeIcon icon={faAnglesRight} />
                </button>

            </div>
        </div>
    )
}

interface DisplayItemProps {
    item: Item
}

function DisplayItem({ item }: DisplayItemProps) {

    const navigate = useNavigate()
    const navigateToItem = () => {
        navigate(`/shop/item/${item.name}`)
    }
    return (
        <div className="flex flex-col w-1/3 pl-2 pt-2  font-regular transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 items-center" onClick={navigateToItem}>
            <img src={item.photos[0]} className="w-[100%] h-[190px] ">
            </img>
            <p>{item.name}</p>
            <p>${item.price}</p>
            <button className="bg-actionColor text-white p-1 rounded-md font-bold font-button cursor-pointer">Buy Now</button>
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