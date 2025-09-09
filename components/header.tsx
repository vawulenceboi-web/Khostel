'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex items-center justify-between">
      <Link href="/">
        <div className="flex items-center space-x-2">
          <Image
            src="/images/logo.png"  // place your real logo in public/images/logo.png
            alt="k-H Logo"
            width={120}
            height={40}
            priority
          />
          <span className="text-xl font-bold text-gray-800">k-H</span>
        </div>
      </Link>

      {/* Optional: future navigation */}
      {/* <nav>
        <Link href="/auth/login" className="mr-4">Login</Link>
        <Link href="/auth/register">Sign Up</Link>
      </nav> */}
    </header>
  )
}