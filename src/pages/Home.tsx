import { useState, useEffect } from "react";
import {
  ArrowRight,
  Search,
  Star,
  Users,
  Home as HomeIcon,
  Clock,
  ChevronRight,
  MapPin,
  Check,
  BookOpen,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import TestimonialsSlider from "../components/TestimonialsSlider";
import FAQAccordion from "../components/FAQAccordion";
import AgentQuestionnaire, {
  QuestionnaireData,
} from "../components/AgentQuestionnaire";
import styles from "../styles/Footer.module.css";
import { TestimonialsCard } from "../components";
import { getCityFromUrl } from "../utils/urlUtils";

const features = [
  { text: "100% free" },
  { text: "Takes just 1 minute" },
  { text: "No strings attached" },
];

export default function Home() {
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial checks
    handleResize();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleQuestionnaireSubmit = (data: QuestionnaireData) => {
    console.log("Questionnaire submitted:", data);
  };

  const handleFindAgentClick = () => {
    setIsQuestionnaireOpen(true);
  };

  return (
    <div className="min-h-screen" style={{ marginTop: "-64px" }}>
      <AgentQuestionnaire
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        onSubmit={handleQuestionnaireSubmit}
      />

      {/* Hero Section - Optimized for mobile */}
      <div
        className="relative min-h-screen overflow-hidden bg-center bg-cover"
        style={{
          backgroundImage: 'url("/bg.jpg")',
          paddingTop: "64px",
          // backgroundAttachment: isMobile ? 'scroll' : 'fixed' // Remove fixed background on mobile for better performance
        }}
      >
        <div className="absolute inset-0 from-black/70 via-black/50 to-black/60" />
        <div className="relative flex flex-col min-h-screen">
          <div className="grid w-full grid-cols-1 gap-4 px-4 py-6 mx-auto lg:grid-cols-2 md:flex-row max-w-7xl md:gap-8 md:py-8 md:h-screen sm:px-6">
            <div
              className="text-white w-full max-w-[55rem] text-left px-0 sm:px-4 mt-2 space-y-4 md:space-y-8"
              style={{ letterSpacing: "1px" }}
            >
              <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:mb-6 md:text-7xl ">
                Find the best listing agent{" "}
              </h1>
              <p className="mb-6 text-base font-light sm:text-xl md:text-2xl">
                We negotiate so you don't have to - get the best realtor while
                paying less commissions.
              </p>
              <div className="flex flex-col items-start gap-3 mb-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <div className="p-1 bg-white rounded-full">
                      <Check className="w-4 h-4 text-black sm:h-6 sm:w-6" />
                    </div>
                    <span className="text-sm sm:text-xl">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-[100%] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 sm:p-6 h-auto min-h-[500px] sm:h-[640px] md:h-[640px] mb-[30px] sm:mb-[100px] border border-white/20">
              <div className="h-full overflow-y-auto">
                <AgentQuestionnaire
                  isOpen={true}
                  onClose={() => {}}
                  onSubmit={handleQuestionnaireSubmit}
                  embedded={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Optimized for all screens */}
      <div className="py-12 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="relative inline-block w-full mx-auto mb-6 text-xl font-bold text-center sm:text-3xl text-secondary sm:mb-12 lg:mb-20">
            <span className="relative inline-block text-3xl sm:text-4xl lg:text-5xl">
              How It Works
              <span className="absolute w-12 h-1 transform -translate-x-1/2 rounded-full -bottom-5 left-1/2 sm:w-20 bg-primary"></span>
            </span>
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 lg:gap-8">
            <div className="flex flex-col">
              <div className="flex flex-col justify-between h-full p-5 text-center bg-white border border-gray-100 shadow-lg rounded-xl sm:p-8 group">
                <div>
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-xl font-bold text-white rounded-full bg-primary sm:w-16 sm:h-16 sm:mb-6">
                    1
                  </div>
                  <h3 className="mb-4 text-lg font-bold text-gray-900 sm:text-2xl lg:text-xl xl:text-2xl">
                    Take a Quick Quiz
                  </h3>
                  <p className="text-base text-gray-600 lg:text-sm xl:text-base">
                    Answer a few simple questions about your home and selling
                    goals to help us understand your needs
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-col justify-between h-full p-5 text-center bg-white border border-gray-100 shadow-lg rounded-xl sm:p-8 group">
                <div>
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-xl font-bold text-white rounded-full bg-primary sm:w-16 sm:h-16 sm:mb-6">
                    2
                  </div>
                  <h3 className="mb-4 text-lg font-bold text-gray-900 sm:text-2xl lg:text-xl xl:text-2xl">
                    Get a Personalized Agent List
                  </h3>
                  <p className="text-base text-gray-600 lg:text-sm xl:text-base">
                    We match you with top-rated realtors in your area, tailored
                    to your preferences and requirements
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:col-span-2 lg:col-span-1">
              <div className="flex flex-col justify-between h-full p-5 text-center bg-white border border-gray-100 shadow-lg rounded-xl sm:p-8 group">
                <div>
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-xl font-bold text-white rounded-full bg-primary sm:w-16 sm:h-16 sm:mb-6">
                    3
                  </div>
                  <h3 className="mb-4 text-lg font-bold text-gray-900 sm:text-2xl lg:text-xl xl:text-2xl">
                    Connect & Save on Commission
                  </h3>
                  <p className="text-base text-gray-600 lg:text-sm xl:text-base">
                    Choose a pre-vetted realtor with pre-negotiated commissions,
                    so you get the best deal without the hassle
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Testimonials */}
      <div id="reviews_section" className="py-16 bg-white sm:py-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="relative inline-block w-full mx-auto mb-8 text-2xl font-bold text-center sm:text-3xl text-secondary sm:mb-10 lg:mb-20">
            <span className="relative inline-block text-[2.5rem] leading-[2.6rem]">
              Homeowners Love AceRealtors
              <span className="absolute w-16 h-1 transform -translate-x-1/2 rounded-full -bottom-5 left-1/2 sm:w-20 bg-primary"></span>
            </span>
          </h2>

          <div>
            <TestimonialsCard />
          </div>
        </div>
      </div>

      {/* Find Local Agents */}
      <div className="py-5 xxs:py-10 sm:py-24 bg-gradient-to-r from-white to-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 md:grid-cols-2 sm:gap-12">
            <div className="order-2 md:order-1">
              <h2 className="mb-4 text-2xl font-bold sm:text-4xl text-secondary sm:mb-6">
                The right realtor makes all the difference, we handpick one for
                you.
              </h2>
              <p className="mb-6 text-base leading-relaxed text-gray-600 sm:text-xl sm:mb-8">
                Not all realtors are equal. A bad one can leave your home unsold
                for months, while a top agent prices, markets, and sells fast.
                We connect you with the best, so you don't waste time.
              </p>

              <div className="mt-6 sm:mt-8">
                <button
                  onClick={handleFindAgentClick}
                  className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium text-white transition-all duration-300 rounded-lg w-fit bg-gradient-to-r from-primary to-primary/90 sm:py-4 hover:shadow-lg hover:shadow-primary/20 sm:text-base"
                >
                  Find an Agent
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                </button>
              </div>
            </div>

            <div className="relative order-1 group md:order-2">
              <div className="absolute transition duration-500 opacity-50 -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur group-hover:opacity-100"></div>
              <div className="relative">
                <img
                  src="/usp1.jpg"
                  alt="Happy family in their new home"
                  className="rounded-xl shadow-xl h-[250px] sm:h-[350px] md:h-auto w-full object-cover "
                />
                <div className="absolute p-3 shadow-lg bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm sm:p-5 rounded-xl">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 border-2 rounded-full bg-primary/10 sm:w-14 sm:h-14 border-primary/20">
                      <span className="text-base font-bold sm:text-xl text-primary">
                        MD
                      </span>
                    </div>
                    <div>
                      <div className="flex mb-1 text-primary">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-current sm:w-4 sm:h-4"
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 sm:text-sm line-clamp-3">
                        "We didn't want to waste time with the wrong realtor,
                        and AceRealtors made sure we didn't. The agent they
                        connected us with sold our home fast and for a great
                        price!"
                      </p>
                      <p className="mt-1 text-xs font-semibold sm:text-sm text-secondary">
                        Megan D. from Florida
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Testimonial */}
      <div className="py-5 xxs:py-10 sm:py-24 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 md:items-start md:grid-cols-2 lg:gap-12">
            <div className="relative group">
              <div className="absolute transition duration-500 opacity-50 -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur group-hover:opacity-100"></div>
              <div className="relative">
                <div className="overflow-hidden shadow-xl image-container rounded-xl">
                  <img
                    src="/usp2.webp"
                    alt="Happy family enjoying their new home"
                    className="w-full h-[250px] sm:h-[350px] md:h-[400px] object-cover transform "
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center h-full content-wrapper">
              <h2 className="mb-4 text-2xl font-bold sm:text-4xl text-secondary sm:mb-6">
                When you save on commissions, we win.
              </h2>
              <p className="mb-6 text-base leading-relaxed text-gray-600 sm:text-xl sm:mb-8">
                At AceRealtors, we've already done the hard work—negotiating
                lower commission rates with top realtors in your area. That
                means you get the best agents without overpaying. More money in
                your pocket, less stress on your plate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 sm:py-16 bg-gradient-to-br from-primary to-primary/80">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 lg:gap-12">
            {/* First Stat */}
            <div className="relative px-6 py-6 text-center backdrop-blur-sm rounded-xl">
              <h3 className="mb-3 text-3xl font-bold text-white sm:text-4xl md:text-6xl sm:mb-4">
                800+
              </h3>
              <p className="text-lg sm:text-xl text-white/80">
                Top 1% Agents Across US
              </p>
              <div className="absolute bottom-0 w-2/3 h-px -translate-x-1/2 left-1/2 bg-white/20 lg:hidden"></div>
            </div>

            {/* Second Stat */}
            <div className="relative px-6 py-6 text-center backdrop-blur-sm rounded-xl">
              <h3 className="mb-3 text-3xl font-bold text-white sm:text-4xl md:text-6xl sm:mb-4">
                $13.2 M
              </h3>
              <p className="text-lg sm:text-xl text-white/80">
                Commissions Saved
              </p>
              <div className="absolute bottom-0 w-2/3 h-px -translate-x-1/2 left-1/2 bg-white/20 lg:hidden"></div>
            </div>

            {/* Third Stat */}
            <div className="px-6 py-6 text-center backdrop-blur-sm rounded-xl sm:col-span-2 lg:col-span-1">
              <h3 className="mb-3 text-3xl font-bold text-white sm:text-4xl md:text-6xl sm:mb-4">
                4500+
              </h3>
              <p className="text-lg sm:text-xl text-white/80">Happy Sellers</p>
            </div>
          </div>
        </div>
      </div>

      {/* More Resources - Mobile optimized grid */}
      <div id="more-resources" className="py-12 bg-white sm:py-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-6 text-center sm:mb-12">
            <h2
              className="relative inline-block mb-2 text-xl font-bold text-center sm:text-3xl text-secondary"
              style={{ fontSize: "2.5rem" }}
            >
              More Resources
              <span className="absolute w-12 h-1 transform -translate-x-1/2 rounded-full -bottom-2 left-1/2 sm:w-16 bg-primary"></span>
            </h2>
            <p className="mx-auto mt-4 text-sm text-center text-gray-600 sm:text-xl">
              Explore our guides and insights to help you navigate the real
              estate market.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {/* Only show first 3 blog cards on mobile */}
            <div>
              <Link to="/blog/market-trends" className="block group">
                <div className="h-full overflow-hidden border border-gray-100 shadow-md bg-gray-50 rounded-xl">
                  <div className="overflow-hidden">
                    <img
                      src="/blog1.jpg"
                      alt="Real Estate Market Trends"
                      className="object-cover w-full h-36 sm:h-48"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-primary">
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Market Analysis</span>
                    </div>
                    <h3 className="mb-2 text-base font-semibold transition-colors duration-300 sm:text-xl group-hover:text-primary line-clamp-2">
                      Real Estate Market Trends & Property Valuation
                    </h3>
                    <p className="mb-3 text-xs text-gray-600 sm:text-sm line-clamp-2 sm:line-clamp-3">
                      Learn how to analyze market trends and determine the right
                      price for your property.
                    </p>
                    <div className="flex justify-end">
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary sm:text-sm">
                        Read More
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div>
              <Link to="/blog/mortgage-financing" className="block group">
                <div className="h-full overflow-hidden border border-gray-100 shadow-md bg-gray-50 rounded-xl">
                  <div className="overflow-hidden">
                    <img
                      src="/blog2.jpg"
                      alt="Mortgage & Financing"
                      className="object-cover w-full h-36 sm:h-48"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-primary">
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Home Financing</span>
                    </div>
                    <h3 className="mb-2 text-base font-semibold transition-colors duration-300 sm:text-xl group-hover:text-primary line-clamp-2">
                      Mortgage & Financing Options Guide
                    </h3>
                    <p className="mb-3 text-xs text-gray-600 sm:text-sm line-clamp-2 sm:line-clamp-3">
                      Navigate the complex world of home loans and financing
                      options.
                    </p>
                    <div className="flex justify-end">
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary sm:text-sm">
                        Read More
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div>
              <Link to="/blog/legal-tax" className="block group">
                <div className="h-full overflow-hidden border border-gray-100 shadow-md bg-gray-50 rounded-xl">
                  <div className="overflow-hidden">
                    <img
                      src="/blog3.jpg"
                      alt="Legal and Tax Considerations"
                      className="object-cover w-full h-36 sm:h-48"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-primary">
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Legal & Tax Guide</span>
                    </div>
                    <h3 className="mb-2 text-base font-semibold transition-colors duration-300 sm:text-xl group-hover:text-primary line-clamp-2">
                      Legal & Tax Considerations in Real Estate
                    </h3>
                    <p className="mb-3 text-xs text-gray-600 sm:text-sm line-clamp-2 sm:line-clamp-3">
                      Essential legal and tax knowledge for property
                      transactions.
                    </p>
                    <div className="flex justify-end">
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary sm:text-sm">
                        Read More
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Hidden on mobile, visible on SM+ screens */}
            <div className="hidden sm:block">
              <Link to="/blog/home-inspection" className="block group">
                <div className="h-full overflow-hidden border border-gray-100 shadow-md bg-gray-50 rounded-xl">
                  <div className="overflow-hidden">
                    <img
                      src="/blog4.jpg"
                      alt="Home Inspection and Appraisal"
                      className="object-cover w-full h-48"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-sm text-primary">
                      <BookOpen className="w-4 h-4" />
                      <span>Buyer's Guide</span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold transition-colors duration-300 group-hover:text-primary line-clamp-2">
                      Home Inspection & Appraisal Guide
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                      Understanding these crucial steps in real estate
                      transactions.
                    </p>
                    <div className="flex justify-end">
                      <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                        Read More
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Hidden on mobile and tablet, visible on LG+ screens */}
            <div className="hidden lg:block">
              <Link to="/blog/real-estate-agent" className="block group">
                <div className="h-full overflow-hidden border border-gray-100 shadow-md bg-gray-50 rounded-xl">
                  <div className="overflow-hidden">
                    <img
                      src="/blog5.jpg"
                      alt="Real Estate Agent Role"
                      className="object-cover w-full h-48"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-sm text-primary">
                      <BookOpen className="w-4 h-4" />
                      <span>Agent Guide</span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold transition-colors duration-300 group-hover:text-primary line-clamp-2">
                      The Role of a Real Estate Agent
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                      Learn how real estate agents streamline transactions,
                      maximize profits, and implement winning strategies for
                      selling your home.
                    </p>
                    <div className="flex justify-end">
                      <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                        Read More
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="hidden lg:block">
              <Link to="/blog/social-media-marketing" className="block group">
                <div className="h-full overflow-hidden border border-gray-100 shadow-md bg-gray-50 rounded-xl">
                  <div className="overflow-hidden">
                    <img
                      src="/blog6.jpg"
                      alt="Social Media Marketing in Real Estate"
                      className="object-cover w-full h-48"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-sm text-primary">
                      <BookOpen className="w-4 h-4" />
                      <span>Digital Marketing</span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold transition-colors duration-300 group-hover:text-primary line-clamp-2">
                      Staging Your Home Like a Pro
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                      Learn how proper staging can showcase your home's
                      potential, attract more buyers, and maximize your selling
                      price.
                    </p>
                    <div className="flex justify-end">
                      <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                        Read More
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex justify-center mt-6 sm:mt-12">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 px-5 py-2 text-sm text-white rounded-lg bg-gradient-to-r from-primary to-primary/90 sm:px-8 sm:py-3 sm:text-base"
            >
              View All Blogs
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 sm:py-20 md:py-28 bg-gray-50">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
          <h2 className="mb-10 text-3xl font-bold text-center text-secondary">
            Frequently Asked Questions
          </h2>
          <FAQAccordion />
        </div>
      </div>

      <div className="relative py-12 overflow-hidden sm:py-20 md:py-24 bg-[#374151]">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="relative px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-5xl sm:mb-6">
            Ready to save big on commissions?
          </h2>
          <p className="max-w-2xl mx-auto mb-6 text-base text-gray-300 sm:text-xl sm:mb-8">
            Let our expert agents help you navigate the real estate market.
          </p>
          <button
            onClick={handleFindAgentClick}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-colors bg-orange-500 rounded-lg shadow-xl sm:px-8 sm:py-4 sm:text-lg hover:bg-orange-600 hover:shadow-2xl shadow-black/10"
          >
            Find an Agent
            <ArrowRight className="w-4 h-4 sm:h-5 sm:w-5 animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
}
