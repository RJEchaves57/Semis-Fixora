<?php

// Accept the configured frontend origin(s) plus any Render preview/production host.
// FRONTEND_URL can be a single URL; FRONTEND_URLS can be a comma-separated list.
$configured = array_filter(array_map(
    'trim',
    explode(',', env('FRONTEND_URLS', env('FRONTEND_URL', 'http://localhost:5180'))),
));

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_unique(array_merge(
        $configured,
        ['http://localhost:5180'],
    ))),
    'allowed_origins_patterns' => [
        '/^https:\/\/.*\.onrender\.com$/',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // bearer-token auth, no cookies
];
