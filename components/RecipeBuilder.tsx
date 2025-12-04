
import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { BananaApp, AppInput } from '../types';
import BuilderGuide from './BuilderGuide';
import TestPromptModal from './TestPromptModal';
import { FLAGSHIP_APPS, APP_CATEGORIES, SUGGESTED_TAGS } from '../constants';

interface RecipeBuilderProps {
    initialData?: BananaApp;
    onSave: (app: BananaApp) => void;
    onPublish: (app: BananaApp) => void;
    onCancel: () => void;
}

const EMOJI_CATEGORIES = [
    { name: 'Featured', emojis: ['🍌', '✨', '🔥', '🌈', '🎨', '🚀', '🤖', '🔮', '🦄', '🐲', '👾', '🕹️', '👁️', '🧿', '🧬', '🧠'] },
    { name: 'Faces', emojis: ['😀', '😎', '🤩', '🤠', '🤡', '👻', '💀', '👽', '🧐', '🤓', '😇', '😈', '🤯', '🥶', '🥳', '🥸'] },
    { name: 'Nature', emojis: ['🐶', '🐱', '🦁', '🐯', '🦖', '🐙', '🦋', '🌹', '🌵', '🌴', '🍄', '⚡', '🌊', '❄️', '🔥', '🌍'] },
    { name: 'Objects', emojis: ['📷', '💻', '💡', '💎', '🔑', '🎁', '🎈', '📚', '✏️', '🖌️', '🔭', '🔬', '💊', '🛡️', '⚔️', '🛒'] },
    { name: 'Food', emojis: ['🍕', '🍔', '🌮', '🍣', '🍦', '🍩', '🍪', '🍫', '🍿', '🥤', '🍷', '🍺', '🍎', '🍓', '🥑', '🌶️'] },
];

const RecipeBuilder: React.FC<RecipeBuilderProps> = ({ initialData, onSave, onPublish, onCancel }) => {
    const [showGuide, setShowGuide] = useState(false); // Default closed on mobile

    const [name, setName] = useState(initialData ? `${initialData.name} Remix` : '');
    const [tagline, setTagline] = useState(initialData?.tagline || '');
    const [emoji, setEmoji] = useState(initialData?.emoji || '🍌');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [category, setCategory] = useState(initialData?.category || APP_CATEGORIES[0].label);
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [inputs, setInputs] = useState<AppInput[]>(initialData?.inputs || [
        { id: 'primary_image', type: 'image', label: 'Main Image' }
    ]);
    const [masterPrompt, setMasterPrompt] = useState(initialData?.master_prompt || 'Take {{primary_image}} and...');
    const [systemInstruction, setSystemInstruction] = useState(initialData?.system_instruction || 'You are a creative AI...');
    const [remixable, setRemixable] = useState(initialData?.remixable ?? false);

    // Model Config State
    const [temperature, setTemperature] = useState(initialData?.model_config.temperature ?? 0.7);
    const [thinkingMode, setThinkingMode] = useState(initialData?.model_config.thinking_mode ?? false);
    const [aspectRatio, setAspectRatio] = useState(initialData?.model_config.aspectRatio || '1:1');

    // Image Assets
    const [coverImage, setCoverImage] = useState<string | null>(initialData?.cover_image || null); // Legacy state, will map to exampleOutput if not explicitly set
    const [exampleInput, setExampleInput] = useState<string | null>(
        Array.isArray(initialData?.example_input_image) 
            ? initialData!.example_input_image[0] 
            : (initialData?.example_input_image || null)
    );
    const [exampleOutput, setExampleOutput] = useState<string | null>(initialData?.example_output_image || null);

    const [error, setError] = useState<string | null>(null);

    // Auto-Fill Modal State
    const [showAutoFillModal, setShowAutoFillModal] = useState(false);
    const [pastedJson, setPastedJson] = useState('');

    // Test Prompt Modal State
    const [showTestPromptModal, setShowTestPromptModal] = useState(false);

    // --- Magic Randomizer Logic ---
    const handleMagicRandomizer = () => {
        const ADJECTIVES = ['Funky', 'Cosmic', 'Retro', 'Neon', 'Glitchy', 'Vintage', 'Cyber', 'Banana', 'Pixel', 'Liquid', 'Spicy', 'Frozen'];
        const NOUNS = ['Vision', 'Lens', 'Machine', 'Stand', 'Blender', 'Dreamer', 'Mixer', 'Toaster', 'Goggles', 'Scope'];
        const EMOJIS = ['🍌', '✨', '🔥', '🌈', '🍦', '🎨', '🚀', '🔮', '🧿', '🧬', '🧸', '🕹️'];
        
        const randomName = `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`;
        const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        
        setName(randomName);
        setEmoji(randomEmoji);
        
        // Only set tagline if empty to avoid overwriting user intent
        if (!tagline) {
            setTagline(`The ultimate ${randomName.toLowerCase()} experience.`);
        }
    };

    const handleAddTag = (tagToAdd: string) => {
        const normalized = tagToAdd.trim();
        if (normalized && !tags.includes(normalized) && tags.length < 5) {
            setTags([...tags, normalized]);
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const addInput = () => {
        const id = `var_${inputs.length + 1}`;
        setInputs([...inputs, { id, type: 'text', label: 'New Input' }]);
    };

    const updateInput = (index: number, field: keyof AppInput, value: any) => {
        const newInputs = [...inputs];
        newInputs[index] = { ...newInputs[index], [field]: value };
        setInputs(newInputs);
    };

    const removeInput = (index: number) => {
        if (inputs[index].type === 'image') return; // Prevent removing primary image for MVP
        setInputs(inputs.filter((_, i) => i !== index));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) setter(ev.target.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const insertVariable = (varId: string) => {
        setMasterPrompt(prev => {
            const insertion = ` { {${varId} } } `;
            // Simple append for MVP, in a real app we'd insert at cursor
            return prev + insertion;
        });
    };

    const loadTemplate = () => {
        // Finds the Pet Toonify app from Flagship apps
        const template = FLAGSHIP_APPS.find(a => a.id === 'pet-toonify-3d');
        if (template) {
            setName("My Toon App");
            setTagline(template.tagline);
            setEmoji(template.emoji);
            setCategory(template.category || APP_CATEGORIES[0].label);
            setTags(template.tags || []);
            setInputs(template.inputs);
            setMasterPrompt(template.master_prompt);
            setSystemInstruction(template.system_instruction);
            setTemperature(template.model_config.temperature);
            setThinkingMode(template.model_config.thinking_mode);
            setAspectRatio(template.model_config.aspectRatio || '1:1');
            // We don't copy the images so the user has to upload their own (avoiding confusion)
        }
    };

    const performAutoFill = () => {
        if (!pastedJson) return;

        try {
            // Clean markdown code blocks if present (often LLMs wrap in ```json ... ```)
            let cleanJson = pastedJson.replace(/```json/g, '').replace(/```/g, '').trim();

            const data = JSON.parse(cleanJson) as BananaApp;

            if (!data.name || !data.master_prompt) {
                alert("Invalid JSON: Missing name or master_prompt.");
                return;
            }

            setName(data.name);
            setTagline(data.tagline || '');
            setEmoji(data.emoji || '🍌');
            if (data.category) setCategory(data.category);
            setTags(data.tags || []);
            setInputs(data.inputs || []);
            setMasterPrompt(data.master_prompt);
            setSystemInstruction(data.system_instruction || '');
            setRemixable(data.remixable ?? false);

            if (data.model_config) {
                setTemperature(data.model_config.temperature ?? 0.7);
                setThinkingMode(data.model_config.thinking_mode ?? false);
                setAspectRatio(data.model_config.aspectRatio || '1:1');
            }

            setCoverImage(data.cover_image || null);
            setExampleInput(data.example_input_image || null);
            setExampleOutput(data.example_output_image || null);

            setError(null);
            setShowAutoFillModal(false);
            setPastedJson('');
        } catch (e) {
            console.error(e);
            alert("Failed to parse JSON. Please check the code.");
        }
    };

    const constructAppObject = (): BananaApp => {
        // If coverImage is set (from legacy or potential future restore), use it. Otherwise default to exampleOutput.
        // We use exampleOutput as the primary cover if available.
        const finalCover = exampleOutput || coverImage || `https://picsum.photos/400/400?random=${Date.now()}`;
        return {
            id: initialData?.id || crypto.randomUUID(),
            name,
            tagline,
            emoji,
            category,
            tags,
            description: tagline,
            inputs,
            system_instruction: systemInstruction,
            master_prompt: masterPrompt,
            remixable,
            model_config: {
                temperature,
                thinking_mode: thinkingMode,
                aspectRatio: aspectRatio as any
            },
            cover_image: finalCover,
            example_input_image: exampleInput || undefined,
            example_output_image: exampleOutput || undefined,
        };
    }

    const handleSave = () => {
        setError(null);

        // Validation for Remix consistency
        if (initialData) {
            if (masterPrompt.trim() === initialData.master_prompt.trim()) {
                setError("To create a valid Remix, you must modify the Master Prompt logic! Don't just copy it.");
                return;
            }
        }

        const newApp = constructAppObject();
        // Ensure ID is new if it's a remix or new app
        if (!initialData || (initialData && name !== initialData.name)) {
            newApp.id = crypto.randomUUID();
        }

        onSave(newApp);
    };

    const handleExport = () => {
        const app = constructAppObject();
        const json = JSON.stringify(app, null, 2);
        navigator.clipboard.writeText(json);
        alert("Recipe JSON copied to clipboard! Share it with a friend.");
    };

    return (
        <div className="max-w-7xl mx-auto px-6 my-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                <div className="flex-1">
                    <h2 className="text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight transition-colors">
                        {initialData ? 'Remix Recipe ⚡' : 'New Recipe 🍳'}
                    </h2>
                    {!initialData && (
                        <button
                            onClick={loadTemplate}
                            className="text-xs font-bold text-yellow-600 hover:text-yellow-700 dark:text-yellow-500 dark:hover:text-yellow-400 underline mt-2 flex items-center gap-1 transition-colors"
                        >
                            <span>⚡</span> Need Inspiration? Load "Pet Toonify" Template
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 items-center mt-1">
                    <button
                        onClick={onCancel}
                        className="mr-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-bold text-xs uppercase tracking-wider px-3 py-2 transition-colors"
                    >
                        Cancel
                    </button>
                    
                    <div className="h-6 w-px bg-stone-200 dark:bg-stone-800 mx-1 hidden md:block"></div>

                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-sm ${showGuide ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100' : 'bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500'}`}
                    >
                        {showGuide ? 'Hide Guide' : 'Show Guide 📘'}
                    </button>

                    <button
                        onClick={handleExport}
                        className="px-4 py-2 rounded-full text-xs font-bold bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-yellow-400 dark:hover:border-yellow-500 hover:text-stone-900 dark:hover:text-white transition-all shadow-sm"
                        title="Copy JSON to clipboard"
                    >
                        Export JSON
                    </button>

                    <button
                        onClick={() => setShowTestPromptModal(true)}
                        className="px-4 py-2 rounded-full text-xs font-bold bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-stone-900 dark:hover:text-white transition-all shadow-sm flex items-center gap-2"
                        title="Test recipe in Gemini"
                    >
                        <span>🧪</span> Test in Gemini
                    </button>

                    <button
                        onClick={() => setShowAutoFillModal(true)}
                        className="px-4 py-2 rounded-full text-xs font-bold bg-stone-900 text-yellow-400 border border-stone-900 hover:bg-stone-800 dark:bg-yellow-400 dark:text-stone-900 dark:border-yellow-400 dark:hover:bg-yellow-300 transition-all shadow-md flex items-center gap-2"
                    >
                        <span>🤖</span> Auto-Fill
                    </button>
                </div>
            </div>

            <div className="relative">

                {/* --- FORM CONTAINER --- */}
                <div className="max-w-4xl mx-auto transition-all duration-300">
                    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-800 p-6 md:p-8 animate-in slide-in-from-bottom-4 transition-colors">

                        {initialData && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-xl mb-6 flex items-start gap-3 transition-colors">
                                <span className="text-xl mt-0.5">⚡</span>
                                <div>
                                    <p className="font-bold text-sm">You are remixing "{initialData.name}".</p>
                                    <p className="text-xs mt-1 opacity-90">Change the prompt logic to create your own unique version. We've pre-filled the recipe for you.</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-8">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="col-span-1 relative">
                                    <label className="block text-xs font-bold uppercase text-stone-500 dark:text-stone-400 mb-1">Emoji</label>
                                    
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="w-full text-center text-4xl p-2 bg-stone-50 dark:bg-stone-950 dark:text-white rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 focus:ring-2 focus:ring-yellow-400 outline-none transition-all h-[60px]"
                                    >
                                        {emoji}
                                    </button>

                                    {showEmojiPicker && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)}></div>
                                            <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 p-4 w-[280px] max-h-[350px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                                {EMOJI_CATEGORIES.map(category => (
                                                    <div key={category.name} className="mb-4 last:mb-0">
                                                        <h4 className="text-[10px] font-bold uppercase text-stone-400 mb-2 sticky top-0 bg-white dark:bg-stone-900 py-1">{category.name}</h4>
                                                        <div className="grid grid-cols-5 gap-2">
                                                            {category.emojis.map(e => (
                                                                <button
                                                                    key={e}
                                                                    onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                                                                    className={`text-2xl w-9 h-9 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors ${emoji === e ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`}
                                                                >
                                                                    {e}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="col-span-3">
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="block text-xs font-bold uppercase text-stone-500 dark:text-stone-400">App Name</label>
                                        <div className="flex gap-2">
                                            <div className="flex items-center gap-2 mr-2">
                                                <label className="text-[10px] font-bold uppercase text-stone-400 cursor-pointer select-none flex items-center gap-1 group relative">
                                                    <span className="border-b border-dashed border-stone-300 dark:border-stone-600 hover:border-stone-500 dark:hover:border-stone-400 transition-colors" title="Check this box to allow other users to see your prompt logic and create their own versions of this app.">Remixable</span>
                                                    <input 
                                                        type="checkbox"
                                                        checked={remixable}
                                                        onChange={(e) => setRemixable(e.target.checked)}
                                                        className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                                                    />
                                                </label>
                                            </div>
                                            <button 
                                                onClick={handleMagicRandomizer}
                                                className="text-[10px] bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 px-2 py-0.5 rounded font-bold transition-colors flex items-center gap-1"
                                                title="Randomize Name & Emoji"
                                            >
                                                <span>🎲</span> Magic Name
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Pixel Artify"
                                        className="w-full p-3 bg-stone-50 dark:bg-stone-950 dark:text-white rounded-xl border border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-lg transition-shadow"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-xs font-bold uppercase text-stone-500 dark:text-stone-400 mb-1">Tagline</label>
                                    <input
                                        type="text"
                                        value={tagline}
                                        onChange={e => setTagline(e.target.value)}
                                        placeholder="Briefly describe what it does..."
                                        className="w-full p-3 bg-stone-50 dark:bg-stone-950 dark:text-white rounded-xl border border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-yellow-400 outline-none transition-shadow"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold uppercase text-stone-500 dark:text-stone-400 mb-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-full p-3 bg-stone-50 dark:bg-stone-950 dark:text-white rounded-xl border border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-yellow-400 outline-none transition-shadow appearance-none"
                                    >
                                        {APP_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.label}>{cat.emoji} {cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tags Input */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 dark:text-stone-400 mb-2">Hashtags (Max 5)</label>
                                <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 focus-within:ring-2 focus-within:ring-yellow-400 transition-all">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-bold px-2 py-1 rounded-full">
                                                #{tag}
                                                <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">×</button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddTag(tagInput);
                                                }
                                            }}
                                            placeholder={tags.length < 5 ? "Type tag & hit Enter..." : "Max tags reached"}
                                            disabled={tags.length >= 5}
                                            className="bg-transparent outline-none text-sm text-stone-900 dark:text-white placeholder-stone-400 flex-grow min-w-[120px]"
                                        />
                                    </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="text-[10px] text-stone-400 font-bold uppercase py-1">Suggestions:</span>
                                    {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 8).map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleAddTag(tag)}
                                            disabled={tags.length >= 5}
                                            className="text-[10px] border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 text-stone-500 dark:text-stone-400 px-2 py-1 rounded-full transition-colors disabled:opacity-50"
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Visuals Section */}
                            <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-8 transition-colors">

                                {/* Before/After Demo */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-xs font-bold uppercase text-stone-500 dark:text-stone-400">Demo Pair (Before & After)</label>
                                        <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full font-bold">REQUIRED</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 md:gap-8 relative">
                                        {/* Connector Arrow */}
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white dark:bg-stone-800 rounded-full p-1.5 border border-stone-200 dark:border-stone-700 shadow-sm text-stone-400">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
                                        </div>

                                        {/* Example Input */}
                                        <div className="space-y-2 group">
                                            <div className={`relative aspect-square bg-white dark:bg-stone-900 rounded-xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden shadow-sm ${exampleInput ? 'border-blue-400' : 'border-stone-300 dark:border-stone-700 hover:border-blue-400'}`}>
                                                {exampleInput ? (
                                                    <img src={exampleInput} alt="Ex Input" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center opacity-40 group-hover:opacity-100 dark:text-white">
                                                        <span className="text-2xl block mb-1">📷</span>
                                                        <span className="text-[10px] font-bold uppercase">Original Photo</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, setExampleInput)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                {exampleInput && <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">CHANGE</div>}
                                            </div>
                                            <p className="text-[10px] text-center text-stone-400 font-bold uppercase tracking-wider group-hover:text-blue-500 transition-colors">Example Input</p>
                                        </div>

                                        {/* Example Output */}
                                        <div className="space-y-2 group">
                                            <div className={`relative aspect-square bg-white dark:bg-stone-900 rounded-xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden shadow-sm ${exampleOutput ? 'border-green-400' : 'border-stone-300 dark:border-stone-700 hover:border-green-400'}`}>
                                                {exampleOutput ? (
                                                    <img src={exampleOutput} alt="Ex Output" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center opacity-40 group-hover:opacity-100 dark:text-white">
                                                        <span className="text-2xl block mb-1">✨</span>
                                                        <span className="text-[10px] font-bold uppercase">Result Photo</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, setExampleOutput)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                {exampleOutput && <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">CHANGE</div>}
                                            </div>
                                            <p className="text-[10px] text-center text-stone-400 font-bold uppercase tracking-wider group-hover:text-green-500 transition-colors">Example Output</p>
                                        </div>

                                    </div>
                                    <p className="text-xs text-stone-400 mt-4 text-center italic opacity-80">
                                        This pair creates the "Before/After" slider users see. 
                                        <br/>
                                        <span className="font-bold text-yellow-600 dark:text-yellow-500 not-italic">Note: The "Result Photo" will also be used as your app's cover card.</span>
                                    </p>
                                </div>
                            </div>

                            {/* Inputs Builder */}
                            <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 transition-colors">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-xs font-bold uppercase text-stone-500 dark:text-stone-400">User Inputs</label>
                                    <button onClick={addInput} className="text-xs bg-stone-900 dark:bg-stone-700 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors shadow-sm">
                                        + Add Variable
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {inputs.map((input, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <div className="w-28 shrink-0 text-xs font-mono text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden text-ellipsis whitespace-nowrap shadow-sm">
                                                {`{{${input.id}}}`}
                                            </div>
                                            <select
                                                value={input.type}
                                                disabled={input.id === 'primary_image'}
                                                onChange={e => updateInput(idx, 'type', e.target.value)}
                                                className="bg-white dark:bg-stone-900 dark:text-white p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 text-sm focus:border-yellow-400 focus:outline-none shadow-sm"
                                            >
                                                <option value="image">Image</option>
                                                <option value="text">Text</option>
                                                <option value="select">Select</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={input.label}
                                                onChange={e => updateInput(idx, 'label', e.target.value)}
                                                className="flex-grow p-2.5 bg-white dark:bg-stone-900 dark:text-white rounded-lg border border-stone-200 dark:border-stone-700 text-sm focus:border-yellow-400 focus:outline-none shadow-sm"
                                                placeholder="Label (e.g. 'Upload Photo')"
                                            />
                                            {input.id !== 'primary_image' && (
                                                <button onClick={() => removeInput(idx)} className="text-stone-300 dark:text-stone-600 hover:text-red-500 dark:hover:text-red-400 px-2 transition-colors">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Prompts */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 dark:text-stone-400 mb-2">System Instruction (Persona)</label>
                                <textarea
                                    value={systemInstruction}
                                    onChange={e => setSystemInstruction(e.target.value)}
                                    className="w-full p-3 bg-stone-50 dark:bg-stone-950 dark:text-white rounded-xl border border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-yellow-400 outline-none h-24 text-sm resize-none"
                                    placeholder="Describe how the AI should behave..."
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-xs font-bold uppercase text-stone-500 dark:text-stone-400">Master Prompt (The Logic)</label>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-xs text-stone-400 font-medium py-1">Insert:</span>
                                    {inputs.map(input => (
                                        <button
                                            key={input.id}
                                            onClick={() => insertVariable(input.id)}
                                            className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 hover:bg-yellow-100 dark:hover:bg-yellow-900 hover:text-yellow-800 dark:hover:text-yellow-200 hover:border-yellow-300 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-mono text-[10px] px-2 py-1 rounded-md cursor-pointer transition-all active:scale-95"
                                        >
                                            <span>+</span> {`{{${input.id}}}`}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={masterPrompt}
                                    onChange={e => setMasterPrompt(e.target.value)}
                                    className={`w-full p-4 bg-stone-50 dark:bg-stone-950 dark:text-white rounded-xl border focus:ring-2 focus:ring-yellow-400 outline-none h-40 font-mono text-sm leading-relaxed resize-y ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-stone-200 dark:border-stone-800'}`}
                                    placeholder="Write your prompt here. Use {{variables}} to make it dynamic."
                                />
                                {error && (
                                    <div className="mt-2 text-red-500 text-xs font-bold flex items-center gap-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* Model Config Section */}
                            <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 transition-colors">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-xl">⚙️</span>
                                    <label className="text-xs font-bold uppercase text-stone-500 dark:text-stone-400">Model Configuration</label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                                    {/* Aspect Ratio */}
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-2">Aspect Ratio</label>
                                        <div className="relative">
                                            <select
                                                value={aspectRatio}
                                                onChange={(e) => setAspectRatio(e.target.value as any)}
                                                className="w-full p-2.5 bg-white dark:bg-stone-900 dark:text-white rounded-lg border border-stone-200 dark:border-stone-700 text-sm focus:border-yellow-400 focus:outline-none shadow-sm appearance-none"
                                            >
                                                <option value="1:1">Square (1:1)</option>
                                                <option value="3:4">Portrait (3:4)</option>
                                                <option value="4:3">Landscape (4:3)</option>
                                                <option value="9:16">Story (9:16)</option>
                                                <option value="16:9">Cinema (16:9)</option>
                                                <option value="match_input">Match Input Image</option>
                                            </select>
                                            <div className="absolute right-3 top-3 pointer-events-none text-stone-400">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Temperature */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-semibold text-stone-900 dark:text-stone-100">Creativity</label>
                                            <span className="text-xs font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">{temperature}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={temperature}
                                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                            className="w-full accent-yellow-400 h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 mt-1 font-medium">
                                            <span>Precise</span>
                                            <span>Wild</span>
                                        </div>
                                    </div>

                                    {/* Thinking Mode */}
                                    <div className="flex flex-col">
                                        <label className="text-xs font-semibold text-stone-900 dark:text-stone-100 mb-2">Thinking Mode</label>
                                        <div
                                            onClick={() => setThinkingMode(!thinkingMode)}
                                            className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg border transition-all ${thinkingMode ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 shadow-sm' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'}`}
                                        >
                                            <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${thinkingMode ? 'bg-stone-900 dark:bg-yellow-400' : 'bg-stone-300 dark:bg-stone-600'}`}>
                                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${thinkingMode ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                            <span className={`text-xs font-bold ${thinkingMode ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'}`}>
                                                {thinkingMode ? 'ENABLED' : 'DISABLED'}
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={!name || !masterPrompt || !exampleInput || !exampleOutput}
                                    className="flex-1 py-4 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-bold text-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {initialData ? 'SAVE REMIX 💾' : 'SAVE DRAFT 💾'}
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm("Publish this recipe to the public Community Marketplace?")) {
                                            const app = constructAppObject();
                                            onPublish(app);
                                            // 🎉 Celebration!
                                            confetti({
                                                particleCount: 150,
                                                spread: 70,
                                                origin: { y: 0.6 },
                                                colors: ['#FACC15', '#292524', '#ffffff'] // Yellow, Dark, White
                                            });
                                        }
                                    }}
                                    disabled={!name || !masterPrompt || !exampleInput || !exampleOutput}
                                    className="flex-1 py-4 bg-yellow-400 hover:bg-yellow-300 text-stone-900 font-black text-lg rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none border-2 border-black dark:border-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-400"
                                >
                                    PUBLISH 🚀
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- GUIDE MODAL (Always Centered) --- */}
                {showGuide && (
                    <div className="fixed inset-0 z-[60] overflow-y-auto p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 flex items-center justify-center">
                         <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
                            <BuilderGuide onClose={() => setShowGuide(false)} />
                        </div>
                    </div>
                )}
            </div>

            {/* --- AUTO FILL MODAL --- */}
            {showAutoFillModal && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-stone-900 dark:text-white">🤖 Auto-Fill Recipe</h3>
                                <p className="text-sm text-stone-500 dark:text-stone-400">Paste the JSON generated by an AI assistant below.</p>
                            </div>
                            <button onClick={() => setShowAutoFillModal(false)} className="text-stone-400 hover:text-black dark:hover:text-white">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="p-4 flex-grow">
                            <textarea
                                value={pastedJson}
                                onChange={(e) => setPastedJson(e.target.value)}
                                placeholder='{ "id": "...", "name": "...", ... }'
                                className="w-full h-full min-h-[300px] p-4 bg-stone-50 dark:bg-stone-950 dark:text-white border border-stone-200 dark:border-stone-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                            />
                        </div>

                        <div className="p-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 rounded-b-2xl flex justify-end gap-3 transition-colors">
                            <button
                                onClick={() => setShowAutoFillModal(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={performAutoFill}
                                disabled={!pastedJson.trim()}
                                className="px-5 py-2.5 bg-stone-900 dark:bg-yellow-400 text-yellow-400 dark:text-stone-900 rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                            >
                                Auto-Fill Recipe
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TEST PROMPT MODAL --- */}
            {showTestPromptModal && (
                <TestPromptModal onClose={() => setShowTestPromptModal(false)} />
            )}

        </div>
    );
};

export default RecipeBuilder;
