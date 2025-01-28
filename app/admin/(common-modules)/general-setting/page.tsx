"use client";
import { ChevronRight, Eye, EyeOff, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { string, z } from "zod";
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
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getUserData } from "../admin-setting/action";
import { supabase } from "@/utils/supabase/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { GeneralSettingsSkeleton } from "@/components/skeleton-ui";

const formSchema = z.object({
  logo: z.any(),
  favIcon: z.any(),
  applicationName: z.string().min(0, {
    //   message: "name is not recognized. Please try again.",
  }),
  copyrightText: z.string().min(0, {
    //   message: "name is not recognized. Please try again.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  smtpPort: z.string().min(0, {
    //   message: "name is not recognized. Please try again.",
  }),
  smtpUser: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(0, {
    message: "Password must be at least 6 characters long.",
  }),
});

const GeneralSetting = () => {
  const router = useRouter();
  const [appLogo, setAppLogo] = useState<string>("");
  const [favIcon, setFavIcon] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [modalPassword, setModalPassword] = useState("");
  const [cancelLoader, setCancelLoader] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);
  const [skeletonLoader, setSkeletonLoader] = useState(true);

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
      logo: "",
      favIcon: "",
      applicationName: "",
      copyrightText: "",
      email: "superadmin@gmail.com",
      smtpPort: "",
      smtpUser: "superadmin@gmail.com",
      password: "",
    },
  });

  const handleImageChange = (files?: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFavIconChange = (files?: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFavIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchUserEmail = async () => {
    setSkeletonLoader(true);
    const user = await getUserData();
    const { data, error } = await supabase
      .from("generalSettings")
      .select("*")
      .eq("userId", user?.id)
      .single();
    if (error) {
      setSkeletonLoader(false);
      return;
    }
    setSkeletonLoader(false);
    form.setValue("logo", data?.url || "");
    form.setValue("applicationName", data?.applicationName || "");
    form.setValue("copyrightText", data.copyrightText || "");
    form.setValue("email", data.email || "");
    // form.setValue("smtpPort", data.smtpPort || "");
    // form.setValue("smtpUser", data.smtpUser || "");
    // form.setValue("password", data.smtpPassword || "");
    setAppLogo(data?.logo || "");
    setFavIcon(data?.favicon || "");
    setUserId(user?.id || "");
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setModalPassword(password);
    form.setValue("password", password);
  };

  const handleUpdateProfile = async () => {
    setSaveLoader(true);
    const data = form.getValues();

    let uploadedLogoUrl = appLogo;
    let uploadedFaviconUrl = favIcon;

    if (data.logo && data.logo.length > 0) {
      const logoFile: any = data.logo[0];
      const { data: uploadedLogo, error: uploadedLogoError } =
        await supabase.storage
          .from("screen-images")
          .upload(`logos/${logoFile.name}`, logoFile, {
            cacheControl: "3600",
            upsert: true,
          });

      if (uploadedLogoError) {
        console.error("Logo upload error:", uploadedLogoError);
        return;
      }

      const { data: publicLogoURLData } = supabase.storage
        .from("screen-images")
        .getPublicUrl(uploadedLogo.path);
      uploadedLogoUrl = publicLogoURLData.publicUrl;
    }

    if (data.favIcon && data.favIcon.length > 0) {
      const favIconFile: any = data.favIcon[0];
      const { data: uploadedFavIcon, error: uploadedFavIconError } =
        await supabase.storage
          .from("screen-images")
          .upload(`favicons/${favIconFile.name}`, favIconFile, {
            cacheControl: "3600",
            upsert: true,
          });

      if (uploadedFavIconError) {
        console.error("Favicon upload error:", uploadedFavIconError);
        return;
      }

      const { data: publicFavIconURLData } = supabase.storage
        .from("screen-images")
        .getPublicUrl(uploadedFavIcon.path);
      uploadedFaviconUrl = publicFavIconURLData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("generalSettings")
      .update({
        logo: uploadedLogoUrl,
        favicon: uploadedFaviconUrl,
        applicationName: data.applicationName,
        copyrightText: data.copyrightText,
        email: data.email,
        // smtpPort: data.smtpPort,
        // smtpUser: data.smtpUser,
        // smtpPassword: data.password,
      })
      .eq("userId", userId);

    if (updateError) {
      console.error("Update user error:", updateError);
      return;
    }
    setSaveLoader(false);
    window.location.reload();
    notify("Settings updated successfully", true);
    // Success notification or actions can be added here
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
            General Setting
          </h4>
        </div>
      </div>
      {skeletonLoader ? (
        <div className="mt-[80px]">
        <GeneralSettingsSkeleton />
        </div>
      ) : (
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateProfile)}
              className="space-y-3"
            >
              <div className="flex flex-col justify-center items-center gap-4 pt-20">
                <div className="flex justify-center items-center gap-5">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem className="mt-0 pb-2">
                        <FormControl>
                          <div className="relative w-32 h-32 rounded-full border-2 border-border_gray">
                            <p className="text-primary_color font-bold text-base absolute -top-10 left-[45px]">
                              Logo
                            </p>
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
                              src={appLogo || ""}
                              alt="Profile Image"
                              layout="fill"
                              objectFit="cover"
                              className="rounded-full z-0 text-transparent"
                            />
                            <div className="text-black bg-white absolute right-1 bottom-2 p-1 border border-border_gray rounded-full w-8 h-8 flex justify-center items-center">
                              <Pencil size={16} className="cursor-pointer" />
                            </div>
                          </div>
                        </FormControl>
                        {/* <FormMessage className="text-center" /> */}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="favIcon"
                    render={({ field }) => (
                      <FormItem className="mt-0 pb-2">
                        <FormControl>
                          <div className="relative w-32 h-32 rounded-full border-2 border-border_gray">
                            <p className="text-primary_color font-bold text-base absolute -top-10 left-[38px]">
                              Fav Icon
                            </p>
                            <Input
                              type="file"
                              accept="image/png, image/jpeg"
                              placeholder="Upload Image"
                              className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                              onChange={(e) => {
                                field.onChange(e.target.files);
                                handleFavIconChange(e.target.files as FileList);
                              }}
                            />
                            <Image
                              src={favIcon || ""}
                              alt="Fav Icon"
                              layout="fill"
                              objectFit="cover"
                              className="rounded-full z-0 text-transparent"
                            />
                            <div className="text-black bg-white absolute right-1 bottom-2 p-1 border border-border_gray rounded-full w-8 h-8 flex justify-center items-center">
                              <Pencil size={16} className="cursor-pointer" />
                            </div>
                          </div>
                        </FormControl>
                        {/* <FormMessage className="text-center" /> */}
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-center text-sm font-medium text-placeholder">
                  Allowed Types: jpg, png, jpeg
                </p>
              </div>

              <div className="grid grid-cols-2 items-center gap-2 pt-3">
                <FormField
                  control={form.control}
                  name="applicationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Name here" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="copyrightText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Copyright Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Copyright 2024" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 items-end gap-2">
                {/* <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mt-0">
                    <FormLabel>Email From/ Reply to</FormLabel>
                    <FormControl>
                      <Input placeholder="0000 000 000" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              /> */}
                {/* <FormField
                control={form.control}
                name="smtpPort"
                render={({ field }) => (
                  <FormItem className="mt-0">
                    <FormLabel>SMTP Port</FormLabel>
                    <FormControl>
                      <Input placeholder="5869" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              </div>
              {/* <div className="grid grid-cols-2 items-end gap-2">
              <FormField
                control={form.control}
                name="smtpUser"
                render={({ field }) => (
                  <FormItem className="mt-0">
                    <FormLabel>SMTP User</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="support@solution22.com.au"
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
            </div> */}
              <Button
                className="text-white bg-primary_color w-[128px] h-[40px] text-sm font-medium absolute top-[6px] right-[16px]"
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

export default GeneralSetting;
