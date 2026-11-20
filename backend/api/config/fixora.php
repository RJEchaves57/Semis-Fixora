<?php

return [
    // Staff (admin / maintenance) can only self-register with these codes. Leave unset to disable
    // self-registration for that role; real systems should have admins invite staff instead.
    'staff_codes' => [
        'admin' => env('FIXORA_ADMIN_CODE'),
        'maintenance' => env('FIXORA_MAINTENANCE_CODE'),
    ],
];
