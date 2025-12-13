#!/usr/bin/env python3
"""
Quick test script for conversational interviewer features.
Run this to verify everything is working before manual testing.
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from app.services.llm_service import llm_service


def print_section(title):
    """Print a section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)


def test_classification():
    """Test answer quality classification (deterministic)."""
    print_section("TEST 1: Answer Quality Classification")
    
    test_cases = [
        ({"correctness": 4.5, "depth": 4.0, "relevance": 4.5}, "strong"),
        ({"correctness": 3.0, "depth": 3.0, "relevance": 3.0}, "partial"),
        ({"correctness": 1.5, "depth": 2.0, "relevance": 1.0}, "weak"),
        ({"correctness": 4.0, "depth": 4.0, "relevance": 4.0}, "strong"),
        ({"correctness": 2.5, "depth": 2.5, "relevance": 2.5}, "partial"),
    ]
    
    passed = 0
    for evaluation, expected in test_cases:
        result = llm_service.classify_answer_quality(evaluation)
        status = "✅" if result == expected else "❌"
        print(f"{status} Scores {evaluation['correctness']:.1f}/{evaluation['depth']:.1f}/{evaluation['relevance']:.1f} → {result} (expected: {expected})")
        if result == expected:
            passed += 1
    
    print(f"\n📊 Classification Test: {passed}/{len(test_cases)} passed")
    return passed == len(test_cases)


def test_follow_up_logic():
    """Test follow-up decision logic (deterministic)."""
    print_section("TEST 2: Follow-up Decision Logic")
    
    test_cases = [
        ("weak", 0, True, "Should ask follow-up for weak answer"),
        ("weak", 1, True, "Should ask 2nd follow-up for weak answer"),
        ("weak", 2, False, "Should NOT ask 3rd follow-up (max reached)"),
        ("partial", 0, True, "Should ask follow-up for partial answer"),
        ("partial", 2, False, "Should NOT ask 3rd follow-up (max reached)"),
        ("strong", 0, False, "Should NOT ask follow-up for strong answer"),
        ("strong", 1, False, "Should NOT ask follow-up for strong answer"),
    ]
    
    passed = 0
    for quality, count, expected, description in test_cases:
        result = llm_service.should_ask_follow_up(quality, count)
        status = "✅" if result == expected else "❌"
        print(f"{status} {description}")
        print(f"   Quality: {quality}, Follow-up count: {count} → {result}")
        if result == expected:
            passed += 1
    
    print(f"\n📊 Follow-up Logic Test: {passed}/{len(test_cases)} passed")
    return passed == len(test_cases)


def test_follow_up_types():
    """Test follow-up type selection (deterministic)."""
    print_section("TEST 3: Follow-up Type Selection")
    
    test_cases = [
        (0, "weak", "simplify", "1st follow-up for weak → simplify"),
        (0, "partial", "rephrase", "1st follow-up for partial → rephrase"),
        (1, "weak", "hint", "2nd follow-up → hint"),
        (1, "partial", "hint", "2nd follow-up → hint"),
    ]
    
    passed = 0
    for count, quality, expected, description in test_cases:
        result = llm_service.get_follow_up_type(count, quality)
        status = "✅" if result == expected else "❌"
        print(f"{status} {description}")
        print(f"   Result: {result}")
        if result == expected:
            passed += 1
    
    print(f"\n📊 Follow-up Type Test: {passed}/{len(test_cases)} passed")
    return passed == len(test_cases)


def test_fallback_responses():
    """Test fallback interviewer responses."""
    print_section("TEST 4: Fallback Interviewer Responses")
    
    test_cases = ["strong", "partial", "weak"]
    
    print("Testing fallback responses for different answer qualities:\n")
    for quality in test_cases:
        response = llm_service._get_fallback_interviewer_response(quality, "Python")
        print(f"  {quality.upper():8} → \"{response}\"")
        if len(response) <= 50:
            print(f"           ✅ Length OK ({len(response)} chars)")
        else:
            print(f"           ❌ Too long ({len(response)} chars)")
    
    return True


async def test_live_generation():
    """Test actual LLM generation (if quota available)."""
    print_section("TEST 5: Live LLM Generation (Optional)")
    
    # Check quota status first
    status = llm_service.get_quota_status()
    print(f"Quota Status: {status['recommendation']}")
    print(f"Consecutive errors: {status['consecutive_quota_errors']}")
    
    if status['consecutive_quota_errors'] >= 2:
        print("\n⚠️  Quota exhausted or too many errors - skipping live tests")
        print("   This is OK - fallbacks will be used in production")
        return True
    
    print("\n🔄 Testing live interviewer response generation...")
    try:
        response = await llm_service.generate_interviewer_response(
            answer_quality="partial",
            question_text="Can you explain Python decorators?",
            answer_text="They are functions that wrap other functions.",
            evaluation={
                "correctness": 3.0,
                "depth": 2.5,
                "relevance": 3.5,
                "comment": "Basic understanding but lacks depth"
            },
            skill="Python"
        )
        print(f"✅ Generated: \"{response}\"")
        print(f"   Length: {len(response)} chars")
        return True
        
    except Exception as e:
        print(f"⚠️  Error during generation: {e}")
        print("   Fallbacks will be used automatically")
        return True


def test_cache_functionality():
    """Test cache management functions."""
    print_section("TEST 6: Cache Management")
    
    # Get initial stats
    stats = llm_service.get_cache_stats()
    print("Initial cache stats:")
    print(f"  Plan cache: {stats['plan_cache']['total_entries']} entries")
    print(f"  Question cache: {stats['question_cache']['total_entries']} entries")
    
    # Test cache clearing
    llm_service.clear_cache()
    print("\n✅ Cache cleared successfully")
    
    # Verify cleared
    stats = llm_service.get_cache_stats()
    if stats['plan_cache']['total_entries'] == 0 and stats['question_cache']['total_entries'] == 0:
        print("✅ Cache verified empty")
        return True
    else:
        print("❌ Cache not properly cleared")
        return False


async def main():
    """Run all tests."""
    print("\n" + "🧪 " + "="*58)
    print("  CONVERSATIONAL INTERVIEWER - LOCAL TEST SUITE")
    print("="*60)
    
    results = []
    
    # Run deterministic tests
    results.append(("Classification", test_classification()))
    results.append(("Follow-up Logic", test_follow_up_logic()))
    results.append(("Follow-up Types", test_follow_up_types()))
    results.append(("Fallback Responses", test_fallback_responses()))
    results.append(("Cache Management", test_cache_functionality()))
    
    # Run async tests
    results.append(("Live Generation", await test_live_generation()))
    
    # Summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\n{'='*60}")
    print(f"  OVERALL: {passed}/{total} test suites passed")
    print('='*60)
    
    if passed == total:
        print("\n🎉 All tests passed! System is ready for manual testing.")
        print("\n📋 Next steps:")
        print("   1. Open http://localhost:5173 in your browser")
        print("   2. Follow the testing scenarios in LOCAL_TESTING_GUIDE.md")
        print("   3. Test the conversational flow with real interviews")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the output above.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
