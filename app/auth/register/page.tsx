'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  UserCheck, 
  Building, 
  GraduationCap, 
  Upload,
  MapPin,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
  Camera,
  User
} from 'lucide-react'


export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'student' as 'student' | 'agent',
    schoolId: '',
    businessRegNumber: '',
    address: '',
    profileImageUrl: '',
    termsAccepted: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [schools, setSchools] = useState<any[]>([])

  const [facePhotoUrl, setFacePhotoUrl] = useState('')
  const [currentStep, setCurrentStep] = useState<'form' | 'complete'>('form')
  const router = useRouter()

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools')
      if (response.ok) {
        const data = await response.json()
        setSchools(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching schools:', error)
    }
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return false
    }

    if (!formData.termsAccepted) {
      toast.error('You must accept the terms and conditions')
      return false
    }

    // Enhanced agent validation
    if (formData.role === 'agent') {
      if (!formData.businessRegNumber) {
        toast.error('CAC registration number is required for agents')
        return false
      }
      
      if (!formData.businessRegNumber.match(/^RC\d{6,7}$/)) {
        toast.error('CAC number must be in format: RC followed by 6-7 digits (e.g., RC123456)')
        return false
      }

      if (!formData.lastName) {
        toast.error('Last name is required for agents')
        return false
      }

      if (!formData.phone) {
        toast.error('Phone number is required for agents')
        return false
      }

      if (!formData.address || formData.address.length < 10) {
        toast.error('Full business address is required for agents (minimum 10 characters)')
        return false
      }
    }

    return true
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Register both students and agents directly (no face verification)
    await completeRegistration()
  }



  const completeRegistration = async (facePhotoUrl?: string) => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName || null,
            phone: formData.phone || null,
            role: formData.role,
            school_id: formData.schoolId || null,
            business_reg_number: formData.businessRegNumber || null,
            address: formData.address || null,
            profile_image_url: formData.profileImageUrl || null,
            face_photo_url: facePhotoUrl || null,
            terms_accepted: formData.termsAccepted,
            terms_accepted_at: new Date().toISOString(),
            verified_status: formData.role === 'agent' ? false : true,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
      })

      if (error) {
        console.error('Registration error:', error.message)
        toast.error(error.message || 'Registration failed')
        if (formData.role === 'agent') {
          setCurrentStep('form')
        }
      } else if (data.user) {
        toast.success('Registration successful! Please check your email to verify your account.')
        setTimeout(() => {
          router.push('/auth/verify-email')
        }, 2000)
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
      if (formData.role === 'agent') {
        setCurrentStep('form')
      }
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Join k-H</h1>
          <p className="text-muted-foreground">
            Create your account to access Nigeria's premier student housing platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              {formData.role === 'agent' 
                ? 'Register as a property agent to list hostels (requires verification)'
                : 'Register as a student to book hostel inspections'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.role === 'student' ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                  >
                    <CardContent className="p-4 text-center">
                      <GraduationCap className="w-8 h-8 mx-auto mb-2" />
                      <h3 className="font-semibold">Student</h3>
                      <p className="text-xs text-muted-foreground">Book hostel inspections</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.role === 'agent' ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, role: 'agent' }))}
                  >
                    <CardContent className="p-4 text-center">
                      <Building className="w-8 h-8 mx-auto mb-2" />
                      <h3 className="font-semibold">Agent</h3>
                      <p className="text-xs text-muted-foreground">List properties</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name {formData.role === 'agent' && '*'}
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required={formData.role === 'agent'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number {formData.role === 'agent' && '*'}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required={formData.role === 'agent'}
                  />
                </div>
              </div>

              {/* Agent-specific fields */}
              {formData.role === 'agent' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessRegNumber">CAC Registration Number *</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="businessRegNumber"
                        placeholder="RC1234567"
                        className="pl-10"
                        value={formData.businessRegNumber}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          businessRegNumber: e.target.value.toUpperCase() 
                        }))}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Format: RC followed by 6-7 digits (e.g., RC123456)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="address"
                        placeholder="Full business address including street, city, state"
                        className="pl-10 min-h-[80px]"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profileImageUrl">Profile Picture URL (Optional)</Label>
                    <div className="relative">
                      <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="profileImageUrl"
                        type="url"
                        placeholder="https://example.com/your-photo.jpg"
                        className="pl-10"
                        value={formData.profileImageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, profileImageUrl: e.target.value }))}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Professional photo recommended for faster verification
                    </p>
                  </div>
                </>
              )}

              {/* School selection for students */}
              {formData.role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="schoolId">University (Optional)</Label>
                  <Select value={formData.schoolId} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, schoolId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name} - {school.city}, {school.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Password fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, termsAccepted: checked as boolean }))
                    }
                    required
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label 
                      htmlFor="termsAccepted"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the Terms and Conditions *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      By registering, you agree to our{' '}
                      <Link href="/terms" className="underline hover:text-foreground">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="underline hover:text-foreground">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Agent verification notice */}
                {formData.role === 'agent' && (
                  <Card className="bg-secondary/50 border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Agent Verification Process</h4>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>• Your application will be reviewed by our admin team</p>
                            <p>• Verification decision will be made within 30 minutes</p>
                            <p>• You can only list properties after verification approval</p>
                            <p>• Ensure all information is accurate and verifiable</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12" 
                disabled={isLoading || !formData.termsAccepted}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    {formData.role === 'agent' ? 'Submitting for Verification...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    {formData.role === 'agent' ? 'Continue to Face Verification' : 'Create Account'}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}