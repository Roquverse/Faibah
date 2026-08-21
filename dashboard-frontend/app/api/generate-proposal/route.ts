import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the SDK. It automatically picks up GEMINI_API_KEY from process.env
const ai = new GoogleGenAI({});

const SYSTEM_INSTRUCTION = `
You are an expert agency proposal writer and pricing strategist. 
The user will provide a brief prompt describing a project they need to create a proposal and invoice for.
Your job is to generate a comprehensive, highly professional proposal.

Return ONLY a valid JSON object matching this schema exactly, with NO markdown formatting around it (no \`\`\`json):
{
  "proposalTitle": "String - A catchy, professional title for the proposal",
  "proposalHTML": "String - The detailed proposal text formatted in HTML. Include <h1>, <h2>, <p>, <ul>, <li> tags to structure the document. Make it highly professional and persuasive.",
  "items": [
    {
      "id": "String - unique ID",
      "description": "String - Detailed line item description for the invoice",
      "quantity": "Number",
      "rate": "Number - The cost in NGN (Nigerian Naira) or USD depending on context. Make it realistic based on the prompt."
    }
  ]
}

Ensure the proposalHTML is well-written, persuasive, directly addresses the user's prompt, and uses rich HTML tags (headings, paragraphs, lists) so it renders perfectly in a WYSIWYG editor. 
Ensure the financial items breakdown logically covers the scope of work and sums up to the user's requested budget (if provided).
`;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables.' }, { status: 500 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No text generated from Gemini');
    }

    const parsedData = JSON.parse(text);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error generating proposal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate proposal' }, 
      { status: 500 }
    );
  }
}
