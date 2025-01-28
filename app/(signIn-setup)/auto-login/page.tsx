"use client";

import { useEffect } from "react";
import { signIn } from "../sign-in/action";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const AutoLogin = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const password = searchParams.get("password");
  const id = searchParams.get("id");
  const router = useRouter();

  useEffect(() => {
    if (email && password && id) {
      signIn(email, password);
      localStorage.setItem("userId", id);
      localStorage.setItem("userEmail", email);
      // router.push("/dashboard"); // Uncomment if needed
    } else {
      console.error("Email or password is missing");
    }
  }, [email, password, id, router]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div>
        <svg
          className="animate-spin h-10 w-10 ml-[110px]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="#FF7C44"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="#FF7C44"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-xl font-bold text-primary_color mt-4">
          Signing into your account
        </p>
      </div>
    </div>
  );
};

// Fallback UI for Suspense
const Loading = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <p className="text-xl font-bold text-primary_color mt-4">
      Loading, please wait...
    </p>
  </div>
);

// Wrap your component in Suspense
const AutoLoginWrapper = () => (
  <Suspense fallback={<Loading />}>
    <AutoLogin />
  </Suspense>
);

export default AutoLoginWrapper;
