import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminDashboard from "./pages/AdminDashboard";
import Footer from "./components/layout/Footer";
import QuickViewModal from "./components/ui/QuickViewModal";
import CartDrawer from "./components/cart/CartDrawer";
import ScrollToTop from "./components/ui/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#08080d] text-white selection:bg-amber-400 selection:text-black overflow-x-hidden w-full max-w-full">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <Footer />
        <QuickViewModal />
        <CartDrawer />
        <ScrollToTop />
      </div>
    </AuthProvider>
  );
}

export default App;
