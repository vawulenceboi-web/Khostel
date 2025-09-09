'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
  <header className="w-full bg-white shadow-md py-2 px-6 flex justify-center">
    <Link href="/">
          <Image
            src="/images/logo.png"  
            alt="k-H Logo"
            width={90}
            height={100}
            priority
          />
      </Link>
    

      {/* Optional: future navigation */}
      {/* <nav>
        <Link href="/auth/login" className="mr-4">Login</Link>
        <Link href="/auth/register">Sign Up</Link>
      </nav> */}
    </header>
  
      )
    }