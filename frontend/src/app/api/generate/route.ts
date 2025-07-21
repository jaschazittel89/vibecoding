import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  // TODO: integrate with OpenAI
  return NextResponse.json({
    recipes: [
      { title: 'Avocado Toast', description: 'Simple avocado toast.' },
      { title: 'Veggie Omelette', description: 'Eggs with mixed veggies.' },
      { title: 'Pasta Primavera', description: 'Pasta with fresh vegetables.' },
    ],
  });
}
