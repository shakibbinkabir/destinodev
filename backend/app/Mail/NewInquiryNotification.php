<?php

namespace App\Mail;

use App\Models\Inquiry;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

/**
 * Admin notification for new public inquiries (PRD §6.4.1).
 *
 * Recipient resolution order:
 *   1. settings.company.email
 *   2. env MAIL_INQUIRY_TO
 *   3. fallback "export@destino.jp"
 *
 * The mailable is queued through {@see ShouldQueue} so the inquiry POST
 * returns 201 immediately while SMTP delivery happens on the database queue
 * processed by the scheduled queue:work (PRD §6.4.7).
 */
class NewInquiryNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Inquiry $inquiry)
    {
        $this->inquiry->loadMissing('car');
    }

    public function envelope(): Envelope
    {
        $recipient = Setting::get('company.email')
            ?: config('mail.inquiry_to')
            ?: 'export@destino.jp';

        $reference = $this->inquiry->car
            ? trim($this->inquiry->car->make.' '.$this->inquiry->car->model)
            : ($this->inquiry->car_reference ?: 'general');

        return new Envelope(
            to: [new Address($recipient)],
            replyTo: [new Address($this->inquiry->email, $this->inquiry->name)],
            subject: "New inquiry — {$this->inquiry->name} — {$reference}",
        );
    }

    public function content(): Content
    {
        $jst = $this->inquiry->created_at
            ? $this->inquiry->created_at->copy()->setTimezone('Asia/Tokyo')
            : Carbon::now('Asia/Tokyo');

        return new Content(
            markdown: 'emails.inquiries.admin',
            with: [
                'inquiry' => $this->inquiry,
                'car' => $this->inquiry->car,
                'carAdminUrl' => $this->inquiry->car
                    ? rtrim((string) config('app.url'), '/').'/admin/cars/'.$this->inquiry->car->id
                    : null,
                'submittedAtJst' => $jst->format('Y-m-d H:i').' JST',
                'brandColor' => '#32498F',
            ],
        );
    }
}
