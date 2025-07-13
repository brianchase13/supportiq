'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  MessageSquare, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface AIResponse {
  content: string;
  type: 'auto_resolve' | 'follow_up' | 'escalate';
  confidence: number;
  reasoning: string;
  cost_usd: number;
  tokens_used: number;
}

interface TrialLimits {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
}

export function TicketTester() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [customerEmail, setCustomerEmail] = useState('customer@example.com');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trialLimits, setTrialLimits] = useState<TrialLimits | null>(null);

  const sampleTickets = [
    {
      subject: 'Password Reset Request',
      content: 'Hi, I forgot my password and need help resetting it. Can you please help me get back into my account?',
      category: 'account',
      priority: 'medium'
    },
    {
      subject: 'Billing Question',
      content: 'I noticed a charge on my credit card that I don\'t recognize. Can you explain what this charge is for?',
      category: 'billing',
      priority: 'high'
    },
    {
      subject: 'Feature Request',
      content: 'I would love to see a dark mode option in the mobile app. Is this something you\'re planning to add?',
      category: 'feature_request',
      priority: 'low'
    },
    {
      subject: 'Bug Report',
      content: 'The app keeps crashing when I try to upload a file larger than 10MB. This happens every time.',
      category: 'bug',
      priority: 'high'
    }
  ];

  const handleSampleTicket = (sample: typeof sampleTickets[0]) => {
    setSubject(sample.subject);
    setContent(sample.content);
    setCategory(sample.category);
    setPriority(sample.priority);
  };

  const handleTestTicket = async (dryRun: boolean = false) => {
    if (!content.trim()) {
      setError('Please enter ticket content');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          content,
          customerEmail,
          category,
          priority,
          dryRun
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process ticket');
      }

      if (data.success) {
        setResponse(data.response);
        setTrialLimits(data.trial_limits);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'auto_resolve':
        return 'bg-green-100 text-green-800';
      case 'follow_up':
        return 'bg-yellow-100 text-yellow-800';
      case 'escalate':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Test AI Ticket Processing
          </CardTitle>
          <CardDescription>
            Test our AI with sample tickets or create your own. See how the AI analyzes and responds to support requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample Tickets */}
            <div>
              <Label className="text-sm font-medium">Sample Tickets</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {sampleTickets.map((sample, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSampleTicket(sample)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium text-sm">{sample.subject}</div>
                      <div className="text-xs text-gray-500 mt-1">{sample.content.substring(0, 60)}...</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Ticket Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ticket subject..."
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Ticket Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe the customer's issue or question..."
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestTicket(true)} 
                  disabled={loading || !content.trim()}
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4 mr-2" />
                  )}
                  Test (Dry Run)
                </Button>
                <Button 
                  onClick={() => handleTestTicket(false)} 
                  disabled={loading || !content.trim()}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Process Ticket
                </Button>
              </div>

              {/* Trial Limits Info */}
              {trialLimits && (
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      AI Responses: {trialLimits.used}/{trialLimits.limit} 
                      ({trialLimits.remaining} remaining)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* AI Response Display */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              AI Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Response Metadata */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getResponseTypeColor(response.type)}>
                  {response.type.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={getConfidenceColor(response.confidence)}>
                  {Math.round(response.confidence * 100)}% Confidence
                </Badge>
                <Badge variant="outline">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ${response.cost_usd.toFixed(4)}
                </Badge>
                <Badge variant="outline">
                  {response.tokens_used} tokens
                </Badge>
              </div>

              {/* Response Content */}
              <div>
                <Label className="text-sm font-medium">AI Response</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <Label className="text-sm font-medium">Reasoning</Label>
                <p className="text-sm text-gray-600 mt-1">{response.reasoning}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 