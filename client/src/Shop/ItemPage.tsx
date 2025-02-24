import Drawer from "../Drawer";

export default function ItemPage() {
    return (
        <div className="h-screen">
            <Drawer />
            <div className="w-full h-full py-2">
                <Item />
            </div>
        </div>
    )
}

function Item() {
    return (
        <div className="flex flex-row w-[90%] h-[90%]  justify-self-center py-2 bg-white">
            <div className="flex flex-col w-[45%] h-full items-center mx-auto">
                <img className="w-full h-[80%] border-black border-2"></img>
                <ImageSlider />
            </div>
            <div className="w-1/2 h-full flex flex-col">
                <ItemDescription />
            </div>
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
    return <div className="flex flex-col h-full text-lg pt-1">
        <div className="flex flex-col">
            <h3 className="text-3xl font-headerFont">Tumbler Cup</h3>
            <p className="text-xl font-regular">$19.99</p>
        </div>
        <div className="flex flex-row items-center space-x-1 font-regular pt-12">
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
        <div className="flex flex-col pt-4">
            <p className="font-button font-bold">About this item: </p>
            <p className="font-regular text-md">This is the description for an item wow this is really descriptive blah blah blah</p>
        </div>
    </div>
}