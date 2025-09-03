import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Database, Eye, Lock } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/auth/register">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: January 2025</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-green-600" />
              <span>k-H Privacy & Data Protection</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* 1. Information We Collect */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                1. Information We Collect
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">For All Users:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Name, email address, and phone number</li>
                    <li>Account credentials (encrypted passwords)</li>
                    <li>Profile photos (optional)</li>
                    <li>University/school affiliation</li>
                    <li>Platform usage data and activity logs</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Agent Information:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Business registration number (CAC)</li>
                    <li>Physical business address</li>
                    <li>Property listings and media (photos/videos)</li>
                    <li>Verification status and admin review history</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Booking & Interaction Data:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Inspection booking requests and status</li>
                    <li>Communication between students and agents</li>
                    <li>Ratings and reviews submitted by students</li>
                    <li>Property search and browsing history</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. How We Use Your Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>We use your information to:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Create and manage your platform account</li>
                  <li>Facilitate connections between students and verified agents</li>
                  <li>Process inspection booking requests</li>
                  <li>Verify agent business credentials and authenticity</li>
                  <li>Display agent ratings and reviews to help student decisions</li>
                  <li>Send important platform notifications and updates</li>
                  <li>Improve our platform services and user experience</li>
                  <li>Prevent fraud and ensure platform safety</li>
                </ul>
              </div>
            </section>

            {/* 3. Information Sharing */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                3. Information Sharing & Visibility
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Public Information (Visible to All Users):</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Agent business names and verification status</li>
                    <li>Agent profile photos and business addresses</li>
                    <li>Property listings with photos, prices, and amenities</li>
                    <li>Agent ratings and anonymous student reviews</li>
                    <li>Property location areas (not exact addresses)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Private Information (Not Shared Publicly):</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Personal email addresses and phone numbers</li>
                    <li>Student personal details and university information</li>
                    <li>Private messages between students and agents</li>
                    <li>Booking history and inspection details</li>
                    <li>Account passwords and security information</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Information Shared with Agents:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Student contact information for confirmed bookings only</li>
                    <li>Inspection preferences and requested dates</li>
                    <li>Student names for booking identification</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Data Security */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Data Security & Storage</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>We implement industry-standard security measures:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Encrypted data transmission (HTTPS/SSL)</li>
                  <li>Secure password hashing and storage</li>
                  <li>Regular security audits and updates</li>
                  <li>Restricted admin access to sensitive information</li>
                  <li>Secure cloud storage with Supabase infrastructure</li>
                </ul>
              </div>
            </section>

            {/* 5. Photo & Media Policy */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Photo & Media Policy</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>Regarding uploaded photos and videos:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Profile photos should be clear, recent, and appropriate</li>
                  <li>Property photos must accurately represent the accommodation</li>
                  <li>No inappropriate, misleading, or copyrighted content</li>
                  <li>We reserve the right to remove inappropriate media</li>
                  <li>Uploaded media may be compressed for platform performance</li>
                </ul>
              </div>
            </section>

            {/* 6. Cookies & Analytics */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Cookies & Analytics</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>We use cookies and analytics to:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Maintain your login session securely</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze platform usage to improve services</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </div>
            </section>

            {/* 7. Your Rights */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Your Privacy Rights</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>You have the right to:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Access your personal information stored on our platform</li>
                  <li>Update or correct your account information</li>
                  <li>Delete your account and associated data</li>
                  <li>Withdraw consent for non-essential data processing</li>
                  <li>Request information about how your data is used</li>
                </ul>
              </div>
            </section>

            {/* 8. Contact for Privacy */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Privacy Contact</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>For privacy-related questions or requests:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Email: privacy@k-h.com</li>
                  <li>Data requests: data@k-h.com</li>
                  <li>Security concerns: security@k-h.com</li>
                </ul>
              </div>
            </section>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                We are committed to protecting your privacy and using your data responsibly. This policy may be updated periodically to reflect platform improvements.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}