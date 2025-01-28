"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getUserData() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (data && data.user) {
    const { user } = data;
    // console.log("data in getUserData 1 ", user.id);
    return user;
  } else {
    return null;
  }
}

export async function signUp(email: string, password: string, roleId: number) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  });

  if (error) {
    console.error("Error during sign-up: ", error.message);
    return {error : error.message};
  }

  const userId = data.user.id;

  const { error: signupError } = await supabase.from("usersList").insert({
    email: email,
    roleId: roleId,
    userId: userId,
  });

  if (signupError) {
    throw new Error("Error signing up: " + signupError.message);
  }

//   revalidatePath("/sign-up", "layout");
  return redirect(`/profile-setting`);
}
