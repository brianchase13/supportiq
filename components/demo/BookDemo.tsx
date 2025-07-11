'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Video, Clock, CheckCircle, X } from 'lucide-react';

export function BookDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCalendly = () => {
    // In production, replace with your actual Calendly link
    const calendlyUrl = 'https://calendly.com/supportiq-demo/30min';
    
    // For demo purposes, show a modal instead
    setIsModalOpen(true);
    
    // In production, uncomment this:
    // window.open(calendlyUrl, '_blank');
  };

  if (isModalOpen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-900 border-slate-800 max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Book Your Demo
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-2">What you'll get:</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Personalized walkthrough of SupportIQ
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Analysis of your support data (if available)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Custom ROI calculation for your team
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Q&A with our founders
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 p-3 rounded text-center">
                <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <div className="text-white font-medium">30 min</div>
                <div className="text-xs text-slate-400">Duration</div>
              </div>
              <div className="bg-slate-800 p-3 rounded text-center">
                <Video className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <div className="text-white font-medium">Zoom</div>
                <div className="text-xs text-slate-400">Platform</div>
              </div>
            </div>

            <div className="space-y-3">
              <a 
                href="mailto:demo@supportiq.ai?subject=Demo Request&body=Hi! I'd like to book a demo of SupportIQ. My team handles about [X] tickets per month and I'm particularly interested in [specific use case]."
                className="block w-full"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Email to Book Demo
                </Button>
              </a>
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="text-xs text-slate-500 text-center">
              We'll respond within 2 hours during business hours
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Button 
      onClick={openCalendly}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <Calendar className="w-4 h-4 mr-2" />
      Book a Demo
    </Button>
  );
}