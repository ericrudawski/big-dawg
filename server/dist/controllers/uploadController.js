"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImage = void 0;
const fs_1 = __importDefault(require("fs"));
const openai_1 = __importDefault(require("openai"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const analyzeImage = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No image uploaded' });
        // @ts-ignore
        const userId = req.user.userId;
        const { mode } = req.body; // 'finance' or 'general'
        const imagePath = req.file.path;
        const imageBuffer = fs_1.default.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const prompt = mode === 'finance'
            ? "Extract transaction data from this image. Return JSON with date, description, amount."
            : "Analyze this image and suggest habits or summarize content. Return JSON.";
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
        await prisma_1.default.upload.create({
            data: {
                userId,
                filename: req.file.filename,
                url: imagePath, // In real app, upload to S3/Cloudinary
                analysis: JSON.parse(analysis || '{}'),
            }
        });
        res.json({ analysis: JSON.parse(analysis || '{}') });
        // Cleanup temp file
        // fs.unlinkSync(imagePath); 
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Image analysis failed' });
    }
};
exports.analyzeImage = analyzeImage;
