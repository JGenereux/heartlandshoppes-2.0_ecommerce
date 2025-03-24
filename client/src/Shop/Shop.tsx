import { Link, Route, Routes, useNavigate } from "react-router-dom";
import Drawer from "../Navbar/Drawer";
import { Item } from "../interfaces/iteminterface";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loading from "../Loading/Loading";
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { useEffect, useState } from "react";
import { Edit, X } from "lucide-react";
import Modal from "@mui/material/Modal";
const apiUrl = import.meta.env.VITE_API_URL;

export default function Shop() {
    return <Routes>
        <Route path="/" element={<ShopMenu category="Featured" />} />
        <Route path="tumblers" element={<ShopMenu category="Tumblers" />} />
        <Route path="accessories" element={<ShopMenu category="Tumbler Accessories" />} />
        <Route path="homedecor" element={<ShopMenu category="Home Decor" />} />
        <Route path="seasonal" element={<ShopMenu category="Seasonal" />} />
        <Route path="customorder" element={<ShopMenu category="Custom Order" />} />
        <Route path="miscellaneous" element={<ShopMenu category="Miscellaneous" />} />
    </Routes>
}

interface ShopMenuProps {
    category: string
}
function ShopMenu({ category }: ShopMenuProps) {

    const { isPending, data: inventoryData = [], isFetching } = useQuery<Item[], Error>({
        queryKey: ['inventory', category],
        queryFn: async () => {
            const res = await axios.get<Item[]>(`${apiUrl}/inventory/${category}`)
            return res.data
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchInterval: 10 * 60 * 1000
    })
    const navigate = useNavigate()

    const handleCustomRequest = () => {
        navigate('/?customOrder=true')
    }

    return <div className="mb-6">
        <Drawer />
        <CategoriesBar category={category} />
        {(isPending || isFetching) ? <div className="flex flex-col w-full items-center justify-center p-12 space-y-1.5">
            <p className="font-regular font-bold text-xl">Loading Shop Items</p>
            <Loading />
        </div> : <div className="flex flex-col">
            <DisplayItems items={inventoryData} />
            {category.toLowerCase().trim() === "custom order" && <div className=" text-center w-full">
                <CustomOrderSlide />
                <div className="w-fit mx-auto">
                    <p className="font-bold font-regular">Want a custom order?</p>
                    <button
                        type="button"
                        onClick={handleCustomRequest}
                        className="w-full bg-actionColor hover:actionColor/90 text-primary-foreground font-button font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        Request Custom Order
                    </button>
                </div>
            </div>}
        </div>}
    </div>
}

function CustomOrderSlide() {
    const [imagesModalOpen, setImagesModalOpen] = useState(false)
    const [currentImage, setCurrentImage] = useState(0)
    const images = [
        "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556760544-74068565f05c?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1464316325666-63beaf639dbb?q=80&w=1200&auto=format&fit=crop",
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
        }, 5000)
        return () => clearInterval(interval)
    }, [images.length])

    // Manual navigation
    const goToImage = (index: number) => {
        setCurrentImage(index)
    }

    return <div className="w-[80%] mx-auto">
        <div className="relative mb-8">
            <div className="relative h-[250px] md:h-[350px] rounded-lg overflow-hidden">
                {images.map((src, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${currentImage === index ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <img
                            src={src || "https://via.placeholder.com/1200x400"}
                            alt={`Handmade product image ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading={index === 0 ? "eager" : "lazy"}
                        />
                    </div>
                ))}

                {/* Image navigation dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToImage(index)}
                            className={`w-3 h-3 rounded-full ${currentImage === index ? "bg-white" : "bg-white/50"}`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Images Modal */}
            <Modal open={imagesModalOpen}
                onClose={() => setImagesModalOpen(false)}>
                <div className="py-4">
                    <div className="grid gap-4 mb-4">
                        <Label>Current Images</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {images.map((src, index) => (
                                <div key={index} className="relative group rounded-md overflow-hidden border">
                                    <img
                                        src={src || "https://via.placeholder.com/120x80"}
                                        alt={`Image ${index + 1}`}
                                        className="object-cover w-full h-20"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-white"

                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-white"

                                            disabled={images.length <= 1}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div >
    </div >
}

interface categoryProps {
    category: string
}

function CategoriesBar({ category }: categoryProps) {
    return (
        <div className="flex flex-col w-full h-fit border-gray-600 border-b-2 items-center justify-center font-button pt-1.5">
            <p className="text-md md:text-lg">{category}</p>
            <div className="flex flex-row flex-wrap w-full text-md md:text-lg space-x-4 md:space-x-10 justify-center">
                <Link to="/shop">Featured</Link>
                <Link to="/shop/tumblers">Tumblers</Link>
                <Link to="/shop/accessories">Tumbler Accessories</Link>
                <Link to="/shop/homedecor">Home Decor</Link>
                <Link to="/shop/seasonal">Seasonal</Link>
                <Link to="/shop/customorder">Custom Order</Link>
                <Link to="/shop/miscellaneous">Miscellaneous</Link>
            </div>
        </div>
    )
}

interface DisplayItemsProps {
    items: Item[]
}

function DisplayItems({ items }: DisplayItemsProps) {

    return <div className="w-full h-full my-2">
        {items && items.length > 0 ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 max-w-6xl gap-6 w-full pb-4 pt-4 pr-2 pl-2">
            {items?.map((item, index) => {
                return <DisplayItem key={index} item={item} />
            })}
        </div> : <div className="flex h-full justify-center items-center my-6 font-headerFont text-lg md:text-xl lg:text-2xl">
            <p>There are no items in this category.</p>
        </div>}
    </div>
}

interface ItemProps {
    item: Item
}

function DisplayItem({ item }: ItemProps) {
    const navigate = useNavigate()

    const handleItemRedirect = () => {
        navigate(`/shop/item/${item.name}`)
    }
    return <div className="flex flex-col h-fit pl-2 py-2 rounded-md bg-white cursor-pointer items-center transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" onClick={handleItemRedirect}>
        <img src={item?.photos[0]} className="h-40">
        </img>
        <div className="flex flex-col font-regular items-center">
            <p className="overflow-hidden line-clamp-1">{item.name}</p>
            <p>${Number(item.price).toFixed(2)}</p>
            <button className="bg-actionColor text-white p-1 rounded-md font-bold font-button cursor-pointer">Buy Now</button>
        </div>
    </div>
}