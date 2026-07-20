import { useState } from "react";
import { ArrowRight, Lock, Mail, Signature, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { signupUser } from "../../api/user";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const navigate = useNavigate();

  const { mutate: signup } = useMutation({
    mutationKey: ["signup-user"],
    mutationFn: () => signupUser(formData),
    onSuccess: (data) => {
      console.log(data);
      const dbTime = new Date(data.createdAt);

      console.log(dbTime.toLocaleString());
      navigate("/auth/verify", {
        state: { fromSignup: true, userId: data.id },
      });
    },
    onError: (err: AxiosError) => {
      const response = err.response?.data as any;
      console.log(response);

      if (response?.detail && Array.isArray(response.detail)) {
        const firstError = response.detail[0];
        const errorMessage = firstError?.msg || "Validation error";
        toast.error(errorMessage);
      } else if (response?.detail && typeof response.detail === "string") {
        toast.error(response.detail);
      } else {
        toast.error("An error occurred");
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup();
  };

  const loginWithGoogle = () => {
    const baseUrl = import.meta.env.VITE_API_URL
    window.location.href = baseUrl + "/auth/google/login"
  };

  return (
    <div className="bg-[#FAF7F2] w-full min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 my-auto">
      <div className="p-5 sm:p-8 md:p-12 lg:p-14 shadow-sm border border-gray-100 rounded-xl sm:rounded-2xl md:rounded-[32px] bg-white w-full max-w-[580px] flex flex-col items-center my-3 sm:my-6 md:my-8 mx-auto">
        <div className="flex items-center justify-center bg-[#e8edeb] text-[#1e4d3b] rounded-full w-12 h-12 sm:w-14 sm:h-14 font-bold text-xl sm:text-2xl mb-4 sm:mb-5 shadow-inner">
          B
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 mb-2 text-center px-1">
          Create your <span className="text-[#1e4d3b] font-bold">BiteBack</span>{" "}
          account
        </h1>

        <p className="text-gray-400 text-xs sm:text-sm mb-5 sm:mb-6 text-center px-2">
          Join the community sharing food and cooking smarter.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600 px-1">
              Full Name
            </label>
            <div className="relative group flex items-center">
              <Signature
                size={18}
                className="absolute left-4 text-gray-400 group-focus-within:text-[#1e4d3b] transition-colors"
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-neutral-50/50 border border-gray-100 rounded-xl sm:rounded-2xl pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#1e4d3b] focus:ring-2 focus:ring-[#e8edeb]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600 px-1">
              Username
            </label>
            <div className="relative group flex items-center">
              <UserRound
                size={18}
                className="absolute left-4 text-gray-400 group-focus-within:text-[#1e4d3b] transition-colors"
              />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe12"
                className="w-full bg-neutral-50/50 border border-gray-100 rounded-xl sm:rounded-2xl pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#1e4d3b] focus:ring-2 focus:ring-[#e8edeb]"
              />
            </div>
          </div>

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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-neutral-50/50 border border-gray-100 rounded-xl sm:rounded-2xl pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#1e4d3b] focus:ring-2 focus:ring-[#e8edeb]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600 px-1">
              Password
            </label>
            <div className="relative group flex items-center">
              <Lock
                size={18}
                className="absolute left-4 text-gray-400 group-focus-within:text-[#1e4d3b] transition-colors"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-neutral-50/50 border border-gray-100 rounded-xl sm:rounded-2xl pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#1e4d3b] focus:ring-2 focus:ring-[#e8edeb]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600 px-1">
              Confirm Password
            </label>
            <div className="relative group flex items-center">
              <Lock
                size={18}
                className="absolute left-4 text-gray-400 group-focus-within:text-[#1e4d3b] transition-colors"
              />
              <input
                type="password"
                name="passwordConfirmation"
                value={formData.passwordConfirmation}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-neutral-50/50 border border-gray-100 rounded-xl sm:rounded-2xl pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#1e4d3b] focus:ring-2 focus:ring-[#e8edeb]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="group flex items-center justify-center gap-2 bg-[#1e4d3b] hover:bg-[#153629] text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-full font-medium text-base sm:text-lg shadow-md transition-all duration-300 active:scale-98 mt-3 sm:mt-4 cursor-pointer w-full"
          >
            <span>Sign Up</span>
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
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <div className="flex items-center gap-2">
            <span>Continue with Google</span>
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </div>
        </button>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Already have an account?{" "}
          <Link
            to={"/auth/login"}
            className="text-[#1e4d3b] font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
