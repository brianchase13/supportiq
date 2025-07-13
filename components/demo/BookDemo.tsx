'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Zap,
  CheckCircle,
  ArrowRight,
  Video,
  Mail,
  Phone
} from 'lucide-react';

interface DemoBookingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bookingData: any) => void;
}

interface BookingForm {
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  ticketVolume: string;
  currentTool: string;
  useCase: string;
  preferredDate: string;
  preferredTime: string;
  additionalNotes: string;
}

const TIME_SLOTS = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
];

const TICKET_VOLUMES = [
  'Less than 100 tickets/month',
  '100-500 tickets/month',
  '500-1,000 tickets/month',
  '1,000-5,000 tickets/month',
  '5,000+ tickets/month',
];

const CURRENT_TOOLS = [
  'Intercom',
  'Zendesk',
  'Freshdesk',
  'Help Scout',
  'Desk.com',
  'Custom solution',
  'Other',
];

const USE_CASES = [
  'Reduce response time',
  'Scale support team',
  'Improve customer satisfaction',
  'Reduce support costs',
  'Handle peak periods',
  'Other',
];

export function BookDemo({ isOpen, onClose, onSuccess }: DemoBookingProps) {
  const [step, setStep] = useState<'qualification' | 'scheduling' | 'confirmation'>('qualification');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BookingForm>({
    name: '',
    email: '',
    company: '',
    role: '',
    phone: '',
    ticketVolume: '',
    currentTool: '',
    useCase: '',
    preferredDate: '',
    preferredTime: '',
    additionalNotes: '',
  });

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQualificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.company || !formData.ticketVolume) {
      alert('Please fill in all required fields');
      return;
    }

    setStep('scheduling');
  };

  const handleSchedulingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.preferredDate || !formData.preferredTime) {
      alert('Please select a date and time');
      return;
    }

    setLoading(true);

    try {
      // Submit demo booking
      const response = await fetch('/api/demo/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStep('confirmation');
        onSuccess?.(formData);
      } else {
        throw new Error('Failed to book demo');
      }
    } catch (error) {
      console.error('Demo booking error:', error);
      alert('Failed to book demo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Book Your Demo</h2>
              <p className="text-gray-600">See SupportIQ in action with a personalized demo</p>
            </div>
            <Button variant="ghost" onClick={onClose} size="sm">
              ✕
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'qualification' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 mx-2 ${
                step !== 'qualification' ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'scheduling' ? 'bg-blue-600 text-white' : 
                step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 mx-2 ${
                step === 'confirmation' ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step 1: Qualification */}
          {step === 'qualification' && (
            <form onSubmit={handleQualificationSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Work Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@company.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Your Company"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    placeholder="Support Manager, CTO, etc."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ticketVolume">Monthly Support Tickets *</Label>
                <Select value={formData.ticketVolume} onValueChange={(value) => handleInputChange('ticketVolume', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ticket volume" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_VOLUMES.map((volume) => (
                      <SelectItem key={volume} value={volume}>
                        {volume}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currentTool">Current Support Tool</Label>
                <Select value={formData.currentTool} onValueChange={(value) => handleInputChange('currentTool', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENT_TOOLS.map((tool) => (
                      <SelectItem key={tool} value={tool}>
                        {tool}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="useCase">Primary Use Case</Label>
                <Select value={formData.useCase} onValueChange={(value) => handleInputChange('useCase', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="What are you looking to achieve?" />
                  </SelectTrigger>
                  <SelectContent>
                    {USE_CASES.map((useCase) => (
                      <SelectItem key={useCase} value={useCase}>
                        {useCase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Next: Schedule Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Scheduling */}
          {step === 'scheduling' && (
            <form onSubmit={handleSchedulingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="preferredDate">Preferred Date *</Label>
                  <Select value={formData.preferredDate} onValueChange={(value) => handleInputChange('preferredDate', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a date" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDates().map((date) => (
                        <SelectItem key={date} value={date}>
                          {formatDate(date)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferredTime">Preferred Time *</Label>
                  <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time} EST
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (for calendar invite)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Any specific questions or topics you'd like to cover?"
                  rows={3}
                />
              </div>

              {/* Demo Preview */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    What to Expect
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>30-minute personalized demo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Live AI response demonstration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Integration setup walkthrough</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>ROI calculation for your use case</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Q&A session</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep('qualification')}>
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? 'Booking...' : 'Book Demo'}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirmation' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-green-800">Demo Booked Successfully!</h3>
                <p className="text-gray-600 mt-2">
                  We've sent a calendar invite to {formData.email}
                </p>
              </div>

              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="font-medium">Date:</span>
                      <span>{formatDate(formData.preferredDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Time:</span>
                      <span>{formData.preferredTime} EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Duration:</span>
                      <span>30 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Format:</span>
                      <span>Video call (Zoom/Google Meet)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  <strong>What happens next:</strong>
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• You'll receive a calendar invite within 5 minutes</p>
                  <p>• We'll send you a pre-demo questionnaire</p>
                  <p>• Our team will prepare a personalized demo</p>
                  <p>• You'll get access to a trial account before the demo</p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                  Close
                </Button>
                <Button variant="outline" onClick={() => window.open('/dashboard', '_blank')}>
                  Explore Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}