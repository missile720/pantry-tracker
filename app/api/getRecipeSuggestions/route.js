import { NextResponse } from 'next/server';
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const { inventory } = await req.json();
    const inventoryList = inventory.map((item) => item.name).join(", ");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: `I have the following items: ${inventoryList}. What recipes can I make?`}],
      max_tokens: 150,
    });

    const recipeSuggestion = response.data.choices[0].message.content;

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
