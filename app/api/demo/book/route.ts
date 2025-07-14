import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const DemoBookingSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  role: z.string().optional(),
  phone: z.string().optional(),
  ticketVolume: z.string().min(1),
  currentTool: z.string().optional(),
  useCase: z.string().optional(),
  preferredDate: z.string().min(1),
  preferredTime: z.string().min(1),
  additionalNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = DemoBookingSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const bookingData = validationResult.data;

    // Check if demo already exists for this email and date
    const { data: existingBooking } = await supabaseAdmin
      .from('demo_bookings')
      .select('id')
      .eq('email', bookingData.email)
      .eq('preferred_date', bookingData.preferredDate)
      .single();

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Demo already booked for this date and email' },
        { status: 409 }
      );
    }

    // Create demo booking
    const { data: booking, error: insertError } = await supabaseAdmin
      .from('demo_bookings')
      .insert({
        name: bookingData.name,
        email: bookingData.email,
        company: bookingData.company,
        role: bookingData.role,
        phone: bookingData.phone,
        ticket_volume: bookingData.ticketVolume,
        current_tool: bookingData.currentTool,
        use_case: bookingData.useCase,
        preferred_date: bookingData.preferredDate,
        preferred_time: bookingData.preferredTime,
        additional_notes: bookingData.additionalNotes,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting demo booking:', insertError);
      return NextResponse.json(
        { error: 'Failed to book demo' },
        { status: 500 }
      );
    }

    // Send calendar invite (if email service is configured)
    if (process.env.SMTP_HOST) {
      try {
        await sendCalendarInvite(bookingData);
      } catch (emailError) {
        console.error('Failed to send calendar invite:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Send confirmation email
    try {
      await sendConfirmationEmail(bookingData);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    // Track demo booking event
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'demo_booked',
        event_data: {
          name: bookingData.name,
          email: bookingData.email,
          company: bookingData.company,
          ticket_volume: bookingData.ticketVolume,
          current_tool: bookingData.currentTool,
          use_case: bookingData.useCase,
          preferred_date: bookingData.preferredDate,
          preferred_time: bookingData.preferredTime,
        },
        created_at: new Date().toISOString(),
      });

    // Create lead if doesn't exist
    await supabaseAdmin
      .from('leads')
      .upsert({
        email: bookingData.email,
        name: bookingData.name,
        company: bookingData.company,
        source: 'demo_booking',
        status: 'qualified',
        ticket_volume: parseTicketVolume(bookingData.ticketVolume),
        current_tool: bookingData.currentTool,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'email'
      });

    console.log(`Demo booked for ${bookingData.email} on ${bookingData.preferredDate}`);

    return NextResponse.json({
      success: true,
      message: 'Demo booked successfully',
      booking: {
        id: booking.id,
        date: bookingData.preferredDate,
        time: bookingData.preferredTime,
      }
    });

  } catch (error) {
    console.error('Demo booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function parseTicketVolume(volume: string): number {
  const volumeMap: Record<string, number> = {
    'Less than 100 tickets/month': 50,
    '100-500 tickets/month': 300,
    '500-1,000 tickets/month': 750,
    '1,000-5,000 tickets/month': 3000,
    '5,000+ tickets/month': 7500,
  };
  return volumeMap[volume] || 0;
}

async function sendCalendarInvite(bookingData: any) {
  // This would integrate with your calendar service (Google Calendar, Outlook, etc.)
  // For now, we'll just log the calendar invite details
  
  const calendarEvent = {
    summary: 'SupportIQ Demo',
    description: `Demo for ${bookingData.company}\n\nUse Case: ${bookingData.useCase}\nCurrent Tool: ${bookingData.currentTool}\nTicket Volume: ${bookingData.ticketVolume}\n\nAdditional Notes: ${bookingData.additionalNotes || 'None'}`,
    start: {
      dateTime: `${bookingData.preferredDate}T${convertTimeTo24Hour(bookingData.preferredTime)}:00`,
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: `${bookingData.preferredDate}T${convertTimeTo24Hour(bookingData.preferredTime)}:30`,
      timeZone: 'America/New_York',
    },
    attendees: [
      { email: bookingData.email, name: bookingData.name },
      { email: 'demo@supportiq.ai', name: 'SupportIQ Team' },
    ],
    conferenceData: {
      createRequest: {
        requestId: `demo-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  console.log('Calendar invite would be created:', calendarEvent);

  // TODO: Integrate with actual calendar service
  // await createCalendarEvent(calendarEvent);
}

function convertTimeTo24Hour(time: string): string {
  const [timeStr, period] = time.split(' ');
  const [hours, minutes] = timeStr.split(':');
  let hour = parseInt(hours);
  
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

async function sendConfirmationEmail(bookingData: any) {
  const emailContent = {
    to: bookingData.email,
    subject: 'Your SupportIQ Demo is Confirmed! 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Demo Confirmed!</h1>
        
        <p>Hi ${bookingData.name},</p>
        
        <p>Great news! Your SupportIQ demo has been confirmed. Here are the details:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Demo Details</h3>
          <p><strong>Date:</strong> ${new Date(bookingData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <p><strong>Time:</strong> ${bookingData.preferredTime} EST</p>
          <p><strong>Duration:</strong> 30 minutes</p>
          <p><strong>Format:</strong> Video call (Zoom/Google Meet)</p>
        </div>
        
        <p><strong>What to expect:</strong></p>
        <ul>
          <li>Personalized walkthrough of SupportIQ</li>
          <li>Live AI response demonstration</li>
          <li>Integration setup for ${bookingData.currentTool || 'your current tool'}</li>
          <li>ROI calculation for your ${bookingData.ticketVolume} ticket volume</li>
          <li>Q&A session</li>
        </ul>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Before the demo:</strong></p>
          <p style="margin: 5px 0 0 0;">We'll send you a calendar invite with the video call link. You'll also get access to a trial account so you can explore SupportIQ before our call.</p>
        </div>
        
        <p>If you need to reschedule or have any questions, just reply to this email.</p>
        
        <p>Looking forward to showing you how SupportIQ can transform your support operations!</p>
        
        <p>Best regards,<br>The SupportIQ Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          SupportIQ Demo Team<br>
          demo@supportiq.ai
        </p>
      </div>
    `
  };

  console.log('Confirmation email would be sent:', {
    to: emailContent.to,
    subject: emailContent.subject
  });

  // TODO: Integrate with actual email service
  // await sendEmail(emailContent);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Get demo bookings for email
    const { data: bookings, error } = await supabaseAdmin
      .from('demo_bookings')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching demo bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Demo booking retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 