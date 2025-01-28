"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getUserData() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (data && data.user) {
    const { user } = data;
    console.log("data in getUserData 1 ", user.id);
    return user;
  } else {
    return null;
  }
}

export async function updateMetadata(status : string, id : string) {
  console.log("user status ", status, id);
  const supabase = createClient();

  const {data:clientEmail, error:clientError} = await supabase
  .from("usersList")
  .select("email, userId")
  .eq("id", id)
  .single();
  if(clientError) {
    console.error("Error during update metadata 1: ", clientError.message);
    return {error : clientError.message};
  }
  console.log("clientEmail ", clientEmail.email, clientEmail.userId);

  const { data, error } = await supabase.auth.admin.updateUserById(clientEmail.userId, { user_metadata: { status: status } });
  console.log("meta data ", data);
  if (error) {
    console.error("Error during update metadata 2: ", error.message);
    return {error : error.message};
  }
  console.log("Metadata update successful:", data);
  return { success: true, data };
}

export async function signUp(name: string, price: string, storage: string, screen_count: string, status: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("plans").insert({
    name: name,
    price: price,
    storage: storage,
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

