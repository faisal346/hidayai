import { NextResponse } from "next/server";
import OpenAI from "openai"; 

const systemPrompt = 
  "You are a customer service representative. Your role is to assist " +
  "customers with their inquiries, provide accurate information, and " +
  "resolve issues in a friendly and efficient manner. Always strive to " +
  "ensure customer satisfaction and maintain a positive interaction.";

export async function POST(req) {
    const openai = new OpenAI(); // Ensure OpenAI is properly initialized
    const data = await req.json();

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        }
    });

    return new NextResponse(stream); // Return the stream in the response
}
