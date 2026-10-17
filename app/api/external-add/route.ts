import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // ADDING CORS HEADERS TO ALLOW THE EXTENSION TO COMMUNICATE
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allow any origin (for local dev)
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers });
  }

  try {
    const body = await req.json();
    const { title, deadline } = body;

    if (!title || !deadline) {
      return NextResponse.json({ error: "Missing data" }, { status: 400, headers });
    }

    console.log(`External assignment received: ${title} due ${deadline}`);

    return NextResponse.json({
      success: true,
      message: "Assignment received!"
    }, { headers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers });
  }
}
