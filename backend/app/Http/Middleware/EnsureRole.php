<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  array<int, string>  $roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array((string) $user->role_id, $roles, true)) {
            return response()->json([
                'responseCode' => 403,
                'responseText' => 'You are not authorized to perform this action.',
                'responseData' => [],
            ], 403);
        }

        return $next($request);
    }
}
