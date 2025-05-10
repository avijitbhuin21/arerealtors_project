import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SellProperty from "./pages/SellProperty";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminLogin from "./pages/adminlogin";
import AdminPanel from "./pages/adminpanel";
import CompareAgents from "./pages/compare_agents";
import RealEstateBlogPost from "./pages/blogpost1";
import MortgageFinancingBlogPost from "./pages/blogspot2.tsx";
import LegalTaxBlogPost from "./pages/blogspot3.tsx";
import HomeInspectionAppraisalBlogPost from "./pages/blogspot4.tsx";
import RealEstateAgentBlogPost from "./pages/blogspot5.tsx";
import SocialMediaBlogPost from "./pages/blogpost6";
import Blogs from "./pages/Blogs";
import Microsite from "./pages/microsite.tsx";
import ThankYou from "./pages/ThankYou";
import Test from "./pages/test/Test.tsx";
import Information from "./components/information/index.tsx";
import Footer from "./components/layout/Footer.tsx";

function AppContent() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/adminlogin" ||
    location.pathname === "/compare_agents" ||
    location.pathname === "/test" ||
    location.pathname === "/find-realtor" ||
    location.pathname === "/adminpanel";

  console.log("Current path:", location.pathname);
  console.log("Hide navbar:", hideNavbar);
  console.log("Component loading started");

  // Adding error boundary
  try {
    return (
      <div className="min-h-screen bg-gray-50">
        {!hideNavbar && <Navbar />}
        <main className={!hideNavbar ? "pt-16" : ""}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sell" element={<SellProperty />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/adminlogin" element={<AdminLogin />} />
            <Route path="/adminpanel" element={<AdminPanel />} />
            <Route path="/compare_agents" element={<Test />} />
            <Route path="/test" element={<Test />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route
              path="/blog/market-trends"
              element={<RealEstateBlogPost />}
            />
            <Route
              path="/blog/mortgage-financing"
              element={<MortgageFinancingBlogPost />}
            />
            <Route path="/blog/legal-tax" element={<LegalTaxBlogPost />} />
            <Route
              path="/blog/home-inspection"
              element={<HomeInspectionAppraisalBlogPost />}
            />
            <Route
              path="/blog/real-estate-agent"
              element={<RealEstateAgentBlogPost />}
            />
            <Route
              path="/blog/social-media-marketing"
              element={<SocialMediaBlogPost />}
            />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/find-realtor" element={<Microsite />} />
            <Route path="/information" element={<Information />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error in AppContent:", error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p>Something went wrong. Please try again later.</p>
      </div>
    );
  }
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
