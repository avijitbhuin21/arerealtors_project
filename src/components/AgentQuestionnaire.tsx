import { useState, useEffect, useRef } from "react";
import { X, Plus, Minus } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { geocodeByAddress } from "react-google-places-autocomplete";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utility";
import { Check } from "lucide-react";

// Google Maps type declarations
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: typeof google.maps.places.Autocomplete;
        };
      };
    };
  }
}

// Animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideOut {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(20px); opacity: 0; }
  }

  @keyframes fadeInDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes fadeInRight {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes fadeInLeft {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes shimmer {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
  }

  .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
  .animate-fadeOut { animation: fadeOut 0.4s ease-out forwards; }
  .animate-slideIn { animation: slideIn 0.5s ease-out forwards; }
  .animate-slideOut { animation: slideOut 0.5s ease-out forwards; }
  .animate-fadeInDown { animation: fadeInDown 0.5s ease-out forwards; }
  .animate-fadeInRight { animation: fadeInRight 0.4s ease-out forwards; }
  .animate-fadeInLeft { animation: fadeInLeft 0.4s ease-out forwards; }
  .animate-pulse { animation: pulse 2s infinite; }

  .hover-scale {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .hover-scale:hover {
    transform: scale(1.02);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .shimmer-bg {
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0) 0%, 
      rgba(255, 255, 255, 0.8) 50%, 
      rgba(255, 255, 255, 0) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  /* Phone input styles */
  .phone-input-container {
    font-family: 'Inter', sans-serif;
  }
  .phone-input-container .special-label {
    display: none;
  }
  .phone-input-container .selected-flag {
    background-color: transparent !important;
    border-radius: 8px 0 0 8px !important;
    transition: all 0.3s ease;
  }
  .phone-input-container .selected-flag:hover,
  .phone-input-container .selected-flag:focus {
    background-color: rgba(234, 88, 12, 0.05) !important;
  }
  .phone-input-container .country-list {
    margin-top: 4px !important;
    border-radius: 12px !important;
    border: 1px solid rgba(234, 88, 12, 0.2) !important;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05) !important;
    max-height: 300px !important;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(234, 88, 12, 0.5) transparent;
  }
  .phone-input-container .country-list::-webkit-scrollbar {
    width: 6px;
  }
  .phone-input-container .country-list::-webkit-scrollbar-track {
    background: transparent;
  }
  .phone-input-container .country-list::-webkit-scrollbar-thumb {
    background-color: rgba(234, 88, 12, 0.3);
    border-radius: 20px;
  }
  .phone-input-container .country-list .country:hover {
    background-color: rgba(234, 88, 12, 0.1) !important;
  }
  .phone-input-container .country-list .country.highlight {
    background-color: rgba(234, 88, 12, 0.15) !important;
  }
  .phone-input-container .country-list .country {
    padding: 10px 12px !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    transition: all 0.2s ease;
  }
  .phone-input-container .country-list .search {
    padding: 12px !important;
    border-bottom: 1px solid rgba(234, 88, 12, 0.1) !important;
    margin-bottom: 4px !important;
  }
  .phone-input-container .country-list .search-box {
    margin: 0 !important;
    width: 100% !important;
    border-radius: 8px !important;
    border: 1px solid rgba(234, 88, 12, 0.3) !important;
    padding: 8px 12px !important;
    transition: all 0.3s ease !important;
  }
  .phone-input-container .country-list .search-box:focus {
    border-color: #ea580c !important;
    box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.2) !important;
    outline: none !important;
  }
  .phone-input-container .react-tel-input .flag-dropdown.open {
    background-color: rgba(234, 88, 12, 0.05) !important;
    border-radius: 8px 0 0 0 !important;
  }
  .phone-input-container .selected-flag .arrow {
    border-top-color: #272727 !important;
    transition: all 0.3s ease;
  }
  .phone-input-container .selected-flag .arrow.up {
    border-bottom-color: #272727 !important;
  }
  .phone-input-container .country-list .country .flag {
    margin-right: 10px !important;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  }
  .phone-input-container .country-list .country-name {
    margin-left: 35px !important;
    font-size: 14px !important;
  }
  .phone-input-container .country-list .dial-code {
    color: #6b7280 !important;
    font-size: 13px !important;
  }
  .phone-input-container input[type="tel"] {
    font-size: 16px !important;
    letter-spacing: 0.01em !important;
    transition: all 0.3s ease !important;
    border: none !important;
  }

  /* Custom form elements */
  .premium-input {
    width: 100%;
    height: 60px;
    padding: 18px 20px;
    padding-left: 52px;
    font-size: 18px;
    border: 1.5px solid rgba(234, 88, 12, 0.2);
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    color: #272727;
  }
  
  .premium-input:hover {
    border-color: rgba(234, 88, 12, 0.4);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  }
  
  .premium-input:focus {
    outline: none;
    border-color: #ea580c;
    box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15);
  }

  .option-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: white;
    color: #272727;
    border-radius: 12px;
    border: 1.5px solid rgba(234, 88, 12, 0.2);
    font-weight: 500;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .option-button:hover {
    border-color: #ea580c;
    color: #ea580c;
  }
  
  .option-button:active {
    border-color: #ea580c;
    color: #ea580c;
  }

  .selected-option {
    border-color: #ea580c;
    color: #ea580c;
  }

  .primary-button {
    background: linear-gradient(145deg, #ea580c, #d24b09);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 16px 32px;
    font-weight: 600;
    font-size: 18px;
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(234, 88, 12, 0.2);
  }
  
  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(234, 88, 12, 0.3);
  }
  
  .primary-button:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(234, 88, 12, 0.2);
  }
  
  .primary-button::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent 0%,
      transparent 40%,
      rgba(255, 255, 255, 0.15) 50%,
      transparent 60%,
      transparent 100%
    );
    transition: all 0.6s ease;
    transform: translateX(-100%);
  }
  
  .primary-button:hover::after {
    transform: translateX(100%);
  }
  
  .secondary-button {
    background: white;
    color: #272727;
    border: 1.5px solid rgba(234, 88, 12, 0.2);
    border-radius: 4px;
    padding: 16px 32px;
    font-weight: 600;
    font-size: 18px;
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
  
  .secondary-button:hover {
    border-color: #ea580c;
    color: #ea580c;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  }
  
  .secondary-button:active {
    transform: translateY(1px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  /* Progress bar styling */
  .premium-progress-container {
    width: 100%;
    height: 6px;
    background: rgba(234, 88, 12, 0.1);
    border-radius: 0;
    overflow: hidden;
    position: relative;
  }
  
  .premium-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #ea580c, #f97316);
    border-radius: 0;
    transition: width 0.5s cubic-bezier(0.44, 0.13, 0.25, 1);
    position: relative;
  }
  
  .premium-progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.3));
    animation: pulse 2s infinite;
  }
  
  /* Slider customization */
  .premium-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 6px;
    outline: none;
    background: rgba(234, 88, 12, 0.15);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .premium-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(145deg, #ea580c, #d24b09);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 10px rgba(234, 88, 12, 0.4);
    transition: all 0.3s ease;
  }
  
  .premium-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(145deg, #ea580c, #d24b09);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 10px rgba(234, 88, 12, 0.4);
    transition: all 0.3s ease;
  }
  
  .premium-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 15px rgba(234, 88, 12, 0.5);
  }
  
  .premium-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 15px rgba(234, 88, 12, 0.5);
  }
  
  .premium-slider:active::-webkit-slider-thumb {
    transform: scale(1.2);
  }
  
  .premium-slider:active::-moz-range-thumb {
    transform: scale(1.2);
  }

  /* Modal backdrop and container */
  .modal-backdrop {
    backdrop-filter: blur(5px);
    background-color: rgba(0, 0, 0, 0.4);
  }
  
  .modal-container {
    border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.2);
    background-color: white;
    overflow: hidden;
  }

  /* Success animation */
  @keyframes successPulse {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  .success-animation {
    animation: successPulse 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  
  /* Base typography */
  .heading-text {
    font-weight: 700;
    color: #272727;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  
  .body-text {
    color: rgba(39, 39, 39, 0.8);
    line-height: 1.6;
  }
  
  .hint-text {
    color: rgba(39, 39, 39, 0.6);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  /* Fix for input icon overlapping */
  .input-icon-wrapper {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 1;
  }

  .city-autocomplete-container .css-1s2u09g-control {
    min-height: 60px !important;
    padding: 18px 20px !important;
    padding-left: 52px !important;
    font-size: 18px !important;
    border: 1.5px solid rgba(234, 88, 12, 0.2) !important;
    border-radius: 4px !important;
    background-color: rgba(255, 255, 255, 0.8) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02) !important;
  }

  .phone-input-container input {
    height: 60px !important;
    padding: 18px 20px !important;
    padding-left: 52px !important;
    font-size: 18px !important;
    border-radius: 4px !important;
  }

  .city-autocomplete-container .css-1s2u09g-menu {
    margin-top: 4px !important;
    border-radius: 4px !important;
    border: 1px solid rgba(234, 88, 12, 0.2) !important;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05) !important;
    padding: 8px !important;
    background-color: white !important;
    z-index: 1000 !important;
  }

  .city-autocomplete-container .css-1n7v3ny-option {
    padding: 12px !important;
    font-size: 18px !important;
    cursor: pointer !important;
    border-radius: 4px !important;
    color: #272727 !important;
  }
`;

// Email validation functions
const validateEmail = (email: string): boolean => {
  // Regular expression for email validation
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  // Basic structural checks
  if (!email || typeof email !== "string") return false;
  if (email.length > 254) return false; // RFC 5321
  if (email.length < 3) return false;

  // Check for multiple @ symbols
  const atSymbols = email.split("@").length - 1;
  if (atSymbols !== 1) return false;

  // Split email into local part and domain
  const [localPart, domain] = email.split("@");

  // Local part checks
  if (localPart.length > 64) return false; // RFC 5321
  if (localPart.startsWith(".") || localPart.endsWith(".")) return false;
  if (localPart.includes("..")) return false;

  // Domain checks
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  if (domain.includes("..")) return false;
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) return false;

  // Full regex test
  return emailRegex.test(email);
};

const getEmailValidationMessage = (email: string): string => {
  if (!email) return "Email is required";
  if (email.length > 254) return "Email is too long";
  if (email.length < 3) return "Email is too short";

  const atSymbols = email.split("@").length - 1;
  if (atSymbols === 0) return "Email must contain @ symbol";
  if (atSymbols > 1) return "Email cannot contain multiple @ symbols";

  const [localPart, domain] = email.split("@");

  if (localPart.length > 64) return "Local part of email is too long";
  if (localPart.startsWith(".") || localPart.endsWith("."))
    return "Local part cannot start or end with a dot";
  if (localPart.includes(".."))
    return "Local part cannot contain consecutive dots";

  if (!domain) return "Domain is required";
  if (domain.startsWith(".") || domain.endsWith("."))
    return "Domain cannot start or end with a dot";
  if (domain.includes("..")) return "Domain cannot contain consecutive dots";
  if (!/^[a-zA-Z0-9.-]+$/.test(domain))
    return "Domain contains invalid characters";

  if (!validateEmail(email)) return "Invalid email format";

  return "";
};

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface QuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionnaireData) => void;
  type?: string;
}

export interface QuestionnaireData {
  transactionType: string;
  timeframe: string;
  location: string;
  budget: number;
  propertyType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  wantsToSell: string;
  mortgageStatus?: string;
  address?: string;
}

const AgentQuestionnaire = ({
  isOpen,
  onClose,
  onSubmit,
  embedded = false,
  type,
}: QuestionnaireProps & { embedded?: boolean }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<QuestionnaireData>({
    transactionType: "",
    timeframe: "",
    location: "",
    budget: 500000,
    propertyType: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    wantsToSell: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Get total steps based on transaction type
  const getTotalSteps = (type: string) => {
    switch (type) {
      case "buying":
        return 8; // Total steps for buying flow
      case "selling":
        return 8; // Total steps for selling flow (including phone step)
      case "both":
        return 8; // Total steps for both flow
      default:
        return 8;
    }
  };

  // Calculate progress percentage based on current step and transaction type
  const getProgressWidth = () => {
    const totalSteps = getTotalSteps(formData.transactionType);
    const adjustedStep = currentStep;
    return `${(adjustedStep / totalSteps) * 100}%`;
  };

  // Reference to store and clear timeouts
  const closeTimeoutRef = useRef<number | null>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = () => {
      // Remove this effect since we don't need it anymore
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Clean up any lingering timeouts when component unmounts or isOpen changes
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Focus phone input when step 7 becomes active
  useEffect(() => {
    if (currentStep === 7) {
      const phoneInput = document.querySelector(
        '.phone-input-container input[type="tel"]'
      );
      if (phoneInput) {
        (phoneInput as HTMLInputElement).focus();
      }
    }
  }, [currentStep]);

  // Add useEffect to handle utm_city parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmCity = params.get("utm_city");

    if (utmCity) {
      // Format the city name with USA suffix
      const formattedCity = `${
        utmCity.charAt(0).toUpperCase() + utmCity.slice(1)
      }, USA`;
      setFormData((prev) => ({
        ...prev,
        location: formattedCity,
      }));
    }
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Clear any pending close timeouts when opening
      if (closeTimeoutRef.current !== null) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      // Get utm_city parameter
      const params = new URLSearchParams(window.location.search);
      const utmCity = params.get("utm_city");

      setFormData({
        transactionType: "",
        timeframe: "",
        location: utmCity
          ? `${utmCity.charAt(0).toUpperCase() + utmCity.slice(1)}, USA`
          : "",
        budget: 500000,
        propertyType: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        wantsToSell: "",
      });

      setSubmitError(null);
      setShowSuccess(false);
      setIsClosing(false);
    }
  }, [isOpen]);

  // Function to format phone number with spaces
  const formatPhoneNumber = (phone: string): string => {
    // Remove any existing formatting (spaces, parentheses, etc.)
    // Remove the '+' if it exists and any non-digits
    const cleanPhone = phone.replace(/^\+/, "").replace(/\D/g, "");

    // Format: Keep last 10 digits together, everything before that is country code
    if (cleanPhone.length > 10) {
      const countryCode = cleanPhone.slice(0, -10);
      const restOfNumber = cleanPhone.slice(-10);
      return `+${countryCode} ${restOfNumber}`;
    }
    // If number is 10 digits or less, assume US (+1)
    return `+1 ${cleanPhone}`;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Format the data for Supabase - Update budget range formatting
      const submissionData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formatPhoneNumber(formData.phone),
        budget:
          formData.budget < 1000000
            ? `${formData.budget} - ${formData.budget + 50000}`
            : `${formData.budget} - ${formData.budget + 250000}`,
        location: formData.location,
        propertytype: formData.propertyType,
        timeframe: formData.timeframe,
        transaction_type: formData.transactionType,
        mortgage_status: formData.mortgageStatus || null,
        address: formData.address || null,
        created_at: new Date().toISOString(),
        type: formData.transactionType,
      };

      // Insert data into Supabase
      const { error } = await supabase
        .from("submitted_data")
        .insert([submissionData]);

      if (error) {
        console.error("Error submitting form:", error);
        setSubmitError("Failed to submit your information. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Show success message and redirect
      onSubmit(formData);
      navigate("/thank-you");
    } catch (err) {
      console.error("Unexpected error:", err);
      setSubmitError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    // Store the timeout ID so we can clear it if needed
    closeTimeoutRef.current = window.setTimeout(() => {
      onClose();
      setIsClosing(false);
      closeTimeoutRef.current = null;
    }, 500);
  };

  // Function to determine next step based on transaction type
  const getNextStep = (currentStep: number, transactionType: string) => {
    switch (transactionType) {
      case "buying":
        switch (currentStep) {
          case 1:
            return 2; // Transaction Type to Price Range
          case 2:
            return 3; // Price Range to City Name
          case 3:
            return 4; // City Name to Timeframe
          case 4:
            return 5; // Timeframe to Mortgage Status
          case 5:
            return 6; // Mortgage Status to Name
          case 6:
            return 7; // Name to Email
          case 7:
            return 8; // Email to Phone
          default:
            return currentStep + 1;
        }
      case "selling":
        switch (currentStep) {
          case 1:
            return 2; // Transaction Type to Price Range
          case 2:
            return 3; // Price Range to Property Type
          case 3:
            return 4; // Property Type to Address
          case 4:
            return 6; // Address to Name
          case 6:
            return 7; // Name to Email
          case 7:
            return 8; // Email to Phone
          case 8:
            return 9; // Phone to Submit
          default:
            return currentStep + 1;
        }
      case "both":
        switch (currentStep) {
          case 1:
            return 2; // Transaction Type to Price Range
          case 2:
            return 3; // Price Range to Property Type
          case 3:
            return 4; // Property Type to Address
          case 4:
            return 5; // Address to City
          case 5:
            return 6; // City to Name
          case 6:
            return 7; // Name to Email
          case 7:
            return 8; // Email to Phone
          default:
            return currentStep + 1;
        }
      default:
        return currentStep + 1;
    }
  };

  // Function to determine previous step based on transaction type
  const getPrevStep = (currentStep: number, transactionType: string) => {
    switch (transactionType) {
      case "buying":
        switch (currentStep) {
          case 2:
            return 1; // Price Range to Transaction Type
          case 3:
            return 2; // City Name to Price Range
          case 4:
            return 3; // Timeframe to City Name
          case 5:
            return 4; // Mortgage Status to Timeframe
          case 6:
            return 5; // Name to Mortgage Status
          case 7:
            return 6; // Email to Name
          case 8:
            return 7; // Phone to Email
          default:
            return currentStep - 1;
        }
      case "selling":
        switch (currentStep) {
          case 2:
            return 1; // Price Range to Transaction Type
          case 3:
            return 2; // Property Type to Price Range
          case 4:
            return 3; // Address to Property Type
          case 6:
            return 4; // Name to Address
          case 7:
            return 6; // Email to Name
          case 8:
            return 7; // Phone to Email
          case 9:
            return 8; // Submit to Phone
          default:
            return currentStep - 1;
        }
      case "both":
        switch (currentStep) {
          case 2:
            return 1; // Price Range to Transaction Type
          case 3:
            return 2; // Property Type to Price Range
          case 4:
            return 3; // Address to Property Type
          case 5:
            return 4; // City to Address
          case 6:
            return 5; // Name to City
          case 7:
            return 6; // Email to Name
          case 8:
            return 7; // Phone to Email
          default:
            return currentStep - 1;
        }
      default:
        return currentStep - 1;
    }
  };

  const nextStep = () => {
    const next = getNextStep(currentStep, formData.transactionType);
    const totalSteps = getTotalSteps(formData.transactionType);
    if (next <= totalSteps) {
      setCurrentStep(next);
    } else if (formData.transactionType === "selling" && currentStep === 7) {
      // For selling flow, after email (step 7), go to phone (step 8)
      setCurrentStep(8);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    const prev = getPrevStep(currentStep, formData.transactionType);
    if (prev >= 1) {
      setCurrentStep(prev);
    }
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value}`;
    }
  };

  // Handle step size change for slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);

    // Determine the closest valid step
    let adjustedValue;
    if (value < 1000000) {
      // Below 1M: steps of 50K
      adjustedValue = Math.round(value / 50000) * 50000;
    } else {
      // Above 1M: steps of 250K
      adjustedValue = Math.round(value / 250000) * 250000;
    }

    setFormData({ ...formData, budget: adjustedValue });
  };

  // Function to format budget range for display
  const formatBudgetRange = (value: number): string => {
    // Calculate the upper range based on value
    let upperValue;
    if (value < 1000000) {
      upperValue = value + 50000;
    } else {
      upperValue = value + 250000;
    }

    return `${formatCurrency(value)} - ${formatCurrency(upperValue)}`;
  };

  const handleTransactionTypeSelect = (type: string) => {
    setFormData({ ...formData, transactionType: type });
    setCurrentStep(2); // Go to price range step for all flows
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{animationStyles}</style>
      <div
        className={
          embedded
            ? "w-full h-full"
            : `fixed inset-0 modal-backdrop z-50 flex items-center justify-center ${
                isClosing ? "animate-fadeOut" : ""
              }`
        }
      >
        <div
          className={
            embedded
              ? "w-full h-full"
              : `modal-container mx-5 max-w-[900px] w-full h-[650px] relative ${
                  isClosing ? "animate-slideOut" : ""
                }`
          }
        >
          {/* Progress bar at the very top, only for compare type */}
          {type === "compare" && (
            <div className="absolute top-0 left-0 z-20 w-full">
              <div
                className={cn(
                  "premium-progress-container",
                  type === "compare" && "!h-[10px] !rounded-lg"
                )}
                style={{ borderRadius: "25px" }}
              >
                <div
                  className="premium-progress-bar"
                  style={{ width: getProgressWidth(), borderRadius: "25px" }}
                />
              </div>
            </div>
          )}
          <div className="MessageAgentForm h-full flex flex-col text-[rgba(39,39,39,0.8)] text-sm md:text-base font-normal relative">
            {/* Progress header */}
            <div className="relative z-[3] bg-[#f8f8f8]">
              <div className="flex items-center justify-between px-6">
                {!embedded && (
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-full hover:bg-[rgba(234,88,12,0.1)] transition-all duration-300 transform hover:rotate-90"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-[#272727]" />
                  </button>
                )}
              </div>
              {/* Progress bar below header for non-compare types */}
              {type !== "compare" && (
                <div
                  className="premium-progress-container"
                  style={{ borderRadius: "25px" }}
                >
                  <div
                    className="premium-progress-bar"
                    style={{ width: getProgressWidth(), borderRadius: "25px" }}
                  />
                </div>
              )}
            </div>

            {/* Step 1: Transaction Type */}
            <div
              className={`${currentStep === 1 ? "block" : "hidden"}
                flex flex-col px-6 md:px-10 h-full overflow-hidden`}
            >
              <div
                className={cn(
                  "mt-8 mb-6 text-2xl heading-text md:text-3xl lg:text-4xl",
                  type === "compare" && "text-center !font-semibold"
                )}
              >
                {type === "compare"
                  ? "Find The Best REALTORS® For You"
                  : `Are you buying or selling?`}

                {type === "compare" && (
                  <p className="text-[20px] mt-6 mb-6 text-center text-[#272727] font-normal">
                    Instantly see a personalized list of great agents to choose
                    from.
                  </p>
                )}
              </div>

              <div
                className={cn(
                  type === "compare"
                    ? "grid grid-cols-1 md:grid-cols-3 gap-5 flex-grow mb-8"
                    : "flex flex-col justify-center flex-grow gap-6 mb-8"
                )}
              >
                <button
                  onClick={() => handleTransactionTypeSelect("buying")}
                  className={cn(
                    "relative bg-white rounded-xl border-2 border-gray-200 hover:border-[#ea580c] transition-all duration-300 hover:shadow-lg group",
                    type === "compare" ? "py-8 px-6" : "py-11 px-6",
                    formData.transactionType === "buying" && "border-[#ea580c]"
                  )}
                >
                  <div
                    className={cn(
                      "flex w-full gap-4",
                      type === "compare"
                        ? "flex-col items-center justify-center"
                        : "flex-col items-center sm:flex-row sm:justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center transition-all rounded-full bg-gray-100",
                        type === "compare" ? "w-16 h-16" : "w-12 h-12",
                        formData.transactionType === "buying" && "!bg-orange-50"
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={type === "compare" ? "32" : "24"}
                        height={type === "compare" ? "32" : "24"}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={
                          formData.transactionType === "buying"
                            ? "#ea580c"
                            : "#6B7280"
                        }
                        className="transition-colors duration-300 group-hover:stroke-[#ea580c]"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </div>
                    <div
                      className={cn(
                        "flex flex-col",
                        type === "compare"
                          ? "items-center text-center"
                          : "items-center sm:items-start text-left"
                      )}
                    >
                      <span
                        className={cn(
                          "font-semibold text-gray-900",
                          type === "compare" ? "text-2xl" : "text-xl"
                        )}
                      >
                        I'm Buying
                      </span>
                      {!type && (
                        <span className="text-sm font-normal text-gray-600">
                          Find the best real estate agent to represent you
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleTransactionTypeSelect("selling")}
                  className={cn(
                    "relative bg-white rounded-xl border-2 border-gray-200 hover:border-[#ea580c] transition-all duration-300 hover:shadow-lg group",
                    type === "compare" ? "py-8 px-6" : "py-11 px-6",
                    formData.transactionType === "selling" && "border-[#ea580c]"
                  )}
                >
                  <div
                    className={cn(
                      "flex w-full gap-4",
                      type === "compare"
                        ? "flex-col items-center justify-center"
                        : "flex-col items-center sm:flex-row sm:justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center transition-all rounded-full bg-gray-100",
                        type === "compare" ? "w-16 h-16" : "w-12 h-12",
                        formData.transactionType === "selling" &&
                          "!bg-orange-50"
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={type === "compare" ? "32" : "24"}
                        height={type === "compare" ? "32" : "24"}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={
                          formData.transactionType === "selling"
                            ? "#ea580c"
                            : "#6B7280"
                        }
                        className="transition-colors duration-300 group-hover:stroke-[#ea580c]"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3v18h18"></path>
                        <path d="m19 9-5 5-4-4-3 3"></path>
                      </svg>
                    </div>
                    <div
                      className={cn(
                        "flex flex-col",
                        type === "compare"
                          ? "items-center text-center"
                          : "items-center sm:items-start text-left"
                      )}
                    >
                      <span
                        className={cn(
                          "font-semibold text-gray-900",
                          type === "compare" ? "text-2xl" : "text-xl"
                        )}
                      >
                        I'm Selling
                      </span>
                      {!type && (
                        <span className="text-sm font-normal text-gray-600">
                          A top REALTOR will sell your home fast
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleTransactionTypeSelect("both")}
                  className={cn(
                    "relative bg-white rounded-xl border-2 border-gray-200 hover:border-[#ea580c] transition-all duration-300 hover:shadow-lg group",
                    type === "compare" ? "py-8 px-6" : "py-11 px-6",
                    formData.transactionType === "both" && "border-[#ea580c]"
                  )}
                >
                  <div
                    className={cn(
                      "flex w-full gap-4",
                      type === "compare"
                        ? "flex-col items-center justify-center"
                        : "flex-col items-center sm:flex-row sm:justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center transition-all rounded-full bg-gray-100",
                        type === "compare" ? "w-16 h-16" : "w-12 h-12",
                        formData.transactionType === "both" && "!bg-orange-50"
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={type === "compare" ? "32" : "24"}
                        height={type === "compare" ? "32" : "24"}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={
                          formData.transactionType === "both"
                            ? "#ea580c"
                            : "#6B7280"
                        }
                        className="transition-colors duration-300 group-hover:stroke-[#ea580c]"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div
                      className={cn(
                        "flex flex-col",
                        type === "compare"
                          ? "items-center text-center"
                          : "items-center sm:items-start text-left"
                      )}
                    >
                      <span
                        className={cn(
                          "font-semibold text-gray-900",
                          type === "compare" ? "text-2xl" : "text-xl"
                        )}
                      >
                        I'm Buying & Selling
                      </span>
                      {!type && (
                        <span className="text-sm font-normal text-gray-600">
                          Top rated realtor can support your journey
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
              {type === "compare" && (
                <div className="px-2 mt-2 mb-4 text-center sm:px-0">
                  {[
                    "We've worked with over 10k happy home buyers & sellers",
                    "We only recommend the top agents in your area",
                    "Get a free custom list of top agents in your area in less than 2 minutes",
                  ].map((option) => (
                    <div
                      key={option}
                      className="flex items-start gap-2 mb-3 text-left sm:items-center sm:gap-3 sm:text-center"
                    >
                      <div className="bg-[#0CB182] rounded-full p-1 shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[12px] sm:text-[18px] text-[#272727] leading-snug sm:leading-normal">
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Price Range */}
            <div
              className={`${
                currentStep === 2 ? "block animate-fadeInRight" : "hidden"
              }
              flex flex-col w-full h-full px-6 pt-4 md:px-10 md:pt-6 overflow-hidden`}
            >
              <div
                className={cn(
                  "text-xl heading-text md:text-2xl lg:text-3xl mb-6",
                  "!text-[32px] md:!text-[42px] !text-center",
                  type === "compare" && "!mt-[50px] sm:!mt-[100px]"
                )}
              >
                {formData.transactionType === "buying"
                  ? "What's your price range?"
                  : "What price are you hoping to sell at?"}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-8 w-full lg:w-[70%] mx-auto">
                  <button
                    onClick={() => {
                      const newValue = Math.max(
                        50000,
                        formData.budget -
                          (formData.budget <= 1000000 ? 50000 : 250000)
                      );
                      setFormData({ ...formData, budget: newValue });
                    }}
                    className="p-2 transition-shadow bg-white rounded-full shadow-md hover:shadow-lg"
                  >
                    <Minus className="w-5 h-5 text-[#272727]" />
                  </button>
                  <p className="text-3xl font-bold text-center text-black md:text-4xl">
                    {formatBudgetRange(formData.budget)}
                  </p>
                  <button
                    onClick={() => {
                      const newValue = Math.min(
                        5000000,
                        formData.budget +
                          (formData.budget < 1000000 ? 50000 : 250000)
                      );
                      setFormData({ ...formData, budget: newValue });
                    }}
                    className="p-2 transition-shadow bg-white rounded-full shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5 text-[#272727]" />
                  </button>
                </div>

                <div className="px-2 mb-6">
                  <div className="w-full lg:w-[70%] mx-auto">
                    <input
                      type="range"
                      min="50000"
                      max="5000000"
                      step="1000"
                      value={formData.budget}
                      onChange={handleSliderChange}
                      className="premium-slider"
                      style={{
                        height: "10px",
                        background: `linear-gradient(to right, #ea580c 0%, #ea580c ${
                          ((formData.budget - 50000) / (5000000 - 50000)) * 100
                        }%, rgba(234, 88, 12, 0.15) ${
                          ((formData.budget - 50000) / (5000000 - 50000)) * 100
                        }%, rgba(234, 88, 12, 0.15) 100%)`,
                      }}
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-[18px] text-gray-500">$50K</span>
                      <span className="text-[18px] text-gray-500">$5M+</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "pb-6 mt-auto flex-wrap",
                  type === "compare"
                    ? "flex flex-col gap-4 items-stretch"
                    : "flex gap-4 xxss:gap-0 items-center justify-between"
                )}
              >
                {type === "compare" ? (
                  <div className="flex flex-wrap justify-between w-full gap-4 ">
                    <button onClick={prevStep} className="secondary-button">
                      Back
                    </button>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => {
                          setFormData({ ...formData, budget: 0 });
                          nextStep();
                        }}
                        className="secondary-button"
                      >
                        Not Sure
                      </button>
                      <button onClick={nextStep} className="primary-button">
                        Continue
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={prevStep} className="secondary-button">
                      Back
                    </button>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => {
                          setFormData({ ...formData, budget: 0 });
                          nextStep();
                        }}
                        className="secondary-button"
                      >
                        Not Sure
                      </button>
                      <button onClick={nextStep} className="primary-button">
                        Continue
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Step 3: Property Type (Only for selling and both) */}
            <div
              className={`${
                currentStep === 3 &&
                (formData.transactionType === "selling" ||
                  formData.transactionType === "both")
                  ? "block animate-fadeInRight"
                  : "hidden"
              }
              flex flex-col w-full h-full px-6 pt-4 md:px-10 md:pt-6 overflow-hidden`}
            >
              <div
                className={cn(
                  "text-xl heading-text md:text-2xl lg:text-3xl mb-6",
                  "!text-[32px] md:!text-[42px] !text-center",
                  type === "compare" && "!mt-[50px] sm:!mt-[100px]"
                )}
              >
                What kind of property are you selling?
              </div>

              <div
                className={cn(
                  "flex flex-col gap-4 mt-2 mb-4",
                  type === "compare" && "grid grid-cols-1 sm:grid-cols-2 gap-4"
                )}
              >
                {["Single Family", "Condo", "Land/Lot", "Other"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setFormData({ ...formData, propertyType: option });
                        nextStep();
                      }}
                      className={cn(
                        "option-button",
                        formData.propertyType === option && "selected-option",
                        type === "compare" && "h-full"
                      )}
                    >
                      <span className="w-full text-center">{option}</span>
                      {formData.propertyType === option && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                            fill="white"
                          />
                        </svg>
                      )}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center justify-between pb-6 mt-auto">
                <button onClick={prevStep} className="secondary-button">
                  Back
                </button>
              </div>
            </div>

            {/* Step 3: City Name (Only for buying) */}
            <div
              className={`${
                currentStep === 3 && formData.transactionType === "buying"
                  ? "block animate-fadeInRight"
                  : "hidden"
              }
              flex flex-col w-full h-full px-6 pt-4 md:px-10 md:pt-6 overflow-hidden`}
            >
              <div
                className={cn(
                  "text-xl heading-text md:text-2xl lg:text-3xl mb-6",
                  "!text-[32px] md:!text-[42px] !text-center",
                  type === "compare" && "!mt-[50px] sm:!mt-[100px]"
                )}
              >
                Where are you looking to buy?
              </div>

              <p className="mb-6 text-[18px] text-black text-center">
                So we can recommend{" "}
                {formData.transactionType === "buying" ? "seller" : "buyer"}{" "}
                expert in your area.
              </p>

              <div className="relative mt-4">
                <div className="relative group city-autocomplete-container">
                  <div className="input-icon-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#ea580c]"
                    >
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <GooglePlacesAutocomplete
                    selectProps={{
                      placeholder: "Enter city name...",
                      value: formData.location
                        ? { label: formData.location, value: formData.location }
                        : null,
                      onChange: async (place) => {
                        if (!place) {
                          setFormData({
                            ...formData,
                            location: "",
                          });
                          return;
                        }

                        try {
                          const results = await geocodeByAddress(place.label);
                          if (results && results.length > 0) {
                            const cityComponent =
                              results[0].address_components.find((component) =>
                                component.types.includes("locality")
                              );

                            if (cityComponent) {
                              const cityName = `${cityComponent.long_name}, USA`;
                              setFormData({
                                ...formData,
                                location: cityName,
                              });
                            } else {
                              // Fallback if locality not found
                              setFormData({
                                ...formData,
                                location: place.label,
                              });
                            }
                          } else {
                            // Fallback if no results
                            setFormData({
                              ...formData,
                              location: place.label,
                            });
                          }
                        } catch (error) {
                          console.error("Error geocoding address:", error);
                          // Fallback on error
                          setFormData({
                            ...formData,
                            location: place.label,
                          });
                        }
                      },
                      onBlur: () => {
                        // Ensure we have a valid location before proceeding
                        if (!formData.location) {
                          setFormData({
                            ...formData,
                            location: "",
                          });
                        }
                      },
                      components: {
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                      },
                      openMenuOnClick: false,
                      openMenuOnFocus: false,
                      filterOption: (option, inputValue) => {
                        return (
                          option.label
                            .toLowerCase()
                            .includes(inputValue.toLowerCase()) &&
                          !option.label.match(/\d/) &&
                          option.label.includes(", USA")
                        );
                      },
                      noOptionsMessage: ({ inputValue }) =>
                        inputValue ? "No cities found" : null,
                      styles: {
                        control: (provided) => ({
                          ...provided,
                          border: "1.5px solid rgba(234, 88, 12, 0.2)",
                          borderRadius: "12px",
                          padding: "14px 16px",
                          paddingLeft: "48px",
                          fontSize: "16px",
                          minHeight: "unset",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
                          cursor: "text",
                          "&:hover": {
                            borderColor: "rgba(234, 88, 12, 0.4)",
                            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.05)",
                          },
                          "&:focus-within": {
                            borderColor: "#ea580c",
                            boxShadow: "0 0 0 3px rgba(234, 88, 12, 0.15)",
                          },
                        }),
                        menu: (provided) => ({
                          ...provided,
                          borderRadius: "12px",
                          border: "1px solid rgba(234, 88, 12, 0.2)",
                          boxShadow:
                            "0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)",
                          marginTop: "4px",
                          padding: "8px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          padding: "12px",
                          cursor: "pointer",
                          borderRadius: "8px",
                          backgroundColor: state.isFocused
                            ? "rgba(234, 88, 12, 0.1)"
                            : "transparent",
                          color: "#272727",
                          fontSize: "14px",
                          "&:hover": {
                            backgroundColor: "rgba(234, 88, 12, 0.1)",
                          },
                          "&:active": {
                            backgroundColor: "rgba(234, 88, 12, 0.15)",
                          },
                        }),
                        input: (provided) => ({
                          ...provided,
                          margin: "0",
                          padding: "0",
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          padding: "0",
                        }),
                      },
                    }}
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    autocompletionRequest={{
                      types: ["(cities)"],
                      componentRestrictions: { country: "us" },
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pb-6 mt-auto">
                <button onClick={prevStep} className="secondary-button">
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!formData.location}
                  className={`primary-button ${
                    !formData.location ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Step 4: Address (Only for selling and both) */}
            <div
              className={`${
                currentStep === 4 &&
                (formData.transactionType === "selling" ||
                  formData.transactionType === "both")
                  ? "block animate-fadeInRight"
                  : "hidden"
              }
              flex flex-col w-full h-full px-6 pt-4 md:px-10 md:pt-6 overflow-hidden`}
            >
              <div
                className={cn(
                  "text-xl heading-text md:text-2xl lg:text-3xl mb-6",
                  "!text-[32px] md:!text-[42px] !text-center",
                  type === "compare" && "!mt-[50px] sm:!mt-[100px]"
                )}
              >
                What is the address of your property?
              </div>

              <p className="mb-6 text-[18px] text-black text-center">
                Our recommendations are free, No strings attached.
              </p>

              <div className="relative mt-4">
                <div className="relative group city-autocomplete-container">
                  <div className="input-icon-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#ea580c]"
                    >
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <GooglePlacesAutocomplete
                    selectProps={{
                      placeholder: "Enter property address...",
                      value: formData.address
                        ? { label: formData.address, value: formData.address }
                        : null,
                      onChange: async (place) => {
                        if (!place) {
                          setFormData({
                            ...formData,
                            address: "",
                          });
                          return;
                        }

                        try {
                          const results = await geocodeByAddress(place.label);
                          if (results && results.length > 0) {
                            setFormData({
                              ...formData,
                              address: place.label,
                            });
                          } else {
                            setFormData({
                              ...formData,
                              address: place.label,
                            });
                          }
                        } catch (error) {
                          console.error("Error geocoding address:", error);
                          setFormData({
                            ...formData,
                            address: place.label,
                          });
                        }
                      },
                      onBlur: () => {
                        if (!formData.address) {
                          setFormData({
                            ...formData,
                            address: "",
                          });
                        }
                      },
                      components: {
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                      },
                      openMenuOnClick: false,
                      openMenuOnFocus: false,
                      filterOption: (option, inputValue) => {
                        return (
                          option.label
                            .toLowerCase()
                            .includes(inputValue.toLowerCase()) &&
                          option.label.includes(", USA")
                        );
                      },
                      noOptionsMessage: ({ inputValue }) =>
                        inputValue ? "No addresses found" : null,
                      styles: {
                        control: (provided) => ({
                          ...provided,
                          border: "1.5px solid rgba(234, 88, 12, 0.2)",
                          borderRadius: "12px",
                          padding: "14px 16px",
                          paddingLeft: "48px",
                          fontSize: "16px",
                          minHeight: "unset",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
                          cursor: "text",
                          "&:hover": {
                            borderColor: "rgba(234, 88, 12, 0.4)",
                            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.05)",
                          },
                          "&:focus-within": {
                            borderColor: "#ea580c",
                            boxShadow: "0 0 0 3px rgba(234, 88, 12, 0.15)",
                          },
                        }),
                        menu: (provided) => ({
                          ...provided,
                          borderRadius: "12px",
                          border: "1px solid rgba(234, 88, 12, 0.2)",
                          boxShadow:
                            "0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)",
                          marginTop: "4px",
                          padding: "8px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          padding: "12px",
                          cursor: "pointer",
                          borderRadius: "8px",
                          backgroundColor: state.isFocused
                            ? "rgba(234, 88, 12, 0.1)"
                            : "transparent",
                          color: "#272727",
                          fontSize: "14px",
                          "&:hover": {
                            backgroundColor: "rgba(234, 88, 12, 0.1)",
                          },
                          "&:active": {
                            backgroundColor: "rgba(234, 88, 12, 0.15)",
                          },
                        }),
                        input: (provided) => ({
                          ...provided,
                          margin: "0",
                          padding: "0",
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          padding: "0",
                        }),
                      },
                    }}
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    autocompletionRequest={{
                      types: ["address"],
                      componentRestrictions: { country: "us" },
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pb-6 mt-auto">
                <button onClick={prevStep} className="secondary-button">
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!formData.address}
                  className={`primary-button ${
                    !formData.address ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Step 4: Timeframe (Only for buying) */}
            <div
              className={`${
                currentStep === 4 && formData.transactionType === "buying"
                  ? "block animate-fadeInRight"
                  : "hidden"
              }
              flex flex-col w-full h-full px-6 pt-4 md:px-10 md:pt-6 overflow-hidden`}
            >
              <div
                className={cn(
                  "text-xl heading-text md:text-2xl lg:text-3xl mb-6",
                  "!text-[32px] md:!text-[42px] !text-center",
                  type === "compare" && "!mt-[50px] sm:!mt-[100px]"
                )}
              >
                When do you plan to buy?
              </div>

              <div
                className={cn(
                  "flex flex-col gap-4 mt-4 mb-4",
                  type === "compare"
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                    : "flex flex-col gap-4"
                )}
              >
                {[
                  "Immediately",
                  "1 Month or Less",
                  "2 - 3 Months",
                  "3 - 6 Months",
                  "6 - 9 Months",
                  "9 Months or Later",
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFormData({ ...formData, timeframe: option });
                      nextStep();
                    }}
                    className={cn(
                      "option-button",
                      formData.timeframe === option ? "selected-option" : "",
                      type === "compare" ? "h-full" : ""
                    )}
                  >
                    <span className="w-full text-center">{option}</span>
                    {formData.timeframe === option && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                          fill="white"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pb-6 mt-auto">
                <button onClick={prevStep} className="secondary-button">
                  Back
                </button>
              </div>
            </div>

            {/* Step 5: City Name (Only for selling and both) */}
            <div
              className={`${
                currentStep === 5 &&
                (formData.transactionType === "selling" ||
                  formData.transactionType === "both")
                  ? "block animate-fadeInRight"
                  : "hidden"
              } flex flex-col w-full h-full px-6 pt-4 md:px-10 md:pt-6 overflow-hidden`}
            >
              <div
                className={cn(
                  "text-xl heading-text md:text-2xl lg:text-3xl mb-6",
                  "!text-[32px] md:!text-[42px] !text-center",
                  type === "compare" && "!mt-[50px] sm:!mt-[100px]"
                )}
              >
                Where are you looking to buy?
              </div>

              <p className="mb-6 text-[18px] text-black text-center">
                So we can recommend{" "}
                {formData.transactionType === "buying" ? "seller" : "buyer"}{" "}
                expert in your area.
              </p>

              <div className="relative mt-4">
                <div className="relative group city-autocomplete-container">
                  <div className="input-icon-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#ea580c]"
                    >
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <GooglePlacesAutocomplete
                    selectProps={{
                      placeholder: "Enter city name...",
                      value: formData.location
                        ? { label: formData.location, value: formData.location }
                        : null,
                      onChange: async (place) => {
                        if (!place) {
                          setFormData({
                            ...formData,
                            location: "",
                          });
                          return;
                        }

                        try {
                          const results = await geocodeByAddress(place.label);
                          if (results && results.length > 0) {
                            const cityComponent =
                              results[0].address_components.find((component) =>
                                component.types.includes("locality")
                              );

                            if (cityComponent) {
                              const cityName = `${cityComponent.long_name}, USA`;
                              setFormData({
                                ...formData,
                                location: cityName,
                              });
                            } else {
                              setFormData({
                                ...formData,
                                location: place.label,
                              });
                            }
                          } else {
                            setFormData({
                              ...formData,
                              location: place.label,
                            });
                          }
                        } catch (error) {
                          console.error("Error geocoding address:", error);
                          setFormData({
                            ...formData,
                            location: place.label,
                          });
                        }
                      },
                      onBlur: () => {
                        if (!formData.location) {
                          setFormData({
                            ...formData,
                            location: "",
                          });
                        }
                      },
                      components: {
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                      },
                      openMenuOnClick: false,
                      openMenuOnFocus: false,
                      filterOption: (option, inputValue) => {
                        return (
                          option.label
                            .toLowerCase()
                            .includes(inputValue.toLowerCase()) &&
                          !option.label.match(/\d/) &&
                          option.label.includes(", USA")
                        );
                      },
                      noOptionsMessage: ({ inputValue }) =>
                        inputValue ? "No cities found" : null,
                      styles: {
                        control: (provided) => ({
                          ...provided,
                          border: "1.5px solid rgba(234, 88, 12, 0.2)",
                          borderRadius: "12px",
                          padding: "14px 16px",
                          paddingLeft: "48px",
                          fontSize: "16px",
                          minHeight: "unset",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
                          cursor: "text",
                          "&:hover": {
                            borderColor: "rgba(234, 88, 12, 0.4)",
                            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.05)",
                          },
                          "&:focus-within": {
                            borderColor: "#ea580c",
                            boxShadow: "0 0 0 3px rgba(234, 88, 12, 0.15)",
                          },
                        }),
                        menu: (provided) => ({
                          ...provided,
                          borderRadius: "12px",
                          border: "1px solid rgba(234, 88, 12, 0.2)",
                          boxShadow:
                            "0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)",
                          marginTop: "4px",
                          padding: "8px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          padding: "12px",
                          cursor: "pointer",
                          borderRadius: "8px",
                          backgroundColor: state.isFocused
                            ? "rgba(234, 88, 12, 0.1)"
                            : "transparent",
                          color: "#272727",
                          fontSize: "14px",
                          "&:hover": {
                            backgroundColor: "rgba(234, 88, 12, 0.1)",
                          },
                          "&:active": {
                            backgroundColor: "rgba(234, 88, 12, 0.15)",
                          },
                        }),
                        input: (provided) => ({
                          ...provided,
                          margin: "0",
                          padding: "0",
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          padding: "0",
                        }),
                      },
                    }}
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    autocompletionRequest={{
                      types: ["(cities)"],
                      componentRestrictions: { country: "us" },
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pb-6 mt-auto">
                <button onClick={prevStep} className="secondary-button">
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!formData.location}
                  className={`primary-button ${
                    !formData.location ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Step 5: Mortgage Status (Only for buying) */}
            <div
              className={`${
                currentStep === 5 && formData.transactionType === "buying"
                  ? "block animate-fadeInRight"
                  : "hidden"
              }
              flex flex-col w-full h-full px-6 pt-4 md:px-10 md:pt-6 overflow-hidden`}
            >
              <div
                className={cn(
                  "text-xl heading-text md:text-2xl lg:text-3xl mb-6",
                  "!text-[32px] md:!text-[42px] !text-center",
                  type === "compare" && "!mt-[50px] sm:!mt-[100px]"
                )}
              >
                What's your Mortgage Status?
              </div>

              <div
                className={cn(
                  "flex flex-col gap-4 mt-4 mb-4",
                  type === "compare"
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                    : "flex flex-col gap-4"
                )}
              >
                {[
                  "Pre-Approved",
                  "Not Pre-Approved",
                  "Cash Buyer",
                  "Not Sure",
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFormData({ ...formData, mortgageStatus: option });
                      nextStep();
                    }}
                    className={cn(
                      "option-button",
                      formData.mortgageStatus === option
                        ? "selected-option"
                        : "",
                      type === "compare" ? "h-full" : ""
                    )}
                  >
                    <span className="w-full text-center">{option}</span>
                    {formData.mortgageStatus === option && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                          fill="white"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pb-6 mt-auto">
                <button onClick={prevStep} className="secondary-button">
                  Back
                </button>
              </div>
            </div>

            {/* Step 6: Name */}
            <div
              className={`${
                (currentStep === 6 && formData.transactionType === "buying") ||
                (currentStep === 6 && formData.transactionType === "selling") ||
                (currentStep === 6 && formData.transactionType === "both")
                  ? "block animate-fadeInRight"
                  : "hidden"
              } flex flex-col w-full h-full px-6 pt-4 md:px-10 md:pt-6 overflow-hidden`}
            >
              <div
                className={cn(
                  "text-xl heading-text md:text-2xl lg:text-3xl mb-6",
                  "!text-[32px] md:!text-[42px] !text-center",
                  type === "compare" && "!mt-[50px] sm:!mt-[100px]"
                )}
              >
                What's your name?
              </div>

              <p className="mb-6 body-text">
                Our recommendations are free, No strings attached.
              </p>

              <div
                className={cn(
                  "mt-4",
                  type === "compare" ? "flex flex-row gap-4" : "space-y-4"
                )}
              >
                <div
                  className={cn(
                    "relative group",
                    type === "compare" ? "w-full sm:w-1/2" : "w-full"
                  )}
                >
                  <div className="input-icon-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#ea580c]"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="Enter your first name"
                    className="premium-input"
                  />
                </div>

                <div
                  className={cn(
                    "relative group",
                    type === "compare" ? "w-full sm:w-1/2" : "w-full"
                  )}
                >
                  <div className="input-icon-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#ea580c]"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <path d="M9 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Enter your last name"
                    className="premium-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pb-6 mt-auto">
                <button onClick={prevStep} className="secondary-button">
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={
                    !formData.firstName.trim() || !formData.lastName.trim()
                  }
                  className={`primary-button ${
                    !formData.firstName.trim() || !formData.lastName.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Step 7: Email */}
            <div
              className={`${
                (currentStep === 7 && formData.transactionType === "buying") ||
                (currentStep === 7 && formData.transactionType === "selling") ||
                (currentStep === 7 && formData.transactionType === "both")
                  ? "block animate-fadeInRight"
                  : "hidden"
              }
              flex flex-col w-full h-full px-6 pt-4 md:px-10 md:pt-6 overflow-hidden`}
            >
              <div
                className={cn(
                  "text-xl heading-text md:text-2xl lg:text-3xl mb-6",
                  "!text-[32px] md:!text-[42px] !text-center",
                  type === "compare" && "!mt-[50px] sm:!mt-[100px]"
                )}
              >
                What's your email?
              </div>

              {type === "compare" && (
                <div className="mt-2 mb-4 text-center">
                  {[
                    "Get a list of great local agents in your inbox today",
                    "We or your carefully selected agents may email you to help with your transaction",
                  ].map((option) => (
                    <div key={option} className="flex items-center gap-3 mb-2">
                      <div className="bg-[#0CB182] rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[11px] sm:text-[18px] text-[#272727]">
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <div className="relative group">
                  <div className="input-icon-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#ea580c]"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    className="premium-input"
                  />
                </div>
                <p className="mt-2 hint-text">
                  We'll send your property matches to this email
                </p>
                {/* Email validation function */}
                {formData.email && (
                  <p
                    className={`text-xs mt-1 ${
                      validateEmail(formData.email)
                        ? "text-green-500"
                        : "text-red-500"
                    } transition-colors`}
                  >
                    {validateEmail(formData.email)
                      ? "✓ Valid email"
                      : getEmailValidationMessage(formData.email)}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pb-6 mt-auto">
                <button onClick={prevStep} className="secondary-button">
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={
                    !formData.email.trim() || !validateEmail(formData.email)
                  }
                  className={`primary-button ${
                    !formData.email.trim() || !validateEmail(formData.email)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Step 8: Phone */}
            <div
              className={`${
                (currentStep === 8 && formData.transactionType === "buying") ||
                (currentStep === 8 && formData.transactionType === "selling") ||
                (currentStep === 8 && formData.transactionType === "both")
                  ? "block animate-fadeInRight"
                  : "hidden"
              }
              flex flex-col w-full h-full px-6 pt-4 md:px-10 md:pt-6 overflow-hidden`}
            >
              <div
                className={cn(
                  "text-xl heading-text md:text-2xl lg:text-3xl mb-6",
                  "!text-[32px] md:!text-[42px] !text-center",
                  type === "compare" && "!mt-[50px] sm:!mt-[100px]"
                )}
              >
                What's your phone number?
              </div>

              {type === "compare" && (
                <div className="px-2 mt-2 mb-4 text-center sm:px-0">
                  {[
                    "A phone consultation with your recommended agents is the best way to get help",
                    "We or your carefully selected agents may call you to assist with your transaction",
                  ].map((option) => (
                    <div
                      key={option}
                      className="flex items-start gap-2 mb-3 text-left sm:items-center sm:gap-3 sm:text-center"
                    >
                      <div className="bg-[#0CB182] rounded-full p-1 shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[12px] sm:text-[18px] text-[#272727] leading-snug sm:leading-normal">
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <div
                  className={`relative z-[100] ${
                    showSuccess ? "animate-fadeOut" : ""
                  }`}
                >
                  <PhoneInput
                    country={"us"}
                    value={formData.phone}
                    onChange={(phone) =>
                      setFormData({ ...formData, phone: `+${phone}` })
                    }
                    containerClass="!w-full phone-input-container"
                    inputClass="!w-full !h-[54px] !py-3.5 !text-[#272727] !rounded-lg focus:!border-[#ea580c] !text-base"
                    buttonClass="!border-[rgba(234,88,12,0.2)] !h-[54px] !rounded-l-lg !bg-white"
                    dropdownClass="!rounded-lg !border-[rgba(234,88,12,0.2)] !text-[#272727]"
                    searchClass="!rounded-t-lg !m-0 !py-2"
                    enableSearch={true}
                    dropdownStyle={{ zIndex: 999 }}
                    inputProps={{
                      name: "phone",
                      required: true,
                    }}
                    preferredCountries={["us"]}
                  />
                </div>
                <p className="mt-2 hint-text">
                  Your agent will call you at this number
                </p>
              </div>

              {submitError && (
                <div className="p-4 mt-4 text-sm text-red-700 border border-red-100 rounded-lg bg-red-50 animate-fadeIn">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>{submitError}</span>
                  </div>
                </div>
              )}

              <div
                className={`mt-auto pb-6 flex justify-between items-center ${
                  embedded ? "" : ""
                }`}
              >
                <button
                  onClick={prevStep}
                  className="secondary-button"
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    !formData.phone || formData.phone.length < 8 || isSubmitting
                  }
                  className={`primary-button ${
                    !formData.phone || formData.phone.length < 8 || isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>

            {/* Step: Selling Question (Only for Buying) */}
            <div
              className={`${
                currentStep === 9 && formData.transactionType === "buying"
                  ? "block animate-fadeInRight"
                  : "hidden"
              }
              flex flex-col w-full h-full px-6 pt-4 md:px-10 md:pt-6 overflow-hidden`}
            >
              <div className="mb-6 text-xl heading-text md:text-2xl lg:text-3xl">
                Are you also looking to sell a home?
              </div>

              <div className="flex flex-col gap-4 mt-2">
                {["Yes", "No"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFormData({ ...formData, wantsToSell: option });
                      nextStep();
                    }}
                    className={`option-button ${
                      formData.wantsToSell === option ? "selected-option" : ""
                    }`}
                  >
                    <span>{option}</span>
                    {formData.wantsToSell === option && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                          fill="white"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pb-6 mt-auto">
                <button onClick={prevStep} className="secondary-button">
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentQuestionnaire;
