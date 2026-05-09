<?php

namespace App\Filament\Resources\DeliveredCarResource\Pages;

use App\Filament\Resources\DeliveredCarResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDeliveredCar extends EditRecord
{
    protected static string $resource = DeliveredCarResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
