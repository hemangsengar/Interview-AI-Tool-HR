#!/usr/bin/env python3
"""Test the new optimized /conversation endpoint."""
import asyncio
import time
from app.services.llm_service import llm_service


async def test_process_answer_and_respond():
    """Test the unified LLM call."""
    print("\n" + "=" * 60)
    print("Testing process_answer_and_respond() - UNIFIED LLM CALL")
    print("=" * 60)
    
    test_cases = [
        {
            "question": "What is your experience with Python?",
            "answer": "I've been using Python for 5 years. I've built web applications with Django and Flask, data pipelines with Pandas and Apache Spark, and machine learning models with scikit-learn and TensorFlow.",
            "skill": "Python",
            "is_last": False,
            "q_num": 1,
            "total": 5
        },
        {
            "question": "Can you explain what REST APIs are?",
            "answer": "Yeah, APIs are like... ways to connect things.",
            "skill": "API Development",
            "is_last": False,
            "q_num": 2,
            "total": 5
        },
        {
            "question": "Describe a challenging project you've worked on.",
            "answer": "Last year I led the redesign of our payment processing system. We migrated from a monolithic architecture to microservices, handling 10,000 transactions per second. The biggest challenge was ensuring zero downtime during the migration. We used a strangler fig pattern and extensive feature flags.",
            "skill": "System Design",
            "is_last": True,
            "q_num": 5,
            "total": 5
        }
    ]
    
    for i, tc in enumerate(test_cases):
        print(f"\n--- Test Case {i+1}: {tc['skill']} ---")
        print(f"Question: {tc['question'][:60]}...")
        print(f"Answer: {tc['answer'][:60]}...")
        print(f"Question {tc['q_num']}/{tc['total']} | Last: {tc['is_last']}")
        
        start = time.time()
        result = await llm_service.process_answer_and_respond(
            answer_text=tc['answer'],
            question_text=tc['question'],
            skill=tc['skill'],
            jd_context="Software Engineer role requiring Python, APIs, and system design skills.",
            question_type="technical"
        )
        elapsed = time.time() - start
        
        print(f"\n✅ Response ({elapsed:.2f}s):")
        print(f"  Spoken: \"{result['spoken_response']}\"")
        print(f"  Quality: {result['answer_quality']}")
        print(f"  Scores: C={result['scores']['correctness']:.1f} D={result['scores']['depth']:.1f} R={result['scores']['relevance']:.1f}")
        print(f"  Next: {result['next_action']}")
        if result.get('follow_up_question'):
            print(f"  Follow-up: {result['follow_up_question']}")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_process_answer_and_respond())
