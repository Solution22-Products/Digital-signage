"use server";
import { createClient } from "@/utils/supabase/server";

export async function passwordReset(password: string) {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.updateUser({
      password: password,
    });
  // console.log("userData ", userData);
  // console.log(userError , "error");
    if (userError) {
      // console.error("Password update error:", userError.message);
      return { error: userError.message };
    }
    // console.log(password);
    // console.log("userData ", userData);
    return { success_message: "Password changed successfully" };
  }