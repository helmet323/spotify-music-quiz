/**
 * Creates a standardized JSON error response.
 */
export function errorResponse(message = "An error occurred", status = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Creates a standardized JSON success response.
 */
export function successResponse(data = {}, status = 200) {
  return new Response(JSON.stringify({ success: true, ...data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
