import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import { supabase } from "../lib/supabase";
import { SubmittedData } from "../types";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";

// Gradient colors for charts and UI elements
const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#10b981",
];

interface Blob {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SubmittedData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Check if user is logged in
  useEffect(() => {
    const username = localStorage.getItem("acerealtors_username");
    const password = localStorage.getItem("acerealtors_pass");

    if (!username || !password) {
      console.log("No credentials found, redirecting to login");
      navigate("/adminlogin");
      return;
    }

    // Verify credentials with Supabase
    const verifyCredentials = async () => {
      try {
        const { data, error } = await supabase
          .from("Admin_Profiles")
          .select()
          .eq("username", username)
          .eq("password", password)
          .single();

        if (error || !data) {
          console.log("Invalid credentials, redirecting to login");
          localStorage.removeItem("acerealtors_username");
          localStorage.removeItem("acerealtors_pass");
          navigate("/adminlogin");
        }
      } catch (err) {
        console.error("Error verifying credentials:", err);
        navigate("/adminlogin");
      }
    };

    verifyCredentials();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("acerealtors_username");
    localStorage.removeItem("acerealtors_pass");
    navigate("/adminlogin");
  };
  const [sortBy, setSortBy] = useState<keyof SubmittedData>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  // Canvas background animation reference
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated background using canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const blobs: Blob[] = [];

    // Create initial blobs
    for (let i = 0; i < 5; i++) {
      blobs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 50 + Math.random() * 100,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: COLORS[i % COLORS.length],
        alpha: 0.03 + Math.random() * 0.04,
      });
    }

    // Resize canvas to match window dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop
    const render = () => {
      // Clear the canvas with semi-transparent white to create trail effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update each blob
      blobs.forEach((blob) => {
        // Update position
        blob.x += blob.speedX;
        blob.y += blob.speedY;

        // Bounce off edges
        if (blob.x > canvas.width || blob.x < 0) blob.speedX *= -1;
        if (blob.y > canvas.height || blob.y < 0) blob.speedY *= -1;

        // Draw blob
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );
        gradient.addColorStop(
          0,
          `rgba(${hexToRgb(blob.color)}, ${blob.alpha})`
        );
        gradient.addColorStop(1, `rgba(${hexToRgb(blob.color)}, 0)`);
        ctx.fillStyle = gradient;
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    // Cleanup function
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Helper function to convert hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
          result[3],
          16
        )}`
      : "255, 255, 255";
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: submittedData, error } = await supabase
        .from("submitted_data")
        .select("*")
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (error) throw error;

      // Log the raw data from Supabase
      console.log("Raw data from Supabase:", submittedData);

      // Log each record's transactionType
      submittedData?.forEach((record, index) => {
        console.log(
          `Record ${index + 1} transactionType:`,
          record.transactionType
        );

        // Log complete object if name is "asg ag"
        if (record.name === "asg ag") {
          console.log("Found record with name 'asg ag':", record);
        }
      });

      setData(submittedData as SubmittedData[]);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortBy, sortOrder]);

  // Data for charts
  const propertyTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const type = item.propertytype || "Not Specified";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const timeframeData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const timeframe = item.timeframe || "Not Specified";
      counts[timeframe] = (counts[timeframe] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const budgetData = useMemo(() => {
    const ranges: Record<string, number> = {
      "$100k - $500k": 0,
      "$500k - $800k": 0,
      "$800k - $1M": 0,
      "$1M - $1.5M": 0,
      "$1.5M - $2M": 0,
      Other: 0,
      "Not Specified": 0,
    };

    data.forEach((item) => {
      if (!item.budget) {
        ranges["Not Specified"]++;
        return;
      }

      try {
        const budget = item.budget.toLowerCase().trim();
        const numericPart = budget.match(/[\d.]+/)?.[0];

        if (!numericPart) {
          console.log("No numeric value found in:", budget);
          ranges["Not Specified"]++;
          return;
        }

        let value: number;
        if (budget.includes("m") || budget.includes("million")) {
          value = parseFloat(numericPart) * 1000000;
        } else if (budget.includes("k") || budget.includes("thousand")) {
          value = parseFloat(numericPart) * 1000;
        } else {
          value = parseFloat(numericPart);
          if (value < 1000) value *= 1000;
        }

        if (isNaN(value)) {
          console.log("Invalid numeric value:", budget);
          ranges["Not Specified"]++;
          return;
        }

        console.log("Parsed budget:", item.budget, "to value:", value);

        if (value >= 100000 && value < 500000) {
          ranges["$100k - $500k"]++;
        } else if (value >= 500000 && value < 800000) {
          ranges["$500k - $800k"]++;
        } else if (value >= 800000 && value < 1000000) {
          ranges["$800k - $1M"]++;
        } else if (value >= 1000000 && value < 1500000) {
          ranges["$1M - $1.5M"]++;
        } else if (value >= 1500000 && value <= 2000000) {
          ranges["$1.5M - $2M"]++;
        } else {
          console.log("Value outside range:", value, "Original:", item.budget);
          ranges["Other"]++;
        }
      } catch (error) {
        console.log("Error processing budget:", item.budget, error);
        ranges["Not Specified"]++;
      }
    });

    return Object.entries(ranges)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0); // Only show ranges with values
  }, [data]);

  const locationData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const location = item.location || "Not Specified";
      counts[location] = (counts[location] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Get top 10 locations
  }, [data]);

  // Filter data for the table
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // If property type filter is active
      if (selectedProperty && item.propertytype !== selectedProperty) {
        return false;
      }

      // Search across all fields
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          item.name?.toLowerCase().includes(searchTermLower) ||
          false ||
          item.email?.toLowerCase().includes(searchTermLower) ||
          false ||
          item.location?.toLowerCase().includes(searchTermLower) ||
          false ||
          item.budget?.toLowerCase().includes(searchTermLower) ||
          false ||
          item.propertytype?.toLowerCase().includes(searchTermLower) ||
          false ||
          item.timeframe?.toLowerCase().includes(searchTermLower) ||
          false ||
          item.transactionType?.toLowerCase().includes(searchTermLower) ||
          false
        );
      }
      return true;
    });
  }, [data, searchTerm, selectedProperty]);

  // Handle sorting
  const handleSort = (field: keyof SubmittedData) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc"); // Default to descending when changing field
    }
  };

  // Create and download CSV
  const downloadCSV = () => {
    if (data.length === 0) return;

    // Get all keys from the first item
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      // Headers row
      headers.join(","),
      // Data rows
      ...filteredData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof SubmittedData];
            // Handle null values and wrap strings in quotes
            return value === null
              ? ""
              : typeof value === "string"
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    // Create a Blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `submitted-data-${new Date().toISOString().slice(0, 10)}.csv`);

    // Show success notification
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Custom active shape for pie chart
  const renderActiveShape = (props: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
    payload: {
      name: string;
      value: number;
    };
    percent: number;
    value: number;
  }): JSX.Element => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
          fontWeight="600"
        >
          {payload.name}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#666"
        >
          {`Count: ${value} (${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 w-full h-full pointer-events-none"
      />

      <div className="container relative z-10 px-4 py-8 mx-auto">
        {/* Header with decorative elements */}
        <motion.div
          className="relative mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between w-full px-4">
            <div className="inline-block">
              <h1 className="mb-2 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                Data Analytics Dashboard
              </h1>
              <div className="w-1/3 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" />
            </div>
            <motion.button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors duration-200 bg-red-500 rounded-lg shadow hover:bg-red-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Logout</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Success notification */}
        <AnimatePresence>
          {showExportSuccess && (
            <motion.div
              className="fixed p-4 text-green-700 border-l-4 border-green-500 rounded shadow-lg top-5 right-5 bg-green-50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">CSV exported successfully!</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            className="p-4 mb-6 text-red-700 border-l-4 border-red-500 rounded-md shadow-sm bg-red-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col items-center justify-between mb-8 space-y-4 md:flex-row md:space-y-0">
          <div className="flex flex-wrap gap-3">
            <motion.button
              className="flex items-center px-5 py-3 text-white transition-all duration-300 rounded-lg shadow-lg btn bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-xl"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchData}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {isLoading ? "Loading..." : "Refresh Data"}
            </motion.button>

            <motion.button
              className="flex items-center px-5 py-3 text-white transition-all duration-300 rounded-lg shadow-lg btn bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadCSV}
              disabled={data.length === 0 || isLoading}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Export CSV
            </motion.button>
          </div>
        </div>

        {/* Stats overview */}
        <motion.div
          className="grid grid-cols-1 gap-5 mb-10 md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="p-5 transition-all duration-300 bg-white border-l-4 border-indigo-500 rounded-lg shadow-lg hover:shadow-xl"
            whileHover={{ y: -5 }}
          >
            <h3 className="mb-1 text-sm font-medium text-gray-500 uppercase">
              Total Submissions
            </h3>
            <div className="text-3xl font-bold text-gray-800">
              {data.length}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {data.length > 0
                ? `Latest on ${formatDate(data[0].created_at).split(",")[0]}`
                : "No data"}
            </div>
          </motion.div>

          <motion.div
            className="p-5 transition-all duration-300 bg-white border-l-4 border-purple-500 rounded-lg shadow-lg hover:shadow-xl"
            whileHover={{ y: -5 }}
          >
            <h3 className="mb-1 text-sm font-medium text-gray-500 uppercase">
              Property Types
            </h3>
            <div className="text-3xl font-bold text-gray-800">
              {propertyTypeData.length}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Different property categories
            </div>
          </motion.div>

          <motion.div
            className="p-5 transition-all duration-300 bg-white border-l-4 border-pink-500 rounded-lg shadow-lg hover:shadow-xl"
            whileHover={{ y: -5 }}
          >
            <h3 className="mb-1 text-sm font-medium text-gray-500 uppercase">
              Locations
            </h3>
            <div className="text-3xl font-bold text-gray-800">
              {
                Object.keys(
                  data.reduce(
                    (acc, item) => ({
                      ...acc,
                      [item.location || "Unknown"]: true,
                    }),
                    {}
                  )
                ).length
              }
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Unique areas tracked
            </div>
          </motion.div>

          <motion.div
            className="p-5 transition-all duration-300 bg-white border-l-4 border-orange-500 rounded-lg shadow-lg hover:shadow-xl"
            whileHover={{ y: -5 }}
          >
            <h3 className="mb-1 text-sm font-medium text-gray-500 uppercase">
              Urgent Requests
            </h3>
            <div className="text-3xl font-bold text-gray-800">
              {
                data.filter(
                  (item) =>
                    item.timeframe?.toLowerCase().includes("immediate") ||
                    item.timeframe?.toLowerCase().includes("asap")
                ).length
              }
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Immediate attention needed
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl"
            whileHover={{ y: -5 }}
          >
            <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
              <div className="w-2 h-6 mr-2 bg-indigo-500 rounded-full"></div>
              Property Type Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient
                        key={`gradient-${index}`}
                        id={`colorGradient${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                        <stop
                          offset="100%"
                          stopColor={color}
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index: number) =>
                      setActivePieIndex(index)
                    }
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {propertyTypeData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#colorGradient${index % COLORS.length})`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} submissions`,
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: "0.5rem",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl"
            whileHover={{ y: -5 }}
          >
            <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
              <div className="w-2 h-6 mr-2 bg-purple-500 rounded-full"></div>
              Timeframe Preference
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient
                        key={`gradient-time-${index}`}
                        id={`colorTimeGradient${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                        <stop
                          offset="100%"
                          stopColor={color}
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={timeframeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={100}
                    animationDuration={1000}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {timeframeData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#colorTimeGradient${index % COLORS.length})`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} submissions`,
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: "0.5rem",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "15px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl"
            whileHover={{ y: -5 }}
          >
            <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
              <div className="w-2 h-6 mr-2 bg-pink-500 rounded-full"></div>
              Top Locations
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={locationData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="colorLocation"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop
                        offset="100%"
                        stopColor="#d946ef"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      value.length > 15 ? `${value.substring(0, 15)}...` : value
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value} submissions`,
                      "Count",
                    ]}
                    contentStyle={{
                      borderRadius: "0.5rem",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill="url(#colorLocation)"
                    name="Count"
                    radius={[0, 4, 4, 0]}
                    animationBegin={200}
                    animationDuration={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl"
            whileHover={{ y: -5 }}
          >
            <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
              <div className="w-2 h-6 mr-2 bg-orange-500 rounded-full"></div>
              Budget Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <defs>
                    <linearGradient
                      id="colorBudget"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop
                        offset="100%"
                        stopColor="#eab308"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} submissions`,
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: "0.5rem",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill="url(#colorBudget)"
                    name="Count"
                    radius={[4, 4, 0, 0]}
                    animationBegin={300}
                    animationDuration={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>

        {/* Filter options */}
        <motion.div
          className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex flex-col items-center justify-between md:flex-row">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 md:mb-0">
              Data Filters
            </h2>
            <div className="flex flex-wrap items-end gap-4">
              <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 py-2 pl-10 pr-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg
                    className="absolute w-5 h-5 text-gray-400 left-3 top-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Property Type
                </label>
                <select
                  className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedProperty || ""}
                  onChange={(e) => setSelectedProperty(e.target.value || null)}
                >
                  <option value="">All Types</option>
                  {propertyTypeData.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none top-6">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <div className="flex mt-1 rounded-md shadow-sm">
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 shadow-sm appearance-none rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as keyof SubmittedData)
                    }
                  >
                    <option value="created_at">Date</option>
                    <option value="name">Name</option>
                    <option value="location">Location</option>
                    <option value="propertytype">Property Type</option>
                    <option value="budget">Budget</option>
                    <option value="transactionType">Type</option>
                  </select>
                  <button
                    type="button"
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-l-0 border-gray-300 bg-gray-50 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    {sortOrder === "asc" ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Submitted Data Table
              </h2>
              <span className="text-sm text-gray-500">
                Showing {filteredData.length} of {data.length} entries
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Date",
                    "Name",
                    "Email",
                    "Phone",
                    "Location",
                    "Property Type",
                    "Budget",
                    "Timeframe",
                    "Type",
                  ].map((header, i) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors duration-200 cursor-pointer hover:bg-gray-100"
                      onClick={() =>
                        handleSort(
                          [
                            "created_at",
                            "name",
                            "email",
                            "phone",
                            "location",
                            "propertytype",
                            "budget",
                            "timeframe",
                            "transactionType",
                          ][i] as keyof SubmittedData
                        )
                      }
                    >
                      <div className="flex items-center">
                        {header}
                        {sortBy ===
                          [
                            "created_at",
                            "name",
                            "email",
                            "phone",
                            "location",
                            "propertytype",
                            "budget",
                            "timeframe",
                            "transactionType",
                          ][i] && (
                          <svg
                            className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                              sortOrder === "asc" ? "transform rotate-180" : ""
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i}>
                        {Array(9)
                          .fill(0)
                          .map((_, j) => (
                            <td key={j} className="px-6 py-4 whitespace-nowrap">
                              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                          ))}
                      </tr>
                    ))
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg
                          className="w-12 h-12 mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M19 10a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <p className="text-lg font-medium">No data found</p>
                        <p className="mt-1 text-sm">
                          Try changing your search criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      className="transition-colors duration-150 hover:bg-gray-50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      whileHover={{
                        backgroundColor: "rgba(243, 244, 246, 0.5)",
                      }}
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-900"
                          title={item.name || "-"}
                        >
                          {item.name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {item.email ? (
                            <a
                              href={`mailto:${item.email}`}
                              className="text-indigo-600 transition-colors duration-200 hover:text-indigo-800"
                              title={item.email}
                            >
                              {item.email}
                            </a>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {item.phone ? (
                          <a
                            href={`tel:${item.phone}`}
                            className="text-indigo-600 transition-colors duration-200 hover:text-indigo-800"
                          >
                            {item.phone}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div
                          className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                          title={item.location || "-"}
                        >
                          {item.location || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.propertytype ? (
                          <span className="inline-flex px-2 text-xs font-semibold leading-5 text-indigo-800 bg-indigo-100 rounded-full">
                            {item.propertytype}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {item.budget || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.timeframe ? (
                          <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                            {item.timeframe}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item?.type ? (
                          <span className="inline-flex px-2 text-xs font-semibold leading-5 text-purple-800 bg-purple-100 rounded-full">
                            {item.type}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {data.length} total records
              </div>
              <div className="flex items-center space-x-2">
                {/* Here you could add pagination controls if needed */}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-sm text-center text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <p>Last updated: {new Date().toLocaleString()}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
