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

export async function signUp(name: string, price: string, screen_count: string, status: string) { //storage: string, 
  const supabase = createClient();
  const { data, error } = await supabase.from("plans").insert({
    name: name,
    price: price,
    // storage: storage,
    screen_count: screen_count,
    status: status,
  });

  if (error) {
    console.error("Error during update plan: ", error.message);
    return {error : error.message};
  }

//   revalidatePath("/plan", "layout");
  return redirect(`/plan-setting`);
}
