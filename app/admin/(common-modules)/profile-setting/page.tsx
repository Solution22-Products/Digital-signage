"use client";
import { Button } from "@/components/ui/button";
import { ChevronRight, Eye, EyeOff, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { getUserData } from "../admin-setting/action";
import { supabase } from "@/utils/supabase/supabaseClient";
import { emailUpdate, passwordReset } from "./action";
import toast, { Toaster } from "react-hot-toast";
import UploadProfileSkeleton from "@/components/skeleton-ui";

const formSchema = z
  .object({
    picture: z.any(),
    // .refine((file) => file, "Please select an image")
    // .refine(
    //   (file) =>
    //     file[0]?.type === "image/png" || file[0]?.type === "image/jpeg",
    //   "Must be a PNG or JPEG"
    // )
    // .refine((file) => file[0]?.size <= 5000000, "Max file size is 5MB.")
    name: z.string().min(0, {
      message: "name is not recognized. Please try again.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    password: z.string().min(0, {
      message: "Password must be at least 6 characters long.",
    }),
    confirmPassword: z.string().min(0, {
      message: "Password must be at least 6 characters long.",
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match. Please try again.",
    path: ["confirmPassword"],
  });

const ProfileSetting = () => {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);
  const [modalPassword, setModalPassword] = useState("");

  const [userId, setUserId] = useState("");
  const [saveLoader, setSaveLoader] = useState(false);
  const [cancelLoader, setCancelLoader] = useState(false);
  const [skeletonLoader, setSkeletonLoader] = useState(false);

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
      picture: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobile: "",
    },
  });

  const handleImageChange = (files?: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchUserEmail = async () => {
    setSkeletonLoader(true);
    const user = await getUserData();
    const { data, error } = await supabase
      .from("usersList")
      .select("*")
      .eq("userId", user?.id)
      .single();
    if (error) {
      console.log(error);
      setSkeletonLoader(false);
      return;
    }
    form.setValue("email", user?.email || "");
    form.setValue("name", data?.name || "");
    form.setValue("mobile", data?.mobile || "");
    form.setValue("picture", data?.url || "");
    setImageUrl(data?.url || "");
    setUserId(user?.id || "");
    setSkeletonLoader(false);
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setModalPassword(password);
    form.setValue("password", password);
    form.setValue("confirmPassword", password);
  };

  const handleUpdateProfile = async (data: any) => {
    setSaveLoader(true);

    let uploadedUrl = imageUrl; // Start with existing image URL

    if (data.picture && data.picture.length > 0) {
      const file = data.picture[0];
      if (file.name === undefined || file.name === null) {
        const { data: userData, error: userError } = await supabase
          .from("usersList")
          .update({
            email: data.email,
            name: data.name,
            mobile: data.mobile,
          })
          .eq("userId", userId);

        if (userError) {
          console.error("Update user error:", userError);
          notify("Update user error", false);
          return;
        }

        notify("Profile updated successfully", true);
        form.setValue("password", "");
        form.setValue("confirmPassword", "");
        setSaveLoader(false);
        passwordReset(data.password);
        emailUpdate(data.email, userId);
        window.location.reload();
      } else {
        const { data: uploadedFile, error: uploadedError } =
          await supabase.storage
            .from("screen-images")
            .upload(`${file.name}`, file, {
              cacheControl: "3600",
              upsert: true,
            });

        if (uploadedError) {
          console.error("Upload error:", uploadedError);
          notify("Upload error", false);
          return;
        }

        const { data: publicURLData } = supabase.storage
          .from("screen-images")
          .getPublicUrl(`${uploadedFile.path}`);
        uploadedUrl = publicURLData.publicUrl;

        const { data: userData, error: userError } = await supabase
          .from("usersList")
          .update({
            email: data.email,
            name: data.name,
            mobile: data.mobile,
            url: uploadedUrl, // Use the new URL or the existing one
          })
          .eq("userId", userId);

        if (userError) {
          console.error("Update user error:", userError);
          notify("Update user error", false);
          return;
        }

        notify("Profile updated successfully", true);
        form.setValue("password", "");
        form.setValue("confirmPassword", "");
        setSaveLoader(false);
        passwordReset(data.password);
        emailUpdate(data.email, userId);
        window.location.reload();
      }
    }
  };

  useEffect(() => {
    fetchUserEmail();
  }, []);

  return (
    <div
      className="w-full p-4 pt-5 relative"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <Toaster />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h4
            className="text-sm font-medium text-primary_color cursor-pointer"
            onClick={() => {
              setCancelLoader(true);
              setTimeout(() => {
                router.back();
                setCancelLoader(false);
              }, 1000);
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
            Profile Setting
          </h4>
        </div>
      </div>
      {skeletonLoader ? (
        <div className="mt-4">
          <UploadProfileSkeleton />
        </div>
      ) : (
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateProfile)}
              className="space-y-3"
            >
              <FormField
                control={form.control}
                name="picture"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-2">
                    <FormControl>
                      <div className="flex flex-col items-center justify-center mt-5 gap-2">
                        <div className="relative w-32 h-32 rounded-full border-2 border-border_gray">
                          <Input
                            type="file"
                            accept="image/png, image/jpeg"
                            placeholder="Upload Image"
                            className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                            onChange={(e) => {
                              field.onChange(e.target.files);
                              handleImageChange(e.target.files as FileList);
                            }}
                          />
                          <Image
                            src={imageUrl || ""}
                            alt="Profile Image"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full z-0 text-transparent"
                          />
                          <div className="text-black bg-white absolute right-1 bottom-2 p-1 border border-border_gray rounded-full w-8 h-8 flex justify-center items-center">
                            <Pencil size={16} className="cursor-pointer" />
                          </div>
                        </div>
                        <p className="text-center text-sm font-medium text-placeholder">
                          Allowed Types: jpg, png, jpeg
                        </p>
                      </div>
                    </FormControl>
                    {/* <FormMessage className="text-center" /> */}
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 items-center gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Name here" {...field} />
                      </FormControl>
                      {/* <FormMessage /> */}
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
              </div>
              <div className="grid grid-cols-2 items-end gap-2">
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem className="mt-0">
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+61 0000 0000" {...field} />
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
                        onClick={() => setModalShowPassword(!modalShowPassword)}
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
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
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
                className="text-white bg-primary_color text-sm w-[128px] h-[40px] font-medium absolute top-[6px] right-[16px]"
                type="submit"
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
  );
};

export default ProfileSetting;
