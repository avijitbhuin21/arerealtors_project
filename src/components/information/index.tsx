import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

interface Requests {
  information?: boolean;
  delete?: boolean;
  shared?: boolean;
  notSold?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone?: string;
  requests: Requests;
  certify?: boolean;
}

const Information = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSubmitError(false);
    try {
      // Prepare data for Supabase
      const submissionData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        request_information: !!data.requests?.information,
        request_delete: !!data.requests?.delete,
        request_shared: !!data.requests?.shared,
        request_not_sold: !!data.requests?.notSold,
        certify: !!data.certify,
        created_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("consumer_privacy_requests")
        .insert([submissionData]);
      if (error) {
        setSubmitted(false);
        setSubmitError(true);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitted(false);
      setSubmitError(true);
    }
    console.log(data);
  };

  // Helper to safely render error messages
  const renderError = (err: unknown) => {
    if (typeof err === "string") return err;
    if (
      err &&
      typeof err === "object" &&
      "message" in err &&
      typeof err.message === "string"
    )
      return err.message;
    return null;
  };

  return (
    <div className="min-h-screen" style={{ marginTop: "-64px" }}>
      <div
        className="relative min-h-screen overflow-hidden bg-center bg-cover"
        style={{
          backgroundImage: "url('/infor.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center justify-center px-2 pt-20 pb-10 sm:py-24">
          <div className="w-[98%] md:w-[90%] xl:w-[70%] py-10 bg-white rounded-lg shadow-lg">
            <h2 className="mx-2 xxs:mx-0 mb-2 text-[22px] sm:text-[36px] font-extralight text-center">
              Consumer Privacy Act Requests
            </h2>
            <p className="w-[92%] sm:w-[65%] mx-auto mb-6 text-[14px] sm:text-[18px] text-start text-gray-700">
              Residents of California, Colorado, Connecticut, or Virginia may
              request to know what information we have stored about them and ask
              for us to delete that information. If you are a resident of one of
              these states you may complete the form below, email us at{" "}
              <a
                href="mailto:support@acerealtors.org"
                className="text-blue-600 hover:underline"
              >
                support@acerealtors.org
              </a>{" "}
              with a subject line of "CCPA Request", or call us directly at{" "}
              <a
                href="tel:(877) 695-9300"
                className="font-semibold text-orange-500 cursor-pointer hover:underline hover:text-orange-600"
              >
                (877) 695-9300
              </a>
              .
            </p>
            <form
              className="w-[90%] lg:w-[45%] mx-auto space-y-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                <label className="block mb-1 text-sm text-gray-700">Name</label>
                <input
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  placeholder="Name"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {renderError(errors.name.message)}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  Email
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  placeholder="Email"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {renderError(errors.email.message)}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  Phone Number
                </label>
                <input
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                  type="number"
                  placeholder="Phone Number"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {renderError(errors.phone?.message)}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  What is your request? (Check all that apply)
                </label>
                <div className="mt-4 ml-2 space-y-2 font-semibold">
                  <label className="flex items-center text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("requests.information")}
                      className="mr-2"
                    />
                    I'd like to know what information you have stored about me
                  </label>
                  <label className="flex items-center text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("requests.delete")}
                      className="mr-2"
                    />
                    I'd like you to delete my information
                  </label>
                  <label className="flex items-center text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("requests.shared")}
                      className="mr-2"
                    />
                    I'd like to know who my information has been shared with
                  </label>
                  <label className="flex items-center text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("requests.notSold")}
                      className="mr-2"
                    />
                    I'd like my information not be sold to third parties
                  </label>
                </div>
              </div>
              <div className="mt-2">
                <p className="mb-2 text-[13px] font-thin text-gray-700">
                  Please certify you are a resident of either CA, CO, CT, or VA
                  below (required)
                </p>
                <label className="flex items-center mt-2 text-sm cursor-pointer ms-2">
                  <input
                    type="checkbox"
                    {...register("certify", {
                      required: "You must certify residency",
                    })}
                    className="mr-2"
                  />
                  <span className="font-semibold">
                    I certify that I am a Resident of CA, CO, CT, or VA
                  </span>
                </label>
                {errors.certify && (
                  <p className="mt-1 text-xs text-red-500">
                    {renderError(errors.certify.message)}
                  </p>
                )}
              </div>
              <div className="grid place-items-center">
                {(submitted || submitError) && (
                  <div
                    className={`py-3 mb-2 text-sm rounded px-7 ${
                      submitError
                        ? "text-red-700 bg-red-100"
                        : "text-green-700 bg-green-100"
                    }`}
                  >
                    {submitError ? "Request failed" : "Request Submitted!"}
                  </div>
                )}
                <button
                  type="submit"
                  className="px-[32px] py-[8px] mt-4 text-[18px] font-semibold text-white transition-colors bg-orange-500 rounded-full hover:bg-orange-600"
                >
                  Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;
