"use server";

import { createClient } from "@/utils/supabase/server";
import { supabase } from "@/utils/supabase/supabaseServer";
//import { createClient } from "@/utils/supabase/server";
import { error } from "console";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getUserData() {
  const { data } = await supabase.auth.getUser();

  if (data && data.user) {
    const { user } = data;
    // console.log("data in getUserData 1 ", user.id);
    return user;
  } else {
    return null;
  }
}

export async function createUser(email: string, name: string, mobile: string, address: string, website: string, state: string, city: string, roleId: string, zipcode: string, country: string, password: string, plan: string, url: string, status: string) {
  //const supabase = createClient();
  const { data: authData, error: authError } =  await supabase.auth.admin.createUser({
    email: email,
    password: password,
    user_metadata:{status:"Active"},
    email_confirm: true, // Correctly passed within the user data object.
  });

  if (authError) {
    console.error("Error during update user: ", authError);
    //return ("Error during user data: " + authError);
    return {error : authError};
  }

  // const { data: userCurrrent, error: userError } = await supabase.auth.getUser();
  // const userId = userCurrrent.user?.id;

  /*
  // Insert User Data into Table
  const { data: inserData, error: insertError } = await supabase.from("usersList").insert({
    email: email,
    name: name,
    mobile: mobile,
    address: address,
    website: website,
    state: state,
    city: city,
    roleId: roleId || "3", //"3" || 3,
    zipcode: zipcode,
    country: country,
    password: password,
    plan: plan || "", //"be34dce8-8f81-4b42-94b4-53767464086c",
    url: url, // Set the uploaded image URL
    status: "Active",
    created_by: userId || "",
    userId: authData.user?.id || "",
  });

  if (insertError) {
    console.error("Error inserting update user: ", insertError);
    //return ("Error inserting user data: " + insertError);
    return {error : insertError};
  }*/

  return{data : authData.user};
}

export async function updateUser(password: string,id: string) {
  const supabase = createClient();
  const userId = id; // ID of the user you want to update
  const updateData = {
    // email: email,
    password: password,
  };

  const { data: authData, error: authError } =  await supabase.auth.admin.updateUserById(userId, updateData);

  if (authError) {
    console.error("Error during update user: ", authError);
    //return ("Error during user data: " + authError);
    return {error : authError};
  }
  console.log("authData ", authData);
  // return{data : authData.user};
}
