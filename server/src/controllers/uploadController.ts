import { Request, Response } from 'express';
import fs from 'fs';
import OpenAI from 'openai';
import prisma from '../utils/prisma';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    dangerouslyAllowBrowser: true
});

export const analyzeImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

        // @ts-ignore
        const userId = req.user.userId;
        const { mode } = req.body; // 'finance' or 'general'

        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        const prompt = mode === 'finance'
            ? "Extract transaction data from this image. Return JSON with date, description, amount."
            : "Analyze this image and suggest habits or summarize content. Return JSON.";

        if (!process.env.OPENAI_API_KEY) {
            const mockAnalysis = { summary: "This is a mock analysis. Add an API key for real vision features." };
            await prisma.upload.create({
                data: {
                    userId,
                    filename: req.file.filename,
                    url: imagePath,
                    analysis: JSON.stringify(mockAnalysis),
                }
            });
            return res.json({ analysis: mockAnalysis });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 500,
        });

        const analysis = response.choices[0].message.content;

        // Save record
        await prisma.upload.create({
            data: {
                userId,
                filename: req.file.filename,
                url: imagePath, // In real app, upload to S3/Cloudinary
                analysis: analysis || '{}', // analysis is already a string from OpenAI
            }
        });

        res.json({ analysis: JSON.parse(analysis || '{}') });

        // Cleanup temp file
        // fs.unlinkSync(imagePath); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Image analysis failed' });
    }
};
