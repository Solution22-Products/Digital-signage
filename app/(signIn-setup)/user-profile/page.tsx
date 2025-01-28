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
import { getUserData } from "../sign-in/action";
import toast, { Toaster } from "react-hot-toast";

const formSchema = z.object({
  picture: z
    .any()
    .refine(
      (file) => file?.length === 1,
      "*Supported image formats include JPEG, PNG"
    )
    .refine(
      (file) => file[0]?.type === "image/png" || file[0]?.type === "image/jpeg",
      "Must be a png or jpeg"
    )
    .refine((file) => file[0]?.size <= 5000000, "Max file size is 5MB."),
  companyName: z.string().min(2, {
    message: "Company name is not recognised. Please try again.",
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
      message: "Please enter a valid mobile number with no more than 11 digits",
    })
    .regex(/^[0-9]+$/, {
      message: "Please enter a valid mobile number with no special characters",
    }),
});

const UserProfile = () => {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [signedInUserEmail, setSignedInUserEmail] = useState<string | null>("");
  const [saveLoader, setSaveLoader] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: "",
      companyName: "",
      email: "",
      mobile: "",
    },
  });

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

  const handleImageChange = (files: any) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as any);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    setSaveLoader(true);
    let userProfileUrl = imageUrl;
    if (data.picture && data.picture.length > 0) {
      const userprofile = data.picture[0];
      console.log("userprofile ", userprofile);
      const { data: updateData, error: updateError } = await supabase.storage
        .from("screen-images")
        .upload(`userProfile/${userprofile.name}`, userprofile, {
          cacheControl: "3600",
          upsert: true,
        });
      if (updateError) {
        console.log(updateError);
        setSaveLoader(false);
        notify("Update profile error", false);
        return;
      }
      const { data: publicLogoURLData } = supabase.storage
        .from("screen-images")
        .getPublicUrl(updateData.path);
      userProfileUrl = publicLogoURLData.publicUrl;
    }
    try {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("userProfile")
        .select();
      if (userProfileError) {
        setSaveLoader(false);
        console.log(userProfileError);
        return;
      } else {
        console.log(userProfileData);
        const userData = await getUserData();
        const userId = userData?.id;
        const checkUser = userProfileData.filter(
          (user: any) => user.userId === userId
        );
        if (checkUser.length > 0 || !checkUser) {
          const { data: updateData, error: updateError } = await supabase
            .from("userProfile")
            .update({
              userId: userId,
              email: data.email,
              companyName: data.companyName,
              mobile: data.mobile,
              profileImage: userProfileUrl,
              accessVerified: 1,
            })
            .eq("id", checkUser[0].id);
          if (updateError) {
            console.log(updateError);
            setSaveLoader(false);
            return;
          } else {
            notify("Profile updated successfully", true);
            setSaveLoader(false);
            console.log("user profile updated successfully ", updateData);
          }
        } else {
          const { data: insertData, error: insertError } = await supabase
            .from("userProfile")
            .insert({
              userId: userId,
              email: data.email,
              companyName: data.companyName,
              mobile: data.mobile,
              profileImage: userProfileUrl,
              accessVerified: 1,
            })
            .select();
          if (insertError) {
            console.log(insertError);
            return;
          } else {
            notify("Profile added successfully", true);
            setSaveLoader(false);
            console.log("user profile inserted successfully ", insertData);
          }
        }
      }
    } catch (err) {
      console.log(err);
      setSaveLoader(false);
    }
    setTimeout(() => {
      router.push("/welcome4");
      setSaveLoader(false);
    }, 6000);
    form.reset();
  };

  // const fetchUserprofile = async () => {
  //   const user = await getUserData();
  //   console.log(user?.email);
  //   const { data: userProfileData, error: userProfileError } = await supabase
  //     .from("userProfile")
  //     .select("*")
  //     .eq("userId", user?.id)
  //     .single();
  //   if (userProfileError) {
  //     console.log(userProfileError);
  //     return;
  //   } else {
  //     form.setValue("email", userProfileData?.email || "");
  //   }
  // };

  useEffect(() => {
    const userEmail = async () => {
      const loggedUserEmail = await getUserData();
      setSignedInUserEmail(loggedUserEmail?.email || null);
      form.setValue("email", loggedUserEmail?.email || "");
      // fetchUserprofile();
      // console.log("loggedUserEmail email ", loggedUserEmail?.email);
    };
    userEmail();
  }, []);

  return (
    <div className="md:flex sm:block justify-end min-h-screen">
      <Toaster />
      <div className="md:w-3/5 sm:w-full h-screen flex flex-col justify-center">
        <div className="lg:w-[515px] p-10 md:w-full w-full md:p-12 lg:p-0 m-auto">
          <h1 className="text-3xl font-bold text-primary_color mb-7">
            Profile
          </h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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
                              handleImageChange(e.target.files);
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
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Company Name here" {...field} />
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
                      <Input placeholder="+61 0000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-button_orange hover:bg-button_orange hover:opacity-75"
                style={{ marginTop: "30px" }}
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
                  "Save & Continue"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <div className="w-2/5 relative sm:hidden md:block">
        <Image
          src="/images/welcome-image5.png"
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

export default UserProfile;
