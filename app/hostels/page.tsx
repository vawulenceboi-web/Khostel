import HostelsClient from './hostels-client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function HostelsPage() {
  return <HostelsClient />
}