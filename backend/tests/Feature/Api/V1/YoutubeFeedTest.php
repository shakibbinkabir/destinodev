<?php

use App\Services\YouTubeFeedService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
    Config::set('services.youtube.channel_id', 'UC9r_ugFs9RL4OkeEAwztQ7g');
});

function fakeYoutubeXml(array $videos = []): string
{
    if ($videos === []) {
        $videos = [
            ['id' => 'aaaa1111aaa', 'title' => 'Land Cruiser walk-around', 'published' => '2026-05-08T01:00:00+00:00', 'views' => 1234],
            ['id' => 'bbbb2222bbb', 'title' => 'Auction haul — May', 'published' => '2026-05-01T01:00:00+00:00', 'views' => 5678],
        ];
    }

    $entries = '';
    foreach ($videos as $v) {
        $entries .= <<<XML
        <entry>
          <id>yt:video:{$v['id']}</id>
          <yt:videoId>{$v['id']}</yt:videoId>
          <yt:channelId>UC9r_ugFs9RL4OkeEAwztQ7g</yt:channelId>
          <title>{$v['title']}</title>
          <published>{$v['published']}</published>
          <media:group>
            <media:thumbnail url="https://i.ytimg.com/vi/{$v['id']}/hqdefault.jpg" width="480" height="360" />
            <media:thumbnail url="https://i.ytimg.com/vi/{$v['id']}/maxresdefault.jpg" width="1280" height="720" />
            <media:community>
              <media:statistics views="{$v['views']}" />
            </media:community>
          </media:group>
        </entry>
        XML;
    }

    return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"
              xmlns:media="http://search.yahoo.com/mrss/"
              xmlns="http://www.w3.org/2005/Atom">
          <title>Destino Channel</title>
          {$entries}
        </feed>
        XML;
}

it('fetches the YouTube RSS feed, parses videos, and caches the result', function () {
    Http::fake([
        'youtube.com/feeds/videos.xml*' => Http::response(fakeYoutubeXml(), 200),
    ]);

    $response = $this->getJson('/api/v1/youtube-feed');

    $response->assertStatus(200);
    $response->assertJsonPath('meta.stale', false);
    $response->assertJsonPath('data.0.videoId', 'aaaa1111aaa');
    $response->assertJsonPath('data.0.title', 'Land Cruiser walk-around');
    $response->assertJsonPath('data.0.views', 1234);
    expect($response->json('data.0.thumbnail'))->toContain('maxresdefault');

    $response = $this->getJson('/api/v1/youtube-feed');
    $response->assertStatus(200);

    Http::assertSentCount(1);
});

it('returns last_known with stale=true when upstream fails', function () {
    Cache::forever('youtube_feed:UC9r_ugFs9RL4OkeEAwztQ7g:last_known', [
        ['videoId' => 'cccc3333ccc', 'title' => 'Cached video', 'published' => null, 'thumbnail' => null, 'views' => null],
    ]);

    Http::fake([
        'youtube.com/feeds/videos.xml*' => Http::response('', 500),
    ]);

    $response = $this->getJson('/api/v1/youtube-feed');

    $response->assertStatus(200);
    $response->assertJsonPath('meta.stale', true);
    $response->assertJsonPath('data.0.videoId', 'cccc3333ccc');
});

it('returns 503 when upstream fails and there is no cached fallback', function () {
    Http::fake([
        'youtube.com/feeds/videos.xml*' => Http::response('', 500),
    ]);

    $this->getJson('/api/v1/youtube-feed')->assertStatus(503);
});

it('caps the result at six videos even if the feed has more', function () {
    $videos = [];
    for ($i = 1; $i <= 9; $i++) {
        $videos[] = ['id' => "vid{$i}xxxxxxx", 'title' => "Video {$i}", 'published' => '2026-05-01T01:00:00+00:00', 'views' => $i * 100];
    }

    Http::fake([
        'youtube.com/feeds/videos.xml*' => Http::response(fakeYoutubeXml($videos), 200),
    ]);

    $response = $this->getJson('/api/v1/youtube-feed');

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(YouTubeFeedService::MAX_VIDEOS);
});
