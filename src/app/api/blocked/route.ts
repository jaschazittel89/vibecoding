import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Access forbidden" },
    { status: 403 }
  )
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Access forbidden" },
    { status: 403 }
  )
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: "Access forbidden" },
    { status: 403 }
  )
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: "Access forbidden" },
    { status: 403 }
  )
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    { error: "Access forbidden" },
    { status: 403 }
  )
} 