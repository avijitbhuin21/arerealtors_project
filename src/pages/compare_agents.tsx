import React, { useEffect } from "react";
import { getCityFromUrl } from "../utils/urlUtils";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AgentQuestionnaire, {
  QuestionnaireData,
} from "../components/AgentQuestionnaire";

// Main Page Component
export default function CompareAgentsPage() {
  useEffect(() => {
    const fetchCity = async () => {
      try {
        const cityName = await getCityFromUrl();
        console.log("City name from URL:", cityName);
      } catch (error) {
        console.error("Error fetching city:", error);
      }
    };

    fetchCity();
  }, []);

  const handleQuestionnaireSubmit = (data: QuestionnaireData) => {
    console.log("Questionnaire submitted with data:", data);
    // Handle the submission data as needed
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div
          className="relative min-h-screen overflow-hidden bg-fixed bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: "url(/new-bg.jpg)",
            backgroundAttachment: "fixed",
          }}
        >
          <Header />
          <div className="absolute inset-0 from-black/70 via-black/50 to-black/60" />
          <div className="relative flex flex-col min-h-screen">
            <div className="flex items-center justify-center w-full px-4 py-6 mx-auto max-w-7xl md:py-8 sm:px-6">
              <div className="w-[90%] sm:w-[80%] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 sm:p-6 h-auto min-h-[500px] sm:h-[640px] md:h-[640px] mb-[30px] sm:mb-[100px] border border-white/20">
                <div className="h-full overflow-y-auto">
                  <AgentQuestionnaire
                    isOpen={true}
                    onClose={() => {}}
                    onSubmit={handleQuestionnaireSubmit}
                    embedded={true}
                    type="compare"
                  />
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
