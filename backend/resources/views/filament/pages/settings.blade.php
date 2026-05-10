<x-filament-panels::page>
    <form wire:submit="save" class="space-y-6">
        {{ $this->form }}

        <div class="flex items-center justify-end gap-3 pt-2">
            <x-filament::button
                type="submit"
                size="lg"
                icon="heroicon-m-check"
            >
                Save changes
            </x-filament::button>
        </div>
    </form>
</x-filament-panels::page>
