import { FormEvent, useEffect, useState } from "react";
import Drawer from "../Navbar/Drawer";
import uploadPhotoICON from '../assets/uploadPhotoICON.png'
import { Item } from "../interfaces/iteminterface";
import axios from 'axios'
import FormData from "form-data";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Orders from "./Orders";
import Loading from "../Loading/Loading";

export default function Inventory() {
    return (
        <div className="h-screen">
            <Drawer />
            <Dashboard />
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
    return <div className="flex flex-row h-fit p-2 w-full border-black border-b-2 items-center pl-4 space-x-6 font-button">
        <button className="cursor-pointer hover:text-blue-500 transition-colors duration-300" onClick={() => setDashboardOption('inventory')}>Inventory</button>
        <button className="cursor-pointer hover:text-blue-500 transition-colors duration-300" onClick={() => setDashboardOption('orders')}>Orders</button>
    </div>
}

function DisplayInventory() {
    const { isPending, isFetching, error, data: inventoryData = [] } = useQuery<Item[], Error>({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await axios.get<Item[]>('http://localhost:5000/inventory')
            return res.data
        },
        staleTime: 60 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 45 * 1000
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

    if (error) { return `error: ${error}` }

    return <div className="flex flex-col w-[90%] h-fit mx-auto md:my-2">
        <div className="flex flex-row flex-wrap w-full">
            <div>
                <h3 className="text-2xl font-headerFont">Current Inventory</h3>
                <button className="self-end border-black border-2 px-2 py-1 rounded-full font-button cursor-pointer" onClick={() => setAddItem((add) => !add)}>{addItem ? 'Go Back' : 'Add to inventory'}</button>
            </div>
            <div className="flex flex-row items-center ml-auto space-x-1">
                <p className="text-xl">Category: </p>
                <select className="border-black border-2 p-0.5 rounded-lg font-button">
                    <option>All</option>
                </select>
            </div>
        </div>
        {addItem && <AddItem categories={currentCategories} />}
        {isFetching || isPending ? <div className="flex flex-col w-full items-center justify-center p-12 space-y-1.5">
            <p className="font-regular font-bold text-xl">Loading Shop Items</p>
            <Loading />
        </div> :
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 overflow-y-auto max-h-116 border-black border-2 my-2 shadow-gray-400 shadow-lg">
                {inventoryData?.map((item: Item, index) => {
                    return <DisplayItem key={index} item={item} />
                })}
            </div>
        }
    </div>
}

interface DeleteMutationProps {
    itemName: string
}

interface DisplayItemProps {
    item: Item
}

function DisplayItem({ item }: DisplayItemProps) {

    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: async ({ itemName }: DeleteMutationProps) => {
            await axios.delete(`http://localhost:5000/inventory/item/${itemName}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] })
            queryClient.invalidateQueries({ queryKey: ['inventory', item.category] })
            queryClient.invalidateQueries({ queryKey: [item.name] })
            window.location.reload()
        }
    })

    const handleItemDelete = () => {
        deleteMutation.mutate({ itemName: item.name })
    }


    const [modify, setModify] = useState(false)
    return <div className={modify ? "flex flex-col h-fit justify-center items-center border-black border-2 pb-1" : "flex flex-col h-fit items-center border-black border-2 pb-1 py-6"}>
        <div className={modify ? "flex flex-col w-[80%]  my-2 font-regular" : "flex flex-col w-[70%] justify-center font-regular"}>
            {modify ?
                <ModifyItem item={item} /> : <>
                    <img src={item?.photos[0]} className="border-2 border-black  w-full h-[250px] object-contain " ></img>
                    <div>
                        <p>{item.name}</p>
                        <p>{item.price}</p>
                        <p>{item.quantity}</p>
                        <p>{item.category}</p>
                        <p>{item.description}</p>
                        <div className="grid grid-cols-2">
                            {Object.keys(item.options).map((option) => {
                                return <label key={option}>
                                    {option}
                                    {item.options[option].map((value) => {
                                        return <p className="ml-2">{value}</p>
                                    })}
                                </label>
                            })}
                        </div>
                    </div>
                </>}
            <div className="flex flex-row justify-between w-full">
                <button className="bg-actionColor text-white p-1 rounded-md font-bold font-button cursor-pointer text-lg transition delay-100 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 my-2" onClick={() => setModify((modify) => !modify)}>{modify ? 'Return' : 'Modify'}</button>
                <button className="bg-actionColor text-white p-1 rounded-md font-bold font-button cursor-pointer text-lg transition delay-100 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 my-2" onClick={handleItemDelete}>Remove</button>
            </div>
        </div>

    </div>
}

function ModifyItem({ item }: DisplayItemProps) {
    const [photos, setPhotos] = useState<string[]>([])
    const [modifiedItem, setModifiedItem] = useState<Item>(item)

    const handleItemChange = (property: keyof Item, value: string | string[] | number) => {
        if (property === 'category' && typeof value === 'string') {
            const categories = value.split(',')
            setModifiedItem({
                ...modifiedItem,
                [property]: categories
            })
            return
        }
        setModifiedItem({
            ...modifiedItem,
            [property]: value
        })
    }

    useEffect(() => {
        handleItemChange('photos', photos)
    }, [photos])

    const queryClient = useQueryClient()

    const updateMutation = useMutation(
        {
            mutationFn: async (updatedItem: Item) => {
                const response = await axios.put(`http://localhost:5000/inventory/item/${item.name}`, { item: updatedItem, oldCategory: item.category })
                window.location.reload()
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

        updateMutation.mutate(modifiedItem)
    }

    return <div className="my-4 bg-white rounded-lg">
        <form className="space-y-6" onSubmit={onSubmit}>
            <div>
                <label htmlFor="name" className="block text-sm  text-gray-800 font-semibold">Item Name</label>
                <input
                    type="text"
                    id="name"
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={modifiedItem.name}
                    onChange={(event) => handleItemChange('name', event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="price" className="block text-sm  text-gray-800 font-semibold ">Item Price</label>
                <input
                    type="text"
                    id="price"
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={modifiedItem.price}
                    onChange={(event) => handleItemChange('price', event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="quantity" className="block text-sm  text-gray-800 font-semibold">Quantity</label>
                <input
                    type="text"
                    id="quantity"
                    className="w-32 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={modifiedItem.quantity}
                    onChange={(event) => handleItemChange('quantity', event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="category" className="block text-sm  text-gray-800 font-semibold">Category</label>
                <input
                    type="text"
                    id="category"
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={modifiedItem.category}
                    onChange={(event) => handleItemChange('category', event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="options" className="block text-sm text-gray-800 font-semibold">Options</label>
                {Object.keys(item.options).map((option) => {
                    return <DisplayItemOptions key={option} options={item.options} value={option} setModifiedItem={setModifiedItem} />

                })}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm  text-gray-800 font-semibold">Description</label>
                <textarea
                    id="description"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-40 resize-none"
                    value={modifiedItem.description}
                    onChange={(event) => handleItemChange('description', event.target.value)}
                />
            </div>
            <div className="flex items-center justify-center">
                <PhotoUpload item={item} setPhotos={setPhotos} />
            </div>
            <button
                type="submit"
                className="w-full bg-actionColor text-white py-2 px-4 rounded-md hover:bg-pink-400 cursor-pointer focus:outline-none focus:ring-2 transition-colors font-medium"
            >
                Submit Changes
            </button>
        </form>
    </div>
}

interface DisplayItemOptionsProps {
    options: Record<string, string[]>,
    value: string,
    setModifiedItem: React.Dispatch<React.SetStateAction<Item>>
}

function DisplayItemOptions({ options, value, setModifiedItem }: DisplayItemOptionsProps) {
    const [values, setValues] = useState<string[]>([])

    useEffect(() => {
        setModifiedItem((prevItem) => {
            const item = { ...prevItem }
            item.options[value] = values
            return item
        })
    }, [values])


    return <label>
        {value}
        <div className="flex flex-col space-y-2">
            {options[value].map((item, index) => {
                return <DisplayItemOption key={index} option={item} setValues={setValues} />
            })}
        </div>
    </label>
}

interface DisplayItemOption {
    option: string,
    setValues: React.Dispatch<React.SetStateAction<string[]>>
}

function DisplayItemOption({ option, setValues }: DisplayItemOption) {
    const [value, setValue] = useState(option)

    const handleValueChange = (currValue: string) => {
        setValues((tempValues) => {
            const filteredVals = tempValues.filter((val) => val === value)
            setValue(currValue)
            return [...filteredVals, currValue]
        })
    }
    return <input className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" value={value} onChange={(e) => handleValueChange(e.target.value)}></input>
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
            await axios.post('http://localhost:5000/inventory/item', { item: item })
            window.location.reload()
        } catch (error) {
            console.log(error)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>, field: keyof Item) => {
        if (field === 'category' && typeof e.target.value === 'string') {
            const categories = e.target.value.split(',')
            setItem((prevItem) => ({
                ...prevItem,
                [field]: categories
            }))
            return
        }
        const value = e.target.value;
        setItem((prevItem) => ({
            ...prevItem,
            [field]: value,
        }));
    }

    return <div className="w-full p-2 p-r-0  my-2 font-regular">
        <form onSubmit={(event) => handleAddItem(event)}>
            <div className="flex flex-col w-full">
                <div className="flex flex-col md:flex-row">
                    <div className="flex flex-col w-1/2">
                        <p>Item Name</p>
                        <input type="text" className=" border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-400 focus:border-blue-400 transition-colors border-2 pl-1 ml-2" value={item.name} onChange={(event) => handleInputChange(event, "name")}></input>
                        <p>Item Price</p>
                        <input type="text" className="border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-400 focus:border-blue-400 transition-colors border-2 pl-1 ml-2" value={item.price} onChange={(event) => handleInputChange(event, "price")}></input>
                        <p>Category</p>
                        <input type="text" className="border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-400 focus:border-blue-400 transition-colors border-2 pl-1 ml-2" value={item.category} onChange={(event) => handleInputChange(event, "category")}></input>
                        <p>Quantity</p>
                        <input type="text" className="border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-400 focus:border-blue-400 transition-colors border-2 pl-1 ml-2" value={item.quantity} onChange={(event) => handleInputChange(event, "quantity")}></input>
                        <p>Description</p>
                        <textarea className="resize-none border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-400 focus:border-blue-400 transition-colors border-2 pl-1 h-fit ml-2" value={item.description} onChange={(event) => handleInputChange(event, "description")}></textarea>
                    </div>
                    <div className="flex flex-col my-4 md:my-auto ml-2 md:mx-auto space-y-4">
                        <DisplayCategories categories={categories} />
                        <DisplayOptions item={item} setItem={setItem} />
                    </div>
                </div>
                <div className="flex flex-col mx-auto w-fit my-2">
                    <h3 className="text-2xl font-headerFont">Photos</h3>
                    <div className="grid grid-cols-3 gap-8 p-4 py-2">
                        <PhotoUpload item={item} setItem={setItem} />
                        <PhotoUpload item={item} setItem={setItem} />
                        <PhotoUpload item={item} setItem={setItem} />
                    </div>
                </div>
                <button className="border-black border-1 w-fit self-center px-4 py-2 rounded-full text-lg hover:border-blue-400 duration-300 transition-colors font-bold font-button" type="submit">Add Item to inventory</button>
            </div>
        </form>
    </div>
}

interface DisplayCategoriesProps {
    categories: Set<string>
}

function DisplayCategories({ categories }: DisplayCategoriesProps) {

    return <div className="flex flex-col w-fit">
        <p className="border-gray-800 border-3 border-b-0 shadow-gray-400 shadow-sm w-fit px-2 rounded-tr-2xl rounded-tl-2xl">Categories</p>
        {(categories && categories.size > 0) ? <div className="border-gray-800 border-3 rounded-tr-lg rounded-bl-lg rounded-br-lg grid grid-cols-3 gap-2 pl-2 py-1.5">
            {Array.from(categories)?.map((category, index) => {
                return <DisplayCategory key={index} category={category} />
            })}
        </div> : <p className="border-gray-800 border-3 p-1">No items in inventory</p>}
    </div>
}

interface DisplayCategoryProps {
    category: string
}

function DisplayCategory({ category }: DisplayCategoryProps) {
    return <div className="border-gray-400 border-2 px-2 py-1 rounded-full">
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

    return <div className="flex flex-col w-fit">
        <p className="w-fit border-gray-800 border-3 border-b-0 px-2 rounded-tr-2xl rounded-tl-2xl">Options</p>
        <div className="border-gray-800 border-3 p-2 rounded-bl-lg rounded-br-lg rounded-tr-lg">
            <p>Enter Option to add:</p>
            <div className="flex flex-row flex-wrap space-x-2">
                <input type="text" className="pl-1 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-400 focus:border-blue-400 transition-colors" value={currOption} onChange={(event) => setCurrOption(event.target.value)}></input>
                <button className="border-black border-1 px-3 rounded-full cursor-pointer" type="button" onClick={handleAddOption}>Add</button>
            </div>
            <div className="grid grid-cols-4 my-2 min-h-8 items-center p-1 gap-2">
                {Object.keys(item?.options).map((key) => (
                    <div key={key}>
                        <Option option={key} setSelectedOption={setSelectedOption} item={item} setItem={setItem} />
                    </div>
                ))}
            </div>
            {selectedOption?.length > 0 && <p>Enter values for {selectedOption}</p>}
            {Object.keys(item?.options).length > 0 && currentValues?.map((val, index) => (<Value key={index} val={val} item={item} setItem={setItem} selectedOption={selectedOption} />))}
        </div>
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
        <input type="text" className="border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-400 focus:border-blue-400 transition-colors border-2 pl-1 ml-2 w-1/4" value={option} readOnly={added && true} onChange={(event) => setOption(event.target.value)}></input>
        <button type="button" onClick={handleAddValue} className="border-black border-1 px-3 rounded-full cursor-pointer">Add</button>
        {(option?.length > 0 && added) && <button type="button" onClick={handleRemoveValue} className="border-black border-1 px-3 rounded-full cursor-pointer">Remove</button>}
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
    return <div className="cursor-pointer border-2 border-gray-400 text-center w-fit px-2 space-x-1 rounded-full transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">
        <button type="button" onClick={() => setSelectedOption(option)} className="cursor-pointer">{option}</button>
        <button className="self-end font-md cursor-pointer" onClick={handleRemoveOption} >-</button>
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

    return <div className="flex flex-col items-center justify-center transition-all duration-300 ease-in-out hover:-translate-y-1">
        {(photoUrl && photoUrl.length > 0) ?
            <div className="w-full h-full relative">
                <img src={photoUrl} className="w-48 h-44"></img>
                <button className="bg-red-500 p-0.5 pt-0 pb-0 rounded-lg absolute top-0 left-1 text-white" onClick={handleFileRemove}>-</button>
            </div>
            :
            <div className="flex flex-col p-1">
                <div style={setPhotos ? { height: 'fit' } : { width: 'fit', height: 'fit' }} className="flex flex-col relative items-center justify-center pl-2">
                    <img src={uploadPhotoICON} className="h-12 w-12"></img>
                    <input type="file" className="text-transparent w-full h-full absolute top-0 cursor-pointer" onChange={(event) => handleFileUpload(event)}></input>
                </div>
            </div>}
    </div>
}

