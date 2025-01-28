"use server";

import { createClient } from "@/utils/supabase/server";

export async function passwordReset(password: string) {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.updateUser({
    password : password,
  });

  if (userError) {
    console.error("Password update error:", userError.message);
    return { error: userError.message };
  }
  console.log("userData ", userData);
  return { success_message: "Password changed successfully" };
}

export async function emailUpdate(email: string, userId: string) {
  const supabase = createClient();
  const { data: user, error } = await supabase.auth.admin.updateUserById(
    userId,
    { email: email }
  );
  if (error) {
    console.error("Error in email updation", error.message);
    return { error: error.message };
  }
  console.log("email updated", user);
  return{success_message : "Email updated successfully"};
}
