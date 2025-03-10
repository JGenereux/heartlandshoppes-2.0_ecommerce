import { useEffect, useState } from "react";
import Drawer from "../Navbar/Drawer";
import Rating from '@mui/material/Rating';
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Item, Review } from "../interfaces/iteminterface";
import axios from "axios";
import uploadPhotoICON from '../assets/uploadPhotoICON.png'
import { useCart } from "../Contexts/cartContext";

export default function ItemPage() {
    const { name } = useParams()

    const { isPending, isError, data: item, error } = useQuery<Item, Error>({
        queryKey: [name],
        queryFn: async () => {
            const res = await axios.get<Item>(`http://localhost:5000/inventory/item/${name}`);
            console.log("axios", res);
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
    });

    if (isPending) { return <span>'Loading...'</span> }
    if (isError) { return <span>Error: {error.message}</span> }

    return (
        <div className="">
            <Drawer />
            <div className="w-full h-full py-6">
                {item && <DisplayItem item={item} />}
            </div>
        </div>
    )
}

interface DisplayItemProps {
    item: Item
}

function DisplayItem({ item }: DisplayItemProps) {
    const [photoUrl, setPhotoUrl] = useState(item?.photos[0] || "")
    return (
        <div className="w-[90%] h-fit flex flex-col mx-auto py-2 shadow-black shadow-lg">
            <div className="flex flex-col md:flex-row w-full h-[90%] bg-white py-2">
                <div className="flex flex-col w-[90%] md:w-[45%] h-full items-center mx-auto">
                    <img src={photoUrl} className="w-full h-[65vh] border-black border-2"></img>
                    <ImageSlider item={item} setPhotoUrl={setPhotoUrl} />
                </div>
                <div className="md:w-1/2 h-full flex flex-col pl-2 md:pl-0">
                    <ItemDescription item={item} />
                </div>
            </div>
            <Reviews item={item} />
        </div>
    )
}

interface ImageSliderProps {
    item: Item,
    setPhotoUrl: (url: string) => void
}

function ImageSlider({ item, setPhotoUrl }: ImageSliderProps) {
    const photosSliced = item.photos.slice(0, 2)
    return < div className="w-full flex flex-col border-black border-2 items-center" >
        <div className="flex flex-row w-full p-2 justify-center space-x-3">
            <div className="w-3/6 flex flex-row space-x-2 justify-center">
                {photosSliced.map((photo, index) => {
                    return <img key={index} src={photo} className="w-1/3 h-16 border-black border-2" onClick={() => setPhotoUrl(photo)}></img>
                })}
            </div>
        </div>
        <div className="flex flex-row space-x-2 pb-1">
            <button className="w-4 h-4 rounded-lg border-black border-2"></button>
            <button className="w-4 h-4 rounded-lg border-black border-2"></button>
            <button className="w-4 h-4 rounded-lg border-black border-2"></button>
        </div>
    </div >
}

function ItemDescription({ item }: DisplayItemProps) {
    const { cart, addToCart, removeFromCart } = useCart()

    const retrieveItem = (): number => {
        if (!cart) return 0
        const itemIndex = cart.findIndex((currItem) => currItem.item.name === item.name)
        if (itemIndex !== -1) {
            return cart[itemIndex].quantity
        } else {
            return 0
        }
    }

    const [quantity, setQuantity] = useState(() => retrieveItem())

    useEffect(() => {
        setQuantity(() => retrieveItem())
    }, [cart])

    return <div className="flex flex-col h-full text-lg pt-1 w-full">
        <div className="flex flex-col">
            <h3 className="text-3xl font-headerFont">{item.name}</h3>
            <p className="text-xl font-regular">${item.price}</p>
        </div>
        <div className="flex flex-row items-center space-x-1 font-regular pt-4 md:pt-12">
            <p className="text-xl">Size: </p>
            <select className="bg-[#f8b4c4] text-white w-fit p-0.5">
                <option>S</option>
            </select>
        </div>
        <div className="flex flex-col pt-2">
            <p className="font-regular">Quantity</p>
            <div className="flex flex-row space-x-4 font-button bg-[#f8b4c4] text-white font-bold w-fit p-1 rounded-lg">
                <button onClick={() => addToCart({ item: item, quantity: quantity })}>+</button>
                <p>{quantity}</p>
                <button onClick={() => removeFromCart({ item: item, quantity: quantity })}>-</button>
            </div>
        </div>
        <div className="flex flex-col pt-4 w-[95%]">
            <p className="font-button font-bold">About this item: </p>
            <p className="font-regular text-md">{item.description}</p>
        </div>
    </div>
}

function Reviews({ item }: DisplayItemProps) {
    const [leaveReview, setLeaveReview] = useState(false)
    return <div className="flex flex-col self-center  w-[95%] h-fit">
        <div className="flex flex-col md:flex-row py-1">
            <h3 className="font-headerFont text-2xl">Reviews</h3>
            <button className=" w-fit md:ml-auto text-xl md:mr-8 rounded-lg p-1 font-button bg-[#f8b4c4] text-white font-bold" onClick={() => setLeaveReview((review) => !review)}>{leaveReview ? 'Go Back' : 'Leave a review'}</button>
        </div>
        {leaveReview && <AddReview item={item} setLeaveReview={setLeaveReview} />}
        <div className="flex flex-col space-y-6 mb-2">
            {item.reviews?.map((review: Review, index) => {
                return <DisplayReview key={index} review={review} />
            })}
        </div>
    </div>
}

interface ImageResponse {
    imageUrl: string;
}

interface AddReviewProps {
    item: Item,
    setLeaveReview: (flag: boolean) => void
}

function AddReview({ item, setLeaveReview }: AddReviewProps) {
    const queryClient = useQueryClient()

    const [review, setReview] = useState<Review>({
        fullName: "First name Last name / Date",
        stars: 5,
        description: "",
        photos: []
    })

    const mutation = useMutation(
        {
            mutationFn: async (review: Review) => {
                const response = await axios.put(`http://localhost:5000/inventory/item/${item.name}/review`, { review: review })
                return response.data
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['inventory'] })
                queryClient.invalidateQueries({ queryKey: ['inventory', item.category] })
                queryClient.invalidateQueries({ queryKey: [item.name] })
            }
        }
    )

    const handleReviewChange = (property: keyof Review, value: string | string[] | number | null) => {
        if (value === null) return
        setReview((prevReview) => ({
            ...prevReview,
            [property]: value
        }))
    }

    const handleAddReview = async () => {
        mutation.mutate(review)
        setLeaveReview(false)
        setReview({
            fullName: "First name Last name / Date",
            stars: 5,
            description: "",
            photos: []
        })
    }

    return <div className="flex flex-col mb-4 font-regular">
        <p>{review.fullName}</p>
        <Rating name="half-rating" value={review.stars} onChange={(event, newValue) => handleReviewChange('stars', newValue)} precision={0.5} />
        <textarea className="border-black border-1 w-[80%] resize-none pl-0.5 my-1" value={review.description} onChange={(event) => handleReviewChange('description', event.target.value)}></textarea>
        <UploadPhoto review={review} handleReviewChange={handleReviewChange} />
        <button className="self-start my-2 p-1 rounded-lg font-button bg-[#f8b4c4] text-white font-bold" onClick={handleAddReview}>Add Review</button>
    </div>
}

interface UploadPhotoProps {
    review: Review,
    handleReviewChange: (property: keyof Review, value: string | string[] | number | null) => void
}

function UploadPhoto({ review, handleReviewChange }: UploadPhotoProps) {
    const [photoUrl, setPhotoUrl] = useState("")

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (!file) {
            console.error('Error retrieving uploaded file')
            return
        }

        const formData = new FormData()
        formData.append("image", file)

        try {
            const res = await axios.post<ImageResponse>('http://localhost:5000/image/', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
            setPhotoUrl(res.data.imageUrl)
            const newPhotos = review.photos
            newPhotos.push(res.data.imageUrl)
            handleReviewChange('photos', newPhotos)
            event.target.value = ""
        } catch (error) {
            console.error(error)
        }
    }

    const handleFileRemove = () => {
        const photos = review.photos
        console.log(photoUrl)
        const filteredPhotos = photos.filter((photo) => photo !== photoUrl)

        handleReviewChange('photos', filteredPhotos)
        setPhotoUrl('')
    }

    return <div>
        {(photoUrl && photoUrl.length > 0) ?
            <div className="w-full h-full relative">
                <img src={photoUrl} className="w-28 h-28"></img>
                <button className="bg-red-500 p-0.5 pt-0 pb-0 rounded-lg absolute top-0 left-1 text-white" onClick={handleFileRemove}>-</button>
            </div>
            :
            <div className="flex flex-col">
                <div className="flex flex-col w-fit h-24 relative items-center justify-center pl-2">
                    <p>Click to upload photo</p>
                    <img src={uploadPhotoICON} className="h-10 w-10"></img>
                    <input type="file" className="text-transparent w-full h-full absolute top-0" onChange={(event) => handleFileUpload(event)}></input>
                </div>
            </div>}
    </div>
}

interface ReviewProps {
    review: Review
}

function DisplayReview({ review }: ReviewProps) {
    return <div className="flex flex-col font-regular w-[80%]">
        <p>{review.fullName}</p>
        <Rating name="half-rating" defaultValue={review.stars} precision={0.5} readOnly />
        <p>{review.description}</p>
        <div className="flex flex-row">
            {review.photos?.map((photo, index) => {
                return <img src={photo} key={index} className="w-22"></img>
            })}
        </div>
    </div>
}