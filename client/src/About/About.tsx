import type React from "react"

import { useState, useEffect, useRef, FormEvent } from "react"
import { Mail, MapPin, ImagePlus, Edit, X } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import Drawer from "../Navbar/Drawer"
import { useAuth } from "../Contexts/authContext"
import axios, { isAxiosError } from "axios"
import Error from "../Loading/Error"
const apiUrl = import.meta.env.VITE_API_URL;

// Custom Modal Component
function Modal({
    isOpen,
    onClose,
    title,
    children,
}: {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}) {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Prevent body scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }

        // Close on escape key
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }

        window.addEventListener("keydown", handleEscape)
        return () => {
            document.body.style.overflow = ""
            window.removeEventListener("keydown", handleEscape)
        }
    }, [isOpen, onClose])

    // Close when clicking outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleBackdropClick}>
            <div
                ref={modalRef}
                className="bg-background rounded-lg shadow-lg w-full max-w-md md:max-w-xl max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    )
}

export default function About() {
    return (
        <div>
            <Drawer />
            <AboutPage />
        </div>
    )
}

// Define the Partner type
interface Partner {
    id: string
    name: string
    location: string
    description: string
}

interface Message {
    name: string,
    email: string,
    message: string
}

function AboutPage() {
    const { user } = useAuth()

    // Modal states
    const [imagesModalOpen, setImagesModalOpen] = useState(false)

    // Image slider state
    const [currentImage, setCurrentImage] = useState(0)
    const [images, setImages] = useState([
        "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556760544-74068565f05c?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1464316325666-63beaf639dbb?q=80&w=1200&auto=format&fit=crop",
    ])
    const [newImageUrl, setNewImageUrl] = useState("")
    const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)

    // About section state
    const [aboutText] = useState([
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue. Nullam id dolor id nibh ultricies vehicula ut id elit. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.",
        "Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.",
    ])

    // Partners state
    const [partners] = useState<Partner[]>([
        {
            id: "1",
            name: "mbym Knitwear",
            location: "Medicine Hat, AB",
            description:
                "I have recently partnered with 'nbym Knitware'. Debbie, a local knitter in my community of Medicine Hat, designs and creates knitted apparel and giftware.",
        },
    ])

    const [message, setMessage] = useState<Message>({
        name: "", email: "", message: ""
    })
    const [error, setError] = useState("")
    const [messageSent, setMessageSent] = useState<boolean>(false)

    // Auto-rotate images
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
        }, 5000)
        return () => clearInterval(interval)
    }, [images.length])

    // Manual navigation
    const goToImage = (index: number) => {
        setCurrentImage(index)
    }

    // Add a new image
    const addImage = () => {
        if (newImageUrl.trim()) {
            setImages([...images, newImageUrl])
            setNewImageUrl("")
        }
    }

    // Update an existing image
    const updateImage = () => {
        if (editingImageIndex !== null && newImageUrl.trim()) {
            const newImages = [...images]
            newImages[editingImageIndex] = newImageUrl
            setImages(newImages)
            setNewImageUrl("")
            setEditingImageIndex(null)
        }
    }

    // Start editing an image
    const startEditingImage = (index: number) => {
        setEditingImageIndex(index)
        setNewImageUrl(images[index])
    }

    // Remove an image
    const removeImage = (index: number) => {
        if (images.length > 1) {
            const newImages = [...images]
            newImages.splice(index, 1)
            setImages(newImages)
            if (currentImage >= newImages.length) {
                setCurrentImage(newImages.length - 1)
            }
        }
    }

    const handleChangeMessage = (property: keyof Message, value: string) => {
        setMessage((prevMessage) => ({
            ...prevMessage,
            [property]: value
        }))
    }

    const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (message.email.length === 0 || message.name.length === 0 || message.message.length === 0) {
            setError("All inputs must be filled before sending inquiry")
            return
        }

        try {
            const res = await axios.post(`${apiUrl}/email`, { userInquiry: message })
            if (res.status === 200) {
                setMessageSent(true)
            }
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                setError(error.response.data)
            }
        }
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {(error && error.length > 0) && <Error message={error} />}
            <div className="max-w-4xl mx-auto">
                {/* Image Slider with Edit Button */}
                <div className="relative mb-8">
                    <div className="relative h-[400px] rounded-lg overflow-hidden">
                        {images.map((src, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ${currentImage === index ? "opacity-100" : "opacity-0"
                                    }`}
                            >
                                <img
                                    src={src || "https://via.placeholder.com/1200x400"}
                                    alt={`Handmade product image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            </div>
                        ))}

                        {/* Image navigation dots */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToImage(index)}
                                    className={`w-3 h-3 rounded-full ${currentImage === index ? "bg-white" : "bg-white/50"}`}
                                    aria-label={`Go to image ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Edit Images Button */}
                    {user && user.role === "admin" && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
                            onClick={() => setImagesModalOpen(true)}
                        >
                            <ImagePlus className="w-4 h-4 mr-2" />
                            Edit Images
                        </Button>
                    )}

                    {/* Images Modal */}
                    <Modal isOpen={imagesModalOpen} onClose={() => setImagesModalOpen(false)} title="Manage Slider Images">
                        <div className="py-4">
                            <div className="grid gap-4 mb-4">
                                <Label>Current Images</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {images.map((src, index) => (
                                        <div key={index} className="relative group rounded-md overflow-hidden border">
                                            <img
                                                src={src || "https://via.placeholder.com/120x80"}
                                                alt={`Image ${index + 1}`}
                                                className="object-cover w-full h-20"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-white"
                                                    onClick={() => startEditingImage(index)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-white"
                                                    onClick={() => removeImage(index)}
                                                    disabled={images.length <= 1}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <Label htmlFor="imageUrl">
                                    {editingImageIndex !== null ? `Update Image ${editingImageIndex + 1}` : "Add New Image"}
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="imageUrl"
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        placeholder="Enter image URL"
                                        className="flex-1"
                                    />
                                    <Button onClick={editingImageIndex !== null ? updateImage : addImage}>
                                        {editingImageIndex !== null ? "Update" : "Add"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Modal>
                </div>

                {/* Tagline */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold">Everything made from the Heart. Handmade with love.</h2>
                </div>

                {/* About Store Section */}
                <div className="mb-16">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold">About HeartlandShoppes</h2>
                    </div>

                    <div className="prose max-w-none">
                        {aboutText.map((paragraph, index) => (
                            <p key={index} className={`text-muted-foreground ${index > 0 ? "mt-4" : ""}`}>
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Production Partners Section */}
                <div>
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold">Our Production Partners</h2>
                    </div>

                    <div className="grid gap-8">
                        {partners.map((partner) => (
                            <div key={partner.id} className="border rounded-lg p-6">
                                <h3 className="text-xl font-bold mb-1">{partner.name}</h3>
                                <p className="text-primary font-medium mb-3">{partner.location}</p>
                                <p className="text-muted-foreground">{partner.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <section className="pt-16 pb-4 border-t border-gray-200 mt-16" id="contact">
                    <div className="bg-muted rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-2">Contact Me</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-primary">Get In Touch</h3>
                                <p className="text-muted-foreground mb-6">
                                    Have questions about my products or interested in custom orders? Feel free to reach out!
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Mail className="w-5 h-5 mr-3 text-primary" />
                                        <span>heartlandshoppes@gmail.com</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="w-5 h-5 mr-3 text-primary" />
                                        <span>Medicine Hat, Alberta</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-background rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-semibold mb-4 text-primary">Send a Message</h3>
                                <form className="space-y-4" onSubmit={sendMessage}>
                                    <div>
                                        <label htmlFor="contactName" className="block text-sm font-medium text-muted-foreground mb-1">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="contactName"
                                            value={message.name}
                                            onChange={(e) => handleChangeMessage('name', e.target.value)}
                                            className="w-full bg-muted/50 border border-input rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="contactEmail" className="block text-sm font-medium text-muted-foreground mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="contactEmail"
                                            value={message.email}
                                            onChange={(e) => handleChangeMessage('email', e.target.value)}
                                            className="w-full bg-muted/50 border border-input rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="contactMessage" className="block text-sm font-medium text-muted-foreground mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            id="contactMessage"
                                            rows={4}
                                            value={message.message}
                                            onChange={(e) => handleChangeMessage('message', e.target.value)}
                                            className="w-full bg-muted/50 border border-input rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                                        ></textarea>
                                    </div>
                                    <button
                                        type={messageSent ? "button" : "submit"}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors"
                                    >
                                        {messageSent ? 'Message Sent' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}





