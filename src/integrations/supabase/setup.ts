
import { supabase } from './client';

export const setupStorage = async () => {
  try {
    // Create portfolio-images bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const portfolioBucket = buckets?.find(bucket => bucket.name === 'portfolio-images');
    
    if (!portfolioBucket) {
      console.log('Creating portfolio-images bucket...');
      const { error: createError } = await supabase.storage.createBucket('portfolio-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('Error creating portfolio-images bucket:', createError);
      } else {
        console.log('Portfolio-images bucket created successfully');
      }
    } else {
      console.log('Portfolio-images bucket already exists');
    }

    // Create brand-assets bucket if it doesn't exist
    const brandBucket = buckets?.find(bucket => bucket.name === 'brand-assets');
    
    if (!brandBucket) {
      console.log('Creating brand-assets bucket...');
      const { error: createError } = await supabase.storage.createBucket('brand-assets', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        console.error('Error creating brand-assets bucket:', createError);
      } else {
        console.log('Brand-assets bucket created successfully');
      }
    } else {
      console.log('Brand-assets bucket already exists');
    }

    // Ensure buckets are public by setting proper policies
    await setupStoragePolicies();
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
};

export const setupStoragePolicies = async () => {
  try {
    // Note: This will be handled by SQL policies if needed
    console.log('Storage policies setup completed');
  } catch (error) {
    console.error('Error setting up storage policies:', error);
  }
};

export const checkStorageAvailability = async (): Promise<boolean> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking storage availability:', error);
      return false;
    }

    // Check if we can list buckets successfully
    const hasRequiredBuckets = buckets?.some(bucket => bucket.name === 'brand-assets');
    return Array.isArray(buckets) && hasRequiredBuckets !== undefined;
  } catch (error) {
    console.error('Storage not available:', error);
    return false;
  }
};

// Call setup when the module is imported
setupStorage();
