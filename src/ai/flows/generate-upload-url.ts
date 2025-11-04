
'use server';

/**
 * @fileOverview A Genkit flow for generating a secure, pre-signed URL for file uploads to AWS S3.
 *
 * - generateUploadUrl - A function that creates a temporary URL for direct client-to-S3 uploads.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

// 1. Input Schema: Define what information the flow needs.
export const GenerateUploadUrlInputSchema = z.object({
  fileName: z.string().describe('The name of the file to be uploaded.'),
  contentType: z.string().describe('The MIME type of the file (e.g., "image/jpeg", "application/pdf").'),
  inspectionId: z.string().optional().describe('The ID of the inspection this file belongs to.'),
});
export type GenerateUploadUrlInput = z.infer<typeof GenerateUploadUrlInputSchema>;

// 2. Output Schema: Define what information the flow will return.
export const GenerateUploadUrlOutputSchema = z.object({
  uploadUrl: z.string().url().describe('The secure, pre-signed URL to use for the PUT request.'),
  fileKey: z.string().describe('The unique key (path) of the object in the S3 bucket.'),
  s3Uri: z.string().describe('The S3 URI of the object, to be stored in Firestore.'),
});
export type GenerateUploadUrlOutput = z.infer<typeof GenerateUploadUrlOutputSchema>;

// 3. Exported Function: The main function that clients will call.
export async function generateUploadUrl(input: GenerateUploadUrlInput): Promise<GenerateUploadUrlOutput> {
  return generateUploadUrlFlow(input);
}

// 4. Genkit Flow Definition
const generateUploadUrlFlow = ai.defineFlow(
  {
    name: 'generateUploadUrlFlow',
    inputSchema: GenerateUploadUrlInputSchema,
    outputSchema: GenerateUploadUrlOutputSchema,
  },
  async (input) => {
    // Ensure AWS credentials and config are set in your environment (.env)
    const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env;

    if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET_NAME) {
      throw new Error('AWS credentials or S3 bucket name are not configured in the environment.');
    }

    // Initialize the S3 Client
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    // Create a unique key for the file in S3
    const fileExtension = input.fileName.split('.').pop() || '';
    const uniqueId = randomUUID();
    const fileKey = `inspections/${input.inspectionId || 'unassigned'}/${uniqueId}.${fileExtension}`;

    // Create the command to put an object in the S3 bucket
    const putObjectCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
      ContentType: input.contentType,
    });

    // Generate the pre-signed URL, valid for 5 minutes
    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 300, // URL expires in 5 minutes
    });

    // The S3 URI is what you will store in Firestore's 'payloadRef' field
    const s3Uri = `s3://${S3_BUCKET_NAME}/${fileKey}`;
    
    console.log(`Generated pre-signed URL for ${fileKey}`);

    return {
      uploadUrl,
      fileKey,
      s3Uri,
    };
  }
);
