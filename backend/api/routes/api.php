<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\StaffController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/staff', [StaffController::class, 'index']);

    Route::get('/requests', [RequestController::class, 'index']);
    Route::post('/requests', [RequestController::class, 'store']);
    Route::get('/requests/{maintenanceRequest}', [RequestController::class, 'show']);
    Route::post('/requests/{maintenanceRequest}/approve', [RequestController::class, 'approve']);
    Route::post('/requests/{maintenanceRequest}/decline', [RequestController::class, 'decline']);
    Route::post('/requests/{maintenanceRequest}/assign', [RequestController::class, 'assign']);
    Route::post('/requests/{maintenanceRequest}/start', [RequestController::class, 'start']);
    Route::post('/requests/{maintenanceRequest}/resolve', [RequestController::class, 'resolve']);
});
