import { supabase } from './supabase';
import { uploadRecipeImages } from './imageUploadService';
import { BananaApp } from '../types';

/**
 * Migration Service
 * Handles fixing legacy data issues, such as base64 images in database.
 */

export const MigrationService = {
  /**
   * Scans all recipes for base64 images and migrates them to Supabase Storage.
   * This is a heavy operation and should only be run by an admin.
   */
  fixLegacyRecipes: async (batchSize = 10) => {
    console.log("Starting legacy recipe migration...");
    let processedCount = 0;
    let fixedCount = 0;
    let errorCount = 0;

    try {
      // 1. Fetch all recipes
      // Note: This might still be heavy if there are thousands, but we'll assume reasonable scale for now.
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*');

      if (error) throw error;
      
      console.log(`Found ${recipes.length} recipes to check.`);

      // 2. Iterate and check for base64
      for (const row of recipes) {
        const app = row.app_data as BananaApp;
        let needsUpdate = false;
        
        // Check fields
        if (isBase64(app.example_input_image)) needsUpdate = true;
        if (isBase64(app.example_output_image)) needsUpdate = true;
        if (isBase64(app.cover_image)) needsUpdate = true;

        if (needsUpdate) {
          console.log(`Fixing recipe: ${app.name} (${row.id})...`);
          
          try {
            // Upload to storage
            const urls = await uploadRecipeImages(
              app.id,
              app.example_input_image as string | undefined,
              app.example_output_image as string | undefined
            );

            // Update app object
            const updatedApp = { ...app };
            if (urls.inputUrl) updatedApp.example_input_image = urls.inputUrl;
            if (urls.outputUrl) updatedApp.example_output_image = urls.outputUrl;
            if (urls.coverUrl) updatedApp.cover_image = urls.coverUrl;

            // Update DB
            const { error: updateError } = await supabase
              .from('recipes')
              .update({ app_data: updatedApp })
              .eq('id', row.id);

            if (updateError) {
              console.error(`Failed to update recipe ${row.id}:`, updateError);
              errorCount++;
            } else {
              console.log(`Successfully fixed ${app.name}`);
              fixedCount++;
            }
          } catch (e) {
            console.error(`Error processing recipe ${row.id}:`, e);
            errorCount++;
          }
        }
        processedCount++;
      }

      console.log(`Migration Complete.`);
      console.log(`Processed: ${processedCount}`);
      console.log(`Fixed: ${fixedCount}`);
      console.log(`Errors: ${errorCount}`);
      
      return { processedCount, fixedCount, errorCount };

    } catch (e) {
      console.error("Migration fatal error:", e);
      return { error: e };
    }
  }
};

function isBase64(str: any): boolean {
  if (typeof str !== 'string') return false;
  return str.startsWith('data:image');
}

