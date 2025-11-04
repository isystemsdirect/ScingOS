
'use server';

/**
 * @fileOverview A Genkit flow for generating secure, pre-signed AWS S3 upload URLs.
 * This allows clients to upload files directly to S3 without needing AWS credentials.
 *
 * - generateUploadUrl - A function that returns a pre-signed URL for a specified file.
 * - GenerateUploadUrlInput - The input schema for the generateUploadUrl function.
 * - GenerateUploadUrlOutput - The return schema for the generateUploadUrl function.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input validation schema
export const GenerateUploadUrlInputSchema = z.object({
  fileName: z.string().describe('The name of the file to be uploaded.'),
  fileType: z.string().describe('The MIME type of the file (e.g., "image/jpeg").'),
  inspectionId: z.string().describe('The ID of the inspection this file belongs to.'),
});
export type GenerateUploadUrlInput = z.infer<typeof GenerateUploadUrlInputSchema>;

// Output validation schema
export const GenerateUploadUrlOutputSchema = z.object({
  uploadUrl: z.string().url().describe('The secure, pre-signed URL for the upload.'),
  fileKey: z.string().describe('The final S3 object key where the file will be stored.'),
});
export type GenerateUploadUrlOutput = z.infer<typeof GenerateUploadUrlOutputSchema>;


// Check for AWS credentials
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_REGION || !process.env.AWS_S3_BUCKET) {
    console.warn("AWS credentials are not fully configured in .env file. S3 upload flow will not work.");
}

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

/**
 * Generates a pre-signed URL for uploading a file to an S3 bucket.
 * @param input - The file details for the upload.
 * @returns An object containing the upload URL and the final file key.
 */
export async function generateUploadUrl(input: GenerateUploadUrlInput): Promise<GenerateUploadUrlOutput> {
  return generateUploadUrlFlow(input);
}


const generateUploadUrlFlow = ai.defineFlow(
  {
    name: 'generateUploadUrlFlow',
    inputSchema: GenerateUploadUrlInputSchema,
    outputSchema: GenerateUploadUrlOutputSchema,
  },
  async ({ fileName, fileType, inspectionId }) => {
    
    if (!process.env.AWS_S3_BUCKET) {
        throw new Error("AWS_S3_BUCKET environment variable is not set.");
    }
      
    // Create a unique key for the file in S3, organizing by inspection
    const fileKey = `inspections/${inspectionId}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      ContentType: fileType,
    });

    try {
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // URL expires in 5 minutes
      
      console.log(`Successfully generated pre-signed URL for: ${fileKey}`);

      return {
        uploadUrl,
        fileKey,
      };
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw new Error('Could not generate S3 upload URL.');
    }
  }
);
