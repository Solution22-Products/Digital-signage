"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Welcome1 = () => {
  const [nextLoader, setNextLoader] = useState(false);
  const router = useRouter();

  return (
    <div className="md:flex sm:block justify-end min-h-screen">
      <div className="md:w-3/5 sm:w-full h-screen flex flex-col justify-center">
        <div className="lg:w-[515px] p-10 md:w-full w-full md:p-12 lg:p-0 m-auto">
          <h1 className="text-3xl font-bold text-primary_color">
            Welcome to S22Digital
          </h1>
          <p className="text-base font-bold text-primary_color my-3">
            where captivating your audience begins with every screen!
          </p>
          <p className="text-sm text-secondary_color mb-9">
            Take a moment to tailor your S22Digital experience by answering a
            brief set of questions for customization.
          </p>
          {/* <Link href="/welcome2" className="w-full"> */}
          <Button
            type="submit"
            className="w-full bg-button_orange hover:bg-button_orange hover:opacity-75"
            disabled={nextLoader}
            onClick={() => {
              setNextLoader(true);
              setTimeout(() => {
                router.push("/welcome2");
                setNextLoader(false);
              }, 4000);
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
              "Start now!"
            )}
          </Button>
          {/* </Link> */}
        </div>
      </div>
      <div className="w-2/5 relative sm:none md:block">
        <Image
          src="/images/welcome-image1.png"
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

export default Welcome1;
