import { useEffect, useState } from "react";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { cn } from "../../lib/utility";
import { Check, Plus, Minus } from "lucide-react";
import BuyingIcon from "./svg/sell.svg";
import SellingIcon from "./svg/home.svg";
import BothIcon from "./svg/both.svg";
import "./test.css";
import PhoneInput from "react-phone-input-2";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { geocodeByAddress } from "react-google-places-autocomplete";
import { getCityFromUrl } from "../../utils/urlUtils";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

interface FormData {
  transactionType: string;
  budget?: number;
  location?: string;
  timeframe?: string;
  propertyType?: string;
  address?: string;
  mortgageStatus?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  suite?: string;
  notSure?: boolean;
}

const propertyTypes = [
  { id: "single-family", label: "Single Family" },
  { id: "condo", label: "Condo" },
  { id: "land-lot", label: "Land/Lot" },
  { id: "other", label: "Other" },
];

const options = [
  { text: "I'm Buying", icon: SellingIcon, value: "buying" },
  { text: "I'm Selling", icon: BuyingIcon, value: "selling" },
  { text: "I'm Buying & Selling", icon: BothIcon, value: "both" },
];

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  utmCity?: string;
}

interface SellingPropertyProps {
  onSelect: (propertyType: string) => void;
  onNext: () => void;
  onBack: () => void;
}

interface PropertyAddressProps {
  onNext: () => void;
  onBack: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LookingBuying = ({
  onNext,
  onBack,
  formData,
  setFormData,
  utmCity,
}: StepProps) => {
  const [cityName, setCityName] = useState(formData.location || utmCity || "");

  const handleNext = () => {
    if (cityName.trim()) {
      setFormData({ ...formData, location: cityName.trim() });
      onNext();
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(615px-95px)]">
      <div className="flex-1">
        <div className="text-center">
          <h1 className="text-[28px] lg:text-[40px] font-semibold text-customblack mt-2">
            Where are you looking to buy?
          </h1>
          <p className="text-[20px] text-customblack mt-4">
            So we can recommend buyer experts in your area.
          </p>
        </div>

        <div className="mt-12 w-full max-w-[600px] mx-auto px-4">
          <div className="relative">
            <div className="absolute z-10 -translate-y-1/2 left-6 top-1/2">
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
                value: cityName ? { label: cityName, value: cityName } : null,
                onChange: async (place) => {
                  if (!place) {
                    setCityName("");
                    return;
                  }

                  try {
                    const results = await geocodeByAddress(place.label);
                    if (results && results.length > 0) {
                      const cityComponent = results[0].address_components.find(
                        (component) => component.types.includes("locality")
                      );

                      if (cityComponent) {
                        const cityName = `${cityComponent.long_name}, USA`;
                        setCityName(cityName);
                      } else {
                        setCityName(place.label);
                      }
                    } else {
                      setCityName(place.label);
                    }
                  } catch (error) {
                    console.error("Error geocoding address:", error);
                    setCityName(place.label);
                  }
                },
                onBlur: () => {
                  if (!cityName) {
                    setCityName("");
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
                    minHeight: "60px",
                    padding: "18px 20px",
                    paddingLeft: "52px",
                    fontSize: "18px",
                    border: "2px solid #E0E0E0",
                    borderRadius: "5px",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#EA580C",
                    },
                    "&:focus-within": {
                      borderColor: "#EA580C",
                      boxShadow: "none",
                    },
                  }),
                  menu: (provided) => ({
                    ...provided,
                    marginTop: "4px",
                    borderRadius: "5px",
                    border: "2px solid #E0E0E0",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    zIndex: 20,
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    padding: "12px",
                    cursor: "pointer",
                    backgroundColor: state.isFocused
                      ? "rgba(234, 88, 12, 0.1)"
                      : "transparent",
                    color: "#272727",
                    fontSize: "18px",
                    "&:hover": {
                      backgroundColor: "rgba(234, 88, 12, 0.1)",
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
              apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
              autocompletionRequest={{
                types: ["(cities)"],
                componentRestrictions: { country: "us" },
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between w-full gap-5 py-6 mt-auto lg:gap-0">
        <button
          onClick={onBack}
          className="w-full lg:w-fit px-12 py-4 text-[20px] font-semibold text-[#272727] bg-white border-2 border-[#E0E0E0] rounded transition-all hover:border-[#EA580C]"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!cityName.trim()}
          className={`w-full lg:w-fit px-12 py-4 text-[20px] font-semibold text-white rounded transition-all ${
            cityName.trim()
              ? "bg-[#EA580C] hover:bg-[#EA580C]/90"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const PropertyAddress = ({
  onNext,
  onBack,
  formData,
  setFormData,
}: PropertyAddressProps) => {
  const [streetAddress, setStreetAddress] = useState(formData.address || "");

  const handleNext = () => {
    if (streetAddress.trim()) {
      setFormData({
        ...formData,
        address: streetAddress.trim(),
      });
      onNext();
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(615px-95px)]">
      <div className="flex-1">
        <h1 className="text-[28px] lg:text-[40px] font-semibold text-customblack text-center mt-2">
          What is the address
          <br />
          of your property?
        </h1>

        <p className="text-[14px] md:text-[20px] text-customblack text-center mt-4">
          So we can recommend experts who have sold similar properties.
        </p>

        <div className="px-4 mx-auto mt-12 w-full md:w-[80%]">
          <div className="relative">
            <div className="absolute z-10 -translate-y-1/2 left-6 top-1/2">
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
                value: streetAddress
                  ? { label: streetAddress, value: streetAddress }
                  : null,
                onChange: async (place) => {
                  if (!place) {
                    setStreetAddress("");
                    return;
                  }

                  try {
                    const results = await geocodeByAddress(place.label);
                    if (results && results.length > 0) {
                      setStreetAddress(place.label);
                    } else {
                      setStreetAddress(place.label);
                    }
                  } catch (error) {
                    console.error("Error geocoding address:", error);
                    setStreetAddress(place.label);
                  }
                },
                onBlur: () => {
                  if (!streetAddress) {
                    setStreetAddress("");
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
                    minHeight: "60px",
                    padding: "18px 20px",
                    paddingLeft: "52px",
                    fontSize: "18px",
                    border: "2px solid #E0E0E0",
                    borderRadius: "5px",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#EA580C",
                    },
                    "&:focus-within": {
                      borderColor: "#EA580C",
                      boxShadow: "none",
                    },
                  }),
                  menu: (provided) => ({
                    ...provided,
                    marginTop: "4px",
                    borderRadius: "5px",
                    border: "2px solid #E0E0E0",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    zIndex: 20,
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    padding: "12px",
                    cursor: "pointer",
                    backgroundColor: state.isFocused
                      ? "rgba(234, 88, 12, 0.1)"
                      : "transparent",
                    color: "#272727",
                    fontSize: "18px",
                    "&:hover": {
                      backgroundColor: "rgba(234, 88, 12, 0.1)",
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
              apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
              autocompletionRequest={{
                types: ["address"],
                componentRestrictions: { country: "us" },
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between w-full gap-5 py-6 mt-auto lg:gap-0">
        <button
          onClick={onBack}
          className="w-full lg:w-fit px-12 py-4 text-[20px] font-semibold text-[#272727] bg-white border-2 border-[#E0E0E0] rounded transition-all hover:border-[#EA580C]"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!streetAddress.trim()}
          className={`w-full lg:w-fit px-12 py-4 text-[20px] font-semibold text-white rounded transition-all ${
            streetAddress.trim()
              ? "bg-[#EA580C] hover:bg-[#EA580C]/90"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const SellingProperty = ({ onSelect, onBack }: SellingPropertyProps) => {
  const [selectedType, setSelectedType] = useState("");

  const handleSelect = (type: string) => {
    setSelectedType(type);
    onSelect(type);
  };

  return (
    <div className="relative flex flex-col h-[calc(615px-95px)]">
      <div className="flex-1">
        <h1 className="text-[28px] lg:text-[40px] font-semibold text-customblack text-center mt-2">
          What kind of property
          <br />
          are you selling?
        </h1>

        <div className="mt-8 lg:mt-12 grid md:grid-cols-2 gap-x-8 gap-y-4 w-full max-w-[800px] mx-auto px-4">
          {propertyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSelect(type.id)}
              className={`w-full p-4 md:p-6 text-[14px] lg:text-[20px] font-medium text-[#585F69] text-center border-2 ${
                selectedType === type.id
                  ? "border-[#EA580C]"
                  : "border-[#E0E0E0]"
              } rounded-[5px] transition-all duration-300 hover:border-[#EA580C] hover:shadow-[0_0_28px_rgba(30,41,59,0.08)]`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-start w-full py-6 mt-auto">
        <button
          onClick={onBack}
          className="w-1/2 lg:w-fit px-12 py-4 text-[20px] font-semibold text-[#272727] bg-white border-2 border-[#E0E0E0] rounded transition-all hover:border-[#EA580C]"
        >
          Back
        </button>
      </div>
    </div>
  );
};

const PhoneNumber = ({ onBack, formData, setFormData }: StepProps) => {
  const [phone, setPhone] = useState(formData.phone || "");
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    const phoneDigits = value.replace(/\D/g, "").slice(1);
    setIsValid(phoneDigits.length >= 10);
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

  const handleAccept = async () => {
    if (!phone || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Update form data with phone
      setFormData({ ...formData, phone });

      const budget = formData.budget || 600000;

      // Format the data for Supabase
      const submissionData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formatPhoneNumber(phone),
        budget:
          budget < 1000000
            ? `${budget} - ${budget + 50000}`
            : `${budget} - ${budget + 250000}`,
        location: formData.location,
        propertytype: formData.propertyType,
        timeframe: formData.timeframe,
        transaction_type: formData.transactionType,
        mortgage_status: formData.mortgageStatus || null,
        address: formData.address || null,
        created_at: new Date().toISOString(),
        type: formData.transactionType,
        not_sure: formData.notSure || false,
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

      // Redirect to thank you page
      navigate("/thank-you");
    } catch (err) {
      console.error("Unexpected error:", err);
      setSubmitError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(615px-95px)]">
      <div className="flex-1">
        <h1 className="text-[28px] lg:text-[40px] font-semibold text-customblack text-center mt-2">
          What's your phone number?
        </h1>

        <div className="mx-auto mt-4 space-y-4 md:mt-8 w-fit">
          <div className="flex items-center gap-2">
            <div className="bg-[#047857] rounded-full p-1">
              <Check className="w-3 h-3 text-white md:w-4 md:h-4" />
            </div>
            <p className="text-[13px] md:text-[18px] text-[#272727]">
              A phone consultation with your recommended agents is the best way
              to get help
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#047857] rounded-full p-1">
              <Check className="w-3 h-3 text-white md:w-4 md:h-4 " />
            </div>
            <p className="text-[13px] md:text-[18px] text-[#272727]">
              We or your carefully selected agents may call you to assist with
              your transaction
            </p>
          </div>
        </div>

        <div className="mt-4 md:mt-8">
          <p className="text-[16px] text-[#585F69] mb-2">
            Please enter your phone number below:
          </p>
          <div className="w-full">
            <PhoneInput
              country="us"
              value={phone}
              onChange={handlePhoneChange}
              inputClass="!w-full !h-[60px] !text-[18px]"
              containerClass="!w-full"
              buttonClass="!h-[60px] !border-[#E0E0E0]"
              dropdownClass="!w-[300px] !max-h-[200px] !overflow-y-auto"
              searchClass="!h-[40px] !py-2 !px-3 !text-[16px] !mb-2"
              inputProps={{
                required: true,
                placeholder: "(XXX) XXX-XXXX",
              }}
              enableSearch={true}
              searchPlaceholder="Search countries..."
              specialLabel=""
              disableSearchIcon={false}
              searchNotFound="No country found"
            />
          </div>
        </div>

        <div className="mt-4 md:mt-8">
          <button
            onClick={handleAccept}
            disabled={!isValid || isSubmitting}
            className={`w-full py-4 text-[20px] font-semibold text-white rounded transition-all ${
              isValid && !isSubmitting
                ? "bg-[#EA580C] hover:bg-[#EA580C]/90"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Accept"}
          </button>
          {submitError && (
            <p className="mt-2 text-sm text-center text-red-500">
              {submitError}
            </p>
          )}
        </div>

        <p className="mt-4 text-[14px] text-[#585F69] text-start">
          By clicking "Accept", I am providing my esign and express written
          consent to allow ReferralExchange and our affiliated Participating
          Agents, or parties calling on their behalf, to contact me at the phone
          number above for marketing purposes, including through the use of
          calls, SMS/MMS, prerecorded and/or artificial voice messages using an
          automated dialing system to provide agent info, even if your number is
          listed on a corporate, state or federal Do-Not-Call list. Consent is
          not a condition for our service and you can revoke it at any time.
        </p>
      </div>
    </div>
  );
};

const Email = ({ onNext, onBack, formData, setFormData }: StepProps) => {
  const [email, setEmail] = useState(formData.email || "");
  const [isValid, setIsValid] = useState(true);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(newEmail));
  };

  const handleNext = () => {
    if (isValid && email) {
      setFormData({ ...formData, email });
      onNext();
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(615px-95px)]">
      <div className="flex-1">
        <h1 className="text-[28px] lg:text-[40px] font-semibold text-customblack text-center mt-2">
          What's your email?
        </h1>

        <div className="mx-auto mt-4 space-y-4 md:mt-8 w-fit">
          <div className="flex items-center gap-2">
            <div className="bg-[#047857] rounded-full p-1">
              <Check className="w-3 h-3 text-white md:w-4 md:h-4" />
            </div>
            <p className="text-[13px] md:text-[18px] text-[#272727]">
              Get a list of great local agents in your inbox today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#047857] rounded-full p-1">
              <Check className="w-3 h-3 text-white md:w-4 md:h-4" />
            </div>
            <p className="text-[13px] md:text-[18px] text-[#272727]">
              We or your carefully selected agents may email you to help with
              your transaction
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-[16px] text-[#585F69] mb-2">
            Please enter your email below:
          </p>
          <div className="w-full">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Email"
              className={`w-full h-[60px] px-6 text-[18px] border-2 ${
                isValid ? "border-[#E0E0E0]" : "border-red-500"
              } rounded-[5px] focus:border-[#EA580C] focus:outline-none transition-all`}
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleNext}
            disabled={!isValid || !email}
            className={`w-full py-4 text-[20px] font-semibold text-white rounded transition-all ${
              isValid && email
                ? "bg-[#EA580C] hover:bg-[#EA580C]/90"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>

        <p className="mt-4 text-[14px] text-[#585F69] text-start">
          By clicking "Next" above, I acknowledge and agree to
          ReferralExchange's{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Terms of Use
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
          , which includes binding arbitration and consent to receive electronic
          communications.
        </p>
      </div>

      <div className="flex justify-between w-full gap-5 py-6 mt-auto lg:gap-0">
        <button
          onClick={onBack}
          className="w-full lg:w-fit px-12 py-4 text-[20px] font-semibold text-[#272727] bg-white border-2 border-[#E0E0E0] rounded transition-all hover:border-[#EA580C]"
        >
          Back
        </button>
      </div>
    </div>
  );
};

const FullName = ({ onNext, onBack, formData, setFormData }: StepProps) => {
  return (
    <div className="relative flex flex-col h-[calc(615px-95px)]">
      <div className="flex-1">
        <h1 className="text-[28px] lg:text-[40px] font-semibold text-customblack text-center mt-2">
          What's your name?
        </h1>
        <p className="text-[13px] md:text-[20px] text-customblack text-center mt-4">
          Our recommendations are free. No strings attached.
        </p>

        <div className="mt-8">
          <div className="grid w-full mx-auto md:grid-cols-2 gap-x-6 gap-y-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName || ""}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="h-[60px] px-6 text-[18px] border-2 border-[#E0E0E0] rounded-[5px] focus:border-[#EA580C] focus:outline-none transition-all"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName || ""}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="h-[60px] px-6 text-[18px] border-2 border-[#E0E0E0] rounded-[5px] focus:border-[#EA580C] focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between w-full gap-5 py-6 mt-auto lg:gap-0">
        <button
          onClick={onBack}
          className="w-full lg:w-fit px-12 py-4 text-[20px] font-semibold text-[#272727] bg-white border-2 border-[#E0E0E0] rounded transition-all hover:border-[#EA580C]"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!formData.firstName?.trim() || !formData.lastName?.trim()}
          className={`w-full lg:w-fit px-12 py-4 text-[20px] font-semibold text-white rounded transition-all ${
            formData.firstName?.trim() && formData.lastName?.trim()
              ? "bg-[#EA580C] hover:bg-[#EA580C]/90"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const MortgageStatus = ({
  onNext,
  onBack,
  formData,
  setFormData,
}: StepProps) => {
  const mortgageOptions = [
    "All Cash",
    "Haven't applied",
    "Pre-qualified",
    "Pre-approved",
    "Not Sure",
  ];

  const handleMortgageSelect = (mortgageStatus: string) => {
    setFormData({ ...formData, mortgageStatus });
    onNext();
  };

  return (
    <div className="relative flex flex-col h-[calc(615px-95px)]">
      <div className="flex-1">
        <h1 className="text-[28px] lg:text-[40px] font-semibold text-customblack text-center mt-2">
          What is your <br /> Mortgage Status?
        </h1>

        <div className="mt-4 md:mt-8">
          <div className="grid w-full md:w-[80%] mx-auto md:grid-cols-2 gap-x-8 gap-y-2 md:gap-y-4">
            {mortgageOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleMortgageSelect(option)}
                className={`p-3 md:p-6 text-[14px] md:text-[20px] font-medium text-[#585F69] text-center border-2 ${
                  formData.mortgageStatus === option
                    ? "border-[#EA580C]"
                    : "border-[#E0E0E0]"
                } rounded-[5px] transition-all duration-300 hover:border-[#EA580C] hover:shadow-[0_0_28px_rgba(30,41,59,0.08)]`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-start w-full py-6 mt-auto">
        <button
          onClick={onBack}
          className="w-1/2 lg:w-fit px-12 py-4 text-[20px] font-semibold text-[#272727] bg-white border-2 border-[#E0E0E0] rounded transition-all hover:border-[#EA580C]"
        >
          Back
        </button>
      </div>
    </div>
  );
};

const BuyHome = ({ onNext, onBack, formData, setFormData }: StepProps) => {
  const timeframes = [
    "Immediately",
    "1 Month or Less",
    "2 - 3 Months",
    "3 - 6 Months",
    "6 - 9 Months",
    "9 Months or Later",
  ];

  const handleTimeframeSelect = (timeframe: string) => {
    setFormData({ ...formData, timeframe });
    onNext();
  };

  return (
    <div className="relative flex flex-col h-[calc(615px-95px)]">
      <div className="flex-1">
        <h1 className="text-[28px] lg:text-[40px] font-semibold text-customblack text-center mt-2">
          When do you plan <br /> to buy a home?
        </h1>

        <div className="mt-4 md:mt-8">
          <div className="grid w-full md:w-[80%] mx-auto md:grid-cols-2 gap-x-8 gap-y-2 md:gap-y-4">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => handleTimeframeSelect(timeframe)}
                className={`p-3 md:p-6 text-[14px] md:text-[20px] font-medium text-[#585F69] text-center border-2 ${
                  formData.timeframe === timeframe
                    ? "border-[#EA580C]"
                    : "border-[#E0E0E0]"
                } rounded-[5px] transition-all duration-300 hover:border-[#EA580C] hover:shadow-[0_0_28px_rgba(30,41,59,0.08)]`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-start w-full py-6 mt-auto">
        <button
          onClick={onBack}
          className="w-1/2 lg:w-fit px-12 py-4 text-[20px] font-semibold text-[#272727] bg-white border-2 border-[#E0E0E0] rounded transition-all hover:border-[#EA580C]"
        >
          Back
        </button>
      </div>
    </div>
  );
};

const PriceRange = ({ onNext, onBack, formData, setFormData }: StepProps) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    let adjustedValue;
    if (value < 1000000) {
      adjustedValue = Math.round(value / 50000) * 50000;
    } else {
      adjustedValue = Math.round(value / 250000) * 250000;
    }
    setFormData({ ...formData, budget: adjustedValue });
  };

  const incrementPrice = () => {
    if (!formData.budget) return;
    const increment = formData.budget < 1000000 ? 50000 : 250000;
    const newValue = Math.min(5000000, formData.budget + increment);
    setFormData({ ...formData, budget: newValue });
  };

  const decrementPrice = () => {
    if (!formData.budget) return;
    const decrement = formData.budget <= 1000000 ? 50000 : 250000;
    const newValue = Math.max(100000, formData.budget - decrement);
    setFormData({ ...formData, budget: newValue });
  };

  return (
    <div className="relative flex flex-col h-[calc(615px-95px)]">
      <div className="">
        <h1 className="text-[28px] lg:text-[40px] font-semibold text-customblack text-center mt-2">
          What price are you hoping to{" "}
          {formData.transactionType === "buying" ? "buy" : "sell"} at?
        </h1>

        <div className="mt-10 lg:mt-16">
          <div className="flex items-center justify-between mb-8 w-full lg:w-[70%] mx-auto">
            <button
              onClick={decrementPrice}
              className="p-2 transition-shadow bg-white rounded-full shadow-md hover:shadow-lg"
            >
              <Minus className="w-5 h-5 text-[#272727]" />
            </button>
            <p className="text-3xl font-semibold text-center text-black md:text-[40px]">
              {formData.budget
                ? `${formatCurrency(formData.budget)} - ${formatCurrency(
                    formData.budget +
                      (formData.budget < 1000000 ? 50000 : 250000)
                  )}`
                : "$600K - $650K"}
            </p>
            <button
              onClick={incrementPrice}
              className="p-2 transition-shadow bg-white rounded-full shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5 text-[#272727]" />
            </button>
          </div>

          <div className="px-2 mb-6">
            <div className="w-full lg:w-[70%] mx-auto">
              <input
                type="range"
                min="100000"
                max="5000000"
                step="1000"
                value={formData.budget || 600000}
                onChange={handleSliderChange}
                className="w-full h-[12px] bg-[rgba(234,88,12,0.2)] rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #EA580C 0%, #EA580C ${
                    ((formData.budget || 600000) / 5000000) * 100
                  }%, rgba(234, 88, 12, 0.2) ${
                    ((formData.budget || 600000) / 5000000) * 100
                  }%)`,
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-[18px] text-gray-500">$100K</span>
                <span className="text-[18px] text-gray-500">$5M+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between w-full gap-5 py-6 mt-auto lg:flex-row lg:gap-0">
        <div className="flex flex-col w-full gap-5 lg:hidden">
          <button
            onClick={() => {
              setFormData({ ...formData, notSure: true });
              onNext();
            }}
            className="w-full px-12 py-4 text-[20px] font-semibold text-[#EA580C] bg-white rounded transition-all border-[#EA580C]"
          >
            Not Sure
          </button>
          <div className="flex justify-between w-full gap-5">
            <button
              onClick={onBack}
              className="w-1/2 px-12 py-4 text-[20px] font-semibold text-[#272727] bg-white border-2 border-[#E0E0E0] rounded transition-all hover:border-[#EA580C]"
            >
              Back
            </button>
            <button
              onClick={onNext}
              disabled={!formData.budget}
              className={`w-1/2 px-12 py-4 text-[20px] font-semibold text-white rounded transition-all ${
                formData.budget
                  ? "bg-[#EA580C] hover:bg-[#EA580C]/90"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="justify-between hidden w-full lg:flex">
          <button
            onClick={onBack}
            className="px-12 py-4 text-[20px] font-semibold text-[#272727] bg-white border-2 border-[#E0E0E0] rounded transition-all hover:border-[#EA580C]"
          >
            Back
          </button>
          <div className="flex space-x-10">
            <button
              onClick={() => {
                setFormData({ ...formData, notSure: true });
                onNext();
              }}
              className="px-12 py-4 text-[20px] font-semibold text-[#EA580C] bg-white border-2 rounded transition-all border-[#EA580C]"
            >
              Not Sure
            </button>
            <button
              onClick={onNext}
              disabled={!formData.budget}
              className={`px-12 py-4 text-[20px] font-semibold text-white rounded transition-all ${
                formData.budget
                  ? "bg-[#EA580C] hover:bg-[#EA580C]/90"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CityName = ({
  onNext,
  onBack,
  formData,
  setFormData,
  utmCity,
}: StepProps) => {
  const [cityName, setCityName] = useState(formData.location || utmCity || "");

  const handleNext = () => {
    if (cityName.trim()) {
      setFormData({ ...formData, location: cityName.trim() });
      onNext();
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(615px-95px)]">
      <div className="flex-1">
        <div className="text-center">
          <h1 className="text-[28px] lg:text-[40px] font-semibold text-customblack mt-2">
            Where would you <br /> like to buy?
          </h1>
        </div>

        <div className="mt-8">
          <div className="w-full lg:w-[70%] mx-auto">
            <div className="relative">
              <div className="absolute z-10 -translate-y-1/2 left-6 top-1/2">
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
                  value: cityName ? { label: cityName, value: cityName } : null,
                  onChange: async (place) => {
                    if (!place) {
                      setCityName("");
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
                          setCityName(cityName);
                        } else {
                          setCityName(place.label);
                        }
                      } else {
                        setCityName(place.label);
                      }
                    } catch (error) {
                      console.error("Error geocoding address:", error);
                      setCityName(place.label);
                    }
                  },
                  onBlur: () => {
                    if (!cityName) {
                      setCityName("");
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
                      minHeight: "60px",
                      padding: "18px 20px",
                      paddingLeft: "52px",
                      fontSize: "18px",
                      border: "2px solid #E0E0E0",
                      borderRadius: "5px",
                      boxShadow: "none",
                      "&:hover": {
                        borderColor: "#EA580C",
                      },
                      "&:focus-within": {
                        borderColor: "#EA580C",
                        boxShadow: "none",
                      },
                    }),
                    menu: (provided) => ({
                      ...provided,
                      marginTop: "4px",
                      borderRadius: "5px",
                      border: "2px solid #E0E0E0",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      zIndex: 20,
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      padding: "12px",
                      cursor: "pointer",
                      backgroundColor: state.isFocused
                        ? "rgba(234, 88, 12, 0.1)"
                        : "transparent",
                      color: "#272727",
                      fontSize: "18px",
                      "&:hover": {
                        backgroundColor: "rgba(234, 88, 12, 0.1)",
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
                apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
                autocompletionRequest={{
                  types: ["(cities)"],
                  componentRestrictions: { country: "us" },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between w-full gap-4 py-6 mt-auto lg:gap-0">
        <button
          onClick={onBack}
          className="w-1/2 lg:w-fit px-12 py-4 text-[20px] font-semibold text-[#272727] bg-white border-2 border-[#E0E0E0] rounded transition-all hover:border-[#EA580C]"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!cityName.trim()}
          className={`w-1/2 lg:w-fit px-12 py-4 text-[20px] font-semibold text-white rounded transition-all ${
            cityName.trim()
              ? "bg-[#EA580C] hover:bg-[#EA580C]/90"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const InitialStep = ({
  onSelect,
  utmCity,
}: {
  onSelect: (value: string) => void;
  utmCity: string;
}) => {
  return (
    <div>
      <h1 className="block lg:hidden text-[22px] font-semibold text-customblack text-center mt-4">
        Are you buying or selling?
      </h1>
      <h1 className="hidden lg:block text-[28px] lg:text-[40px] font-semibold text-customblack text-center mt-4">
        Find The Best REALTORS® {utmCity ? `in ${utmCity}` : "For You"}
      </h1>
      <p className="hidden lg:block text-[20px] text-customblack text-center mt-5">
        Instantly see a personalized list of great agents to choose from.
      </p>

      <div className="grid gap-3 mx-5 md:mx-0 md:gap-10 md:grid-cols-3 mt-7 md:mt-14">
        {options.map((option) => {
          return (
            <div
              key={option.value}
              onClick={() => onSelect(option.value)}
              className="group relative text-[14px] md:text-[22px] font-medium text-customblack text-center p-3 lg:p-9 cursor-pointer border-2 border-[#E0E0E0] rounded-[5px] transition-all duration-300 shadow-[0_0_28px_rgba(30,41,59,0.08)] hover:shadow-[0_0_28px_rgba(30,41,59,0.16)] overflow-hidden"
            >
              <span className="ease absolute left-0 top-0 h-0 w-0 border-t-[3px] border-[#EA580C] transition-all duration-200 group-hover:w-full"></span>
              <span className="ease absolute right-0 top-0 h-0 w-0 border-r-[3px] border-[#EA580C] transition-all duration-200 group-hover:h-full"></span>
              <span className="ease absolute bottom-0 right-0 h-0 w-0 border-b-[3px] border-[#EA580C] transition-all duration-200 group-hover:w-full"></span>
              <span className="ease absolute bottom-0 left-0 h-0 w-0 border-l-[3px] border-[#EA580C] transition-all duration-200 group-hover:h-full"></span>
              <div className="relative">
                <img
                  src={option.icon}
                  alt={option.text}
                  className="w-9 h-9 lg:w-[50px] lg:h-[50px] mx-auto mb-2 md:mb-4"
                />
                {option.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full h-[0.5px] bg-[#E0E0E0] my-7 md:my-10" />

      <div className="px-2 mt-2 mb-4 text-center sm:px-0">
        {[
          "We've worked with over 10k happy home buyers & sellers",
          "We only recommend the top agents in your area",
          "Get a free custom list of top agents in your area in less than 2 minutes",
        ].map((option) => (
          <div
            key={option}
            className="flex items-start gap-2 mb-3 text-left sm:items-center sm:text-center"
          >
            <div className="bg-[#047857] rounded-full p-1 shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={4} />
            </div>
            <span className="text-[14px] md:text-[16px] text-[#272727] leading-snug sm:leading-normal">
              {option}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;
  const indicatorProgress =
    currentStep === totalSteps ? Math.min(progress, 95) : progress;

  return (
    <div className="absolute top-0 left-0 w-full">
      <div className="relative">
        <div className="w-full h-[12px] bg-[#E0E0E0] rounded">
          <div
            className="h-[12px] bg-orange-500 rounded-tl-[5px] rounded-r-[5px] transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {currentStep !== 1 && (
          <div
            className="flex justify-center transition-all duration-300 ease-in-out"
            style={{
              marginLeft: `${indicatorProgress}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div
              className={cn(
                "relative mt-2",
                currentStep === totalSteps && "me-24 xxs:me-20 md:me-12 lg:me-8"
              )}
            >
              <div className="absolute w-3 h-3 transform rotate-45 -translate-x-1/2 bg-orange-500 left-1/2 -top-1" />
              <div className="min-w-[120px] inline-flex items-center justify-center px-4 py-1 text-[16px] text-[#EA580C] font-semibold border border-orange-500 rounded-full bg-white relative">
                {currentStep === totalSteps
                  ? "Last Step!"
                  : `Step ${currentStep} / ${totalSteps}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Page Component
function Test() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    transactionType: "",
    budget: 600000,
  });
  const [utmCity, setUtmCity] = useState("");

  console.log(utmCity, "utm");

  useEffect(() => {
    (async () => {
      const response = await getCityFromUrl();
      setUtmCity(response);
    })();
  }, []);

  const getTotalSteps = (type: string) => {
    switch (type) {
      case "buying":
        return 8; // Buying steps
      case "selling":
        return 7; // Selling steps
      case "both":
        return 8; // Buying & Selling steps
      default:
        return 7;
    }
  };

  const handleOptionSelect = (value: string) => {
    // Reset form data to initial state when selecting a new transaction type
    setFormData({
      transactionType: value,
      budget: 600000, // Keep the default budget
    });
    setCurrentStep(2);
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const renderStep = () => {
    if (currentStep === 1) {
      return <InitialStep onSelect={handleOptionSelect} utmCity={utmCity} />;
    }

    // Common second step for all flows
    if (currentStep === 2) {
      return (
        <PriceRange
          onNext={handleNext}
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      );
    }

    // Different flows based on transaction type
    switch (formData.transactionType) {
      case "buying":
        switch (currentStep) {
          case 3:
            return (
              <CityName
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setFormData={setFormData}
                utmCity={utmCity}
              />
            );
          case 4:
            return (
              <BuyHome
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setFormData={setFormData}
              />
            );
          case 5:
            return (
              <MortgageStatus
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setFormData={setFormData}
              />
            );
          case 6:
            return (
              <FullName
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setFormData={setFormData}
              />
            );
          case 7:
            return (
              <Email
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setFormData={setFormData}
              />
            );
          case 8:
            return (
              <PhoneNumber
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setFormData={setFormData}
              />
            );
        }
        break;

      case "selling":
        switch (currentStep) {
          case 3:
            return (
              <SellingProperty
                onSelect={(type) => {
                  setFormData({ ...formData, propertyType: type });
                  setCurrentStep((prev) => prev + 1);
                }}
                onNext={handleNext}
                onBack={handleBack}
              />
            );
          case 4:
            return (
              <PropertyAddress
                onNext={handleNext}
                onBack={() => setCurrentStep((prev) => prev - 1)}
                formData={formData}
                setFormData={setFormData}
              />
            );
          case 5:
            return (
              <FullName
                onNext={handleNext}
                onBack={() => setCurrentStep((prev) => prev - 1)}
                formData={formData}
                setFormData={setFormData}
              />
            );
          case 6:
            return (
              <Email
                onNext={handleNext}
                onBack={() => setCurrentStep((prev) => prev - 1)}
                formData={formData}
                setFormData={setFormData}
              />
            );
          case 7:
            return (
              <PhoneNumber
                onNext={handleNext}
                onBack={() => setCurrentStep((prev) => prev - 1)}
                formData={formData}
                setFormData={setFormData}
              />
            );
        }
        break;

      case "both":
        switch (currentStep) {
          case 3:
            return (
              <SellingProperty
                onSelect={(type) => {
                  setFormData({ ...formData, propertyType: type });
                  setCurrentStep((prev) => prev + 1);
                }}
                onNext={handleNext}
                onBack={handleBack}
              />
            );
          case 4:
            return (
              <PropertyAddress
                onNext={handleNext}
                onBack={() => setCurrentStep((prev) => prev - 1)}
                formData={formData}
                setFormData={setFormData}
              />
            );
          case 5:
            return (
              <LookingBuying
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setFormData={setFormData}
                utmCity={utmCity}
              />
            );
          case 6:
            return (
              <FullName
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setFormData={setFormData}
              />
            );
          case 7:
            return (
              <Email
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setFormData={setFormData}
              />
            );
          case 8:
            return (
              <PhoneNumber
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setFormData={setFormData}
              />
            );
        }
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div
          className="relative min-h-screen overflow-hidden bg-fixed bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: "url(/bg.jpg)",
            backgroundAttachment: "fixed",
          }}
        >
          <Header />

          {currentStep === 1 && (
            <>
              <h1 className="block lg:hidden ms-2 text-[24px] font-semibold text-white text-start sm:text-center">
                Find The Best REALTORS® in <br />{" "}
                {utmCity ? utmCity : "Your Area"}
              </h1>
              <p className="block lg:hidden mx-2 text-[14px] text-white text-start sm:text-center mb-4">
                Instantly see a personalized list of great agents to choose
                from.
              </p>
            </>
          )}

          <div
            className={cn(
              "bg-[#FCFCFB] w-[98%] xxs:w-[95%] xl:w-[72%] mx-auto min-h-[615px] my-5 rounded md:my-10 lg:my-16 relative  shadow-[0_0_28px_rgba(30,41,59,0.08)]",
              currentStep === 1
                ? "p-4 md:p-16"
                : "px-4 sm:px-6 md:px-16 pt-12 md:pt-16",
              ((formData.transactionType === "buying" && currentStep === 8) ||
                (formData.transactionType === "selling" && currentStep === 7) ||
                (formData.transactionType === "both" && currentStep === 8)) &&
                "min-h-[800px] sm:min-h-[615px]"
            )}
          >
            <ProgressBar
              currentStep={currentStep}
              totalSteps={getTotalSteps(formData.transactionType)}
            />
            {renderStep()}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Test;
