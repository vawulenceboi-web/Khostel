export const runtime = 'nodejs';
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🔥 SIMPLE TEST: API route called!')
  console.log('🔥 SIMPLE TEST: Time:', new Date().toISOString())
  
  return NextResponse.json({ 
    message: 'Simple test API works!',
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  console.log('🔥 SIMPLE TEST POST: API route called!')
  console.log('🔥 SIMPLE TEST POST: Time:', new Date().toISOString())
  
  return NextResponse.json({ 
    message: 'Simple test POST API works!',
    timestamp: new Date().toISOString()
  })
}