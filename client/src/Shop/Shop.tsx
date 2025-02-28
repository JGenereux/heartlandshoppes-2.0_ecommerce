import { Link } from "react-router-dom";
import Drawer from "../Navbar/Drawer";

export default function Shop() {
    return (
        <div className="">
            <Drawer />
            <Categories />
            <Items />
        </div>
    )
}

function Categories() {
    return (
        <div className="flex flex-col w-full h-fit border-gray-600 border-b-2 items-center justify-center font-button pt-0.5">
            <p className="text-sm md:text-lg">Featured</p>
            <div className="flex flex-row flex-wrap w-full text-sm md:text-lg space-x-4 md:space-x-8 justify-center">
                <Link to="shop/featured">Featured</Link>
                <Link to="shop/tshirts">T-Shirts</Link>
                <Link to="shop/tumblercups">Tumbler Cups</Link>
                <Link to="shop/homedecor">Home Decor</Link>
                <Link to="shop/seasonal">Seasonal</Link>
                <Link to="shop/craftingsupplies">Crafting Supplies</Link>
                <Link to="shop/accessories">Tumbler Accessories</Link>
            </div>
        </div>
    )
}

function Items() {
    return <div className="w-full h-full ">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 w-full pb-4 pt-4 pr-2 pl-2">
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

function Item() {
    return <div className="flex flex-col h-fit pl-2 py-2 rounded-md bg-white shadow-black shadow-sm">
        <div className="w-[90%] h-[160px] border-black border-1">
        </div>
        <div className="flex flex-col font-regular">
            <p>Item name</p>
            <p>$Item price</p>
        </div>
    </div>
}