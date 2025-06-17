import { supabaseAdmin } from "@/app/lib/supabase/supabaseAdmin";
import { supabase } from "@/app/lib/supabase/supabase";
import { createSupabaseServerClient } from "@/app/lib/supabase/supabaseServerClient";

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

  async logoutUser() {
    const supabase = await createSupabaseServerClient();

    await supabase.auth.signOut();
    return { success: true };
  }

  async updateUserProfile(req: Request, userTable = "user_profile") {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Nicht authentifiziert");
    }

    const body = await req.json();
    const { name, email } = body;

    // 1. Name aktualisieren
    const { error: updateUserError } = await supabaseAdmin
      .from(userTable)
      .update({ name })
      .eq("id", user.id);

    if (updateUserError) {
      throw new Error(updateUserError.message);
    }

    // 2. E-Mail in Auth aktualisieren (optional)
    if (email?.trim()) {
      const { error: updateAuthError } =
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email: email.trim(),
        });

      if (updateAuthError) {
        throw new Error(updateAuthError.message);
      }
    }

    return { success: true };
  }
}
