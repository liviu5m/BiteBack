import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setSessionFunc } from "@/api/user";

export function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: setSession } = useMutation({
    mutationKey: ["set-session"],
    mutationFn: (data: Record<string, string>) => setSessionFunc(data.token),
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["jwt-user"] })

      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/dashboard")
    },
    onError: (err) => {
      console.log(err);
    },
  });

  useEffect(() => {
    const token = searchParams.get("token");

    const establishSession = async () => {
      if (token) setSession({ token });
    };

    establishSession();
  }, [searchParams, navigate]);

  return <div>Authenticating...</div>;
}
