export interface AppInput {
  id: string;
  type: 'image' | 'text' | 'select';
  label: string;
  placeholder?: string;
  options?: string[]; // For select type
  optional?: boolean;
}

export interface ModelConfig {
  temperature: number;
  thinking_mode: boolean;
  style_reference_url?: string;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "match_input";
}

export interface BananaApp {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  inputs: AppInput[];
  system_instruction: string;
  master_prompt: string;
  model_config: ModelConfig;
  cover_image: string; // URL for the store card
  example_input_image?: string | string[]; // For the before/after demo (can be array for multiple inputs)
  example_output_image?: string; // For the before/after demo
  additional_images?: Array<{ url: string; label: string }>; // For the gallery
  author?: string; // e.g. "Banana Stand" or user name
  category?: string;
  tags?: string[];
  input_tips?: string[];
  output_expectations?: string[];
  remixable?: boolean; // Defaults to true if undefined
  usage_count?: number;
}

export interface AppExecutionResult {
  imageUrl: string;
  text?: string;
}