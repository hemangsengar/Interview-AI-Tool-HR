"""Rate limiting middleware for API protection."""
from fastapi import Request, HTTPException
from collections import defaultdict
from datetime import datetime, timedelta
import time
from typing import Dict, List


class RateLimiter:
    """Simple in-memory rate limiter based on IP address."""
    
    def __init__(self):
        # Store: {ip_address: [(timestamp1, timestamp2, ...)]}
        self.requests: Dict[str, List[float]] = defaultdict(list)
        
    def check_rate_limit(
        self, 
        ip: str, 
        max_requests: int = 10, 
        window_seconds: int = 60
    ):
        """
        Check if IP has exceeded rate limit.
        
        Args:
            ip: IP address to check
            max_requests: Maximum number of requests allowed
            window_seconds: Time window in seconds
            
        Raises:
            HTTPException: If rate limit is exceeded
        """
        now = time.time()
        
        # Remove old requests outside the time window
        self.requests[ip] = [
            req_time for req_time in self.requests[ip]
            if now - req_time < window_seconds
        ]
        
        # Check if limit exceeded
        if len(self.requests[ip]) >= max_requests:
            # Calculate when the limit will reset
            oldest_request = min(self.requests[ip])
            reset_time = int(oldest_request + window_seconds - now)
            
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Please try again in {reset_time} seconds.",
                    "retry_after": reset_time
                }
            )
        
        # Add current request timestamp
        self.requests[ip].append(now)
        
    def cleanup_old_entries(self):
        """Remove old entries to prevent memory bloat."""
        now = time.time()
        cleanup_threshold = 3600  # Remove entries older than 1 hour
        
        for ip in list(self.requests.keys()):
            self.requests[ip] = [
                req_time for req_time in self.requests[ip]
                if now - req_time < cleanup_threshold
            ]
            
            # Remove IP if no recent requests
            if not self.requests[ip]:
                del self.requests[ip]


# Global rate limiter instance
rate_limiter = RateLimiter()
