<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\PartnerResource;
use App\Models\Partner;
use Illuminate\Http\JsonResponse;

class PartnersController extends ApiController
{
    public function index(): JsonResponse
    {
        $partners = Partner::query()
            ->where('active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return $this->listResponse(PartnerResource::collection($partners));
    }
}
