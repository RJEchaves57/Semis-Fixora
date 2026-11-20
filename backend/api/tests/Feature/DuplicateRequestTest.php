<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DuplicateRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function payload(array $override = []): array
    {
        return array_merge([
            'title' => 'Leaking faucet',
            'description' => 'Drips constantly.',
            'category' => 'Plumbing',
            'location' => 'Science Lab · Building C',
            'priority' => 'Medium',
            'images' => [UploadedFile::fake()->create('a.jpg', 100, 'image/jpeg')],
            'video' => UploadedFile::fake()->create('clip.mp4', 500, 'video/mp4'),
        ], $override);
    }

    private function submitAs(User $user, array $override = [])
    {
        Sanctum::actingAs($user);

        return $this->postJson('/api/requests', $this->payload($override));
    }

    public function test_first_report_is_accepted(): void
    {
        $this->submitAs(User::factory()->create(['role' => 'user']))
            ->assertCreated()
            ->assertJsonPath('status', 'Pending');
    }

    public function test_same_issue_is_rejected_even_with_different_case_punctuation_or_reporter(): void
    {
        $this->submitAs(User::factory()->create(['role' => 'user']))->assertCreated();

        $this->submitAs(User::factory()->create(['role' => 'user']), [
            'title' => '  LEAKING   faucet!! ',
            'location' => 'science lab, building c',
            'description' => 'A completely different description.',
        ])->assertStatus(409)->assertJsonStructure(['message', 'duplicate_of']);

        $this->assertDatabaseCount('maintenance_requests', 1);
    }

    public function test_different_location_is_not_a_duplicate(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $this->submitAs($user)->assertCreated();
        $this->submitAs($user, ['location' => 'Room 105 · Building B'])->assertCreated();
    }

    public function test_a_declined_report_no_longer_blocks_a_new_one(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $admin = User::factory()->create(['role' => 'admin']);

       $code = $this->submitAs($user)->assertCreated()->json('id');

       Sanctum::actingAs($admin);
       $this->postJson("/api/requests/{$code}/decline", ['reason' => 'Out of scope'])->assertOk();

        $this->submitAs($user)->assertCreated();
    }

    public function test_only_users_can_create_requests(): void
    {
        $this->submitAs(User::factory()->create(['role' => 'admin']))->assertForbidden();
    }
}
