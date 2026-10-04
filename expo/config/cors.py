from django.http import HttpResponse
from django.conf import settings


class DevCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        local_origins = {
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://[::1]:5173",
        }
        configured_origins = {
            origin.strip().rstrip("/")
            for origin in getattr(settings, "CORS_ALLOWED_ORIGINS", "").split(",")
            if origin.strip()
        }
        self.allowed_origins = local_origins | configured_origins

    def __call__(self, request):
        if request.method == "OPTIONS":
            response = HttpResponse(status=200)
        else:
            response = self.get_response(request)

        origin = request.headers.get("Origin")
        if origin in self.allowed_origins:
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            response["Access-Control-Allow-Credentials"] = "true"

        return response
