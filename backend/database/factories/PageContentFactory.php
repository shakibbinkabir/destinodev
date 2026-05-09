<?php

namespace Database\Factories;

use App\Models\PageContent;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PageContent>
 */
class PageContentFactory extends Factory
{
    public function definition(): array
    {
        $title = $this->faker->sentence(3);

        return [
            'slug' => Str::slug($title).'-'.$this->faker->unique()->numberBetween(1, 9999),
            'title' => $title,
            'body' => $this->faker->paragraphs(3, true),
            'meta_title' => $title,
            'meta_description' => $this->faker->sentence(20),
            'extras' => null,
        ];
    }
}
