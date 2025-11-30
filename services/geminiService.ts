
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BananaApp, ModelConfig } from "../types";

const LOCAL_STORAGE_KEY_NAME = 'banana_stand_gemini_key';
const SESSION_STORAGE_KEY_NAME = 'banana_stand_gemini_key_session';

/**
 * MANAGING LOCAL KEYS (BYOK)
 */
export const getStoredKey = (): string | null => {
  // Check Session (safer) first
  const sessionKey = sessionStorage.getItem(SESSION_STORAGE_KEY_NAME);
  if (sessionKey) return sessionKey;

  // Fallback to LocalStorage (persistent)
  return localStorage.getItem(LOCAL_STORAGE_KEY_NAME);
};

export const setStoredKey = (key: string, persist: boolean = false) => {
  if (persist) {
    localStorage.setItem(LOCAL_STORAGE_KEY_NAME, key);
    // Clear session to avoid confusion
    sessionStorage.removeItem(SESSION_STORAGE_KEY_NAME);
  } else {
    sessionStorage.setItem(SESSION_STORAGE_KEY_NAME, key);
    // Clear local if user chose not to persist this time (optional choice, but cleaner security model)
    // Actually, let's NOT clear local automatically unless explicitly asked, 
    // but the getStoredKey prioritizes session. 
    // However, for safety, if a user switches to "Temporary", we should probably respect that intent.
    localStorage.removeItem(LOCAL_STORAGE_KEY_NAME);
  }
};

export const removeStoredKey = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY_NAME);
  sessionStorage.removeItem(SESSION_STORAGE_KEY_NAME);
};

/**
 * Checks if the user has a valid API key available from any source.
 */
export const checkApiKey = async (): Promise<boolean> => {
  // 1. Check Environment (Dev/Hosted)
  if (process.env.API_KEY) return true;

  // 2. Check Local Storage (BYOK)
  if (getStoredKey()) return true;

  // 3. Check Internal Tool (AI Studio)
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey) {
    return await win.aistudio.hasSelectedApiKey();
  }

  return false;
};

/**
 * Helper to get the actual key string for the SDK
 */
const getEffectiveKey = async (): Promise<string> => {
  // 1. Environment
  if (process.env.API_KEY) return process.env.API_KEY;

  // 2. Local Storage
  const stored = getStoredKey();
  if (stored) return stored;

  // 3. Internal Tool does not expose the string directly in a standard way
  // usually, but passing an empty string or relying on the environment 
  // injection is standard for that specific tool. 
  // However, for the standard @google/genai SDK, we strictly need a string 
  // if we are initializing it manually.
  
  return ''; 
};

/**
 * Checks if the AI Studio / IDX environment is available.
 */
export const isAIStudioAvailable = (): boolean => {
  const win = window as any;
  return !!(win.aistudio && win.aistudio.openSelectKey);
};

/**
 * Prompt the user to select an API key (Internal Tool) or return false to trigger UI.
 */
export const requestApiKey = async (): Promise<void> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.openSelectKey) {
    await win.aistudio.openSelectKey();
  } else {
    // If no internal tool, we rely on the App UI to open the modal
    console.warn("AI Studio SDK not found. Please use the Settings menu.");
  }
};

/**
 * Helper: Convert File to Base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Helper: Get dimensions from File
 */
const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Executes a Banana App Recipe.
 */
export const runBananaRecipe = async (
  app: BananaApp,
  inputs: Record<string, string | File>
): Promise<GenerateContentResponse> => {
  
  // 1. Get Key
  const apiKey = await getEffectiveKey();
  if (!apiKey) {
      throw new Error("No API Key found. Please set one in Settings.");
  }

  // 2. Initialize Client
  const ai = new GoogleGenAI({ apiKey });

  // 3. Process Inputs
  let processedPrompt = app.master_prompt;
  let imagePart: { inlineData: { mimeType: string; data: string } } | null = null;
  let primaryImageFile: File | null = null;

  for (const inputDef of app.inputs) {
    const value = inputs[inputDef.id];

    if (inputDef.type === 'image') {
      if (value instanceof File) {
        primaryImageFile = value;
        const base64Data = await fileToBase64(value);
        imagePart = {
          inlineData: {
            mimeType: value.type,
            data: base64Data
          }
        };
        processedPrompt = processedPrompt.replace(`{{${inputDef.id}}}`, "the attached image");
      }
    } else {
      const textVal = value ? String(value) : '';
      processedPrompt = processedPrompt.replace(`{{${inputDef.id}}}`, textVal);
    }
  }

  // 4. Construct Parts
  const parts: any[] = [];
  if (imagePart) parts.push(imagePart);
  parts.push({ text: processedPrompt });

  // 5. Determine Aspect Ratio
  let targetAspectRatio = app.model_config.aspectRatio || "1:1";

  if (targetAspectRatio === 'match_input' && primaryImageFile) {
    try {
      const { width, height } = await getImageDimensions(primaryImageFile);
      const inputRatio = width / height;
      const ratios: { [key: string]: number } = {
        "1:1": 1, "3:4": 0.75, "4:3": 1.33, "9:16": 0.5625, "16:9": 1.777
      };
      let closest = "1:1";
      let minDiff = Number.MAX_VALUE;
      for (const [key, val] of Object.entries(ratios)) {
        const diff = Math.abs(inputRatio - val);
        if (diff < minDiff) {
          minDiff = diff;
          closest = key;
        }
      }
      targetAspectRatio = closest as ModelConfig['aspectRatio'];
    } catch (e) {
      targetAspectRatio = "1:1";
    }
  } else if (targetAspectRatio === 'match_input') {
    targetAspectRatio = "1:1";
  }

  // 6. Call API
  const modelId = 'gemini-3-pro-image-preview'; 

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        systemInstruction: app.system_instruction,
        temperature: app.model_config.temperature,
        imageConfig: {
            aspectRatio: targetAspectRatio as any,
            imageSize: "1K"
        },
        ...(app.model_config.thinking_mode ? { thinkingConfig: { thinkingBudget: 1024 } } : {})
      },
    });

    return response;
  } catch (error: any) {
    console.error("Gemini Execution Error:", error);

    // 7. Handle Rate Limits specifically
    if (error.message && error.message.includes("429")) {
        throw new Error("⚠️ Too Many Requests. The API is busy. Please wait a minute and try again.");
    }

    if (error.message && error.message.includes("403")) {
        throw new Error("⚠️ Access Denied. Your key might be invalid or restricted incorrectly. Check your domain settings in AI Studio.");
    }
    
    throw error;
  }
};
