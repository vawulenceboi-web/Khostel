import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Home, Users } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: January 2025</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>k-H Platform Terms & Conditions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* 1. Platform Overview */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Home className="w-4 h-4 mr-2" />
                1. Platform Overview
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>k-H is a digital platform connecting Nigerian university students with verified accommodation providers (agents) for hostel rentals and inspections.</p>
                <p>By registering, you agree to use our platform responsibly and in accordance with these terms.</p>
              </div>
            </section>

            {/* 2. User Roles & Responsibilities */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                2. User Roles & Responsibilities
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">For Students:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Provide accurate personal information during registration</li>
                    <li>Use the platform to search and book legitimate hostel inspections</li>
                    <li>Attend scheduled inspections or cancel with reasonable notice</li>
                    <li>Provide honest ratings and reviews of agents and properties</li>
                    <li>Respect agent property and follow safety guidelines during visits</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">For Agents:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Provide accurate business information including valid CAC registration</li>
                    <li>Upload clear, recent profile photos for verification</li>
                    <li>List only legitimate, safe, and available hostel properties</li>
                    <li>Respond promptly to student inspection requests</li>
                    <li>Maintain professional conduct in all student interactions</li>
                    <li>Ensure all listed properties meet basic safety and hygiene standards</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Verification Process */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Agent Verification Process</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>All agents must undergo verification before listing properties:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Admin review of provided business registration (CAC) details</li>
                  <li>Verification decisions made within 30 minutes during business hours</li>
                  <li>Agents may be required to resubmit if initial verification expires</li>
                  <li>Verified status may be revoked for policy violations</li>
                  <li>Banned agents cannot list properties or interact with students</li>
                </ul>
              </div>
            </section>

            {/* 4. Booking & Inspection Policy */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Booking & Inspection Policy</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>Inspection bookings are facilitated through our platform with the following terms:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Students can request inspections for listed properties</li>
                  <li>Agents must confirm or decline requests within reasonable time</li>
                  <li>Both parties should honor confirmed inspection appointments</li>
                  <li>k-H is not responsible for transportation to inspection locations</li>
                  <li>Students inspect properties at their own risk</li>
                  <li>Final rental agreements are between students and agents directly</li>
                </ul>
              </div>
            </section>

            {/* 5. Rating & Review System */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Rating & Review System</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>Our rating system helps maintain quality and trust:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Students can rate agents after completed inspections (1-5 stars)</li>
                  <li>Each student may only rate an agent once to prevent spam</li>
                  <li>Ratings and reviews must be honest and based on actual experiences</li>
                  <li>Fake, malicious, or inappropriate reviews will be removed</li>
                  <li>Agents cannot manipulate or pay for positive ratings</li>
                </ul>
              </div>
            </section>

            {/* 6. Prohibited Activities */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Prohibited Activities</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>The following activities are strictly prohibited:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Creating fake accounts or providing false information</li>
                  <li>Listing non-existent, unsafe, or illegal properties</li>
                  <li>Harassment, discrimination, or inappropriate behavior</li>
                  <li>Attempting to bypass our verification systems</li>
                  <li>Using the platform for non-accommodation related activities</li>
                  <li>Sharing personal contact information in public listings for direct transactions</li>
                </ul>
              </div>
            </section>

            {/* 7. Platform Liability */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Platform Liability</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>k-H serves as a connecting platform and:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Does not guarantee the accuracy of property listings</li>
                  <li>Is not responsible for disputes between students and agents</li>
                  <li>Does not handle rental payments or security deposits</li>
                  <li>Cannot guarantee property safety or condition</li>
                  <li>Recommends students verify all details independently</li>
                </ul>
              </div>
            </section>

            {/* 8. Account Termination */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Account Termination</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>We reserve the right to suspend or terminate accounts for:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Violation of these terms and conditions</li>
                  <li>Fraudulent or misleading information</li>
                  <li>Inappropriate behavior or harassment</li>
                  <li>Repeated policy violations</li>
                  <li>Safety concerns reported by other users</li>
                </ul>
              </div>
            </section>

            {/* 9. Contact Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Contact & Support</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>For questions, disputes, or support:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Email: support@k-h.com</li>
                  <li>Platform disputes: admin@k-h.com</li>
                  <li>Emergency safety concerns: safety@k-h.com</li>
                </ul>
              </div>
            </section>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                By registering on k-H, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}