import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const toEventIsoString = (value: string) => {
  if (!value) throw new Error("Event date is required");
  const normalizedValue = value.includes("T") ? value : `${value}T12:00:00`;
  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Please select a valid event date");
  }

  return parsedDate.toISOString();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(token);

    if (authError || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: club, error: clubError } = await admin
      .from("clubs")
      .select("id")
      .eq("email", user.email.toLowerCase())
      .single();

    if (clubError || !club) {
      return new Response(JSON.stringify({ error: "Club access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const eventName = String(formData.get("event_name") ?? "").trim();
    const startDateIso = toEventIsoString(String(formData.get("start_datetime") ?? ""));
    const endDateIso = toEventIsoString(String(formData.get("end_datetime") ?? formData.get("start_datetime") ?? ""));
    const description = String(formData.get("description") ?? "").trim();
    const instagramLink = String(formData.get("instagram_link") ?? "").trim();
    const manualRegistrations = Number.parseInt(String(formData.get("manual_registrations") ?? "0"), 10);
    const totalFund = Number.parseInt(String(formData.get("total_fund") ?? "0"), 10);

    if (!eventName) {
      throw new Error("Event name is required");
    }

    let bannerImageUrl = "";
    const banner = formData.get("banner");

    if (banner instanceof File && banner.size > 0) {
      const originalName = banner.name || "banner.png";
      const fileExtension = originalName.split(".").pop()?.toLowerCase() || "png";
      const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(fileExtension) ? fileExtension : "png";
      const contentType = banner.type || `image/${safeExtension === "jpg" ? "jpeg" : safeExtension}`;
      const path = `${club.id}/${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;

      const { error: uploadError } = await admin.storage
        .from("event-banners")
        .upload(path, banner.stream(), { contentType, upsert: false });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = admin.storage.from("event-banners").getPublicUrl(path);
      bannerImageUrl = data.publicUrl;
    }

    const insertPayload = {
      club_id: club.id,
      event_name: eventName,
      short_name: eventName.slice(0, 20),
      start_datetime: startDateIso,
      end_datetime: endDateIso,
      event_type: "workshop",
      event_mode: "offline",
      pricing_type: "free",
      amount: 0,
      venue: "",
      venue_details: "",
      description,
      keywords: "",
      banner_image_url: bannerImageUrl,
      website_url: "",
      instagram_link: instagramLink,
      manual_registrations: Number.isNaN(manualRegistrations) ? 0 : manualRegistrations,
      total_fund: Number.isNaN(totalFund) ? 0 : totalFund,
      status: "completed",
    };

    const { data: insertedEvent, error: insertError } = await admin
      .from("club_events")
      .insert(insertPayload)
      .select("id, event_name, start_datetime, description, banner_image_url, instagram_link, manual_registrations, total_fund, status")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return new Response(JSON.stringify(insertedEvent), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save past event";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});