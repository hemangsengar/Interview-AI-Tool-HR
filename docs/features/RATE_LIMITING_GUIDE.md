# 🛡️ Rate Limiting Guide

## Overview

Basic rate limiting has been implemented to protect the application from abuse on the free tier deployment. This prevents users from overwhelming the API with excessive requests.

## How It Works

Rate limiting is implemented using an **in-memory IP-based system**:
- Each IP address is tracked
- Requests are counted within a time window
- Once the limit is exceeded, requests are rejected with a 429 status code
- Old entries are automatically cleaned up every hour

## Rate Limits by Endpoint

### Authentication Endpoints

| Endpoint | Limit | Time Window | Reason |
|----------|-------|-------------|--------|
| `POST /api/auth/signup` | 5 requests | 1 hour | Prevent spam account creation |
| `POST /api/auth/login` | 10 requests | 5 minutes | Prevent brute force attacks |

### Job Management Endpoints

| Endpoint | Limit | Time Window | Reason |
|----------|-------|-------------|--------|
| `POST /api/jobs` | 20 requests | 24 hours | Limit job posting spam |
| `POST /api/jobs/{job_id}/candidates` | 5 requests | 1 hour | Limit candidate applications |

### Interview Endpoints

| Endpoint | Limit | Time Window | Reason |
|----------|-------|-------------|--------|
| `POST /api/interviews/{session_id}/start` | 3 requests | 24 hours | Protect AI API credits |
| `POST /api/interviews/tts` | 100 requests | 1 hour | Prevent TTS API abuse |

## Error Response

When rate limit is exceeded, the API returns:

```json
{
  "detail": {
    "error": "Rate limit exceeded",
    "message": "Too many requests. Please try again in 45 seconds.",
    "retry_after": 45
  }
}
```

**Status Code:** `429 Too Many Requests`

## Frontend Handling

### Example: Handle Rate Limit in React

```javascript
// api/authService.js
export const signup = async (userData) => {
  try {
    const response = await axios.post('/api/auth/signup', userData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      const detail = error.response.data.detail;
      throw new Error(detail.message || 'Too many requests. Please try again later.');
    }
    throw error;
  }
};

// Usage in component
const handleSignup = async () => {
  try {
    await signup({ name, email, password });
    // Success
  } catch (error) {
    if (error.message.includes('Rate limit')) {
      toast.error(error.message);
    }
  }
};
```

### Display User-Friendly Messages

```jsx
// Show countdown timer
const [retryAfter, setRetryAfter] = useState(null);

const handleRateLimitError = (error) => {
  if (error.response?.data?.detail?.retry_after) {
    setRetryAfter(error.response.data.detail.retry_after);
    
    // Countdown
    const timer = setInterval(() => {
      setRetryAfter(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }
};

// In JSX
{retryAfter && (
  <div className="alert alert-warning">
    Rate limit exceeded. Try again in {retryAfter} seconds.
  </div>
)}
```

## Customizing Rate Limits

### Modify Existing Limits

Edit the route file to change limits:

```python
# backend/app/routers/auth.py

@router.post("/signup")
async def signup(request: Request, ...):
    # Change from 5 to 10 signups per hour
    rate_limiter.check_rate_limit(
        request.client.host, 
        max_requests=10,  # ← Change this
        window_seconds=3600
    )
```

### Add Rate Limiting to New Endpoints

```python
from fastapi import Request
from ..middleware.rate_limiter import rate_limiter

@router.post("/my-new-endpoint")
async def my_endpoint(request: Request, ...):
    # Add rate limiting
    client_ip = request.client.host if request.client else "unknown"
    rate_limiter.check_rate_limit(
        client_ip,
        max_requests=20,      # Max 20 requests
        window_seconds=300    # Per 5 minutes
    )
    
    # Your endpoint logic here
    ...
```

## Limitations & Considerations

### Current Implementation

✅ **Pros:**
- Simple and lightweight
- No external dependencies (Redis, etc.)
- Works immediately on any deployment
- Zero configuration needed

❌ **Cons:**
- **Not shared across instances**: If you scale to multiple servers, each has its own rate limit counter
- **Memory storage**: Resets when server restarts
- **IP-based only**: Users behind the same NAT/VPN share limits

### Future Improvements

For production at scale, consider:

1. **Redis-based Rate Limiting**
   ```python
   # Install: pip install redis fastapi-limiter
   from redis import Redis
   from fastapi_limiter import FastAPILimiter
   
   @app.on_event("startup")
   async def startup():
       redis = Redis(host='localhost', port=6379)
       await FastAPILimiter.init(redis)
   
   @router.post("/signup")
   @limiter.limit("5/hour")
   async def signup(...):
       ...
   ```

2. **User-based Rate Limiting**
   - Track by user ID instead of IP
   - Better for authenticated endpoints
   - Prevents shared IP issues

3. **Dynamic Rate Limits**
   - Free users: 5 interviews/month
   - Paid users: Unlimited
   - Store limits in database

4. **Rate Limit Headers**
   ```python
   return Response(
       headers={
           "X-RateLimit-Limit": "100",
           "X-RateLimit-Remaining": "95",
           "X-RateLimit-Reset": "1640000000"
       }
   )
   ```

## Testing Rate Limits

### Manual Testing

```bash
# Test signup rate limit (should fail after 5 requests)
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test$i\",\"email\":\"test$i@example.com\",\"password\":\"password123\"}"
  echo ""
done
```

### Automated Testing

```python
# tests/test_rate_limiting.py
import pytest
from fastapi.testclient import TestClient

def test_signup_rate_limit(client: TestClient):
    # First 5 requests should succeed
    for i in range(5):
        response = client.post("/api/auth/signup", json={
            "name": f"User{i}",
            "email": f"user{i}@example.com",
            "password": "password123"
        })
        assert response.status_code in [201, 400]  # Success or duplicate
    
    # 6th request should be rate limited
    response = client.post("/api/auth/signup", json={
        "name": "User6",
        "email": "user6@example.com",
        "password": "password123"
    })
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.json()["detail"]["error"]
```

## Monitoring Rate Limits

### Add Logging

```python
# backend/app/middleware/rate_limiter.py
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    def check_rate_limit(self, ip: str, max_requests: int, window_seconds: int):
        # ... existing code ...
        
        if len(self.requests[ip]) >= max_requests:
            logger.warning(
                f"Rate limit exceeded: IP={ip}, "
                f"Limit={max_requests}/{window_seconds}s"
            )
            raise HTTPException(...)
```

### View Logs in Render

1. Go to your Render dashboard
2. Click on your backend service
3. Go to "Logs" tab
4. Search for "Rate limit exceeded"

## FAQ

### Q: Does rate limiting affect legitimate users?

**A:** The limits are set generously for normal usage:
- 5 signups/hour is enough for manual testing
- 3 interviews/day prevents API abuse while allowing demos
- Users are informed with clear error messages

### Q: What if I need to test and hit the limit?

**A:** Options:
1. Restart the backend (clears in-memory counters)
2. Use a VPN to change IP
3. Temporarily increase limits in code during development

### Q: Can users bypass this by changing IP?

**A:** Partially yes. For better protection, add:
- Email verification (prevents bots)
- CAPTCHA on signup (prevents automated abuse)
- User-based quotas (tracks per account, not IP)

### Q: How do I disable rate limiting?

**A:** Comment out the rate limit check:

```python
@router.post("/signup")
async def signup(request: Request, ...):
    # rate_limiter.check_rate_limit(...)  # ← Comment this out
    
    # Rest of your code
    ...
```

## Summary

✅ **Implemented:** Basic IP-based rate limiting on critical endpoints  
✅ **Protection Level:** Adequate for free-tier deployment and demo purposes  
✅ **User Impact:** Minimal - generous limits for legitimate use  
✅ **Next Steps:** Add email verification, CAPTCHA, and usage quotas  

For questions or issues, check the main project documentation or create an issue on GitHub.
