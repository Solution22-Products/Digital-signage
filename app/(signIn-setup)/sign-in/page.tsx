"use client";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import { supabase } from "@/utils/supabase/supabaseClient";
import { getUserData, signIn } from "./action";
import toast, { Toaster } from "react-hot-toast";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password is not recognised. Please try again.",
  }),
});

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRouter();
  const [signinLoading, setSigninLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [signedInUserId, setSignedInUserId] = useState<string | null>("");

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderError, setFolderError] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState("");
  const [logo, setLogo] = useState<string>("");

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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  //   const { data: existingUser, error: fetchError } = await supabase
  //     .from("clientScreenDetails")
  //     .select("userId")
  //     .eq("userId", signedInUserId)
  //     .single();

  //   if (fetchError && fetchError.code !== "PGRST116") {
  //     return { error: fetchError.message };
  //   }

  //   if (existingUser) {
  //     const { data: userDetails, error: detailsError } = await supabase
  //       .from("clientScreenDetails")
  //       .select("screen_location, screen_counts")
  //       .eq("userId", existingUser.userId)
  //       .single();

  //     if (detailsError) {
  //       console.error("Error fetching client screen details:", detailsError.message);
  //       return { error: detailsError.message };
  //     }

  //     const { data: profile, error: profileError } = await supabase
  //       .from("userProfile")
  //       .select();

  //     if (profileError) {
  //       console.error("Error fetching user profile:", profileError.message);
  //       return { error: profileError.message };
  //     }

  //     const check = profile.filter((item: any) => item.userId === existingUser.userId);

  //     if (userDetails.screen_location === null) {
  //       route.push("/welcome1");
  //     } else if (userDetails.screen_counts === null) {
  //       route.push("/welcome3");
  //     } else if (check.length === 0 || !check) {
  //       route.push("/user-profile");
  //     } else {
  //       route.push("/dashboard");
  //     }
  //   }
  // };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSigninLoading(true);
    try {
      const res = await signIn(values.email, values.password);
      setSigninLoading(false);
      if (res?.error) {
        notify(`Sign in failed: ${res.error}`, false);
      } else {
        notify("Sign in successful", true);
        const user = await getUserData();
        localStorage.setItem("userId", user?.id!);
        localStorage.setItem("userEmail", user?.email!);

        const { data: userData, error: errorData } = await supabase
          .from("usersList")
          .select("roleId")
          .eq("email", user?.email)
          .single();
        if (userData) {
          localStorage.setItem("userRole", userData?.roleId!);
          if (userData?.roleId! == 1) {
            localStorage.setItem("userRolename", "superadmin");
          } else if (userData?.roleId! === 3) {
            localStorage.setItem("userRolename", "user");
          } else {
            localStorage.setItem("userRolename", "admin");
          }
        }
        // checkUserSignedIn();
      }
    } catch (error) {
      setSigninLoading(false);
      notify(`Sign in failed: ${error}`, false);
    }
  }

  const handleSendEmail = async () => {
    setEmailLoading(true);
    const newErrors = { name: !folderNameInput };
    setFolderError(newErrors.name);

    if (newErrors.name) {
      notify("Please enter a valid email address", false); // Display error message if input is invalid
      setEmailLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        folderNameInput,
        {
          redirectTo: `${window.location.origin}/forget-password`,
        }
      );

      if (error) {
        notify(`Error: ${error.message}`, false); // Display error message if Supabase call fails
      } else {
        notify("Password reset link sent to your email", true); // Success notification
      }

      setCreateFolderOpen(false);
    } catch (error: any) {
      notify(`Error: ${error.message}`, false); // Display catch block error as notification
    } finally {
      setEmailLoading(false);
    }
  };

  const fetchLogo = async () => {
    const { data, error } = await supabase
      .from("generalSettings")
      .select("logo")
      .single();
    if (error) {
      console.log("Error", error.message);
    }
    setLogo(data?.logo as any);
    console.log("Logo ", data?.logo);
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      const user = await getUserData();
      if (user) {
        setSignedInUserId(user.id);
      }
    };
    fetchUserId();
    fetchLogo();
  }, [signedInUserId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="md:flex sm:block justify-end min-h-screen">
      <Toaster />
      <div className="md:w-3/5 sm:w-full h-screen flex flex-col justify-center relative">
        <div className="lg:w-[515px] p-10 md:w-full w-full md:p-12 lg:p-0 m-auto">
          <div className="absolute top-4 left-4">
            <div
              className="relative h-[45px] w-[106px] rounded border-2 border-border_gray sizing-border"
              style={{
                backgroundImage: `url(${logo})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
          </div>
          <h1 className="text-3xl font-bold mb-7">Sign In</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Email here" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative pb-3">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        {...field}
                        className="w-[90%]"
                      />
                    </FormControl>
                    <span
                      className="absolute md:right-0 -right-0 top-6 cursor-pointer border border-border_gray rounded w-7 md:w-8 lg:w-11 h-10 flex items-center justify-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </span>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Dialog
                open={createFolderOpen}
                onOpenChange={setCreateFolderOpen}
              >
                <DialogTrigger asChild>
                  <p className="font-medium text-[13px] underline underline-offset-4 cursor-pointer inline">
                    Forget Password
                  </p>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                  <DialogHeader className="flex flex-col space-y-0">
                    <DialogTitle className="text-2xl font-semibold">
                      Forget Password
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 pb-2">
                    <div>
                      <Label htmlFor="name" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="folderName"
                        className={`col-span-3 mt-1.5 ${
                          folderError ? "border-red-500" : "border-border_gray"
                        }`}
                        placeholder="example@gmail.com"
                        value={folderNameInput}
                        onChange={(e) => {
                          setFolderNameInput(e.target.value);
                          if (folderError) setFolderError(false);
                        }}
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
                      onClick={handleSendEmail}
                      disabled={emailLoading}
                    >
                      {emailLoading ? (
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
                        "Send Email"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                type="submit"
                className="w-full bg-button_orange hover:bg-button_orange hover:opacity-75"
                style={{ marginTop: "30px" }}
                disabled={signinLoading}
              >
                {signinLoading ? (
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
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
          {/* <button className="block mt-7 mb-1.5 border border-border_gray rounded py-2 text-sm font-medium text-center w-full">
            Sign in with Google
          </button>
          <button className="block mb-7 border border-border_gray rounded py-2 text-sm font-medium text-center w-full">
            Sign in with Facebook
          </button> */}
          {/* <h2 className="text-base font-bold">
            Don't have an account?{" "}
            <a href="/sign-up" className="text-button_orange">
              Sign Up
            </a>
          </h2> */}
        </div>
      </div>
      <div className="w-2/5 relative sm:none md:block">
        <Image
          src="/images/signin.png"
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

export default SignIn;
