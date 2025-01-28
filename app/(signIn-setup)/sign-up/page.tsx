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
import { Input } from "@/components/ui/input";
import { Search, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { signUp } from "../sign-in/action";
import toast, { Toaster } from "react-hot-toast";

// const RATE_LIMIT_INTERVAL = 60000; // 1 minute in milliseconds
// const MAX_ATTEMPTS = 5; // Max signup attempts allowed within the interval

const formSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    password: z.string().min(6, {
      message: "Password is not recognized. Please try again.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password is not recognized. Please try again.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password is not matched. Please try again.",
    path: ["confirmPassword"],
  });

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const route = useRouter();

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

  // useEffect(() => {
  //   if (lastAttempt && Date.now() - lastAttempt >= RATE_LIMIT_INTERVAL) {
  //     setAttempts(0);
  //     setLastAttempt(null);
  //   }
  // }, [lastAttempt]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit (data: any) {
    console.log(data);
    setSignupLoading(true);
    signUp(data.email, data.password).then((res) => {
      if (res?.error) {
        notify(res?.error, false);
        setSignupLoading(false);
        return;
      }
      notify("Signed up successfully", true);
      form.reset({ email: "", password: "", confirmPassword: "" });
      setTimeout(() => route.push("/sign-in"), 2000);
    })

    // if (attempts >= MAX_ATTEMPTS) {
    //   setMessage(
    //     "You have exceeded the maximum number of signup attempts. Please try again later."
    //   );
    //   return;
    // }

    // setLastAttempt(Date.now());
    // setAttempts((prev) => prev + 1);

    // const { error } = await supabase.auth.signUp({
    //   email: data.email,
    //   password: data.password,
    // });
    // if (error) {
    //   console.log(error);
    //   setMessage(error.message);
    // } else {
    //   console.log("true");
    //   setMessage("Check your email for a confirmation link");
    //   route.push("/sign-in");
    // }
    //form.reset({ email: "", password: "", confirmPassword: "" }); // Reset to default values
  };

  return (
    <div className="md:flex sm:block justify-end min-h-screen">
      <Toaster />
      <div className="md:w-3/5 sm:w-full h-screen flex flex-col justify-center">
        <div className="lg:w-[515px] p-10 md:w-full w-full md:p-12 lg:p-0 m-auto">
          <h1 className="text-3xl font-bold mb-7">Sign Up</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Email"
                        {...field}
                        className=" placeholder:text-placeholder"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="*****"
                        {...field}
                        className=" placeholder:text-placeholder w-[90%]"
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="*****"
                        {...field}
                        className=" placeholder:text-placeholder w-[90%]"
                      />
                    </FormControl>
                    
                    <span
                      className="absolute md:right-0 -right-0 top-6 cursor-pointer border border-border_gray rounded w-7 md:w-8 lg:w-11 h-10 flex items-center justify-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </span>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-button_orange hover:bg-button_orange hover:opacity-75"
                style={{ marginTop: "30px" }}
              >
                Sign Up
              </Button>
            </form>
          </Form>
          <button className="block mt-7 mb-1.5 border border-border_gray rounded py-2 text-sm font-medium text-center w-full">
            SignUp with Google
          </button>
          <button className="block mb-7 border border-border_gray rounded py-2 text-sm font-medium text-center w-full">
            SignUp with Facebook
          </button>
          <h2 className="text-base font-bold">
            Don't have an account?{" "}
            <a href="/sign-in" className="text-button_orange">
              Sign In
            </a>
          </h2>
        </div>
      </div>
      <div className="w-2/5 relative sm:none md:block">
        <Image
          src="/images/signup.png"
          alt="sign in"
          fill
          quality={100}
          priority
          className="w-full h-screen"
        />
      </div>
    </div>
  );
};

export default SignUp;
