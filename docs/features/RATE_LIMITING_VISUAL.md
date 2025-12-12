# 🎨 Rate Limiting - Visual Guide

## 📊 How It Works (Flow Diagram)

```
┌─────────────────────────────────────────────────────────────┐
│                    User Makes Request                        │
│              (e.g., POST /api/auth/signup)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Extract IP Address          │
         │   (e.g., 192.168.1.100)       │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │   Check Rate Limiter          │
         │   • Get request history       │
         │   • Filter to time window     │
         │   • Count recent requests     │
         └───────────┬───────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    UNDER LIMIT            OVER LIMIT
          │                     │
          ▼                     ▼
┌─────────────────┐   ┌─────────────────────┐
│ ✅ ALLOW        │   │ ❌ REJECT           │
│                 │   │                     │
│ • Add timestamp │   │ • Return 429        │
│ • Process req   │   │ • Send retry time   │
│ • Return 200/201│   │ • Log attempt       │
└─────────────────┘   └─────────────────────┘
```

## 🕐 Time Window Explained

### Example: 5 requests per hour

```
Timeline (1 hour = 3600 seconds)
─────────────────────────────────────────────────────

10:00 AM ──► Request 1  ✅ Allowed (1/5)
10:10 AM ──► Request 2  ✅ Allowed (2/5)
10:20 AM ──► Request 3  ✅ Allowed (3/5)
10:30 AM ──► Request 4  ✅ Allowed (4/5)
10:40 AM ──► Request 5  ✅ Allowed (5/5)
10:50 AM ──► Request 6  ❌ BLOCKED! (Too many)

11:01 AM ──► Request 7  ✅ Allowed (1/5)
                          (Request 1 expired)
```

**Key Point:** The window is "rolling", not fixed. After 1 hour from Request 1, it expires and doesn't count anymore.

## 💾 Memory Storage

```
Rate Limiter State:
┌─────────────────────────────────────────┐
│  IP: 192.168.1.100                      │
│  Timestamps: [                          │
│    1702123456,  ← 10:00 AM             │
│    1702124056,  ← 10:10 AM             │
│    1702124656,  ← 10:20 AM             │
│  ]                                      │
│  Current Count: 3/5                     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  IP: 192.168.1.200                      │
│  Timestamps: [                          │
│    1702125000,  ← 10:30 AM             │
│  ]                                      │
│  Current Count: 1/5                     │
└─────────────────────────────────────────┘

Every hour: Cleanup removes old timestamps
```

## 🔄 Cleanup Process

```
Hour 1: Store requests
┌──────────────────────┐
│ IP1: [t1, t2, t3]    │
│ IP2: [t1, t2]        │
│ IP3: [t1]            │
└──────────────────────┘
         │
         │ ⏰ 1 hour passes
         ▼
Hour 2: Cleanup runs
┌──────────────────────┐
│ IP1: [t3]            │ ← Old timestamps removed
│ IP2: []              │ ← Empty, IP removed
│ IP3: [t1]            │
└──────────────────────┘
         │
         ▼
Result: Memory freed! 🎉
```

## 🌐 Multiple Users Scenario

### Scenario 1: Different IPs (Normal)

```
User A (IP: 192.168.1.100)
├─ Signup ✅ (1/5)
├─ Signup ✅ (2/5)
└─ Signup ✅ (3/5)

User B (IP: 192.168.1.200)  ← Different IP
├─ Signup ✅ (1/5)          ← Independent counter
├─ Signup ✅ (2/5)
└─ Signup ✅ (3/5)

✅ Both users can use the app independently
```

### Scenario 2: Same IP (Office/VPN)

```
User A ───┐
User B ───┼─→ Same IP: 192.168.1.100
User C ───┘

User A: Signup ✅ (1/5)
User B: Signup ✅ (2/5)  ← Shared counter!
User C: Signup ✅ (3/5)
User A: Signup ✅ (4/5)
User B: Signup ✅ (5/5)
User C: Signup ❌ (6/5) ← BLOCKED!

⚠️ They share the limit (limitation of IP-based approach)
```

## 📈 Rate Limits by Endpoint (Visual)

```
Strictest ←────────────────────────────→ Most Relaxed

┌────────────┬─────────────┬─────────────┬─────────────┐
│ Interview  │   Signup    │  Candidate  │     TTS     │
│   Start    │             │    Apply    │             │
│            │             │             │             │
│  3/day     │  5/hour     │  5/hour     │  100/hour   │
│  ⭐⭐⭐⭐⭐  │  ⭐⭐⭐⭐    │  ⭐⭐⭐      │  ⭐⭐        │
│            │             │             │             │
│ (AI cost)  │ (Spam)      │ (Resume)    │ (Voice API) │
└────────────┴─────────────┴─────────────┴─────────────┘
```

## 🎯 Real-World Example

### Legitimate User Journey

```
Day 1:
09:00 ─ Sign up              ✅ (1/5 signups)
09:05 ─ Create job           ✅ (1/20 jobs)
09:10 ─ Candidate applies    ✅ (1/5 applies)
09:15 ─ Start interview      ✅ (1/3 interviews) 🎤
10:00 ─ Start interview      ✅ (2/3 interviews) 🎤
11:00 ─ Start interview      ✅ (3/3 interviews) 🎤
11:30 ─ Try 4th interview    ❌ "Daily limit reached"

Day 2:
09:00 ─ Start interview      ✅ (1/3 interviews) 🎤
       ↑ Counter reset!

✅ User experience: Smooth for normal usage
```

### Malicious Bot Attack

```
Bot Attack (within 1 minute):

00:00 ─ Signup attempt 1     ✅
00:01 ─ Signup attempt 2     ✅
00:02 ─ Signup attempt 3     ✅
00:03 ─ Signup attempt 4     ✅
00:04 ─ Signup attempt 5     ✅
00:05 ─ Signup attempt 6     ❌ BLOCKED
00:06 ─ Signup attempt 7     ❌ BLOCKED
00:07 ─ Interview spam       ❌ BLOCKED
...
[Bot gives up] 🛡️

✅ System protected!
```

## 🔐 Error Response Format

```
Request:
POST /api/auth/signup (6th time)

Response:
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "detail": {
    "error": "Rate limit exceeded",
    "message": "Too many requests. Please try again in 3480 seconds.",
    "retry_after": 3480  ← Use this for countdown timer
  }
}
```

### Frontend Display

```javascript
// Convert to user-friendly format
const retryAfter = 3480; // seconds
const minutes = Math.floor(retryAfter / 60);
const hours = Math.floor(minutes / 60);

// Show to user:
"Please try again in 58 minutes" ⏰
```

## 🧩 Code Flow (Simplified)

```python
# 1. User requests signup
POST /api/auth/signup

# 2. Extract IP
client_ip = request.client.host  # "192.168.1.100"

# 3. Check limit
rate_limiter.check_rate_limit(
    ip=client_ip,
    max_requests=5,
    window_seconds=3600  # 1 hour
)

# 4. If under limit:
#    ├─ Add timestamp to IP's list
#    ├─ Continue processing
#    └─ Return success (201)

# 5. If over limit:
#    ├─ Calculate retry time
#    ├─ Raise HTTPException(429)
#    └─ Return error message
```

## 🎓 Key Takeaways

1. **Simple & Effective** ✅
   - No database needed
   - No Redis required
   - Works immediately

2. **IP-Based Tracking** 🌐
   - Each IP has independent counter
   - Shared IPs share limits (limitation)

3. **Rolling Window** 🕐
   - Not "X requests per calendar hour"
   - But "X requests in any 60-minute window"

4. **Automatic Cleanup** 🧹
   - Runs every hour
   - Prevents memory bloat

5. **Customizable** ⚙️
   - Easy to change limits
   - Per-endpoint configuration

## 🚀 Ready to Deploy!

Your rate limiting is:
- ✅ Implemented correctly
- ✅ Protecting expensive endpoints
- ✅ User-friendly error messages
- ✅ Memory efficient
- ✅ Production-ready for free tier

Happy deploying! 🎉
