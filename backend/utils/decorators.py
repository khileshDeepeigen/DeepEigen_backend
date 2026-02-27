"""
Custom decorators for API endpoints and views.
"""
from functools import wraps
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)


def api_login_required(view_func):
    """
    API version of @login_required decorator.
    
    Returns 401 JSON response instead of redirecting to login page.
    This is the correct behavior for JSON/REST API endpoints.
    
    Usage:
        @api_login_required
        @csrf_protect
        def my_api_view(request):
            return JsonResponse({"data": "..."})
    
    Important: Apply @api_login_required BEFORE @csrf_protect to avoid 
    unnecessary CSRF validation on unauthenticated requests.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Allow CORS preflight requests
        if request.method == 'OPTIONS':
            return view_func(request, *args, **kwargs)
        
        # Check authentication
        if not request.user.is_authenticated:
            client_ip = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(
                f"Unauthorized API access attempt from {client_ip} to {request.path} {request.method}"
            )
            
            return JsonResponse(
                {
                    "detail": "Authentication required",
                    "code": "AUTH_REQUIRED"
                },
                status=401
            )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper
