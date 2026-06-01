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
    <div className="bg-[#FAF7F2] w-screen h-screen flex items-center justify-center p-6">
      <div className="p-10 md:p-16 shadow-sm border border-gray-100 rounded-[32px] bg-white w-[850px] flex flex-col items-center text-center">
        {/* Logo Badge */}
        <div className="flex items-center justify-center bg-[#e8edeb] text-[#1e4d3b] rounded-full w-14 h-14 font-bold text-2xl mb-6 shadow-inner">
          B
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-4">
          Welcome to <span className="text-[#1e4d3b] font-bold">BiteBack</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-md mb-12 leading-relaxed">
          Your personal culinary command center. Track your ingredients, plan
          your weekly meals, and cook zero-waste recipes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12">
          <div className="group border border-gray-100 bg-neutral-50/50 p-6 rounded-2xl flex flex-col items-center transition-all duration-300 hover:bg-[#e8edeb]/40 hover:border-[#1e4d3b]/10">
            <div className="p-3 bg-white rounded-xl text-[#1e4d3b] shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <LayoutGrid size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">My Fridge</h3>
            <p className="text-sm text-gray-400">
              Manage ingredients and shelf life.
            </p>
          </div>

          <div className="group border border-gray-100 bg-neutral-50/50 p-6 rounded-2xl flex flex-col items-center transition-all duration-300 hover:bg-[#e8edeb]/40 hover:border-[#1e4d3b]/10">
            <div className="p-3 bg-white rounded-xl text-[#1e4d3b] shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <ChefHat size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Smart Cook</h3>
            <p className="text-sm text-gray-400">
              Generate recipes from your stock.
            </p>
          </div>

          <div className="group border border-gray-100 bg-neutral-50/50 p-6 rounded-2xl flex flex-col items-center transition-all duration-300 hover:bg-[#e8edeb]/40 hover:border-[#1e4d3b]/10">
            <div className="p-3 bg-white rounded-xl text-[#1e4d3b] shadow-sm mb-4 group-hover:scale-110 transition-transform">
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
          className="group flex items-center gap-2 bg-[#1e4d3b] hover:bg-[#153629] text-white px-8 py-4 rounded-full font-medium text-lg shadow-md transition-all duration-300 active:scale-98"
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
