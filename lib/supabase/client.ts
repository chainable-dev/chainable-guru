import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

// For use in Client Components
export const createClient = () => {
	return createClientComponentClient<Database>();
};
