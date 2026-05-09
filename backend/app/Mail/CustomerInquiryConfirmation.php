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

/**
 * Polite acknowledgement to the customer who just submitted an inquiry
 * (PRD §6.4.1). Includes WhatsApp + email fallback so they can reach us
 * synchronously while we get back to them.
 */
class CustomerInquiryConfirmation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Inquiry $inquiry)
    {
        $this->inquiry->loadMissing('car');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            to: [new Address($this->inquiry->email, $this->inquiry->name)],
            subject: 'We received your inquiry — Destino',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.inquiries.customer',
            with: [
                'inquiry' => $this->inquiry,
                'car' => $this->inquiry->car,
                'companyName' => Setting::get('company.name', 'Destino'),
                'companyEmail' => Setting::get('company.email', 'export@destino.jp'),
                'whatsappUrl' => Setting::get('company.whatsapp_url'),
                'brandColor' => '#32498F',
            ],
        );
    }
}
