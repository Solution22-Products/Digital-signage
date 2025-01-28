"use client";
import React, {
  createContext,
  useRef,
  useState,
  FC,
  ChangeEvent,
  useEffect,
} from "react";
import SearchBar from "@/components/searchbar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import { CalendarDays, CirclePlus, Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import toast, { Toaster } from "react-hot-toast";

const Dashboard: FC = () => {
  const [screenLink, setScreenLink] = useState<string>("");
  const [screenName, setScreenName] = useState<string>("");
  const [errors, setErrors] = useState<{ name: boolean }>({ name: false });
  const linkRef = useRef<HTMLInputElement>(null);

  const [addLoader, setAddLoader] = useState(false);

  const [signedInUserId, setSignedInUserId] = useState<string | null>("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const notify = (message: string, success: boolean) =>
    toast[success ? "success" : "error"](message, {
      style: {
        borderRadius: "10px",
        background: "#fff",
        color: "#000",
      },
      position: "top-right",
      duration: 2000,
    });

  const formatTime12Hour = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = date.getMinutes();

    const strDay = day < 10 ? "0" + day : day.toString();
    const strMonth = month < 10 ? "0" + month : month.toString();
    const strYear = year.toString();

    const strHours = hours < 10 ? "0" + hours : hours.toString();
    const strMinutes = minutes < 10 ? "0" + minutes : minutes.toString();

    return `${strDay}.${strMonth}.${strYear},${strHours}:${strMinutes}`;
  };

  const handleAdd = async () => {
    const newErrors = { name: !screenName };
    setErrors(newErrors);
    if (!newErrors.name) {
      setAddLoader(true);
      const currentTimeLocal = formatTime12Hour(new Date());
      const { data, error } = await supabase
        .from("screenDetails")
        .insert({
          screenname: screenName,
          time: currentTimeLocal,
          userId: signedInUserId,
          status: "Active",
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting data:", error);
        setAddLoader(false);
      } else {
        console.log("Data from Supabase:", data);
        setScreenName("");
        setScreenLink("");
        setAddLoader(false);
        setOpen(false);
        notify("Screen created successfully", true);
        setTimeout(() => router.push(`/screen-details/${data?.id}`), 2000);
      }
    }
  };

  useEffect(() => {
    const userName = async () => {
      const user = await getUserData();
      setSignedInUserId(user?.id || null);
      // console.log("user id ", user?.id || null);
      return user;
    };
    userName();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.75, ease: "easeInOut" }}
        className="w-full h-full"
      >
        <Toaster />
        {/* <SearchBar
       displayplus={<CirclePlus size={20} />} 
       dashboardscreen={true}
       calendarIcon={<CalendarDays size={20} />}
        calendar={false}
        /> */}
        {/* <ScreenContext.Provider> */}
        <div className="w-full h-[570px] flex justify-center items-center gap-6 p-4">
          <div className="text-center p-6 border border-border_gray rounded-lg w-[347px] h-[319px]">
            <h2 className="text-2xl font-semibold">Add New Screen</h2>
            <Image
              src="/images/add-screen.png"
              className="m-auto py-3"
              alt="add screen"
              width={184}
              height={115}
            />
            <p className="text-sm">
              Start your digital promotion journey by clicking "Add screen"
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-button_orange hover:bg-button_orange hover:opacity-75 mt-5">
                  ADD SCREEN
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                <DialogHeader className="flex flex-col space-y-0">
                  <DialogTitle className="text-2xl font-semibold">
                    Add New Screen
                  </DialogTitle>
                  <DialogDescription className="m-0">
                    Let's add screen details below!
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <div>
                    <Label htmlFor="name" className="text-right">
                      Screen Name
                    </Label>
                    <Input
                      id="name"
                      className={`col-span-3 mt-1.5 ${
                        errors.name ? "border-red-500" : ""
                      }`}
                      placeholder="Screen 01"
                      value={screenName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setScreenName(e.target.value)
                      }
                    />
                  </div>
                </div>
                <DialogFooter className="mb-2">
                  <DialogClose asChild>
                    <Button variant={"outline"} className="w-2/4">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
                    onClick={handleAdd}
                    disabled={addLoader}
                  >
                    {addLoader ? (
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
                      "Add"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* </ScreenContext.Provider> */}
      </motion.div>
    </AnimatePresence>
  );
};

export default Dashboard;
