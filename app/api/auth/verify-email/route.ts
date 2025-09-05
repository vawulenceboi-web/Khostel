import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'


// This route is no longer needed as Supabase handles email verification automatically
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    message: 'This endpoint is deprecated. Email verification is now handled automatically by Supabase Auth.'
  }, { status: 410 })
}