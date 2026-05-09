<?php

namespace App\Mail;

use App\Models\Setting;
use App\Models\Testimonial;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Admin notification when a customer review is submitted as pending
 * (PRD §6.4.2). Links straight to the Filament edit page so the moderator
 * can approve/reject in one click.
 */
class PendingReviewNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Testimonial $testimonial)
    {
    }

    public function envelope(): Envelope
    {
        $recipient = Setting::get('company.email')
            ?: config('mail.inquiry_to')
            ?: 'export@destino.jp';

        return new Envelope(
            to: [new Address($recipient)],
            subject: "New review pending approval — {$this->testimonial->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.reviews.admin',
            with: [
                'testimonial' => $this->testimonial,
                'adminUrl' => rtrim((string) config('app.url'), '/').'/admin/testimonials/'.$this->testimonial->id.'/edit',
                'brandColor' => '#32498F',
            ],
        );
    }
}
