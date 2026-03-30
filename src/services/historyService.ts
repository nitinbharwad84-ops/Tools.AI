import { supabase } from "./supabaseClient";

export const saveGenerationHistory = async (
  userId: string,
  toolName: string,
  userPrompt: string,
  enhancedPrompt: string | null,
  optionsSelected: any,
  output: string,
  outputType: string
) => {
  const { data, error } = await (supabase
    .from("generation_history") as any)
    .insert([
      {
        user_id: userId,
        tool_name: toolName,
        user_prompt: userPrompt,
        enhanced_prompt: enhancedPrompt,
        options_selected: optionsSelected,
        output: output,
        output_type: outputType,
      },
    ]);

  if (error) {
    console.error("Error saving history:", error);
    throw error;
  }
  return data;
};
