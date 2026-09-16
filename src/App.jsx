import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import AboutAravalli from "./pages/AboutAravalli.jsx";
import AboutFPC from "./pages/AboutFPC.jsx";
import Products from "./pages/Products.jsx";
import HowWeWork from "./pages/HowWeWork.jsx";
import WhyPartner from "./pages/WhyPartner.jsx";
import BuyerEnquiry from "./pages/BuyerEnquiry.jsx";
import Contact from "./pages/Contact.jsx";

// Admin Portal Components & Pages
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminProductsList from "./pages/admin/AdminProductsList.jsx";
import AdminProductForm from "./pages/admin/AdminProductForm.jsx";
import AdminEnquiries from "./pages/admin/AdminEnquiries.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes (Preserved Phase 1A Design & Structure) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about-aravalli" element={<AboutAravalli />} />
            <Route path="/about-fpc" element={<AboutFPC />} />
            <Route path="/products" element={<Products />} />
            <Route path="/how-we-work" element={<HowWeWork />} />
            <Route path="/why-partner" element={<WhyPartner />} />
            <Route path="/buyer-enquiry" element={<BuyerEnquiry />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductsList />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
