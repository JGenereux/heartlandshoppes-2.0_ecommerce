import { Link } from "react-router-dom";
import Drawer from "../Navbar/Drawer";

export default function Login() {
    return (
        <div className="h-[90vh]">
            <Drawer />
            <div className="flex justify-center items-center h-full w-full">
                <LoginForm />
            </div>
        </div>
    )
}

function LoginForm() {
    return <div className="flex flex-col w-fit md:w-[35%] h-fit rounded-sm justify-center items-center py-6 shadow-gray-600 shadow-md">
        <img className="w-18 h-18 border-black border-2 rounded-[2.2rem] mb-2"></img>
        <h3 className="font-headerFont text-2xl">Heartland Shoppes</h3>
        <form className="flex flex-col my-6 w-full space-y-1 items-center">
            <div className="flex flex-col w-[70%] mx-auto">
                <p className="text-lg font-regular">Email:</p>
                <input type="text" id="username" className="border-black border-2 w-full pl-1 h-8 rounded-sm"></input>
            </div>
            <div className="flex flex-col w-[70%] mx-auto">
                <p className="text-lg font-regular">Password:</p>
                <input type="password" id="username" className="border-black border-2 w-full pl-1 h-8 rounded-sm"></input>
                <Link to="/signup" className="underline underline-offset-[1.5px]">Don't have an account yet? Sign up</Link>
            </div>
            <button className="my-4 bg-[#f8b4c4] font-button font-semibold w-fit p-1.5 rounded-lg text-lg text-white">LOGIN</button>
        </form >
    </div >
}