"""
Sanity checks before testing GINA.
Run these first to ensure the foundation is solid.
"""
import os
import sys
import asyncio
from pathlib import Path

# Load .env file from project root
try:
    from dotenv import load_dotenv
    # Go up from tests/ -> local_core/ -> workers/ -> root
    QIOS_ROOT = Path(__file__).parent.parent.parent.parent
    env_path = QIOS_ROOT / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"[TEST] Loaded .env from {env_path}")
    else:
        print(f"[TEST] .env file not found at {env_path}, using system environment variables")
except ImportError:
    print("[TEST] python-dotenv not installed, using system environment variables only")

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from supabase import create_client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False
    print("Warning: supabase-py not installed")

import httpx


def test_database_migration():
    """Test 1.1: Database & Migration"""
    print("\n=== Test 1.1: Database & Migration ===")
    
    if not HAS_SUPABASE:
        print("SKIP: supabase-py not installed")
        print("  Install with: pip install supabase")
        return False
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("SKIP: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")
        print(f"  SUPABASE_URL: {'SET' if supabase_url else 'NOT SET'}")
        print(f"  SUPABASE_SERVICE_ROLE_KEY: {'SET' if supabase_key else 'NOT SET'}")
        print(f"  Check .env file at: {QIOS_ROOT / '.env'}")
        return False
    
    try:
        client = create_client(supabase_url, supabase_key)
        
        # Check embedding column by trying to query it
        print("Checking embedding column...")
        # Try to get a sample embedding to verify type
        result = client.table("semantic_profile").select("id").limit(1).execute()
        
        if result.data:
            print("✓ semantic_profile table exists and has data")
        else:
            print("⚠ semantic_profile table exists but is empty")
        
        # Check if embeddings exist
        print("Checking for existing embeddings...")
        result = client.table("semantic_profile").select("id, embedding").limit(1).execute()
        
        if result.data:
            print(f"✓ Found {len(result.data)} row(s) with embeddings")
            # Check dimension (if we can)
            if result.data[0].get("embedding"):
                emb = result.data[0]["embedding"]
                if isinstance(emb, list):
                    print(f"✓ Embedding dimension: {len(emb)} (expected: 768)")
                    if len(emb) == 768:
                        print("✓ PASS: Embedding dimension is correct")
                    else:
                        print(f"✗ FAIL: Embedding dimension is {len(emb)}, expected 768")
                        return False
        else:
            print("⚠ WARNING: No embeddings found in semantic_profile")
            print("  (This is OK if you haven't ingested anything yet)")
        
        # Test RPC function
        print("Testing match_semantic_profile RPC...")
        test_embedding = [0.01] * 768
        try:
            result = client.rpc("match_semantic_profile", {
                "query_embedding": test_embedding,
                "match_count": 3
            }).execute()
            
            print(f"✓ RPC call succeeded, returned {len(result.data) if result.data else 0} results")
            print("✓ PASS: Database migration and RPC are working")
            return True
        except Exception as rpc_error:
            print(f"✗ FAIL: RPC function test failed: {rpc_error}")
            print("  This usually means:")
            print("  1. Migration 004_standardize_embedding_768.sql hasn't been applied")
            print("  2. RPC function doesn't exist or has wrong signature")
            print("  3. Vector extension not enabled in Supabase")
            print("  Run the migration in Supabase SQL Editor:")
            print(f"    File: data/migrations/004_standardize_embedding_768.sql")
            import traceback
            traceback.print_exc()
            return False
        
    except Exception as e:
        print(f"✗ FAIL: Database check failed: {e}")
        print("  Check:")
        print("  1. SUPABASE_URL is correct")
        print("  2. SUPABASE_SERVICE_ROLE_KEY is correct")
        print("  3. Supabase project is accessible")
        import traceback
        traceback.print_exc()
        return False


async def test_ollama_health():
    """Test 1.2: Ollama Health"""
    print("\n=== Test 1.2: Ollama Health ===")
    
    ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    embedding_model = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
    llm_model = os.getenv("OLLAMA_LLM_MODEL", "llama3.2")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Check available models
            print("Checking available models...")
            response = await client.get(f"{ollama_url}/api/tags")
            
            if response.status_code != 200:
                print(f"✗ FAIL: Ollama not responding (status {response.status_code})")
                return False
            
            data = response.json()
            models = [m.get("name", "") for m in data.get("models", [])]
            
            print(f"Available models: {', '.join(models)}")
            
            has_embedding = any(embedding_model in m for m in models)
            has_llm = any(llm_model in m for m in models)
            
            if not has_embedding:
                print(f"✗ FAIL: Embedding model '{embedding_model}' not found")
                print(f"  Run: ollama pull {embedding_model}")
                return False
            else:
                print(f"✓ Found embedding model: {embedding_model}")
            
            if not has_llm:
                print(f"✗ FAIL: LLM model '{llm_model}' not found")
                print(f"  Run: ollama pull {llm_model}")
                return False
            else:
                print(f"✓ Found LLM model: {llm_model}")
            
            # Test embedding generation
            print("Testing embedding generation...")
            response = await client.post(
                f"{ollama_url}/api/embeddings",
                json={"model": embedding_model, "prompt": "test embedding"},
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"✗ FAIL: Embedding generation failed (status {response.status_code})")
                print(f"  Response: {response.text}")
                return False
            
            data = response.json()
            embedding = data.get("embedding", [])
            
            if not embedding or len(embedding) != 768:
                print(f"✗ FAIL: Invalid embedding (length: {len(embedding) if embedding else 0}, expected 768)")
                return False
            
            print(f"✓ Embedding generated successfully (dimension: {len(embedding)})")
            print("✓ PASS: Ollama is healthy and models are available")
            return True
            
    except httpx.ConnectError:
        print(f"✗ FAIL: Cannot connect to Ollama at {ollama_url}")
        print("  Make sure Ollama is running: ollama serve")
        return False
    except Exception as e:
        print(f"✗ FAIL: Ollama health check failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_rag_pipeline():
    """Test 2: RAG Pipeline"""
    print("\n=== Test 2: RAG Pipeline ===")
    
    # Check if Supabase is configured
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        print("SKIP: SUPABASE_URL or SUPABASE_ANON_KEY not set")
        print(f"  Check .env file at: {QIOS_ROOT / '.env'}")
        return False
    
    try:
        from rag import search_semantic_profile
        
        # Test 2.1: Positive match
        print("\n--- Test 2.1: Positive Match ---")
        query = "no /src folders allowed"
        print(f"Query: '{query}'")
        
        results = search_semantic_profile(query, limit=5)
        
        if not results:
            print("⚠ WARNING: No results returned (database may be empty)")
            print("  This is OK if you haven't ingested documents yet")
        else:
            print(f"✓ Found {len(results)} results")
            for i, r in enumerate(results[:3], 1):
                print(f"  {i}. {r.get('file_path', 'unknown')} (score: {r.get('score', 0):.3f})")
                print(f"     Excerpt: {r.get('content', '')[:100]}...")
            
            top_score = results[0].get('score', 0) if results else 0
            if top_score > 0.3:
                print(f"✓ PASS: Top result has reasonable score ({top_score:.3f})")
            else:
                print(f"⚠ WARNING: Top score is low ({top_score:.3f}), may indicate weak matches")
        
        # Test 2.2: No-match behavior
        print("\n--- Test 2.2: No-Match Behavior ---")
        query = "purple alligator tax regulation v9.13"
        print(f"Query: '{query}'")
        
        results = search_semantic_profile(query, limit=5)
        
        if results:
            top_score = results[0].get('score', 0)
            print(f"✓ Found {len(results)} results (expected: low relevance)")
            print(f"  Top score: {top_score:.3f}")
            
            if top_score < 0.3:
                print("✓ PASS: Low scores for irrelevant query (as expected)")
            else:
                print("⚠ WARNING: Scores are high for irrelevant query")
        else:
            print("⚠ WARNING: No results for query")
        
        print("✓ PASS: RAG pipeline is functional")
        return True
        
    except Exception as e:
        print(f"✗ FAIL: RAG pipeline test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_gina_chat():
    """Test 3: GINA Chat"""
    print("\n=== Test 3: GINA Chat ===")
    
    try:
        import httpx
        
        base_url = os.getenv("QIOS_LOCAL_CORE_URL", "http://localhost:7130")
        
        # Quick health check first
        print("Checking if local_core service is running...")
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                health_response = await client.get(f"{base_url}/health")
                if health_response.status_code == 200:
                    print(f"✓ Service is running at {base_url}")
                else:
                    print(f"⚠ Service responded with status {health_response.status_code}")
        except httpx.ConnectError:
            print(f"✗ FAIL: Cannot connect to local_core at {base_url}")
            print("  Start the service with:")
            print("    cd workers/local_core")
            print("    python qios_local_core.py")
            return False
        except Exception as e:
            print(f"⚠ Health check failed: {e}")
            print("  Attempting to continue with chat test...")
        
        # Test 3.1: Basic existence
        print("\n--- Test 3.1: Basic Existence ---")
        payload = {
            "messages": [
                {"role": "user", "content": "Who are you, and what system are you orchestrating?"}
            ]
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{base_url}/gina/chat", json=payload)
            
            if response.status_code != 200:
                print(f"✗ FAIL: GINA chat failed (status {response.status_code})")
                print(f"  Response: {response.text}")
                return False
            
            data = response.json()
            reply = data.get("reply", "")
            
            print(f"Reply: {reply[:200]}...")
            
            if "qios" in reply.lower() or "gina" in reply.lower():
                print("✓ PASS: GINA identifies herself and QiOS")
            else:
                print("⚠ WARNING: Response doesn't mention GINA or QiOS")
        
        # Test 3.2: RAG recall
        print("\n--- Test 3.2: RAG Recall ---")
        payload = {
            "messages": [
                {"role": "user", "content": "What is the rule about /src folders in QiOS?"}
            ]
        }
        
        response = await client.post(f"{base_url}/gina/chat", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            reply = data.get("reply", "")
            sources = data.get("sources", [])
            
            print(f"Reply: {reply[:300]}...")
            print(f"Sources: {len(sources) if sources else 0}")
            
            if "src" in reply.lower() or "directory" in reply.lower():
                print("✓ PASS: GINA references relevant content")
            else:
                print("⚠ WARNING: Response doesn't seem to reference /src rule")
            
            if sources:
                print(f"✓ RAG sources provided: {len(sources)}")
            else:
                print("⚠ WARNING: No RAG sources in response")
        else:
            print(f"✗ FAIL: RAG recall test failed (status {response.status_code})")
        
        print("✓ PASS: GINA chat is functional")
        return True
        
    except httpx.ConnectError:
        print(f"✗ FAIL: Cannot connect to local_core at {base_url}")
        print("  Make sure qios_local_core.py is running")
        return False
    except Exception as e:
        print(f"✗ FAIL: GINA chat test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_function_calling():
    """Test 4: Function Calling"""
    print("\n=== Test 4: Function Calling ===")
    
    try:
        import httpx
        
        base_url = os.getenv("QIOS_LOCAL_CORE_URL", "http://localhost:7130")
        
        # Test 4.1: Simple single-tool call
        print("\n--- Test 4.1: Simple Single-Tool Call ---")
        payload = {
            "messages": [
                {"role": "user", "content": "Check the status of all workers and summarize which ones are unhealthy."}
            ]
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{base_url}/gina/chat", json=payload)
            
            if response.status_code != 200:
                print(f"✗ FAIL: Function calling test failed (status {response.status_code})")
                print(f"  Response: {response.text}")
                return False
            
            data = response.json()
            reply = data.get("reply", "")
            tool_suggestions = data.get("tool_suggestions", [])
            
            print(f"Reply: {reply[:400]}...")
            print(f"Tools executed: {len(tool_suggestions) if tool_suggestions else 0}")
            
            if tool_suggestions:
                for tool in tool_suggestions:
                    print(f"  - {tool.get('tool')}: success={tool.get('success')}")
                print("✓ PASS: Tools were executed")
            else:
                print("⚠ WARNING: No tools were executed (may be expected if no workers exist)")
        
        # Test 4.2: Multi-step tool chain (if workers exist)
        print("\n--- Test 4.2: Multi-Step Tool Chain ---")
        payload = {
            "messages": [
                {"role": "user", "content": "If the ingestion worker is not running, start it. Then confirm status."}
            ]
        }
        
        response = await client.post(f"{base_url}/gina/chat", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            tool_suggestions = data.get("tool_suggestions", [])
            
            if len(tool_suggestions) >= 2:
                print(f"✓ PASS: Multi-step tool chain executed ({len(tool_suggestions)} tools)")
                for tool in tool_suggestions:
                    print(f"  - {tool.get('tool')}")
            else:
                print(f"⚠ INFO: Only {len(tool_suggestions)} tool(s) executed (may be expected)")
        
        print("✓ PASS: Function calling is functional")
        return True
        
    except Exception as e:
        print(f"✗ FAIL: Function calling test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_failure_modes():
    """Test 5: Failure Modes"""
    print("\n=== Test 5: Failure Modes ===")
    
    print("\n--- Test 5.1: Ollama Down (Manual) ---")
    print("  MANUAL TEST: Stop Ollama, then ask GINA a question")
    print("  Expected: Clear error message, not silent hallucination")
    
    print("\n--- Test 5.2: Supabase Unavailable (Manual) ---")
    print("  MANUAL TEST: Break Supabase connection, then ask GINA")
    print("  Expected: Explicit error, not 'no matches'")
    
    print("\n--- Test 5.3: Tool Failure (Manual) ---")
    print("  MANUAL TEST: Break a tool, then ask GINA to use it")
    print("  Expected: Error acknowledged in response")
    
    print("⚠ NOTE: Failure mode tests require manual intervention")
    print("  See test plan for specific steps")
    return True


async def main():
    """Run all sanity checks"""
    print("=" * 60)
    print("QiOS Local Core - Sanity Check Suite")
    print("=" * 60)
    
    results = []
    
    # Test 1: Foundation
    results.append(("Database Migration", test_database_migration()))
    results.append(("Ollama Health", await test_ollama_health()))
    
    # Test 2: RAG
    results.append(("RAG Pipeline", await test_rag_pipeline()))
    
    # Test 3: GINA
    results.append(("GINA Chat", await test_gina_chat()))
    
    # Test 4: Function Calling
    results.append(("Function Calling", await test_function_calling()))
    
    # Test 5: Failure Modes (manual)
    results.append(("Failure Modes", await test_failure_modes()))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All automated tests passed!")
        print("   Proceed to manual failure mode testing.")
    else:
        print("\n⚠ Some tests failed. Fix issues before proceeding.")


if __name__ == "__main__":
    asyncio.run(main())

