<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_log_in(): void
    {
        $user = User::factory()->create([
            'nick' => 'jp-admin',
            'role' => 'admin',
            'password' => 'secret123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'nick', 'name', 'email', 'role', 'photo', 'photo_url'],
            ]);
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $user = User::factory()->create([
            'nick' => 'jp-me',
            'role' => 'veterinario',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/auth/me');

        $response
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('nick', 'jp-me');
    }

    public function test_authenticated_user_can_update_profile_with_photo(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'nick' => 'jp-photo',
            'role' => 'veterinario',
        ]);

        $response = $this->actingAs($user, 'sanctum')->patch('/api/auth/me', [
            'name' => 'Nombre Actualizado',
            'photo' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('name', 'Nombre Actualizado');

        $user->refresh();

        $this->assertNotNull($user->photo);
        Storage::disk('public')->assertExists($user->photo);
        $this->assertStringContainsString('/storage/', $response->json('photo_url'));
    }
}
