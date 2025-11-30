
import React from 'react';

interface BuilderGuideProps {
  onClose: () => void;
}

const BuilderGuide: React.FC<BuilderGuideProps> = ({ onClose }) => {
  return (
    <div className="min-h-full bg-stone-900 text-stone-200 p-6 md:p-12 font-mono relative">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 border-b border-stone-700 pb-6 flex justify-between items-start">
        <div>
            <h1 className="text-4xl font-black text-yellow-400 mb-2 tracking-tighter uppercase">Master Builder's Guide</h1>
            <p className="text-stone-400 text-sm max-w-lg">
                OFFICIAL MANUAL • VERSION 2.5 • <span className="text-yellow-400/50">CONFIDENTIAL</span>
            </p>
        </div>
        <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white border border-stone-600 hover:border-white px-4 py-2 rounded uppercase text-xs font-bold transition-all"
        >
            Close Manual [ESC]
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Section 1: The Recipe */}
        <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded">01</span> 
                THE RECIPE FORMULA
            </h3>
            <div className="bg-black/30 border border-stone-700 p-6 rounded-xl space-y-4">
                <p className="text-sm leading-relaxed text-stone-400">
                    A great Banana App is defined by how it manipulates variables. Think of it like a Mad Libs game.
                </p>
                
                <div className="bg-stone-800 p-4 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-xs font-bold text-stone-500 mb-2 uppercase">Example Master Prompt</p>
                    <code className="text-sm text-green-400 block font-mono">
                        "Take <span className="text-yellow-400">{`{{primary_image}}`}</span> and turn it into a <span className="text-yellow-400">{`{{style}}`}</span> painting..."
                    </code>
                </div>

                <ul className="text-xs space-y-2 text-stone-400 list-disc pl-4">
                    <li><strong className="text-stone-200">{`{{primary_image}}`}</strong>: This is the user's uploaded photo. Always include it.</li>
                    <li><strong className="text-stone-200">{`{{variable}}`}</strong>: Any custom inputs you define (e.g., style, color).</li>
                </ul>
            </div>
        </section>

        {/* Section 2: Viral Visuals */}
        <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded">02</span> 
                VIRAL VISUALS
            </h3>
            <div className="bg-black/30 border border-stone-700 p-6 rounded-xl space-y-4">
                <p className="text-sm leading-relaxed text-stone-400">
                    Users judge apps by their cover. Your "Box Art" is the most important asset.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-stone-800 p-3 rounded text-center">
                        <span className="text-2xl block mb-2">✅</span>
                        <p className="text-[10px] font-bold text-green-400 uppercase">Do This</p>
                        <p className="text-[10px] text-stone-500 mt-1">Show the final result clearly. Use bright colors.</p>
                    </div>
                    <div className="bg-stone-800 p-3 rounded text-center">
                        <span className="text-2xl block mb-2">❌</span>
                        <p className="text-[10px] font-bold text-red-400 uppercase">Avoid This</p>
                        <p className="text-[10px] text-stone-500 mt-1">Don't use text in the image. We add the title for you.</p>
                    </div>
                </div>
            </div>
        </section>

         {/* Section 3: Model Tuning */}
         <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded">03</span> 
                MODEL TUNING
            </h3>
            <div className="bg-black/30 border border-stone-700 p-6 rounded-xl space-y-4">
                
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs font-bold text-stone-300 mb-1">
                            <span>Temperature: 0.2</span>
                            <span className="text-stone-500">Precise</span>
                        </div>
                        <div className="h-1 bg-stone-700 rounded-full overflow-hidden">
                            <div className="h-full w-[20%] bg-blue-400"></div>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1">Best for: Format conversion, OCR, strict following.</p>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-bold text-stone-300 mb-1">
                            <span>Temperature: 0.9</span>
                            <span className="text-stone-500">Creative</span>
                        </div>
                        <div className="h-1 bg-stone-700 rounded-full overflow-hidden">
                            <div className="h-full w-[90%] bg-red-400"></div>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1">Best for: Art, stories, brainstorming, style transfer.</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-stone-700">
                    <p className="text-xs font-bold text-yellow-400 mb-1">Thinking Mode 🧠</p>
                    <p className="text-xs text-stone-400">
                        Enable this ONLY if your app needs to "calculate" or "reason" (e.g., counting calories, solving math, analyzing logic) before drawing. It is slower but smarter.
                    </p>
                </div>
            </div>
        </section>

        {/* Section 4: Pro Tips */}
        <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded">04</span> 
                PRO TIPS
            </h3>
            <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                    <span className="text-yellow-400 mt-1">➜</span>
                    <p className="text-sm text-stone-400"><strong>Aspect Ratio:</strong> Matching the input image is usually the safest bet for filters. Use 1:1 for stickers.</p>
                </li>
                <li className="flex gap-3 items-start">
                    <span className="text-yellow-400 mt-1">➜</span>
                    <p className="text-sm text-stone-400"><strong>System Instruction:</strong> Give the AI a persona. "You are a senior graphic designer" yields better results than generic instructions.</p>
                </li>
                <li className="flex gap-3 items-start">
                    <span className="text-yellow-400 mt-1">➜</span>
                    <p className="text-sm text-stone-400"><strong>Remixing:</strong> Don't just clone. Change the prompt to add a new twist (e.g., "Cyberpunk" -&gt; "Steampunk").</p>
                </li>
            </ul>
        </section>

        {/* Section 5: AI Generator (New) */}
        <section className="md:col-span-2 mt-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded">05</span> 
                USE AI TO BUILD AI
            </h3>
            <div className="bg-gradient-to-br from-stone-800 to-stone-900 border border-yellow-400/30 p-8 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="text-9xl">🤖</span>
                </div>
                
                <h4 className="text-yellow-400 font-bold mb-2">Lazy? Use this Meta-Prompt.</h4>
                <p className="text-stone-400 text-sm mb-6 max-w-2xl">
                    Copy the text below and paste it into ChatGPT, Claude, or Gemini. Tell it your idea, and it will write the JSON code for you to import directly.
                </p>

                <div className="bg-black p-4 rounded-lg border border-stone-700 font-mono text-xs text-stone-300 relative group shadow-inner">
                    <button 
                        onClick={() => {
                            const text = document.getElementById('meta-prompt')?.innerText;
                            if(text) {
                                navigator.clipboard.writeText(text);
                                alert("Meta-Prompt Copied!");
                            }
                        }}
                        className="absolute top-2 right-2 bg-stone-700 hover:bg-white hover:text-black text-white px-3 py-1 rounded text-[10px] font-bold uppercase transition-all z-10"
                    >
                        Copy
                    </button>
                    <pre id="meta-prompt" className="whitespace-pre-wrap overflow-x-auto p-2">
{`I want to create a "Recipe" for The Banana Stand (an AI App generator). 
Please write a JSON object for a valid \`BananaApp\` based on this idea: [INSERT YOUR IDEA HERE].

Here is the TypeScript interface you must follow strictly:

interface BananaApp {
  id: string; // Generate a UUID
  name: string; // Short, catchy name
  emoji: string; // Single character emoji
  tagline: string; // One sentence hook
  description: string; // 2-3 sentences explaining what it does
  category: string; // Pick one: "Avatar", "Art Style", "Utility", "Analysis", "Photography", "Interior Design", "Fashion", "Gaming Assets", "Marketing", "Education", "Restoration", "Just for Fun"
  tags?: string[]; // Max 5 keywords (e.g. ["Retro", "Portrait", "3D"])
  remixable: boolean; // default to true
  inputs: {
    id: string; // variable name, e.g. "style" or "primary_image"
    type: 'image' | 'text' | 'select';
    label: string;
    placeholder?: string;
    options?: string[]; // Only for 'select' type
  }[];
  system_instruction: string; // The "Persona" of the AI (e.g. "You are a expert 3D artist...")
  master_prompt: string; // The prompt sent to the model. Use {{input_id}} for substitution.
  model_config: {
    temperature: number; // 0.1 (precise) to 2.0 (creative)
    thinking_mode: boolean; // Use true only for logic/math/reasoning tasks
    aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "match_input";
  };
  // Do not include images in the JSON, I will upload them manually.
}

IMPORTANT: Return ONLY the raw JSON object. Do not include markdown formatting.`}
                    </pre>
                </div>
            </div>
        </section>

      </div>

      <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-stone-800 text-center">
          <button 
             onClick={onClose}
             className="bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase text-lg px-8 py-3 rounded hover:scale-105 transition-transform"
          >
             I'm Ready to Build 🔨
          </button>
      </div>
    </div>
  );
};

export default BuilderGuide;
