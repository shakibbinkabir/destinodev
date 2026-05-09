<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\PageContentResource;
use App\Models\PageContent;
use Illuminate\Http\JsonResponse;

class PageContentsController extends ApiController
{
    public function show(string $slug): JsonResponse
    {
        $page = PageContent::query()->where('slug', $slug)->first();

        abort_if($page === null, 404, 'Page not found.');

        return $this->itemResponse(new PageContentResource($page));
    }
}
