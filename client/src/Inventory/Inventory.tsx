import { FormEvent, useEffect, useState } from "react";
import Drawer from "../Navbar/Drawer";
import uploadPhotoICON from '../assets/uploadPhotoICON.png'
import { Item } from "../interfaces/iteminterface";
import axios from 'axios'
import FormData from "form-data";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Orders from "./Orders";

export default function Inventory() {
    return (
        <div className="h-screen">
            <Drawer />
            <Dashboard />
            {/*<DisplayInventory />*/}
        </div>
    )
}

interface DashboardOptionProps {
    option: string
}

function DashboardOption({ option }: DashboardOptionProps) {
    if (option === 'inventory') {
        return <DisplayInventory />
    } else if (option === 'orders') {
        return <Orders />
    } return null
}


function Dashboard() {
    const [dashboardOption, setDashboardOption] = useState('inventory')

    return <div className="flex flex-col border-2 border-black my-4 w-[95%] mx-auto">
        <DashboardNavbar setDashboardOption={setDashboardOption} />
        <DashboardOption option={dashboardOption} />
    </div>
}

interface DashboardNavbarProps {
    setDashboardOption: React.Dispatch<React.SetStateAction<string>>
}

function DashboardNavbar({ setDashboardOption }: DashboardNavbarProps) {
    return <div className="flex flex-row h-fit p-2 w-full border-black border-b-2 items-center pl-4 space-x-6">
        <button className="cursor-pointer" onClick={() => setDashboardOption('inventory')}>Inventory</button>
        <button className="cursor-pointer" onClick={() => setDashboardOption('orders')}>Orders</button>
    </div>
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
    const [currentCategories, setCurrentCategories] = useState<Set<string>>(new Set())

    useEffect(() => {
        const newCategories = new Set<string>()
        inventoryData.forEach((item) => {
            if (typeof item.category === "string") {
                if (!newCategories.has(item.category)) {
                    newCategories.add(item.category)
                }
            } else {
                item.category.forEach((category) => {
                    if (!newCategories.has(category)) {
                        newCategories.add(category)
                    }
                })
            }
        })
        setCurrentCategories(newCategories)
    }, [inventoryData])

    if (isPending) { return 'Loading...' }
    if (error) { return `error: ${error}` }

    return <div className="flex flex-col w-[90%] h-fit mx-auto md:my-2">
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
        {addItem && <AddItem categories={currentCategories} />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-h-fit border-black border-2 my-2 shadow-gray-400 shadow-lg">
            {inventoryData?.map((item: Item, index) => {
                return <DisplayItem key={index} item={item} />
            })}
        </div>
    </div>
}

interface AddItemProps {
    categories: Set<string>
}
function AddItem({ categories }: AddItemProps) {
    const [item, setItem] = useState<Item>({
        name: "",
        price: 0,
        category: [],
        options: {},
        quantity: 0,
        description: "",
        photos: [],
        reviews: []
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
                <div className="flex flex-col md:flex-row">
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
                    <div className="flex flex-col my-4 md:my-auto ml-2 md:mx-auto space-y-4">
                        <DisplayCategories categories={categories} />
                        <DisplayOptions item={item} setItem={setItem} />
                    </div>
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

interface DisplayCategoriesProps {
    categories: Set<string>
}

function DisplayCategories({ categories }: DisplayCategoriesProps) {

    return <div className="flex flex-col border-black border-2 w-fit p-1">
        <p>Categories</p>
        <div className="grid grid-cols-3 gap-2">
            {Array.from(categories)?.map((category, index) => {
                return <DisplayCategory key={index} category={category} />
            })}
        </div>
    </div>
}

interface DisplayCategoryProps {
    category: string
}

function DisplayCategory({ category }: DisplayCategoryProps) {
    return <div className="border-black border-1 p-0.5">
        <p>{category}</p>
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

    return <div className="flex flex-col pl-2 w-fit border-black border-2 p-2">
        <p>Options</p>
        <p>Enter Option</p>
        <div className="flex flex-row flex-wrap space-x-4">
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
    setItem?: (item: Item) => void,
    setPhotos?: React.Dispatch<React.SetStateAction<string[]>>;
}

function PhotoUpload({ item, setItem, setPhotos }: PhotoUploadProps) {
    const [photoUrl, setPhotoUrl] = useState<string>('')

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

            if (setItem) {
                const currentItem = { ...item }
                currentItem.photos.push(res.data.imageUrl)
                setItem({ ...currentItem })
            } else if (setPhotos) {
                setPhotos((prevPhotos) => [...prevPhotos, res.data.imageUrl])
            }
            setPhotoUrl(res.data.imageUrl)
            event.target.value = ""
        } catch (error) {
            console.error(error)
        }
    }

    const handleFileRemove = () => {
        const url = photoUrl

        if (setItem) {
            const currentItem = { ...item }
            const filteredPhotos = currentItem.photos.filter((currUrl) => currUrl != url)
            currentItem.photos = filteredPhotos
            setItem(currentItem)
        } else if (setPhotos) {
            setPhotos((prevPhotos) => {
                return prevPhotos.filter((photo) => photo != url)
            })
        }

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
    return <div className={modify ? "flex flex-col h-fit justify-center items-center border-black border-2 pb-1" : "flex flex-col h-fit justify-center items-center border-black border-2 pb-1 py-2"}>
        <div className={modify ? "flex flex-col w-[70%]  my-2 font-regular" : "flex flex-col w-[70%] h-fit justify-center font-regular"}>
            {modify ?
                <ModifyItem item={item} /> : <>
                    <img src={item?.photos[0]} className="border-2 border-black" ></img>
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

function ModifyItem({ item }: DisplayItemProps) {
    const [photos, setPhotos] = useState<string[]>([])
    const [modifiedItem, setModifiedItem] = useState<Item>(item)

    const handleItemChange = (property: keyof Item, value: string | string[] | number) => {
        setModifiedItem({
            ...modifiedItem,
            [property]: value
        })
    }

    useEffect(() => {
        handleItemChange('photos', photos)
    }, [photos])

    const queryClient = useQueryClient()

    const mutation = useMutation(
        {
            mutationFn: async (updatedItem: Item) => {
                const response = await axios.put(`http://localhost:5000/inventory/item/${item.name}`, { item: updatedItem, oldCategory: item.category })
                console.log(response)
                return response.data
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['inventory'] })
                queryClient.invalidateQueries({ queryKey: ['inventory', item.category] })
                queryClient.invalidateQueries({ queryKey: [item.name] })
                window.alert('item updated')
            }
        }
    )

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        console.log('running')
        mutation.mutate(modifiedItem)
    }

    return <form onSubmit={(event) => onSubmit(event)}>
        <p>Item Name</p>
        <input type="text" className="border-black border-2" value={modifiedItem.name} onChange={(event) => handleItemChange('name', event.target.value)}></input>
        <p>Item Price</p>
        <input type="text" className="border-black border-2" value={modifiedItem.price} onChange={(event) => handleItemChange('price', event.target.value)}></input>
        <p>Quantity</p>
        <input type="text" className="border-black border-2 w-10" value={modifiedItem.quantity} onChange={(event) => handleItemChange('quantity', event.target.value)}></input>
        <p>Category</p>
        <input type="text" className="border-black border-2" value={modifiedItem.category} onChange={(event) => handleItemChange('category', event.target.value)}></input>
        <p>Description</p>
        <textarea className="resize:none border-black border-2 w-full h-40" value={modifiedItem.description} onChange={(event) => handleItemChange('description', event.target.value)}></textarea>
        <PhotoUpload item={item} setPhotos={setPhotos} />
        <button type="submit" className="w-full border-black border-1">Submit Changes</button>
    </form>
}