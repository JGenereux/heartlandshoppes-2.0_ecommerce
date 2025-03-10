import { Link, useNavigate } from "react-router-dom";
import Drawer from "../Navbar/Drawer";
import { useState } from "react";
import { useAuth } from "../Contexts/authContext";
import { User } from "../interfaces/userinterface";
import axios from "axios";

export default function Signup() {
    return <div className="h-[90vh]">
        <Drawer />
        <div className="flex justify-center items-center h-full w-full">
            <SignupForm />
        </div>
    </div>
}

interface LoginResponse {
    user: User,
    accessToken: string
}

function SignupForm() {
    const { login } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [reEnteredPass, setReEnteredPass] = useState("")

    const navigate = useNavigate()

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!email || !password || !reEnteredPass) {
            window.alert("All credentials must be entered")
            return
        }

        if (password !== reEnteredPass) {
            window.alert("Passwords must be the same")
            return
        }

        try {
            const res = await axios.post<LoginResponse>('http://localhost:5000/auth/signup', {
                userEmail: email,
                password: password,
                userRole: "data"
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
        <form className="flex flex-col my-6 w-full space-y-1 items-center" onSubmit={(event) => handleSignUp(event)}>
            <div className="flex flex-col w-[70%] mx-auto">
                <p className="text-lg font-regular">Email:</p>
                <input type="text" className="border-black border-2 w-full pl-1 h-8 rounded-sm" value={email} onChange={(e) => setEmail(e.target.value)}></input>
            </div>
            <div className="flex flex-col w-[70%] mx-auto">
                <p className="text-lg font-regular">Password:</p>
                <input type="password" className="border-black border-2 w-full pl-1 h-8 rounded-sm" value={password} onChange={(e) => setPassword(e.target.value)}></input>
            </div>
            <div className="flex flex-col w-[70%] mx-auto">
                <p className="text-lg font-regular">Re-Enter Password:</p>
                <input type="password" className="border-black border-2 w-full pl-1 h-8 rounded-sm" value={reEnteredPass} onChange={(e) => setReEnteredPass(e.target.value)}></input>
                <Link to="/login" className="underline underline-offset-[1.5px]">Already have an account? Login</Link>
            </div>
            <button type="submit" className="my-4 bg-[#f8b4c4] font-button font-semibold w-fit p-1.5 rounded-lg text-lg text-white">SIGN UP</button>
        </form >
    </div >
}