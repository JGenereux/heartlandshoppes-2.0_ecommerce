export default function Navbar() {
    return <div className="flex flex-row w-full h-12 border-black border-2 items-center">
        <img className="h-full w-[6%] border-black border-2"></img>
        <div className="flex flex-row ml-6 space-x-4">
            <p>Home</p>
            <p>Shop</p>
            <p>About</p>
            <p>Contact</p>
        </div>
        <SearchBar />
        <div className="flex flex-row ml-auto mr-6 space-x-6">
            <p>Inventory</p>
            <p>Login</p>
            <p>🛒</p>
        </div>
    </div>
}

function SearchBar() {
    return <div>

    </div>
}