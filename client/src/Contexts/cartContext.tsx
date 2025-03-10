import { createContext, ReactNode, useContext, useState } from "react";
import { CartItem } from "../interfaces/userinterface";
import { useAuth } from "./authContext";

interface CartContextType {
    cart: CartItem[] | null;
    addToCart: (item: CartItem) => void;
    removeFromCart: (item: CartItem) => void;
}

const CartContext = createContext<CartContextType>({
    cart: null,
    addToCart: () => { },
    removeFromCart: () => { }
})

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth()

    const [cart, setCart] = useState<CartItem[] | null>(user ? user.cart : [])

    const addToCart = (item: CartItem) => {
        if (!cart) return
        const itemIndex = cart.findIndex((currItem) => currItem.item.name === item.item.name)

        if (itemIndex === -1) {
            setCart((prevCart) => [...prevCart ?? [], item])
            return
        }

        const newCart = cart
        newCart[itemIndex].quantity += 1
        setCart(newCart)
    }

    const removeFromCart = (item: CartItem) => {
        if (!cart) return
        const itemIndex = cart.findIndex((currItem) => currItem.item.name === item.item.name)

        if (itemIndex === -1) return

        const newCart = [...cart]

        if (cart[itemIndex].quantity > 1) {
            newCart[itemIndex] = { ...newCart[itemIndex], quantity: newCart[itemIndex].quantity - 1 }
        } else {
            newCart.splice(itemIndex, 1)
        }
        setCart(newCart)
    }

    return <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
        {children}
    </CartContext.Provider>
}