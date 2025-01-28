"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { getUserData } from "../sign-in/action";

const Welcome3 = () => {
  const [selectedOption, setSelectedOption] = useState("1-10");
  const [error, setError] = useState("");
  const [nextLoader, setNextLoader] = useState(false);
  const [backLoader, setBackLoader] = useState(false);
  const router = useRouter();

  const handleSaveScreenLocations = async () => {
    try {
      // Fetch client data
      const { data: clientData, error: fetchError } = await supabase
        .from("clientScreenDetails")
        .select();
      if (fetchError) {
        console.log("Error fetching client data:", fetchError);
        return;
      } else {
        console.log("Client data fetched successfully:", clientData);
        // Get user data
        const userData = await getUserData();
        const userId = userData?.id;

        if (!userId) {
          console.log("User ID not found.");
          return;
        }

        // Check if data already exists for this user
        const userClientData = clientData.find(
          (client) => client.userId === userId
        );
        console.log("userClientData", userClientData);
        if (userClientData) {
          // Update screen location
          const { data: updateData, error: updateError } = await supabase
            .from("clientScreenDetails")
            .update({
              screen_counts: selectedOption,
            })
            .eq("id", userClientData?.id || null)
            .select();
          if (updateError) {
            console.log("Error saving screen locations:", updateError);
          } else {
            console.log("Screen locations saved successfully:", updateData);
          }
        } else {
          // Insert new data
          const { data: insertData, error: insertError } = await supabase
            .from("clientScreenDetails")
            .insert({
              userId: userId,
              screen_counts: selectedOption,
            })
            .select();
          if (insertError) {
            console.log("Error saving screen locations:", insertError);
          } else {
            console.log("Screen locations saved successfully:", insertData);
          }
        }
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setError(""); // Clear error when an option is selected
  };

  const handleNextClick = () => {
    setNextLoader(true);
    if (!selectedOption) {
      setError("Please select an option.");
      setNextLoader(false);
    } else {
      // Proceed to the next step
      console.log("Selected Option:", selectedOption);
      handleSaveScreenLocations();
      setTimeout(() => {
        router.push("/user-profile");
        setNextLoader(false);
      }, 6000);
    }
  };

  return (
    <div className="md:flex sm:block justify-end min-h-screen">
      <div className="md:w-3/5 sm:w-full h-screen flex flex-col justify-center">
        <div className="lg:w-[515px] p-10 md:w-full w-full md:p-12 lg:p-0 m-auto">
          <p className="text-base font-bold text-primary_color flex gap-1">
            <span>2.</span>How many screens do you intend to utilize for your
            deployment?
          </p>
          <p className="text-sm font-normal text-secondary_color pl-3 my-3">
            Optimize your S22Digital experience by choosing the number of
            screens, considering locations, audience, and scale.
          </p>

          <div className="flex justify-between gap-3 mt-3">
            <Button
              className={`w-full block lg:flex justify-normal border h-auto lg:h-9 mb-2 whitespace-normal text-start ${
                selectedOption === "1-10"
                  ? "bg-button_orange text-white hover:bg-button_orange border-none"
                  : "bg-transparent text-primary_color hover:bg-inherit"
              }`}
              onClick={() => handleOptionSelect("1-10")}
            >
              1-10
            </Button>
            <Button
              className={`w-full block lg:flex justify-normal border h-auto lg:h-9 mb-2 whitespace-normal text-start ${
                selectedOption === "11-25"
                  ? "bg-button_orange text-white hover:bg-button_orange border-none"
                  : "bg-transparent text-primary_color hover:bg-inherit"
              }`}
              onClick={() => handleOptionSelect("11-25")}
            >
              11-25
            </Button>
          </div>

          <div className="flex justify-between gap-3 mt-3">
            <Button
              className={`w-full block lg:flex justify-normal border h-auto lg:h-9 mb-2 whitespace-normal text-start ${
                selectedOption === "26-100"
                  ? "bg-button_orange text-white hover:bg-button_orange border-none"
                  : "bg-transparent text-primary_color hover:bg-inherit"
              }`}
              onClick={() => handleOptionSelect("26-100")}
            >
              26-100
            </Button>
            <Button
              className={`w-full block lg:flex justify-normal border h-auto lg:h-9 mb-2 whitespace-normal text-start ${
                selectedOption === "100+"
                  ? "bg-button_orange text-white hover:bg-button_orange border-none"
                  : "bg-transparent text-primary_color hover:bg-inherit"
              }`}
              onClick={() => handleOptionSelect("100+")}
            >
              100+
            </Button>
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}

          <div className="flex justify-between gap-3 mt-3">
            {/* <Link href="/welcome2" className="w-2/4"> */}
            <Button
              className="w-2/4 bg-transparent hover:bg-inherit justify-center border border-border_gray text-primary_color h-9 text-center font-medium"
              disabled={backLoader}
              onClick={() => {
                setBackLoader(true);
                setTimeout(() => {
                  router.push("/welcome2");
                  setBackLoader(false);
                }, 5000);
              }}
            >
              {backLoader ? (
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
                    stroke="#FF7C44"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="#FF7C44"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Back"
              )}
            </Button>
            {/* </Link> */}
            <Button
              className="w-1/2 bg-button_orange text-white hover:bg-button_orange hover:opacity-75 justify-center font-normal h-9 text-center"
              onClick={handleNextClick}
              disabled={nextLoader}
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
                "Next"
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="w-2/5 relative sm:none md:block">
        <Image
          src="/images/welcome-image3.png"
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

export default Welcome3;
