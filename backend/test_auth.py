"""
Quick test script to verify authentication is working correctly.
Run this locally before deploying to ensure everything works.
"""
from app.auth import hash_password, verify_password

def test_auth():
    """Test password hashing and verification."""
    print("Testing authentication system...")
    print("-" * 50)
    
    # Test 1: Hash a password
    test_password = "12345"
    print(f"\n1. Hashing password: '{test_password}'")
    hashed = hash_password(test_password)
    print(f"   ✓ Hash generated: {hashed[:50]}...")
    
    # Test 2: Verify correct password
    print(f"\n2. Verifying correct password...")
    if verify_password(test_password, hashed):
        print(f"   ✓ Correct password verified successfully")
    else:
        print(f"   ✗ ERROR: Correct password failed verification!")
        return False
    
    # Test 3: Verify wrong password
    print(f"\n3. Verifying wrong password...")
    if not verify_password("wrong_password", hashed):
        print(f"   ✓ Wrong password correctly rejected")
    else:
        print(f"   ✗ ERROR: Wrong password was accepted!")
        return False
    
    # Test 4: Test with longer password
    long_password = "this_is_a_much_longer_password_with_special_chars!@#$%"
    print(f"\n4. Testing with longer password...")
    hashed_long = hash_password(long_password)
    if verify_password(long_password, hashed_long):
        print(f"   ✓ Long password works correctly")
    else:
        print(f"   ✗ ERROR: Long password failed!")
        return False
    
    # Test 5: Verify each hash is unique (salt working)
    print(f"\n5. Verifying unique salts...")
    hash1 = hash_password(test_password)
    hash2 = hash_password(test_password)
    if hash1 != hash2:
        print(f"   ✓ Each hash is unique (salt working)")
    else:
        print(f"   ✗ ERROR: Hashes are identical (salt not working)!")
        return False
    
    print("\n" + "=" * 50)
    print("✓ All authentication tests passed!")
    print("=" * 50)
    return True

if __name__ == "__main__":
    try:
        success = test_auth()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
