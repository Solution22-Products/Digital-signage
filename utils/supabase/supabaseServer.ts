import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);


// export function createClient() {
//   const cookieStore = cookies()

//   // Create a server's supabase client with newly configured cookie,
//   // which could be used to maintain user's session
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return cookieStore.get(name)?.value
//         },
//         set(name: string, value: string, options: CookieOptions) {
//           try {
//             cookieStore.set({ name, value, ...options })
//           } catch (error) {
//             // The `set` method was called from a Server Component.
//             // This can be ignored if you have middleware refreshing
//             // user sessions.
//           }
//         },
//         remove(name: string, options: CookieOptions) {
//           try {
//             cookieStore.set({ name, value: '', ...options })
//           } catch (error) {
//             // The `delete` method was called from a Server Component.
//             // This can be ignored if you have middleware refreshing
//             // user sessions.
//           }
//         },
//       },
//     }
//   )
// }