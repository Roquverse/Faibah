import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  constructor(private prisma: PrismaService) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateProposal(companyId: string, prompt: string) {
    // 1. Check AI Tokens
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { aiTokens: true },
    });

    if (!company) {
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
    }

    if (company.aiTokens <= 0) {
      throw new HttpException('Insufficient AI Tokens. Please top up your tokens to continue using the AI.', HttpStatus.PAYMENT_REQUIRED);
    }

    // 2. Generate Proposal via Gemini
    const SYSTEM_INSTRUCTION = `
You are an expert agency proposal writer and pricing strategist. 
The user will provide a brief prompt describing a project they need to create a proposal and invoice for.
Your job is to generate a highly comprehensive, extremely detailed, and very long professional proposal. Do not write a short summary; write a full-length, in-depth proposal.

Return ONLY a valid JSON object matching this schema exactly, with NO markdown formatting around it (no \`\`\`json):
{
  "proposalTitle": "String - A catchy, professional title for the proposal",
  "proposalHTML": "String - The extremely detailed proposal text formatted in HTML. Include <h1>, <h2>, <h3>, <p>, <ul>, <li> tags. You MUST make this section incredibly long and detailed. Expand deeply on every single point. It should read like a 5-10 page document. You MUST include and deeply expand on these sections: Executive Summary, Client Background, Detailed Project Objectives, Comprehensive Scope of Work (broken down into phases), Methodology and Approach, Deliverables, Detailed Timeline, and Conclusion. Use long, descriptive paragraphs.",
  "items": [
    {
      "id": "String - unique ID",
      "description": "String - Detailed line item description for the invoice",
      "quantity": "Number",
      "rate": "Number - The cost in NGN (Nigerian Naira) or USD depending on context. Make it realistic based on the prompt."
    }
  ]
}

CRITICAL REQUIREMENT: The proposalHTML MUST be substantial and extensive (ABSOLUTE MINIMUM of 1500-2500 words). DO NOT give brief overviews. Write out the full text for each section as if you are submitting a multi-million dollar pitch. Be extremely verbose.
Ensure the financial items breakdown logically covers the scope of work and sums up to the user's requested budget (if provided).
`;

    let parsedData;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('No text generated from Gemini');
      }

      parsedData = JSON.parse(text);
    } catch (e: any) {
      throw new HttpException('Failed to generate proposal: ' + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 3. Decrement AI Tokens
    await this.prisma.company.update({
      where: { id: companyId },
      data: { aiTokens: { decrement: 1 } }
    });

    return parsedData;
  }

  async topUpTokens(companyId: string, amount: number) {
    const updatedCompany = await this.prisma.company.update({
      where: { id: companyId },
      data: { aiTokens: { increment: amount } }
    });
    return { aiTokens: updatedCompany.aiTokens };
  }
}
