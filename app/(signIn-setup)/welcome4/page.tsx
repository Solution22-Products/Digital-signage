"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Welcome4 = () => {
  const [nextLoader, setNextLoader] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Push a new state to the history stack to trap the user in the current page
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // console.log("popstate event ", event);
      router.push("/dashboard");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  return (
    <div className="md:flex sm:block justify-end min-h-screen">
      <div className="md:w-3/5 sm:w-full h-screen flex flex-col justify-center">
        <div className="lg:w-[515px] p-10 md:w-full w-full md:p-12 lg:p-0 m-auto">
          <p className="text-base font-bold text-primary_color flex gap-1">
            Thank you for providing valuable insights. Your inputs have been
            utilised to customise your dashboard.
          </p>
          <Button
            className="w-full bg-button_orange hover:bg-button_orange hover:opacity-75 mt-6"
            onClick={() => {
              setNextLoader(true);
              setTimeout(() => {
                router.push("/dashboard");
                setNextLoader(false);
              }, 3000);
            }}
          >
            {nextLoader ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#fff"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="#fff"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "View Dashboard"
            )}
          </Button>
        </div>
      </div>
      <div className="w-2/5 relative sm:none md:block">
        <Image
          src="/images/welcome-image4.png"
          alt="sign in"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
          className="w-full h-screen"
        />
      </div>
    </div>
  );
};

export default Welcome4;
