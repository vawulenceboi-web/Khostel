'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Eye, EyeOff, ArrowLeft, UserCheck, Building, GraduationCap } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'student' as 'student' | 'agent' | 'admin',
    schoolId: '',
    businessRegNumber: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.role === 'agent' && !formData.businessRegNumber) {
      toast.error('CAC registration number is required for agents')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role,
          schoolId: formData.schoolId || undefined,
          businessRegNumber: formData.businessRegNumber || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Registration successful!', {
          description: formData.role === 'agent' 
            ? 'Your account will be verified by admin before you can list properties'
            : 'You can now sign in to your account'
        })
        router.push('/auth/login')
      } else {
        toast.error('Registration failed', {
          description: data.message || 'Please try again'
        })
      }
    } catch (error) {
      toast.error('Registration failed', {
        description: 'An unexpected error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-xl font-bold">k-H</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Join k-H</h1>
            <p className="text-muted-foreground">Create your account to get started</p>
          </div>

          <Card className="border-2 border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Choose your role and fill in your details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={formData.role === 'student' ? 'default' : 'outline'}
                      onClick={() => handleInputChange('role', 'student')}
                      className="h-16 flex flex-col items-center justify-center"
                    >
                      <GraduationCap className="h-6 w-6 mb-1" />
                      <span className="text-sm">Student</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.role === 'agent' ? 'default' : 'outline'}
                      onClick={() => handleInputChange('role', 'agent')}
                      className="h-16 flex flex-col items-center justify-center"
                    >
                      <Building className="h-6 w-6 mb-1" />
                      <span className="text-sm">Agent/Owner</span>
                    </Button>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* University Selection for Students */}
                {formData.role === 'student' && (
                  <div className="space-y-2">
                    <Label>University</Label>
                    <Select value={formData.schoolId} onValueChange={(value) => handleInputChange('schoolId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your university" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kwasu">Kwara State University (KWASU)</SelectItem>
                        <SelectItem value="unilorin">University of Ilorin</SelectItem>
                        <SelectItem value="oau">Obafemi Awolowo University</SelectItem>
                        <SelectItem value="ui">University of Ibadan</SelectItem>
                        <SelectItem value="unn">University of Nigeria, Nsukka</SelectItem>
                        <SelectItem value="uniben">University of Benin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* CAC Registration for Agents */}
                {formData.role === 'agent' && (
                  <div className="space-y-2">
                    <Label htmlFor="businessRegNumber">CAC Registration Number</Label>
                    <Input
                      id="businessRegNumber"
                      value={formData.businessRegNumber}
                      onChange={(e) => handleInputChange('businessRegNumber', e.target.value)}
                      placeholder="Enter your CAC registration number"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Required for verification. Your account will be reviewed by admin.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a password"
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
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
        </div>
      </div>
    </div>
  )
}