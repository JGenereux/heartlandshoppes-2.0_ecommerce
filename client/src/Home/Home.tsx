import { FormEvent, useEffect, useRef, useState } from "react";
import Drawer from "../Navbar/Drawer";
import email from '../assets/email.png'
import fblogo from '../assets/facebooklogo.png'
import iglogo from '../assets/iglogo.png'
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { Item } from "../interfaces/iteminterface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import Loading from "../Loading/Loading";
import Error from "../Loading/Error";
const apiUrl = import.meta.env.VITE_API_URL;

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
        <div className="flex justify-center w-full my-6 md:my-0">
            <div className="w-full relative border-b-2 border-black">

                <div className="flex flex-col w-full justify-between py-4">
                    <div>
                        <p className="text-2xl md:text-[3rem] font-headerFont pl-6">HeartlandShoppes</p>
                    </div>
                    <p className="font-regular text-lg md:text-xl lg:text-[1.4rem] ml-12 my-3">
                        Discover the heart of shopping at heartland shoppes where quality meets community
                    </p>
                    <Link
                        to="/shop"
                        className="font-button mb-2 font-semibold bg-[#f8b4c4] w-fit mx-auto p-0.5 md:p-1.5 rounded-sm md:text-lg shadow-gray-500 shadow-sm text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
                    >
                        Shop now
                    </Link>
                </div>
            </div>
        </div>
    )
}

function Featured() {
    const { data: featuredItems = [], isError, error, isFetching } = useQuery<Item[]>({
        queryKey: ['inventory', 'Featured'],
        queryFn: async () => {
            const res = await axios.get<Item[]>(`${apiUrl}/inventory/Featured`)
            return res.data
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
    })
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
    const [leftIndex, setLeftIndex] = useState(0)
    const SIZE = isDesktop ? 2 : 1
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
            if ((rightIndex + 1) - leftIndex > SIZE) {
                setRightIndex(rightIndex - 1)
            }
        }
    }

    const handleMoveRight = () => {
        if (rightIndex < featuredItems.length - 1) {
            setRightIndex(rightIndex + 1)
            if ((rightIndex + 1) - leftIndex > SIZE) {
                setLeftIndex(leftIndex + 1)
            }
        }
    }

    if (isFetching) return (<div>
        <div className="flex flex-col items-center justify-center w-full p-12 space-y-1.5">
            <h3 className="text-lg md:text-2xl font-button">Loading Featured Products</h3>
            <Loading />
        </div>
    </div>);
    if (isError) return <Error message={error ? `${error}` : 'Error loading featured items'} />

    return (
        <div className="flex flex-col w-full h-fit items-center justify-center pb-2 space-y-1.5 my-2">
            {featuredItemsSlice?.length > 0 ?
                <>
                    <h3 className="text-lg md:text-2xl font-button">Featured Products</h3>
                    < FeaturedItemsDisplay featuredItemsSlice={featuredItemsSlice} handleMoveLeft={handleMoveLeft} handleMoveRight={handleMoveRight} />
                </>
                :
                <p className="text-xl font-regular font-bold p-12">There are no featured products at this time</p>
            }
        </div>
    )
}

interface FeaturedItemsProps {
    featuredItemsSlice: Item[],
    handleMoveRight: () => void,
    handleMoveLeft: () => void
}

function FeaturedItemsDisplay({ featuredItemsSlice, handleMoveLeft, handleMoveRight }: FeaturedItemsProps) {

    return <div className="w-[95%] md:w-[80%] flex flex-row space-x-2 items-center justify-center">
        <button
            className="bg-[#f8b4c4] font-semibold rounded-full p-2 pt-1 pb-1 text-white shadow-md shadow-gray-400 cursor-pointer transition-transform transform hover:scale-110 active:scale-95"
            onClick={handleMoveLeft}
        >
            <FontAwesomeIcon icon={faAnglesLeft

            } />
        </button>

        <div className="grid grid-cols-2 md:grid-cols-3 md:gap-4">
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
    </div >
}

interface DisplayItemProps {
    item: Item
}

function DisplayItem({ item }: DisplayItemProps) {

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
    const navigate = useNavigate()
    const navigateToItem = () => {
        navigate(`/shop/item/${item.name}`)
    }

    const handleResize = () => {
        setIsDesktop(window.innerWidth >= 768)
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })
    const truncateLength = isDesktop ? 20 : 8
    const truncatedName = item.name.length > truncateLength
        ? item.name.substring(0, truncateLength) + "..."
        : item.name;


    return (
        <div className="flex flex-col pl-2 pt-2  font-regular transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 items-center" onClick={navigateToItem}>
            <img src={item.photos[0]} className="h-40 ">
            </img>
            <p>{truncatedName}</p>
            <p>${Number(item.price).toFixed(2)}</p>
            <button className="bg-actionColor text-white p-1 rounded-md font-bold font-button cursor-pointer">Buy Now</button>
        </div>
    )
}

function CustomProduct() {
    const [formOpen, setFormOpen] = useState<boolean>(false)

    return (
        <div className="flex flex-col w-full pb-2 pl-2 py-2 md:py-6 relative">
            <h3 className="text-2xl lg:text-3xl font-headerFont">Express yourself with a unique homemade gift</h3>
            <div className="flex flex-col space-y-2 text-lg w-[95%] self-center font-regular my-1">
                <p>How would you like to express yourself? Guaranteed, family and friends will admire and appreciate your custom handmade item, as intended. Many of these custom handmade gifts are very personal and do not appear in our catalogue. Don't let what you see in our catalogue limit your creativity and inspiration. If you can dream it, Heartland Shoppes can help bring it to life.</p>
                <p>We create t-shirt concepts for charity teams, clubs and small businesses. No order is to small for Heartland Shoppes. Our designs have shown up at Spin Classes, Charity T-Rex runs, our regional Neo-natal Unit, rare diseases month and similar worthwhile causes. Teams sporting our designs get noticed. Whether its a t-shirt and/or a water bottle, the competitors proudly display their custom handmade items, as they rise to the challenges ahead of them; as competitors and supporters of these events. Heartland Shoppes applauds all participants in these noble initiatives.</p>
            </div>
            <div className="flex flex-col mx-auto space-y-1 my-2">
                <p className="font-regular text-2xl">Want a custom product?</p>
                <button className="mx-auto w-fit bg-[#f8b4c4] font-semibold text-2xl text-white p-1.5 rounded-md font-button  cursor-pointer transition-transform transform hover:scale-110 active:scale-95" onClick={() => setFormOpen(true)}>Request Product</button>
            </div>
            {formOpen && <CustomOrderForm setFormOpen={setFormOpen} />}
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

interface Message {
    name: string,
    email: string,
    message: string
}

interface CustomOrderFormProps {
    setFormOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function CustomOrderForm({ setFormOpen }: CustomOrderFormProps) {
    const [message, setMessage] = useState<Message>({
        name: "", email: "", message: ""
    })
    const [error, setError] = useState("")
    const [messageSent, setMessageSent] = useState<boolean>(false)

    const formRef = useRef<HTMLFormElement | null>(null);

    const handleClickOutsideSearch = (event: MouseEvent) => {
        if (formRef.current && !formRef.current.contains(event.target as Node)) {
            setFormOpen(false);
        }
    }

    useEffect(() => {
        window.addEventListener('mousedown', handleClickOutsideSearch)
        const originalStyle = document.body.style.overflow;

        // Apply blur to everything except the navbar
        document.body.classList.add('blur-background');

        return () => {
            window.removeEventListener("mousedown", handleClickOutsideSearch);
            // Clean up when component unmounts or search becomes false
            document.body.classList.remove('blur-background');
            document.body.style.overflow = originalStyle;
        };
    }, [])

    const handleChangeMessage = (property: keyof Message, value: string) => {
        setMessage((prevMessage) => ({
            ...prevMessage,
            [property]: value
        }))
    }

    const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (message.email.length === 0 || message.name.length === 0 || message.message.length === 0) {
            setError("All inputs must be filled before sending inquiry")
            return
        }

        try {
            const res = await axios.post(`${apiUrl}/email`, { userInquiry: message })
            if (res.status === 200) {
                setMessageSent(true)
            }
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                setError(error.response.data)
            }
        }
    }

    return <div className="absolute w-full z-[50]">
        {(error && error.length > 0) && <Error message={error} />}
        <div className="bg-background rounded-lg py-4 px-4 shadow-sm w-[33%] mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-primary font-headerFont">Request custom order</h3>
            <form className="space-y-4" onSubmit={sendMessage} ref={formRef}>
                <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-muted-foreground mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        id="contactName"
                        value={message.name}
                        onChange={(e) => handleChangeMessage('name', e.target.value)}
                        className="w-full bg-muted/50 border border-input rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-muted-foreground mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="contactEmail"
                        value={message.email}
                        onChange={(e) => handleChangeMessage('email', e.target.value)}
                        className="w-full bg-muted/50 border border-input rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="contactMessage" className="block text-sm font-medium text-muted-foreground mb-1">
                        Message
                    </label>
                    <textarea
                        id="contactMessage"
                        rows={4}
                        value={message.message}
                        onChange={(e) => handleChangeMessage('message', e.target.value)}
                        className="w-full bg-muted/50 border border-input rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                    ></textarea>
                </div>
                <button
                    type={messageSent ? "button" : "submit"}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors"
                >
                    {messageSent ? 'Message Sent' : 'Send Message'}
                </button>
            </form>
        </div>
    </div>
}