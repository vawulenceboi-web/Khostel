export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🧪 TEST LOGGING: ===== TEST API CALLED =====')
  console.log('🧪 TEST LOGGING: Timestamp:', new Date().toISOString())
  console.log('🧪 TEST LOGGING: Request URL:', request.url)
  console.log('🧪 TEST LOGGING: Request method:', request.method)
  console.log('🧪 TEST LOGGING: Headers:', Object.fromEntries(request.headers.entries()))
  
  return NextResponse.json({
    success: true,
    message: 'Test logging API called successfully',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  console.log('🧪 TEST LOGGING POST: ===== TEST POST API CALLED =====')
  console.log('🧪 TEST LOGGING POST: Timestamp:', new Date().toISOString())
  
  try {
    const body = await request.json()
    console.log('🧪 TEST LOGGING POST: Body received:', body)
    
    return NextResponse.json({
      success: true,
      message: 'Test POST API called successfully',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ TEST LOGGING POST ERROR:', error)
    return NextResponse.json({
      success: false,
      message: 'Test POST API failed',
      error: (error as Error).message
    })
  }
}