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
    <div>
      <div className="flex items-center justify-center min-h-screen flex-col px-4 py-8">
        <div className="w-full max-w-md p-6 sm:p-8 md:p-10 rounded-lg bg-white shadow z-20">
          <p>
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
            <h1 className="text-center mb-7 flex items-center justify-center gap-3 font-semibold text-lg">
              <ShieldCheck />
              <span>Verify Your Account</span>
            </h1>
            <h3 className="text-center my-2 text-sm text-gray-600">
              You have received on your email an verification code
            </h3>
            <div className="flex items-center justify-center">
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
            <button className="px-4 py-3 rounded-lg shadow bg-gray-200 w-full  mt-5 cursor-pointer hover:bg-gray-100 font-semibold upper">
              Submit
            </button>
          </form>
          <div>
            <h2 className="text-red-500 text-center mt-5">
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
