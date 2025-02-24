import { useState } from "react";
import Drawer from "./Drawer";

export default function Settings() {
    return <div className="h-screen">
        <Drawer />
        <Dashboard />
    </div>
}

enum DashboardOptions {
    account,
    orderHistory
}

interface DisplayProps {
    options: DashboardOptions
}
function DisplayOptions({ options }: DisplayProps) {
    if (options == DashboardOptions.account) {
        return <Account />
    } else if (options == DashboardOptions.orderHistory) {
        return <OrderHistory />
    }
}


function Dashboard() {
    const [option, setOption] = useState<DashboardOptions>(DashboardOptions.account)

    return <div className="flex w-full h-[90%] items-center justify-center">
        <div className="flex flex-col w-[90%] h-[80%] border-2 border-black">
            <DashboardNav setOption={setOption} />
            <DisplayOptions options={option} />
        </div>
    </div>
}

interface DashboardNavProps {
    setOption: (options: DashboardOptions) => void
}

function DashboardNav({ setOption }: DashboardNavProps) {
    return <div className="flex flex-row w-full h-fit items-center space-x-6 text-xl pl-6 py-2 border-b-2 border-black font-button">
        <div className="flex flex-col cursor-pointer" onClick={() => setOption(DashboardOptions.account)}>
            <p>Account</p>
        </div>
        <div className="flex flex-col cursor-pointer" onClick={() => setOption(DashboardOptions.orderHistory)}>
            <p>Order History</p>
        </div>
    </div>
}

function Account() {
    return <div className="w-full h-full flex flex-col pl-12 py-4">
        <div className="flex flex-col w-full">
            <p className="text-lg">Email:</p>
            <p className="text-2xl">Jace@gmail.com</p>
        </div>
        <div className="flex flex-row items-center my-4 text-xl space-x-2">
            <p>Recent order: </p>
            <p className="underline underline-offset-0.5">#000007</p>
        </div>
    </div>
}

function OrderHistory() {
    return <div>

    </div>
}