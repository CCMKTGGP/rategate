"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchData } from "@/utils/fetch";
import { useUserContext } from "@/context/userContext";

export default function MicrosoftRedirectPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();
  const { setUser } = useUserContext();

  useEffect(() => {
    const redirectUser = async () => {
      try {
        const response = await fetchData(
          "/api/current-microsoft-user?email=" + email
        );
        const { data } = response;
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("userId", data._id);
            localStorage.setItem("token", data.token);
          }
        } catch (error) {
          console.error("Error while setting token in localStorage:", error);
        }
        setUser(data);
        if (!data.business_id) {
          router.replace(
            `/application/${data._id}/collect-business-name?email=${data.email}`
          );
        } else {
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("businessId", data.business_id);
            }
          } catch (error) {
            console.error("Error while setting token in localStorage:", error);
          }
          router.replace(
            `/application/${data._id}/${data.business_id}/dashboard`
          );
        }
      } catch (err) {
        console.error("Redirection error:", err);
        router.replace("/auth/error");
      }
    };

    redirectUser();
  }, [router]);

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm leading-5 font-medium text-black text-center">
          Redirecting. Please hang on a sec!
        </p>
      </div>
    </div>
  );
}
