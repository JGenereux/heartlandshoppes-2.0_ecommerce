import { Link, useNavigate } from "react-router-dom";
import Drawer from "../Navbar/Drawer";
import { useAuth } from "../Contexts/authContext";
import { useState } from "react";
import { User } from "../interfaces/userinterface";
import axios from "axios";

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

interface LoginResponse {
    user: User,
    accessToken: string
}

function LoginForm() {
    const { login } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!email || !password) {
            window.alert("All credentials must be entered")
            return
        }

        try {
            const res = await axios.post<LoginResponse>('http://localhost:5000/auth/login', {
                userEmail: email,
                password: password
            })

            const { user, accessToken } = res.data
            login(user, accessToken)

            navigate("/", { replace: true })
        } catch (error) {
            window.alert(`Error logging in: ${error}`)
        }
    }

    return <div className="flex flex-col w-fit md:w-[35%] h-fit rounded-sm justify-center items-center py-6 shadow-gray-600 shadow-md">
        <img className="w-18 h-18 border-black border-2 rounded-[2.2rem] mb-2"></img>
        <h3 className="font-headerFont text-2xl">Heartland Shoppes</h3>
        <form className="flex flex-col my-6 w-full space-y-1 items-center" onSubmit={(event) => handleLogin(event)}>
            <div className="flex flex-col w-[70%] mx-auto">
                <p className="text-lg font-regular">Email:</p>
                <input type="text" id="username" className="border-black border-2 w-full pl-1 h-8 rounded-sm" value={email} onChange={(event) => setEmail(event.target.value)}></input>
            </div>
            <div className="flex flex-col w-[70%] mx-auto">
                <p className="text-lg font-regular">Password:</p>
                <input type="password" id="username" className="border-black border-2 w-full pl-1 h-8 rounded-sm" value={password} onChange={(event) => setPassword(event.target.value)}></input>
                <Link to="/signup" className="underline underline-offset-[1.5px]">Don't have an account yet? Sign up</Link>
            </div>
            <button className="my-4 bg-[#f8b4c4] font-button font-semibold w-fit p-1.5 rounded-lg text-lg text-white" type="submit">LOGIN</button>
        </form >
    </div >
}