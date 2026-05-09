<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180'],
            'phone' => ['nullable', 'string', 'max:40'],
            'country' => ['nullable', 'string', 'max:80'],
            'message' => ['required', 'string', 'max:5000'],
            'source' => ['required', 'in:contact_page,single_car,homepage,footer,other'],
            'car_id' => ['nullable', 'integer', 'exists:cars,id'],
            'car_reference' => ['nullable', 'string', 'max:120'],
        ];
    }
}
