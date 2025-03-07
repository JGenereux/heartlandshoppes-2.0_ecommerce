import { useState } from "react";
import Drawer from "../Navbar/Drawer";
import Rating from '@mui/material/Rating';

export default function ItemPage() {
    return (
        <div className="">
            <Drawer />
            <div className="w-full h-full py-6">
                <Item />
            </div>
        </div>
    )
}

function Item() {
    return (
        <div className="w-[90%] h-fit flex flex-col mx-auto py-2 shadow-black shadow-lg">
            <div className="flex flex-col md:flex-row w-full h-[90%] bg-white py-2">
                <div className="flex flex-col w-[90%] md:w-[45%] h-full items-center mx-auto">
                    <img className="w-full h-[65vh] border-black border-2"></img>
                    <ImageSlider />
                </div>
                <div className="md:w-1/2 h-full flex flex-col pl-2 md:pl-0">
                    <ItemDescription />
                </div>
            </div>
            <Reviews />
        </div>
    )
}

function ImageSlider() {
    return <div className="w-full flex flex-col border-black border-2 items-center">
        <div className="flex flex-row w-full p-2 justify-center space-x-3">
            <div className="w-3/6 flex flex-row space-x-2">
                <img className="w-1/3 h-16 border-black border-2"></img>
                <img className="w-1/3 h-16 border-black border-2"></img>
                <img className="w-1/3 h-16 border-black border-2"></img>
            </div>
        </div>
        <div className="flex flex-row space-x-2 pb-1">
            <button className="w-4 h-4 rounded-lg border-black border-2"></button>
            <button className="w-4 h-4 rounded-lg border-black border-2"></button>
            <button className="w-4 h-4 rounded-lg border-black border-2"></button>
        </div>
    </div>
}

function ItemDescription() {
    return <div className="flex flex-col h-full text-lg pt-1 w-full">
        <div className="flex flex-col">
            <h3 className="text-3xl font-headerFont">Tumbler Cup</h3>
            <p className="text-xl font-regular">$19.99</p>
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
                <button>+</button>
                <p>0</p>
                <button>-</button>
            </div>
        </div>
        <div className="flex flex-col pt-4 w-[95%]">
            <p className="font-button font-bold">About this item: </p>
            <p className="font-regular text-md">This is the description for an item wow this is really descriptive blah blah blah</p>
        </div>
    </div>
}

function Reviews() {
    const [leaveReview, setLeaveReview] = useState(false)
    const reviews = [1, 2]
    return <div className="flex flex-col self-center  w-[95%] h-fit">
        <div className="flex flex-col md:flex-row py-1">
            <h3 className="font-headerFont text-2xl">Reviews</h3>
            <button className=" w-fit md:ml-auto text-xl md:mr-8 rounded-lg p-1 font-button bg-[#f8b4c4] text-white font-bold" onClick={() => setLeaveReview((review) => !review)}>{leaveReview ? 'Go Back' : 'Leave a review'}</button>
        </div>
        {leaveReview && <AddReview />}
        <div className="flex flex-col space-y-6 mb-2">
            {reviews.map((review, index) => {
                return <Review key={index} />
            })}
        </div>
    </div>
}

function AddReview() {
    return <div className="flex flex-col mb-4 font-regular">
        <p>First Name Last Name on Date</p>
        <Rating name="half-rating" defaultValue={2.5} precision={0.5} />
        <textarea className="border-black border-1 w-[80%] resize-none pl-0.5 my-1"></textarea>
        <p>Optional Picture</p>
        <button className="self-start my-2 p-1 rounded-lg font-button bg-[#f8b4c4] text-white font-bold">Add Review</button>
    </div>
}

function Review() {
    return <div className="flex flex-col font-regular w-[80%]">
        <p>First Name Last Name on Date</p>
        <Rating name="half-rating" defaultValue={2.5} precision={0.5} readOnly />
        <p>Review</p>
        <p>Optional Picture</p>
    </div>
}