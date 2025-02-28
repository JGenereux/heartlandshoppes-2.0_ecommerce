import { useState } from "react";
import Drawer from "../Navbar/Drawer";
import uploadPhotoICON from '../assets/uploadPhotoICON.png'

export default function Inventory() {
    return (
        <div className="h-screen">
            <Drawer />
            <DisplayInventory />
        </div>
    )
}

function DisplayInventory() {
    const [addItem, setAddItem] = useState(false)

    return <div className="flex flex-col w-[90%] h-fit mx-auto md:my-4">
        <div className="flex flex-row flex-wrap w-full">
            <div>
                <h3 className="text-2xl font-headerFont">Current Inventory</h3>
                <button className="self-end border-black border-2 p-1 rounded-lg font-button" onClick={() => setAddItem((add) => !add)}>{addItem ? 'Go Back' : 'Add to inventory'}</button>
            </div>
            <div className="flex flex-row items-center ml-auto space-x-1">
                <p className="text-xl">Category: </p>
                <select className="border-black border-2 p-0.5 rounded-lg font-button">
                    <option>All</option>
                </select>
            </div>
        </div>
        {addItem && <AddItem />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-h-120 border-black border-2 my-2 shadow-gray-400 shadow-lg">
            <Item />
            <Item />
            <Item />
            <Item />
            <Item />
            <Item />

            <Item />
            <Item />
            <Item />
            <Item />
            <Item />
            <Item />
        </div>
    </div>
}

function AddItem() {

    return <div className="w-full p-2 p-r-0 border-black border-2 my-2 font-regular">
        <form>
            <div className="flex flex-col w-full">
                <div className="flex flex-col w-1/2">
                    <p>Item Name</p>
                    <input type="text" className="border-black border-1 pl-1 ml-2"></input>
                    <p>Item Price</p>
                    <input type="text" className="border-black border-1 pl-1 ml-2"></input>
                    <p>Category</p>
                    <input type="text" className="border-black border-1 pl-1 ml-2"></input>
                    <p>Quantity</p>
                    <input type="text" className="border-black border-1 pl-1 ml-2"></input>
                    <p>Description</p>
                    <textarea className="resize-none border-black border-1 h-fit ml-2"></textarea>
                </div>
                <div className="flex flex-col mx-auto w-fit my-2">
                    <h3 className="text-xl">Photos</h3>
                    <div className="grid grid-cols-3 border-black border-2 gap-4 p-1">
                        <PhotoUpload />
                        <PhotoUpload />
                        <PhotoUpload />
                    </div>
                </div>
            </div>
        </form>
    </div>
}

function PhotoUpload() {
    const [photo, setPhoto] = useState('')
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const objectURL = URL.createObjectURL(file)
            setPhoto(objectURL)
        }
    }
    return <div className="flex flex-col items-center">
        {(photo && photo.length > 0) ?
            <div className="w-full h-full relative">
                <img src={photo} className="w-48 h-44"></img>
                <button className="bg-red-500 p-0.5 pt-0 pb-0 rounded-lg absolute top-0 left-1 text-white" onClick={() => setPhoto('')}>-</button>
            </div>
            :
            <div className="flex flex-col">
                <div className="flex flex-col w-fit h-44 relative items-center justify-center pl-2">
                    <p>Click to upload photo</p>
                    <img src={uploadPhotoICON} className="h-12 w-12"></img>
                    <input type="file" className="text-transparent w-full h-full absolute top-0" onChange={(event) => handleFileUpload(event)}></input>
                </div>
            </div>}
    </div>
}

function Item() {
    const [modify, setModify] = useState(false)
    return <div className={modify ? "flex flex-col h-120 justify-center items-center border-black border-2 pb-1" : "flex flex-col h-120 justify-center items-center border-black border-2 pb-1"}>
        <div className={modify ? "flex flex-col w-[85%] h-full my-2 font-regular" : "flex flex-col w-[85%] h-full justify-center font-regular"}>
            {modify ?
                <ModifyItem /> : <>
                    <div className="border-2 border-black w-full h-[60%]"></div>
                    <p>Item Name</p>
                    <p>Item Price</p>
                    <p>Quantity</p>
                    <p>Category</p>
                    <p>Description</p>
                </>}
        </div>
        <button className="border-black border-2 p-0.5 rounded-sm font-button" onClick={() => setModify((modify) => !modify)}>Modify</button>
    </div>
}

function ModifyItem() {
    return <form>
        <p>Item Name</p>
        <input type="text" className="border-black border-2"></input>
        <p>Item Price</p>
        <input type="text" className="border-black border-2"></input>
        <p>Quantity</p>
        <input type="text" className="border-black border-2 w-10"></input>
        <p>Category</p>
        <input type="text" className="border-black border-2"></input>
        <p>Description</p>
        <textarea className="resize:none border-black border-2 w-full h-40"></textarea>
    </form>
}