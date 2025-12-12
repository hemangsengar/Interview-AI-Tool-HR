# SECRET_KEY Explained

## What is SECRET_KEY?

The `SECRET_KEY` is a random string used to:
- **Sign JWT tokens** for authentication
- **Encrypt sensitive data**
- **Verify token authenticity**

Think of it like a password that your backend uses to create and verify login tokens.

## Your SECRET_KEY

I've generated a secure random key for you:
```
bd4c26d481eedce16c4de2b0ddd54026c73d2882be5352d2ced85531fa821a24
```

This is already added to `backend/.env`

## For Render Deployment

When you set environment variables on Render, use this:

```
SECRET_KEY=bd4c26d481eedce16c4de2b0ddd54026c73d2882be5352d2ced85531fa821a24
```

## Security Notes

✅ **Keep it secret**: Never share this key publicly  
✅ **Use different keys**: Use different keys for dev and production  
✅ **64 characters**: This is a 256-bit key (very secure)  
✅ **Random**: Generated using Python's `secrets` module  

## How to Generate Your Own

If you want to generate a new one:

**Option 1: Python**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Option 2: OpenSSL**
```bash
openssl rand -hex 32
```

**Option 3: Online** (not recommended for production)
- Use a password generator
- Make it at least 32 characters
- Use random letters and numbers

## What Happens if Someone Gets Your Key?

If someone gets your SECRET_KEY, they can:
- Create fake login tokens
- Impersonate any user
- Access your system

**Solution**: Generate a new key and redeploy

## For Your Deployment

Your environment variables on Render should be:

```
DATABASE_URL=postgresql://interview_user:z3WjOmLZhr6HVfnYwpQA4OlTpqvEIxrN@dpg-d4nc22buibrs739a1vs0-a/interview_db_cy4i

GEMINI_API_KEY=AIzaSyDI62P1Qv5uNy7Eb7La3KKnPCVtw0vScaw

SARVAM_API_KEY=sk_wnijjvf0_elEfAcD7M8EudN6d62dedozt

SECRET_KEY=bd4c26d481eedce16c4de2b0ddd54026c73d2882be5352d2ced85531fa821a24

FRONTEND_URL=https://your-app.vercel.app
```

**Remember**: Replace `https://your-app.vercel.app` with your actual Vercel URL!

## Summary

✅ SECRET_KEY is for JWT token signing  
✅ I've generated a secure one for you  
✅ It's already in `backend/.env`  
✅ Add it to Render environment variables  
✅ Keep it secret!  

---

**You're ready to deploy!** 🚀
