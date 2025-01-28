"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "@/public/svg/page";
import { supabase } from "@/utils/supabase/supabaseClient";
// import toast, { Toaster } from "react-hot-toast";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import { ChevronRight, Eye, EyeOff, Loader2, Upload } from "lucide-react";
import { passwordReset } from "./action";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { UploadProfileSkeleton } from "@/components/skeleton-ui";

// Define the validation schema using Zod
const formSchema = z
  .object({
    picture: z.any(),
    // .refine(
    //   (file) => file?.length === 1,
    //   "*Supported image formats include JPEG, PNG"
    // )
    // .refine(
    //   (file) => file[0]?.type === "image/png" || file[0]?.type === "image/jpeg",
    //   "Must be a PNG or JPEG"
    // )
    // .refine((file) => file[0]?.size <= 5000000, "Max file size is 5MB.")
    companyName: z.string().min(2, {
      message: "Company name is not recognized. Please try again.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    mobile: z
      .string()
      .min(9, {
        message: "Please enter a valid mobile number with at least 9 digits",
      })
      .max(11, {
        message:
          "Please enter a valid mobile number with no more than 11 digits",
      })
      .regex(/^[0-9]+$/, {
        message:
          "Please enter a valid mobile number with no special characters",
      }),
    password: z.string().min(0, {
      message: "Password must be at least 6 characters long.",
    }),
    confirmPassword: z.string().min(0, {
      message: "Password must be at least 6 characters long.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password doesn't match with password",
    path: ["confirmPassword"],
  });

const UserSettings = () => {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [signedInUserEmail, setSignedInUserEmail] = useState<string | null>("");
  const [modalPassword, setModalPassword] = useState("");
  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);

  const [saveLoader, setSaveLoader] = useState(false);
  const [skeletonLoader, setSkeletonLoader] = useState(true);
  const [cancelLoader, setCancelLoader] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: "",
      companyName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  });

  // const notify = (message: string, success: boolean) =>
  //   toast[success ? "success" : "error"](message, {
  //     style: {
  //       borderRadius: "10px",
  //       background: "#fff",
  //       color: "#000",
  //     },
  //     position: "top-right",
  //     duration: 2000,
  //   });

  const handleImageChange = (files: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    setSaveLoader(true);
    console.log("form data ", data);
    try {
      // const userData = await getUserData();
      const userId = localStorage.getItem("userId");

      let userProfileUrl = imageUrl;

      if (data.picture && data.picture.length > 0) {
        const userprofile = data.picture[0];
        if (userprofile.name) {
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("screen-images")
              .upload(`userProfile/${userprofile.name}`, userprofile, {
                cacheControl: "3600",
                upsert: true,
              });

          if (uploadError) {
            toast({
              title: "Error uploading profile image",
              description: uploadError.message,
            });
            return;
          }

          const { data: publicLogoURLData } = supabase.storage
            .from("screen-images")
            .getPublicUrl(uploadData.path);
          userProfileUrl = publicLogoURLData.publicUrl;
        }
      }

      const { error: updateError } = await supabase
        .from("userProfile")
        .update({
          email: data.email,
          companyName: data.companyName,
          mobile: data.mobile,
          profileImage: userProfileUrl,
          accessVerified: 1,
        })
        .eq("userId", userId);

      if (updateError) {
        toast({
          title: "Error updating profile",
          description: updateError.message,
        });
        return;
      }

      toast({
        title: "Updated Successfully!.",
        description: "Profile updated successfully!",
      });
      fetchUserProfile();
      // console.log(data.password, " password");
      passwordReset(data.password);
      // console.log("modalPassword ", modalPassword);
      setSaveLoader(false);
      window.location.reload();
    } catch (error: Error | any) {
      toast({
        title: "Error updating profile",
        description: error.message,
      });
      console.error("Error updating profile:", error);
    }
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setModalPassword(password);
    form.setValue("password", password);
    form.setValue("confirmPassword", password);
  };

  const fetchUserProfile = async () => {
    const user = localStorage.getItem("userId");
    // console.log("user id ", user?.id);
    setSkeletonLoader(true);
    try {
      
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("userProfile")
        .select("*")
        .eq("userId", user || null)
        .single();
  
      if (userProfileError || !userProfileData) {
        console.error("Error fetching user profile:", userProfileError || "No user found.");
        toast({
          title: "Error fetching profile",
        description: "Profile not found",
        });
        if(!userProfileData){
          router.push("/user-profile");
        }
        form.setValue("email", "");
        form.setValue("companyName", "");
        form.setValue("mobile", "");
        setImageUrl("");
        setSkeletonLoader(false);
        console.log("user not found")
        return;
      }
  
      setSkeletonLoader(false);
      form.setValue("email", userProfileData?.email || "");
      form.setValue("companyName", userProfileData?.companyName || "");
      form.setValue("mobile", userProfileData?.mobile || "");
      setImageUrl(userProfileData?.profileImage || "");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      form.setValue("email", "");
      form.setValue("companyName", "");
      form.setValue("mobile", "");
      setImageUrl("");
      setSkeletonLoader(false);
    }
  };
  

  useEffect(() => {
    setSignedInUserEmail(localStorage.getItem("userEmail"));
    fetchUserProfile();
  }, []);

  return (
    <div
      className="w-full relative pb-5"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <Toaster />
      <div className="pt-5">
        <div className="flex items-center gap-4 pl-4 pb-10">
          {/* <h4
            className="text-sm font-medium text-primary_color cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            Setting
          </h4> */}
          <h4
            className="text-sm font-medium text-primary_color cursor-pointer"
            onClick={() => {
              setCancelLoader(true);
              setTimeout(() => {
                router.push("/dashboard");
                setCancelLoader(false);
              }, 2000);
            }}
            style={cancelLoader ? { pointerEvents: "none" } : {}}
          >
            {cancelLoader ? (
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
                  className="opacity-100"
                  fill="#FF7C44"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Setting"
            )}
          </h4>
          <ChevronRight size={20} />
          <h4 className="text-sm font-medium text-primary_color">
            User Settings
          </h4>
        </div>
        {skeletonLoader ? (
          <UploadProfileSkeleton />
        ) : (
          <div className="w-full p-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="picture"
                  render={({ field }) => (
                    <FormItem className="mt-0 pb-2">
                      <FormControl>
                        <div className="flex justify-center mt-5">
                          <div className="relative w-32 h-32 rounded-full border-2 border-border_gray">
                            <Input
                              type="file"
                              accept="image/png, image/jpeg"
                              placeholder="Upload Image"
                              className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                              onChange={(e) => {
                                field.onChange(e.target.files);
                                handleImageChange(e.target.files as any);
                              }}
                            />
                            <Image
                              src={imageUrl || ""}
                              alt="Profile Image"
                              layout="fill"
                              objectFit="cover"
                              className="rounded-full z-0 text-transparent"
                            />
                            <Plus />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-center" />
                    </FormItem>
                  )}
                />

                <div className="w-1/2 space-y-2 mx-auto">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Company Name here"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="mt-0">
                        <FormLabel className="mb-2">Email</FormLabel>
                        <FormControl>
                          <Input disabled placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem className="mt-0">
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="+61 0000 0000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <div className="flex justify-between items-center">
                          <FormLabel>Password</FormLabel>
                          <p
                            className="w-fit bg-button_orange text-white px-1 rounded text-xs cursor-pointer"
                            onClick={generatePassword}
                          >
                            Generate
                          </p>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="**********"
                            type={modalShowPassword ? "text" : "password"}
                            {...field}
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e);
                              setModalPassword(e.target.value);
                            }}
                          />
                        </FormControl>
                        <span
                          className="absolute md:right-0 -right-0 top-[25px] cursor-pointer w-7 md:w-8 lg:w-11 flex items-center justify-center"
                          onClick={() =>
                            setModalShowPassword(!modalShowPassword)
                          }
                        >
                          {modalShowPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="mt-0 relative">
                        <FormLabel className="mb-2">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type={confirmShowPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            {...field}
                          />
                        </FormControl>
                        <span
                          className="absolute md:right-0 -right-0 top-[34px] cursor-pointer w-7 md:w-8 lg:w-11 flex items-center justify-center"
                          onClick={() =>
                            setConfirmShowPassword(!confirmShowPassword)
                          }
                        >
                          {confirmShowPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className={`bg-button_orange hover:bg-button_orange w-[128px] h-[40px] hover:opacity-75 absolute -top-[0px] right-[16px]`}
                  disabled={saveLoader}
                >
                  {saveLoader ? (
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
                    "Update Profile"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettings;
