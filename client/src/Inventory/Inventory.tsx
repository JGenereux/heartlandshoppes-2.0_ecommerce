import { useEffect, useState } from "react";
import Drawer from "../Navbar/Drawer";
import uploadPhotoICON from '../assets/uploadPhotoICON.png'
import { Item } from "../interfaces/iteminterface";
import axios from 'axios'
import FormData from "form-data";
import { useQuery } from "@tanstack/react-query";

export default function Inventory() {
    return (
        <div className="h-screen">
            <Drawer />
            <DisplayInventory />
        </div>
    )
}

function DisplayInventory() {

    const { isPending, error, data: inventoryData = [] } = useQuery<Item[], Error>({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await axios.get<Item[]>('http://localhost:5000/inventory')
            return res.data
        },
        staleTime: 60 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 15 * 1000
    })

    const [addItem, setAddItem] = useState(false)

    if (isPending) { return 'Loading...' }
    if (error) { return `error: ${error}` }

    return <div className="flex flex-col w-[90%] h-fit mx-auto md:my-4">
        <div className="flex flex-row flex-wrap w-full">
            <div>
                <h3 className="text-2xl font-headerFont">Current Inventory</h3>
                <button className="self-end border-black border-2 p-1 rounded-lg font-button" onClick={() => setAddItem((add) => !add)}>{addItem ? 'Go Back' : 'Add to inventory'}</button>
            </div>
            <div className="flex flex-row items-center ml-auto space-x-1">
                <p className="text-xl">Category: </p>
                <select className="border-black border-2 p-0.5 rounded-lg font-button">
                    <option>All</option>
                </select>
            </div>
        </div>
        {addItem && <AddItem />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-h-fit border-black border-2 my-2 shadow-gray-400 shadow-lg">
            {inventoryData?.map((item: Item, index) => {
                return <DisplayItem key={index} item={item} />
            })}
        </div>
    </div>
}


function AddItem() {
    const [item, setItem] = useState<Item>({
        name: "",
        price: 0,
        category: [],
        options: {},
        quantity: 0,
        description: "",
        photos: []
    })

    const handleAddItem = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        try {
            const res = await axios.post('http://localhost:5000/inventory/item', { item: item })
            console.log(res)
        } catch (error) {
            console.log(error)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>, field: keyof Item) => {
        const value = e.target.value;
        setItem((prevItem) => ({
            ...prevItem,
            [field]: value,
        }));
    }

    return <div className="w-full p-2 p-r-0 border-black border-2 my-2 font-regular">
        <form onSubmit={(event) => handleAddItem(event)}>
            <div className="flex flex-col w-full">
                <div className="flex flex-row">
                    <div className="flex flex-col w-1/2">
                        <p>Item Name</p>
                        <input type="text" className="border-black border-1 pl-1 ml-2" value={item.name} onChange={(event) => handleInputChange(event, "name")}></input>
                        <p>Item Price</p>
                        <input type="text" className="border-black border-1 pl-1 ml-2" value={item.price} onChange={(event) => handleInputChange(event, "price")}></input>
                        <p>Category</p>
                        <input type="text" className="border-black border-1 pl-1 ml-2" value={item.category} onChange={(event) => handleInputChange(event, "category")}></input>
                        <p>Quantity</p>
                        <input type="text" className="border-black border-1 pl-1 ml-2" value={item.quantity} onChange={(event) => handleInputChange(event, "quantity")}></input>
                        <p>Description</p>
                        <textarea className="resize-none border-black border-1 h-fit ml-2" value={item.description} onChange={(event) => handleInputChange(event, "description")}></textarea>
                    </div>
                    <DisplayOptions item={item} setItem={setItem} />
                </div>
                <div className="flex flex-col mx-auto w-fit my-2">
                    <h3 className="text-xl">Photos</h3>
                    <div className="grid grid-cols-3 border-black border-2 gap-4 p-1">
                        <PhotoUpload item={item} setItem={setItem} />
                        <PhotoUpload item={item} setItem={setItem} />
                        <PhotoUpload item={item} setItem={setItem} />
                    </div>
                </div>
                <button className="border-black border-1 w-fit self-center p-0.5" type="submit">Add Item to inventory</button>
            </div>
        </form>
    </div>
}

interface DisplayOptionsProps {
    item: Item,
    setItem: (option: Item) => void
}

function DisplayOptions({ item, setItem }: DisplayOptionsProps) {

    const [currOption, setCurrOption] = useState<string>("")
    const [selectedOption, setSelectedOption] = useState<string>("")

    const [currentValues, setCurrentValues] = useState<string[]>([]);

    useEffect(() => {
        const updatedArr = [...(item.options[selectedOption] || []), ""]
        setCurrentValues(updatedArr);
    }, [item, selectedOption]);

    const handleAddOption = () => {
        if (!currOption) return

        const currentItem = { ...item }
        currentItem.options[currOption] = []

        setItem(currentItem)

        setSelectedOption(currOption)
        setCurrOption("")
    }

    return <div className="flex flex-col my-auto mx-auto pl-2 w-1/3 h-full border-black border-2 p-2">
        <p>Options</p>
        <p>Enter Option</p>
        <div className="flex flex-row space-x-4">
            <input type="text" className="border-black border-1  pl-1" value={currOption} onChange={(event) => setCurrOption(event.target.value)}></input>
            <button className="border-black border-1 pl-0.5 pr-0.5" type="button" onClick={handleAddOption}>Add</button>
        </div>
        <div className="grid grid-cols-3 border-black border-2 my-2 min-h-8 items-center p-1 gap-2">
            {Object.keys(item?.options).map((key) => (
                <div key={key}>
                    <Option option={key} setSelectedOption={setSelectedOption} item={item} setItem={setItem} />
                </div>
            ))}
        </div>
        {selectedOption?.length > 0 && <p>Enter values for option</p>}
        {Object.keys(item?.options).length > 0 && currentValues?.map((val, index) => (<Value key={index} val={val} item={item} setItem={setItem} selectedOption={selectedOption} />))}
    </div>
}

interface ValueProps {
    val: string,
    item: Item,
    setItem: (item: Item) => void,
    selectedOption: string,
}

function Value({ val, item, selectedOption, setItem }: ValueProps) {
    const [option, setOption] = useState<string>(val.length > 0 ? val : "")
    const [added, setAdded] = useState<boolean>(false)

    useEffect(() => {
        setOption(val.length > 0 ? val : "")
        if (val.length == 0) {
            setAdded(false)
        } else {
            setAdded(true)
        }
    }, [val])

    const handleAddValue = () => {
        if (added) return
        const currentItem = { ...item }
        const currentOptionValues = currentItem.options[selectedOption] || []


        currentOptionValues.push(option)

        currentItem.options[selectedOption] = currentOptionValues
        setItem({ ...currentItem })

        setAdded(true)
    }

    const handleRemoveValue = () => {
        const currentItem = { ...item }

        const filteredOptions = currentItem.options[selectedOption].filter((currOption) => { return currOption.trim() != option.trim() }) || []

        currentItem.options[selectedOption] = filteredOptions
        setItem({ ...currentItem })
    }

    return <div className="flex flex-row items-center mb-2 space-x-2 h-8">
        <input type="text" className="border-black border-1 pl-1 w-1/4" value={option} readOnly={added && true} onChange={(event) => setOption(event.target.value)}></input>
        <button type="button" onClick={handleAddValue} className="border-1 border-black pl-0.5 pr-0.5">Add</button>
        {(option?.length > 0 && added) && <button type="button" onClick={handleRemoveValue} className="border-1 border-black pl-0.5 pr-0.5">Remove</button>}
    </div>
}

interface OptionProps {
    option: string,
    setSelectedOption: (option: string) => void,
    item: Item,
    setItem: (item: Item) => void,
}

function Option({ option, setSelectedOption, item, setItem }: OptionProps) {
    const handleRemoveOption = () => {
        const currentItem = { ...item }
        delete currentItem.options[option]

        setItem({ ...currentItem })

        if (Object.keys(currentItem.options).length > 0) {
            const resetSelectedOpt = currentItem.options[0] && currentItem.options[0][0] || ""
            setSelectedOption(resetSelectedOpt)
        } else {
            setSelectedOption("")
        }
    }
    return <div className="border-1 border-black text-center w-fit p-0.5 space-x-1">
        <button className="self-end font-md" onClick={handleRemoveOption}>-</button>
        <button type="button" onClick={() => setSelectedOption(option)}>{option}</button>
    </div>
}

interface ImageResponse {
    imageUrl: string;
}

interface PhotoUploadProps {
    item: Item,
    setItem: (item: Item) => void,
}

function PhotoUpload({ item, setItem }: PhotoUploadProps) {
    const [photoUrl, setPhotoUrl] = useState('')

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (!file) {
            console.error('Error retrieving uploaded file')
            return
        }

        const formData = new FormData()
        formData.append("image", file)

        try {
            const res = await axios.post<ImageResponse>('http://localhost:5000/image/', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })

            const currentItem = { ...item }
            currentItem.photos.push(res.data.imageUrl)

            setItem({ ...currentItem })
            setPhotoUrl(res.data.imageUrl)
            event.target.value = ""
        } catch (error) {
            console.error(error)
        }
    }

    const handleFileRemove = () => {
        const url = photoUrl

        const currentItem = { ...item }
        const filteredPhotos = currentItem.photos.filter((currUrl) => currUrl != url)

        currentItem.photos = filteredPhotos
        setItem(currentItem)
        setPhotoUrl('')
    }
    return <div className="flex flex-col items-center">
        {(photoUrl && photoUrl.length > 0) ?
            <div className="w-full h-full relative">
                <img src={photoUrl} className="w-48 h-44"></img>
                <button className="bg-red-500 p-0.5 pt-0 pb-0 rounded-lg absolute top-0 left-1 text-white" onClick={handleFileRemove}>-</button>
            </div>
            :
            <div className="flex flex-col">
                <div className="flex flex-col w-fit h-44 relative items-center justify-center pl-2">
                    <p>Click to upload photo</p>
                    <img src={uploadPhotoICON} className="h-12 w-12"></img>
                    <input type="file" className="text-transparent w-full h-full absolute top-0" onChange={(event) => handleFileUpload(event)}></input>
                </div>
            </div>}
    </div>
}

interface DisplayItemProps {
    item: Item
}
function DisplayItem({ item }: DisplayItemProps) {

    const [modify, setModify] = useState(false)
    return <div className={modify ? "flex flex-col h-120 justify-center items-center border-black border-2 pb-1" : "flex flex-col h-120 justify-center items-center border-black border-2 pb-1"}>
        <div className={modify ? "flex flex-col w-[85%] h-full my-2 font-regular" : "flex flex-col w-[85%] h-full justify-center font-regular"}>
            {modify ?
                <ModifyItem /> : <>
                    <img src={item?.photos[0]} className="border-2 border-black w-full h-[60%]" ></img>
                    <p>{item.name}</p>
                    <p>{item.price}</p>
                    <p>{item.quantity}</p>
                    <p>{item.category}</p>
                    <p>{item.description}</p>
                </>}
        </div>
        <button className="border-black border-2 p-0.5 rounded-sm font-button" onClick={() => setModify((modify) => !modify)}>Modify</button>
    </div>
}

function ModifyItem() {
    return <form>
        <p>Item Name</p>
        <input type="text" className="border-black border-2"></input>
        <p>Item Price</p>
        <input type="text" className="border-black border-2"></input>
        <p>Quantity</p>
        <input type="text" className="border-black border-2 w-10"></input>
        <p>Category</p>
        <input type="text" className="border-black border-2"></input>
        <p>Description</p>
        <textarea className="resize:none border-black border-2 w-full h-40"></textarea>
    </form>
}