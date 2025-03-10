import { useState } from "react"
import { useCart } from "../Contexts/cartContext"
import { CartItem } from "../interfaces/userinterface"

export default function Cart() {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <div className="w-full relative">
            {isOpen ? <div
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
                :
                <div className="flex md:justify-end">
                    <button onClick={() => setIsOpen(!isOpen)}>🛒</button>
                </div>}
        </div>
    )
}

function Items() {
    const { cart } = useCart()

    return <div className="flex flex-col w-full overflow-y-scroll space-y-2">
        {cart?.map((cartItem, index) => {
            return <Item key={index} item={cartItem} />
        })}
    </div>
}

interface ItemProps {
    item: CartItem
}

function Item({ item }: ItemProps) {
    const { addToCart, removeFromCart } = useCart()
    return <div className="flex flex-row border-black border-1 h-22">
        <img src={item.item?.photos[0]} className="h-full w-[30%] border-black border-2"></img>
        <div className="flex flex-col pl-2 py-0.5 w-[70%]">
            <p>{item.item.name}</p>
            <p>{item.item.price}</p>
            <div className="flex flex-row self-end space-x-2 border-black border-2 mr-4 pl-1 pr-1 rounded-lg">
                <button onClick={() => removeFromCart(item)}>-</button>
                <p>{item.quantity}</p>
                <button onClick={() => addToCart(item)}>+</button>
            </div>
        </div>
    </div>
}
