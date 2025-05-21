import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { supabase } from "@/lib/supabase/supabase";
import "server-only";

export class UserService {
  async getUserEmailByName(
    name: string,
    password: string
  ): Promise<{ email?: string; error?: string }> {
    const genericError = "Invalid credentials. Please try again.";

    if (!name || !password) {
      return { error: genericError };
    }

    try {
      // 1. Profil anhand des Benutzernamens holen
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("user_profile")
        .select("id")
        .eq("name", name)
        .single();

      if (profileError || !profileData?.id) {
        return { error: genericError };
      }

      // 2. User-Daten anhand der ID holen
      const { data: userData, error: userError } =
        await supabaseAdmin.auth.admin.getUserById(profileData.id);

      const email = userData?.user?.email;

      if (userError || !email) {
        return { error: genericError };
      }

      // 3. Passwort validieren über Supabase-Client (Client-seitige Session-Erstellung)
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError || !authData.session) {
        return { error: genericError };
      }

      return { email };
    } catch (err) {
      console.error("Fehler in getUserEmailByName:", err);
      return { error: genericError };
    }
  }
}
