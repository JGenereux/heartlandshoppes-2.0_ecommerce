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
        setCart((prevCart) => {
            if (!prevCart || prevCart.length == 0) return [{ ...item, quantity: item.quantity || 1 }];

            //Check if item exists at all by name first
            const itemIndex = prevCart.findIndex(
                (currItem) =>
                    currItem.item.name === item.item.name &&
                    JSON.stringify(currItem.item.options) === JSON.stringify(item.item.options)
            );

            console.log(`Item index is: ${itemIndex}`)
            if (itemIndex !== -1) {
                return prevCart.map((currItem, index) =>
                    index === itemIndex
                        ? { ...currItem, quantity: item.quantity }
                        : currItem
                );
            }

            return [...prevCart, { ...item, quantity: item.quantity }];
        });
    }

    const removeFromCart = (item: CartItem) => {
        if (!cart) return
        const itemIndex = cart.findIndex((currItem) => currItem.item.name === item.item.name)

        if (itemIndex === -1) return

        const newCart = [...cart]

        if (cart[itemIndex].quantity > 1) {
            newCart[itemIndex] = {
                ...newCart[itemIndex], quantity: newCart[itemIndex].quantity - 1, item: {
                    ...newCart[itemIndex].item,
                    options: item.item.options
                }
            }
        } else {
            newCart.splice(itemIndex, 1)
        }
        setCart(newCart)
    }

    return <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
        {children}
    </CartContext.Provider>
}