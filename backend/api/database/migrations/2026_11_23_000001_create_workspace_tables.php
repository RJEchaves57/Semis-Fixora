<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('facilities')) {
            Schema::create('facilities', function (Blueprint $table) {
                $table->id();
                $table->text('name');
                $table->text('details')->default('');
                $table->string('condition')->default('Good');
                $table->integer('condition_percent')->default(90);
                $table->integer('open_issues')->default(0);
                $table->timestamp('created_at')->nullable();
            });
        }

        if (! Schema::hasTable('schedules')) {
            Schema::create('schedules', function (Blueprint $table) {
                $table->id();
                $table->string('time');
                $table->text('title');
                $table->text('location')->default('');
                $table->text('assignee')->default('');
                $table->string('status')->default('Upcoming');
                $table->string('duration')->default('30-60 min');
                $table->timestamp('created_at')->nullable();
            });
        }

        if (! Schema::hasTable('settings')) {
            Schema::create('settings', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->text('value');
                $table->timestamp('updated_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('facilities');
    }
};
