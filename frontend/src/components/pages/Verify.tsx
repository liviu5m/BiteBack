import { ShieldCheck } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { checkVerificationCode, resendVerificationCode } from "../../api/user";

const Verify = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(-1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!location.state?.fromSignup) {
      navigate("/auth/sign-up", { replace: true });
    } else setUserId(location.state.userId);
  }, [location, navigate]);

  const { mutate: verify } = useMutation({
    mutationKey: ["verify-code"],
    mutationFn: () => checkVerificationCode(verificationCode, userId),
    onSuccess: (data) => {
      console.log(data);
      toast("Verification Completed");
      navigate("/auth/login");
    },
    onError: (err: AxiosError) => {
      setError((err.response?.data as any).detail as string);
      setTimeout(() => {
        setError("");
      }, 5000);
    },
  });

  const { mutate: resend } = useMutation({
    mutationKey: ["resend-code"],
    mutationFn: () => resendVerificationCode(userId),
    onSuccess: (data) => {
      console.log(data);
      toast("Code resend successfully");
      setVerificationCode("");
      setError("");
    },
    onError: (err: AxiosError) => {
      toast(err.response?.data as string);
    },
  });

  return (
    <div className="bg-[#FAF7F2] w-full min-h-screen md:min-h-[100dvh]">
      <div className="flex items-center justify-center min-h-screen flex-col px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        <div className="w-full max-w-md p-5 sm:p-6 md:p-10 rounded-xl sm:rounded-2xl md:rounded-[32px] bg-white shadow-sm border border-gray-100 z-20 mx-auto">
          <p className="text-xs sm:text-sm md:text-base text-center sm:text-left leading-relaxed">
            Code will expire in 5 minutes{" "}
            <span
              className="text-[#00ADB5] cursor-pointer"
              onClick={() => resend()}
            >
              Resend verification code
            </span>
          </p>{" "}
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
          >
            <h1 className="text-center mb-4 sm:mb-6 md:mb-7 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 font-semibold text-base sm:text-lg md:text-xl">
              <ShieldCheck />
              <span>Verify Your Account</span>
            </h1>
            <h3 className="text-center my-2 sm:my-3 text-xs sm:text-sm text-gray-600 px-2">
              You have received on your email an verification code
            </h3>
            <div className="flex items-center justify-center overflow-x-auto px-1 sm:px-2 py-2">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button className="px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow bg-[#1e4d3b] hover:bg-[#153629] text-white w-full mt-4 sm:mt-5 cursor-pointer font-semibold text-sm sm:text-base transition-colors">
              Submit
            </button>
          </form>
          <div>
            <h2 className="text-red-500 text-center mt-4 sm:mt-5 text-xs sm:text-sm px-2 break-words">
              {error}{" "}
              {error == "Verification code has expired" && (
                <button
                  className="font-bold ml-3 cursor-pointer"
                  onClick={() => {
                    // resend();
                  }}
                >
                  Resend
                </button>
              )}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
