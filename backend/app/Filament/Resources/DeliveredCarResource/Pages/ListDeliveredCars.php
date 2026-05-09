<?php

namespace App\Filament\Resources\DeliveredCarResource\Pages;

use App\Filament\Resources\DeliveredCarResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDeliveredCars extends ListRecords
{
    protected static string $resource = DeliveredCarResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
