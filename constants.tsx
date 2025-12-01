
import { BananaApp } from './types';

export const APP_CATEGORIES = [
  { id: 'avatar', label: 'Avatar', emoji: '👤', description: 'Transform selfies and portraits.' },
  { id: 'art-style', label: 'Art Style', emoji: '🎨', description: 'Reimagine photos in famous art styles.' },
  { id: 'utility', label: 'Utility', emoji: '🛠️', description: 'Functional tools like stickers or removal.' },
  { id: 'analysis', label: 'Analysis', emoji: '🔍', description: 'Extract data or insights from images.' },
  { id: 'photography', label: 'Photography', emoji: '📸', description: 'Enhance, filter, or fix photos.' },
  { id: 'interior', label: 'Interior Design', emoji: '🏠', description: 'Restyle rooms and furniture.' },
  { id: 'fashion', label: 'Fashion', emoji: '👗', description: 'Virtual try-on and style swaps.' },
  { id: 'gaming', label: 'Gaming Assets', emoji: '🎮', description: 'Textures, sprites, and character sheets.' },
  { id: 'marketing', label: 'Marketing', emoji: '📢', description: 'Ad creatives and social posts.' },
  { id: 'education', label: 'Education', emoji: '📚', description: 'Visual aids and diagrams.' },
  { id: 'restoration', label: 'Restoration', emoji: '🕰️', description: 'Restore and colorize old photos.' },
  { id: 'fun', label: 'Just for Fun', emoji: '🎉', description: 'Memes, jokes, and weird experiments.' },
];

export const SUGGESTED_TAGS = [
  'Portrait', 'Landscape', '3D', 'Anime', 'Realistic', 'Surreal', 
  'Retro', 'Cyberpunk', 'Nature', 'Food', 'Animals', 'Architecture',
  'Fashion', 'Gaming', 'Abstract', 'Minimalist', 'Vintage', 'Neon',
  'Painting', 'Sketch', 'Cartoon', 'Sci-Fi', 'Fantasy'
];

export const FLAGSHIP_APPS: BananaApp[] = [
  {
    id: 'pet-toonify-3d',
    name: 'Pet Toonify 3D',
    author: 'Banana Stand',
    emoji: '🐶',
    category: 'Avatar',
    tags: ['Pets', '3D', 'Cute'],
    usage_count: 12543,
    tagline: 'Your pet starring in an animated movie.',
    description: 'Transform your beloved pet into a studio-quality 3D animated character! This app analyzes your pet\'s breed, fur, and pose, then reimagines them as the star of their own movie. You can choose from different moods like Heroic, Silly, or Dreamy to set the perfect scene.',
    inputs: [
      { id: 'primary_image', type: 'image', label: 'Pet Photo' },
      { id: 'mood', type: 'select', label: 'Mood', options: ['Heroic', 'Silly', 'Grumpy', 'Dreamy'] }
    ],
    system_instruction: 'You are a Senior 3D Character Artist at a major animation studio (like Pixar or Dreamworks). You specialize in translating real-world textures into stylized, appealing 3D renders with cinematic lighting. You prioritize character appeal and clear silhouettes.',
    master_prompt: 'Transform the animal in {{primary_image}} into a high-budget stylized 3D animated character. Keep the pose, breed features, and fur patterns recognizable, but apply a "soft-surface" 3D render style with subsurface scattering and rim lighting. The expression and lighting should convey a {{mood}} atmosphere. The background should be soft and cinematic.',
    model_config: {
      temperature: 0.9,
      thinking_mode: false,
      aspectRatio: 'match_input'
    },
    // 3D Rendered Style Shiba (Clean, Studio Lighting)
    cover_image: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/pet-toonify-3d/heroic-output-1.png',
    // Real Shiba Inu
    example_input_image: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/pet-toonify-3d/input-1.jpeg',
    // Stylized/Perfect "Result" Look
    example_output_image: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/pet-toonify-3d/heroic-output-1.png',
    additional_images: [
      { url: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/pet-toonify-3d/dreamy-output-1.png', label: 'Dreamy' },
      { url: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/pet-toonify-3d/grumpy-output-1.png', label: 'Grumpy' },
      { url: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/pet-toonify-3d/silly-output-1.png', label: 'Silly' }
    ],
    input_tips: [
      "Use photos with good lighting and clear visibility of the face.",
      "Front-facing angles work best for capturing expressions.",
      "Ensure the background isn't too cluttered."
    ],
    output_expectations: [
      "A high-quality 3D rendered character.",
      "Stylized fur and lighting effects.",
      "The pet's expression will match the selected mood."
    ]
  },
  {
    id: 'picasso-painter',
    name: 'Picasso Painter',
    author: 'Banana Stand',
    emoji: '🎨',
    category: 'Art Style',
    tags: ['Art', 'History', 'Abstract'],
    usage_count: 8432,
    tagline: 'Turn life into a Cubist masterpiece.',
    description: 'See the world through the eyes of Pablo Picasso. This app deconstructs your photos into geometric shapes and fragmented perspectives, typical of the Cubist movement. Select from different artistic periods like the melancholic Blue Period or the vibrant Rose Period to change the color palette and emotional tone.',
    inputs: [
      { id: 'primary_image', type: 'image', label: 'Subject Photo' },
      { id: 'period', type: 'select', label: 'Artistic Period', options: ['Cubism', 'Blue Period', 'Rose Period', 'Synthetic Cubism'] }
    ],
    system_instruction: 'You are an AI art forger specializing in the style of Pablo Picasso. You excel at deconstructing subjects into geometric planes (Cubism), applying monochromatic emotional palettes (Blue Period), and using simultaneous perspectives.',
    master_prompt: 'Paint the **primary subject** of {{primary_image}} in the style of Pablo Picasso during his {{period}}. Deconstruct the subject into fragmented geometric shapes and planes. Use simultaneous perspectives where facial features might be viewed from multiple angles. **Completely replace the background** with an abstract, painterly backdrop that matches the {{period}} aesthetic, removing all original real-world context.',
    model_config: {
      temperature: 1.0,
      thinking_mode: false,
      aspectRatio: 'match_input'
    },
    // Abstract Cubist Portrait
    cover_image: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/picasso-painter/cubism-output-1.png',
    // Woman Portrait
    example_input_image: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/picasso-painter/input-1.png',
    // Abstract Art Result
    example_output_image: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/picasso-painter/cubism-output-1.png',
    additional_images: [
        { url: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/picasso-painter/blue-period-output-1.png', label: 'Blue Period' },
        { url: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/picasso-painter/rose-period-output-1.png', label: 'Rose Period' },
        { url: 'https://tahnskaisqiuwswelcmy.supabase.co/storage/v1/object/public/app-images/picasso-painter/synthetic-cubism-output-1.png', label: 'Synthetic' }
    ],
    input_tips: [
      "Works best with portraits or distinct objects.",
      "Avoid images with too much small detail.",
      "High contrast images yield more dramatic results."
    ],
    output_expectations: [
      "An abstract, geometric interpretation of the subject.",
      "Colors will shift to match the selected period.",
      "Facial features may be rearranged (that's the point!)."
    ]
  },
  {
    id: 'sticker-moji-3000',
    name: 'StickerMoji 3000',
    author: 'Banana Stand',
    emoji: '🦄',
    category: 'Utility',
    tags: ['Sticker', 'Vector', 'Cutout'],
    usage_count: 23105,
    tagline: 'Turn photos into die-cut stickers.',
    description: 'Instantly create custom die-cut stickers from any photo. This tool isolates the subject, adds a thick white border, and applies a clean vector style perfect for printing or using in messaging apps. Choose "Holographic" for a shiny foil effect or "Retro" for a vintage vibe.',
    inputs: [
      { id: 'primary_image', type: 'image', label: 'Upload Subject' },
      { id: 'style', type: 'select', label: 'Style', options: ['Cute', 'Edgy', 'Retro', 'Holographic'] }
    ],
    system_instruction: 'You are a professional vector artist specializing in die-cut sticker design. You create clean, bold designs with white borders.',
    master_prompt: 'Transform this image into a {{style}} style die-cut sticker. It should have a thick white border, flat vector shading, and a transparent background context (though generated as an image). Focus on the main subject of {{primary_image}}.',
    model_config: {
      temperature: 0.7,
      thinking_mode: false,
      aspectRatio: '1:1'
    },
    // Vibrant / Sticker Vibe
    cover_image: '/apps/sticker-moji-3000/holo-output-1.png',
    // Portrait Woman
    example_input_image: '/apps/sticker-moji-3000/input-1.jpeg',
    // Abstract Art / Vector Style
    example_output_image: '/apps/sticker-moji-3000/holo-output-1.png',
    additional_images: [
        { url: '/apps/sticker-moji-3000/cute-output-1.png', label: 'Cute' },
        { url: '/apps/sticker-moji-3000/edgy-output-1.png', label: 'Edgy' },
        { url: '/apps/sticker-moji-3000/retro-output-1.png', label: 'Retro' }
    ],
    input_tips: [
      "Use images with a clear central subject.",
      "Simple backgrounds make isolation easier.",
      "Avoid group photos; focus on one subject."
    ],
    output_expectations: [
      "A flat, vector-style sticker design.",
      "A thick white border around the subject.",
      "Simplified colors and shading."
    ]
  },
  {
    id: 'macro-vision-ai',
    name: 'Macro-Vision AI',
    author: 'Banana Stand',
    emoji: '🥑',
    category: 'Analysis',
    tags: ['Food', 'Health', 'AR'],
    usage_count: 5621,
    tagline: 'AR Nutrition Cards for Food.',
    description: 'Stop guessing what\'s in your food. Macro-Vision AI analyzes your meal photos and overlays a futuristic Augmented Reality (AR) HUD with estimated nutritional data. It breaks down protein, carbs, and calories, tailored to specific diet contexts like "Keto" or "Vegan".',
    inputs: [
      { id: 'primary_image', type: 'image', label: 'Food Photo' },
      { id: 'diet_type', type: 'text', label: 'Diet Context (e.g. Keto)', optional: true, placeholder: 'Standard' }
    ],
    system_instruction: 'You are an advanced nutrition analysis AI. You visually analyze food and overlay data.',
    master_prompt: 'Analyze the food in {{primary_image}}. Generate a new image that is identical to the original but overlays a futuristic semi-transparent "HUD" graphic near the food item. The HUD should list estimated Calories, Protein, and Carbs based on a {{diet_type}} assessment. Keep the food realistic.',
    model_config: {
      temperature: 0.4,
      thinking_mode: true, // Requires reasoning
      aspectRatio: '3:4'
    },
    // Healthy Food Bowl
    cover_image: '/apps/macro-vision-ai/hud-output-1.png',
    // Salad Input
    example_input_image: '/apps/macro-vision-ai/input-1.png',
    // Similar Salad (Result vibe)
    example_output_image: '/apps/macro-vision-ai/hud-output-1.png',
    input_tips: [
      "Ensure the entire meal is visible.",
      "Good lighting helps with accurate identification.",
      "Top-down or 45-degree angles work best."
    ],
    output_expectations: [
      "The original food image with an AR overlay.",
      "Estimated nutritional data displayed on the HUD.",
      "Futuristic, clean interface graphics."
    ]
  },
  {
    id: 'vibe-coder-id',
    name: 'Vibe Coder ID',
    author: 'Banana Stand',
    emoji: '👾',
    category: 'Avatar',
    tags: ['Cyberpunk', 'Glitch', 'Profile'],
    usage_count: 3290,
    tagline: 'Cyberpunk Glitch Aesthetics.',
    description: 'Establish your digital identity with a glitch-art profile picture. This app remixes your headshot with heavy chromatic aberration, digital noise, and neon lighting. It also embeds your username directly into the background as a glowing neon sign.',
    inputs: [
      { id: 'primary_image', type: 'image', label: 'Headshot' },
      { id: 'username', type: 'text', label: 'Username' }
    ],
    system_instruction: 'You are a digital artist specializing in Glitch Art and Cyberpunk aesthetics.',
    master_prompt: 'Remix {{primary_image}} into a cyberpunk profile picture. Apply heavy chromatic aberration, neon purple and green highlights, and digital noise. Embed the text "{{username}}" into the image as a neon sign or digital overlay in the background.',
    model_config: {
      temperature: 0.8,
      thinking_mode: false,
      aspectRatio: '1:1'
    },
    // Neon Cyberpunk Portrait
    cover_image: '/apps/vibe-coder-id/glitch-output-1.png',
    // Man Portrait
    example_input_image: '/apps/vibe-coder-id/input-1.png',
    // Glitch Art / Neon
    example_output_image: '/apps/vibe-coder-id/glitch-output-1.png',
    additional_images: [],
    input_tips: [
      "Use a clear, close-up headshot.",
      "Neutral or dark backgrounds work well.",
      "Avoid wearing too many accessories."
    ],
    output_expectations: [
      "A gritty, cyberpunk-styled portrait.",
      "Glitch effects and neon colors.",
      "Your username integrated into the background."
    ]
  },
  {
    id: 'baby-face-mixer',
    name: 'Baby Face Mixer',
    author: 'Banana Stand',
    emoji: '👶',
    category: 'Just for Fun',
    tags: ['Fun', 'Family', 'Prediction'],
    usage_count: 15402,
    tagline: 'What will your baby look like?',
    description: 'Ever wondered what a mashup of you and your crush (or celebrity crush) would look like? This AI analyzes the facial features of two different people and combines them into a realistic prediction of their future child.',
    inputs: [
      { id: 'parent_1', type: 'image', label: 'Parent 1 Photo' },
      { id: 'parent_2', type: 'image', label: 'Parent 2 Photo' },
      { id: 'gender', type: 'select', label: 'Baby Gender', options: ['Boy', 'Girl', 'Surprise Me'] }
    ],
    system_instruction: 'You are an expert digital artist specializing in facial compositing and age regression. You understand genetics and how facial features are inherited and blended across different ethnicities and races.',
    master_prompt: 'Create a photorealistic image of a young child (toddler age) that combines the facial features of {{parent_1}} and {{parent_2}}. Analyze the eye shape, nose structure, and skin tone of both parents and blend them naturally to reflect a realistic mixed-heritage background if the parents are of different races. If the user selected {{gender}}, aim for that appearance, otherwise keep it neutral. The result should look like a high-quality studio portrait of a real child.',
    model_config: {
      temperature: 0.6,
      thinking_mode: false,
      aspectRatio: '1:1'
    },
    // Placeholder paths - User needs to upload these
    cover_image: '/apps/baby-face-mixer/baby-result-girl-1.png', 
    example_input_image: ['/apps/baby-face-mixer/parent-1.png', '/apps/baby-face-mixer/parent-2.png'], 
    example_output_image: '/apps/baby-face-mixer/baby-result-girl-1.png',
    additional_images: [
      { url: '/apps/baby-face-mixer/baby-result-boy-1.png', label: 'Boy Result' }
    ],
    input_tips: [
      "Upload clear front-facing photos of both parents.",
      "Avoid sunglasses or heavy makeup for better accuracy.",
      "Consistent lighting in both photos helps the blend."
    ],
    output_expectations: [
      "A realistic portrait of a young child.",
      "A seamless blend of both parents' features.",
      "High-quality, studio-style lighting."
    ]
  },
  {
    id: 'zen-space-designer',
    name: 'Zen Space Designer',
    author: 'Banana Stand',
    emoji: '🏠',
    category: 'Interior Design',
    tags: ['Home', 'Decor', 'Real Estate'],
    usage_count: 9876,
    tagline: 'Redesign any room in seconds.',
    description: 'Tired of your current decor? Upload a photo of your room and instantly see it reimagined in various interior design styles. Whether you want a cozy Bohemian vibe or a sleek Minimalist look, this app keeps your room\'s layout while swapping out furniture, colors, and textures.',
    inputs: [
      { id: 'room_image', type: 'image', label: 'Room Photo' },
      { id: 'style', type: 'select', label: 'Design Style', options: ['Mid-Century Modern', 'Minimalist', 'Industrial', 'Bohemian', 'Cyberpunk', 'Scandinavian'] }
    ],
    system_instruction: 'You are a world-class Interior Designer and Architect. You are an expert at spatial planning, color theory, and photorealistic rendering of interior spaces.',
    master_prompt: 'Redesign the interior space in {{room_image}} to match the {{style}} design style. **Maintain the original room structure** (walls, windows, ceiling height, and camera angle) exactly. Replace the furniture, flooring, wall colors, and decor to perfectly embody the {{style}} aesthetic. Ensure the lighting is natural and photorealistic. The result should look like a high-end architectural visualization.',
    model_config: {
      temperature: 0.5,
      thinking_mode: false,
      aspectRatio: 'match_input'
    },
    // Placeholder paths
    cover_image: '/apps/zen-space-designer/mid-century-modern-output-1.png', 
    example_input_image: '/apps/zen-space-designer/room-input-1.png',
    example_output_image: '/apps/zen-space-designer/mid-century-modern-output-1.png',
    additional_images: [
      { url: '/apps/zen-space-designer/minimalist-output-1.png', label: 'Minimalist' },
      { url: '/apps/zen-space-designer/industrial-output-1.png', label: 'Industrial' },
      { url: '/apps/zen-space-designer/bohemian-output-1.png', label: 'Bohemian' },
      { url: '/apps/zen-space-designer/cyberpubk-output-1.png', label: 'Cyberpunk' },
      { url: '/apps/zen-space-designer/scandinavian-output-1.png', label: 'Scandinavian' }
    ],
    input_tips: [
      "Use a wide-angle shot to capture the whole room.",
      "Ensure the room is well-lit.",
      "Messy rooms are okay; the AI will clean them up!"
    ],
    output_expectations: [
      "A photorealistic redesign of your space.",
      "Original walls and windows will stay in place.",
      "Furniture and decor will be completely updated."
    ]
  },
  {
    id: 'time-traveler-lens',
    name: 'Time Traveler Lens',
    author: 'Banana Stand',
    emoji: '🕰️',
    category: 'Restoration',
    tags: ['History', 'Colorize', 'Fix'],
    usage_count: 7543,
    tagline: 'Restore and colorize old photos.',
    description: 'Breathe new life into your family history. This app takes old, black-and-white, or damaged photos and intelligently restores them. It removes scratches, sharpens blurry faces, and applies realistic colorization based on historical context.',
    inputs: [
      { id: 'old_photo', type: 'image', label: 'Old Photo' },
      { id: 'mode', type: 'select', label: 'Restoration Mode', options: ['Colorize & Restore', 'Restore Only (B&W)', 'Colorize Only', 'Enhance Details'] }
    ],
    system_instruction: 'You are an expert Photo Restoration Specialist and Historian. You excel at removing physical damage (scratches, dust) from scanned images, sharpening soft focus, and hallucinating accurate colors for black and white photography based on the era.',
    master_prompt: 'Process the {{old_photo}} using the {{mode}} technique. If restoring, remove all scratches, dust, and tears. If colorizing, apply natural skin tones and period-accurate clothing colors. If enhancing, sharpen facial features while maintaining the original likeness. The result should look like a pristine photograph taken yesterday.',
    model_config: {
      temperature: 0.3, // Low temperature for accuracy
      thinking_mode: false,
      aspectRatio: 'match_input'
    },
    // Placeholder paths
    cover_image: '/apps/time-traveler-lens/colorize-restore-output-1.png', 
    example_input_image: '/apps/time-traveler-lens/input-1.png',
    example_output_image: '/apps/time-traveler-lens/colorize-restore-output-1.png',
    additional_images: [
        { url: '/apps/time-traveler-lens/restore-only-bw-output-1.png', label: 'Restored B&W' },
        { url: '/apps/time-traveler-lens/colorize-only-output-1.png', label: 'Color Only' },
        { url: '/apps/time-traveler-lens/enhanced-details-output-1.png', label: 'Enhanced' }
    ],
    input_tips: [
      "Scan your photos at high resolution if possible.",
      "Ensure there is no glare on the photo surface.",
      "Works on both portraits and landscapes."
    ],
    output_expectations: [
      "A clean, scratch-free image.",
      "Realistic colors (if colorization is selected).",
      "Sharper details on faces and textures."
    ]
  },
  {
    id: 'product-studio-ai',
    name: 'Product Studio AI',
    author: 'Banana Stand',
    emoji: '📢',
    category: 'Marketing',
    tags: ['Business', 'E-commerce', 'Ads'],
    usage_count: 4210,
    tagline: 'Professional product photography in seconds.',
    description: 'Turn simple phone photos of your products into high-end marketing assets. This app removes the background from your product and places it into a professional scene of your choice—perfect for Instagram, Shopify, or pitch decks.',
    inputs: [
      { id: 'product_image', type: 'image', label: 'Product Photo' },
      { id: 'scene', type: 'select', label: 'Scene Setting', options: ['Minimal Studio', 'Lifestyle Kitchen', 'Outdoor Nature', 'Luxury Podium', 'Neon Cyberpunk', 'Cozy Living Room'] }
    ],
    system_instruction: 'You are a professional Product Photographer and Retoucher. You specialize in compositing products into realistic environments with perfect lighting matching.',
    master_prompt: 'Take the main product object from {{product_image}} and place it into a {{scene}}. The product should be the clear focal point. Ensure the lighting, shadows, and reflections on the product match the new environment perfectly. The result should look like a high-budget commercial photoshoot.',
    model_config: {
      temperature: 0.7,
      thinking_mode: false,
      aspectRatio: 'match_input'
    },
    // Placeholder paths
    cover_image: '/apps/product-studio-ai/luxary-podium-output-1.png', 
    example_input_image: '/apps/product-studio-ai/input-1.png',
    example_output_image: '/apps/product-studio-ai/luxary-podium-output-1.png',
    additional_images: [
        { url: '/apps/product-studio-ai/lifestyle-kitchen-output-1.png', label: 'Kitchen' },
        { url: '/apps/product-studio-ai/outdoor-nature-output-1.png', label: 'Nature' },
        { url: '/apps/product-studio-ai/neon-cyberpunk-output-1.png', label: 'Cyberpunk' },
        { url: '/apps/product-studio-ai/cozy-living-room-output-1.png', label: 'Living Room' }
    ],
    input_tips: [
      "Photograph your product against a plain background.",
      "Ensure even lighting on the product.",
      "Avoid cutting off any part of the product."
    ],
    output_expectations: [
      "The product isolated and placed in a new scene.",
      "Realistic shadows cast by the product.",
      "High-quality background blending."
    ]
  }
];
