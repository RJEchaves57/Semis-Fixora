<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->nullable()->unique(); // FX-2049 ...
            $table->string('title');
            $table->text('description');
            $table->string('category', 50);
            $table->string('location');
            $table->string('priority', 10)->default('Medium');
            $table->string('status', 20)->default('Pending')->index();
            $table->foreignId('requester_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('decline_reason')->nullable();

            // Duplicate protection. `fingerprint` identifies "the same issue"; `open_fingerprint` is the
            // same value while the request is open and NULL once it is Declined/Resolved. NULLs never
            // collide in a UNIQUE index, so closed requests don't block a genuine new report.
            $table->string('fingerprint', 64)->index();
            $table->string('open_fingerprint', 64)->nullable()->unique();

            $table->timestamps();
        });

        Schema::create('request_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_request_id')->constrained()->cascadeOnDelete();
            $table->string('type', 10); // image | video
            $table->string('path');
            $table->string('original_name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_media');
        Schema::dropIfExists('maintenance_requests');
    }
};
