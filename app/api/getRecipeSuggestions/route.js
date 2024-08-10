import { NextResponse } from 'next/server';
import { OpenAI } from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
});

export async function POST(req) {
  try {
    const { inventory } = await req.json();
    const inventoryList = inventory.map((item) => item.name).join(", ");

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [{role: "user", content: `Format the response so its easy to read. I have the following ingredients: ${inventoryList}. Generate one recipe in the following format:
        Recipe Name
        Ingredients
        Instructions
        `}],
      max_tokens: 13100,
    });

    const recipeSuggestion = response.choices[0].message.content;

    return NextResponse.json({ recipeSuggestion });
  } catch (error) {
    console.error('Error in recipe suggestion API:', error);
    console.log("test", error)
    
    if (error && error.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
