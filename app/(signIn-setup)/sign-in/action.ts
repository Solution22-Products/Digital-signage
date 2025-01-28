"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logout } from "../logout/action";

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

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  // Step 1: Check if the user exists and has roleId === 3
  const { data: roleData, error: roleError } = await supabase
    .from('usersList')
    .select('userId, roleId')
    .eq('email', email)
    .single();

  // If there's an error fetching the role or the roleId !== 3, return unauthorized
  if (roleError || !roleData ) { //|| roleData.roleId !== 3
    revalidatePath('/sign-in', 'layout'); // Revalidate the path to sign-in page
    return { error: 'Invalid email or unauthorized access' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure metadata is retrieved correctly and check the 'Active' status
if (data?.user?.user_metadata?.status !== "Active") {
  await supabase.auth.signOut(); // Logout the user if not active
  return { error: "User is Inactive" };
}

// Proceed if the user is active
// return { success: true, user: data.user };

  getUserData();

  const userId = data.user.id;
  console.log("userId in signIn 1", userId);

  // Check if userId already exists in clientScreenDetails
  const { data: existingUser, error: fetchError } = await supabase
    .from("clientScreenDetails")
    .select("userId")
    .eq("userId", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    return { error: fetchError.message };
  }
  if (existingUser) {
    const message = "User already exists";
    console.error(message);
    // Fetch client screen details to decide the redirection path
    const { data: userDetails, error: detailsError } = await supabase
      .from("clientScreenDetails")
      .select("screen_location, screen_counts")
      .eq("userId", existingUser.userId)
      .single();
    
    //   const { data: userRole, error: roleError } = await supabase
    //   .from("usersList")
    //   .select("roleId")
    //   .eq("userId", existingUser.userId)
    //   .single();

    // if(userRole && userRole.roleId === 1){

    // }

    if (detailsError) {
      console.error(
        "Error fetching client screen details:",
        detailsError.message
      );
      return { error: detailsError.message };
    }
    else{
      const {data : profile, error: profileError} = await supabase
    .from("userProfile")
    .select();

    if(profileError){
      console.error( "Error fetching user profile: ", profileError.message);
      return { error: profileError.message };
    }
    // console.log(profile ,"profile");

    const check = profile.filter((item: any) => item.userId === userId);
    
    if (roleData.roleId === 1) {
      return redirect('/admin/dashboard');
    }
    else if (userDetails.screen_location === null) {
      redirect("/welcome1");
    } 
    else if (userDetails.screen_counts === null) {
       redirect("/welcome3");
    }
    else if (check.length === 0 || !check) {
       redirect("/user-profile");
    }
    else {
       redirect("/dashboard");
    }
    // return { success_message: message };
    }

  } else {
    const { error: signinError } = await supabase
      .from("clientScreenDetails")
      .insert({
        userId: userId,
      });

    if (signinError) {
      console.error(
        "Error inserting client screen details: ",
        signinError.message
      );
      return { error: signinError.message };
    }
  }
}

export async function signUp(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  });

  if (error) {
    console.error("Error during sign-up: ", error.message);
    return { error: error.message };
  }

  const userId = data.user.id;

  const { error: signupError } = await supabase.from("usersList").insert({
    email: email,
    roleId: 3,
    userId: userId,
  });

  if (signupError) {
    throw new Error("Error signing up: " + signupError.message);
  }

  revalidatePath("/sign-up", "layout");
  return redirect(`/sign-up`);
}
