import { useState } from "react"

export default function Cart() {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <div className="w-full relative">
            <div
                className={`absolute top-0 left-0 md:left-auto md:right-0 z-10 bg-white text-black p-4 rounded shadow-lg transition-all duration-1000 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                style={{
                    visibility: isOpen ? 'visible' : 'hidden',
                    opacity: isOpen ? 1 : 0,
                }}
            >
                <div className="flex flex-col w-80 max-h-80">
                    <div className="flex flex-row">
                        <h3 className="text-xl">Cart</h3>
                        <button onClick={() => setIsOpen(false)} className="ml-auto">🛒</button>
                    </div>
                    <Items />
                    <button className="self-start my-2 bg-[#f8b4c4] p-0.5 text-white font-bold text-lg rounded-lg">Checkout</button>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={() => setIsOpen(!isOpen)}>🛒</button>
            </div>
        </div>
    )
}

function Items() {
    return <div className="flex flex-col w-full overflow-y-scroll space-y-2">
        <Item />
        <Item />
        <Item />
        <Item />
        <Item />
    </div>
}

function Item() {
    return <div className="flex flex-row border-black border-1 h-22">
        <img className="h-full w-[30%] border-black border-2"></img>
        <div className="flex flex-col pl-2 py-0.5 w-[70%]">
            <p>Item Name</p>
            <p>Price</p>
            <div className="flex flex-row self-end space-x-2 border-black border-2 mr-4 pl-1 pr-1 rounded-lg">
                <button>-</button>
                <p>1</p>
                <button>+</button>
            </div>
        </div>
    </div>
}
