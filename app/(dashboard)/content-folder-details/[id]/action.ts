// "use server";

// import { createClient } from "@/utils/supabase/server";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

// export async function getContentData(){

//     const supabase = createClient();

//     const { data, error } = await supabase
//     .from('content')
//     .select('*')
//     .order('id', { ascending: false });
//     if (error) {    
//         console.error('Error fetching data:', error);
//     } else {
//         // console.log('Data from Supabase:', data);

//         revalidatePath('/content');
//         return redirect('/content');

//     }
// }