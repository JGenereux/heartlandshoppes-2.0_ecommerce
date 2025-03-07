import { Route, Routes } from "react-router-dom"
import Home from "./Home/Home"
import Shop from "./Shop/Shop"
import About from "./About/About"
import Contact from "./Contact/Contact"
import Inventory from "./Inventory/Inventory"
import Login from "./Login/Login"
import ItemPage from "./Shop/ItemPage"
import Signup from "./Login/Signup"
import Settings from "./Settings"


function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop/*" element={<Shop />} />
      <Route path="/shop/item/:name" element={<ItemPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App
