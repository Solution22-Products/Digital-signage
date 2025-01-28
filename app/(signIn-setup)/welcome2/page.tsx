"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { getUserData } from "../sign-in/action";

const Welcome2 = () => {
  const [selectedOption, setSelectedOption] = useState("Storefront");
  const [otherOption, setOtherOption] = useState("");
  const [error, setError] = useState("");
  const [nextLoader, setNextLoader] = useState(false);
  const [backLoader, setBackLoader] = useState(false);
  const router = useRouter();

  const getClientData = async () => {
    const { data, error } = await supabase.from("clientScreenDetails").select();
    if (error) {
      console.log("Error fetching client data:", error);
    } else {
      console.log("Client data fetched successfully:", data);
    }
  };

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

        console.log("userId 1 ", userId);

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
              screen_location:
                selectedOption === "Others" ? otherOption : selectedOption,
            })
            .eq("id", userClientData.id)
            .select();

          if (updateError) {
            console.log("Error saving screen locations:", updateError);
          } else {
            console.log("Screen locations updated successfully:", updateData);
          }
        } else {
          // Insert new screen location
          const { data: insertData, error: insertError } = await supabase
            .from("clientScreenDetails")
            .insert({
              userId: userId,
              screen_location:
                selectedOption === "Others" ? otherOption : selectedOption,
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
      console.log("An unexpected error occurred:", error);
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setError(""); // Clear error when an option is selected
  };

  const handleTextareaChange = (e: any) => {
    setOtherOption(e.target.value);
  };

  const handleNextClick = () => {
    setNextLoader(true);
    if (!selectedOption) {
      setError("Please select an option.");
      setNextLoader(false);
    } else if (selectedOption === "Others" && !otherOption.trim()) {
      setError("Please specify the 'Others' option.");
      setNextLoader(false);
    } else {
      // Proceed to the next step
      const selectedValue =
        selectedOption === "Others" ? otherOption : selectedOption;
      handleSaveScreenLocations();
      console.log("Selected Option:", selectedValue);
      setTimeout(() => {
        router.push("/welcome3");
        setNextLoader(false);
      }, 6000);
    }
  };

  useEffect(() => {
    getClientData();
  }, []);

  return (
    <div className="md:flex sm:block justify-end min-h-screen">
      <div className="md:w-3/5 sm:w-full h-screen flex flex-col justify-center">
        <div className="lg:w-[515px] p-10 md:w-full w-full md:p-12 lg:p-0 m-auto">
          <p className="text-base font-bold text-primary_color flex gap-1">
            <span>1.</span>Specify the locations for displaying your digital
            signs to optimize S22Digital's impact.
          </p>
          <p className="text-sm font-normal text-secondary_color pl-3 my-3">
            Strategically select display locations for S22Digital signs to
            enhance impact, ensuring effective and targeted communication.
          </p>

          <Button
            className={`w-full block lg:flex justify-normal border h-auto lg:h-9 mb-2 whitespace-normal text-start ${
              selectedOption === "Storefront"
                ? "bg-button_orange text-white hover:bg-button_orange border-none"
                : "bg-transparent text-primary_color hover:bg-inherit"
            }`}
            onClick={() => handleOptionSelect("Storefront")}
          >
            <span className="mr-1 font-medium">Storefront -</span>Restaurant,
            Shops, Stores, Gyms
          </Button>

          <Button
            className={`w-full block lg:flex justify-normal border h-auto lg:h-9 mb-2 whitespace-normal text-start ${
              selectedOption === "Workplace"
                ? "bg-button_orange text-white hover:bg-button_orange border-none"
                : "bg-transparent text-primary_color hover:bg-inherit"
            }`}
            onClick={() => handleOptionSelect("Workplace")}
          >
            <span className="mr-1 font-medium">Workplace -</span>Office,
            Factories, Warehouse, Team Collaboration
          </Button>

          <Button
            className={`w-full block lg:flex justify-normal border h-auto lg:h-9 mb-2 whitespace-normal text-start ${
              selectedOption === "Community Space"
                ? "bg-button_orange text-white hover:bg-button_orange border-none"
                : "bg-transparent text-primary_color hover:bg-inherit"
            }`}
            onClick={() => handleOptionSelect("Community Space")}
          >
            <span className="mr-1 font-medium">Community Space -</span>
            Educational Institute, Religious Organisation, NGO
          </Button>

          <Button
            className={`w-full block lg:flex justify-normal border h-auto lg:h-9 mb-2 whitespace-normal text-start ${
              selectedOption === "Others"
                ? "bg-button_orange text-white hover:bg-button_orange border-none"
                : "bg-transparent text-primary_color hover:bg-inherit"
            }`}
            onClick={() => handleOptionSelect("Others")}
          >
            Others
          </Button>

          <Textarea
            value={otherOption}
            onChange={handleTextareaChange}
            className="mt-2"
            disabled={selectedOption !== "Others"}
          />

          {error && <p className="text-red-500 mt-2">{error}</p>}

          <div className="flex justify-between gap-3 mt-3">
            {/* <Link href="/welcome1" className="w-2/4"> */}
            <Button
              className="w-2/4 bg-transparent hover:bg-inherit justify-center border border-border_gray text-primary_color h-9 text-center font-medium"
              disabled={backLoader}
              onClick={() => {
                setBackLoader(true);
                setTimeout(() => {
                  router.push("/welcome1");
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
          src="/images/welcome-image2.png"
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

export default Welcome2;
