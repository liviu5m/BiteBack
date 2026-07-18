import { useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUserFunc } from "../../api/user";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: login } = useMutation({
    mutationKey: ["login-user"],
    mutationFn: () => loginUserFunc(email, password),
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["jwt-user"] })
      navigate("/dashboard")
    },
    onError: (err: any) => {
      toast(err.response?.data?.detail)
      console.log(err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  const loginWithGoogle = () => {
    const baseUrl = import.meta.env.VITE_API_URL
    window.location.href = baseUrl + "/auth/google/login"
  };

  return (
    <div className="bg-[#FAF7F2] w-full min-h-screen h-auto md:min-h-[100dvh] lg:h-screen flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="p-5 sm:p-8 md:p-12 lg:p-16 shadow-sm border border-gray-100 rounded-xl sm:rounded-2xl md:rounded-[32px] bg-white w-full max-w-[550px] flex flex-col items-center mx-auto">
        <div className="flex items-center justify-center bg-[#e8edeb] text-[#1e4d3b] rounded-full w-12 h-12 sm:w-14 sm:h-14 font-bold text-xl sm:text-2xl mb-4 sm:mb-6 shadow-inner">
          B
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 mb-2 text-center px-1">
          Welcome back to{" "}
          <span className="text-[#1e4d3b] font-bold">BiteBack</span>
        </h1>

        <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8 text-center px-2">
          Log in to manage your kitchen and reduce food waste.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600 px-1">
              Email Address
            </label>
            <div className="relative group flex items-center">
              <Mail
                size={18}
                className="absolute left-4 text-gray-400 group-focus-within:text-[#1e4d3b] transition-colors"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-neutral-50/50 border border-gray-100 rounded-xl sm:rounded-2xl pl-10 sm:pl-11 pr-3 sm:pr-4 py-3 sm:py-3.5 text-sm sm:text-base text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#1e4d3b] focus:ring-2 focus:ring-[#e8edeb]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-medium text-gray-600">
                Password
              </label>
              <button className="text-sm font-medium text-[#1e4d3b] hover:underline cursor-pointer">
                Forgot?
              </button>
            </div>
            <div className="relative group flex items-center">
              <Lock
                size={18}
                className="absolute left-4 text-gray-400 group-focus-within:text-[#1e4d3b] transition-colors"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-neutral-50/50 border border-gray-100 rounded-xl sm:rounded-2xl pl-10 sm:pl-11 pr-3 sm:pr-4 py-3 sm:py-3.5 text-sm sm:text-base text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#1e4d3b] focus:ring-2 focus:ring-[#e8edeb]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="group flex items-center justify-center gap-2 bg-[#1e4d3b] hover:bg-[#153629] text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-full font-medium text-base sm:text-lg shadow-md transition-all duration-300 active:scale-98 mt-3 sm:mt-4 cursor-pointer w-full"
          >
            <span>Sign In</span>
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </form>
        <div className="mt-5 relative flex items-center justify-center w-full">
          <div className="w-full h-px bg-gray-300"></div>
          <span className="absolute bg-white px-3 text-gray-500 text-sm">
            or
          </span>
        </div>
        <button
          type="submit"
          onClick={() => loginWithGoogle()}
          className="group flex items-center justify-center gap-3 sm:gap-5 bg-white hover:bg-gray-100 text-[#333] px-5 sm:px-6 py-3.5 sm:py-4 rounded-full font-medium text-sm sm:text-lg shadow-md transition-all duration-300 active:scale-98 mt-3 sm:mt-4 cursor-pointer w-full border border-gray-50"
        >
          <img src="/imgs/google.png" className="w-5 h-5 " alt="" />
          <div className="flex items-center gap-2">
            <span>Continue with Google</span>
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </div>
        </button>
        <p className="text-gray-400 text-sm mt-8 text-center">
          Don't have an account?{" "}
          <Link
            to={"/auth/signup"}
            className="text-[#1e4d3b] font-semibold hover:underline"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div >
  );
};

export default Login;
