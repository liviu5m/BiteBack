import { ArrowRight, Calendar, ChefHat, LayoutGrid } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../lib/AppProvider";
import { useEffect } from "react";

const Home = () => {
  const { user } = useAppContext();
  const navigate = useNavigate()
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  return (
    <div className="bg-[#FAF7F2] w-full min-h-screen h-auto md:min-h-[100dvh] lg:h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="p-5 sm:p-8 md:p-12 lg:p-16 shadow-sm border border-gray-100 rounded-xl sm:rounded-2xl md:rounded-[32px] bg-white w-full max-w-[850px] flex flex-col items-center text-center mx-auto">
        {/* Logo Badge */}
        <div className="flex items-center justify-center bg-[#e8edeb] text-[#1e4d3b] rounded-full w-12 h-12 sm:w-14 sm:h-14 font-bold text-xl sm:text-2xl mb-4 sm:mb-6 shadow-inner">
          B
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-3 sm:mb-4 px-1">
          Welcome to <span className="text-[#1e4d3b] font-bold">BiteBack</span>
        </h1>

        <p className="text-gray-500 text-base sm:text-lg max-w-md mb-8 sm:mb-12 leading-relaxed px-2">
          Your personal culinary command center. Track your ingredients, plan
          your weekly meals, and cook zero-waste recipes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full mb-8 sm:mb-10 md:mb-12">
          <div className="group border border-gray-100 bg-neutral-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl flex flex-col items-center transition-all duration-300 hover:bg-[#e8edeb]/40 hover:border-[#1e4d3b]/10 sm:col-span-2 md:col-span-1">
            <div className="p-2.5 sm:p-3 bg-white rounded-xl text-[#1e4d3b] shadow-sm mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <LayoutGrid size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">My Fridge</h3>
            <p className="text-sm text-gray-400">
              Manage ingredients and shelf life.
            </p>
          </div>

          <div className="group border border-gray-100 bg-neutral-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl flex flex-col items-center transition-all duration-300 hover:bg-[#e8edeb]/40 hover:border-[#1e4d3b]/10">
            <div className="p-2.5 sm:p-3 bg-white rounded-xl text-[#1e4d3b] shadow-sm mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <ChefHat size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Smart Cook</h3>
            <p className="text-sm text-gray-400">
              Generate recipes from your stock.
            </p>
          </div>

          <div className="group border border-gray-100 bg-neutral-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl flex flex-col items-center transition-all duration-300 hover:bg-[#e8edeb]/40 hover:border-[#1e4d3b]/10 sm:col-span-2 md:col-span-1">
            <div className="p-2.5 sm:p-3 bg-white rounded-xl text-[#1e4d3b] shadow-sm mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Meal Planner</h3>
            <p className="text-sm text-gray-400">
              Organize your dynamic calendar.
            </p>
          </div>
        </div>

        <Link
          to={"/auth/login"}
          className="group flex items-center justify-center gap-2 bg-[#1e4d3b] hover:bg-[#153629] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-medium text-base sm:text-lg shadow-md transition-all duration-300 active:scale-98 w-full sm:w-auto max-w-xs sm:max-w-none"
        >
          <span>Get Started</span>
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
};

export default Home;
