import { supabase } from "@/integrations/supabase/client";

/**
 * Records anonymous tool usage. No personal data is captured here.
 * Failures are swallowed silently — analytics must never break the tool.
 */
export async function recordToolUsage(toolName: string): Promise<void> {
  try {
    await supabase.from("tools_usage").insert({ tool_name: toolName });
  } catch {
    // ignore
  }
}

/**
 * Saves an optional email + generated output for a given tool.
 * Returns true on success, false on failure (so the UI can show a retry).
 */
export async function saveToolLead(args: {
  toolName: string;
  outputText: string;
  userEmail: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("tools_leads").insert({
      tool_name: args.toolName,
      output_text: args.outputText,
      user_email: args.userEmail,
    });
    return !error;
  } catch {
    return false;
  }
}
