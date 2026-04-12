"""
Tool dispatcher for GINA.
Loads tool manifest, validates requests, and invokes tool implementations.
"""
import os
import sys
import yaml
import importlib.util
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass

QIOS_ROOT = Path(__file__).parent.parent.parent
TOOLS_DIR = Path(__file__).parent / "tools"
MANIFEST_PATH = Path(__file__).parent / "tools_manifest.yaml"

# Cache loaded manifest
_manifest_cache: Optional[Dict] = None


@dataclass
class ToolResult:
    """Result of a tool invocation."""
    ok: bool
    tool: str
    result: Any | None = None
    error: str | None = None


def load_manifest() -> Dict:
    """Load tool manifest from YAML file."""
    global _manifest_cache
    
    if _manifest_cache is not None:
        return _manifest_cache
    
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(f"Tool manifest not found: {MANIFEST_PATH}")
    
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        _manifest_cache = yaml.safe_load(f)
    
    return _manifest_cache


def get_tool_config(tool_name: str) -> Optional[Dict]:
    """Get configuration for a specific tool."""
    manifest = load_manifest()
    tools = manifest.get("tools", [])
    
    for tool in tools:
        if tool.get("name") == tool_name:
            return tool
    
    return None


def validate_args(tool_config: Dict, args: Dict) -> tuple[bool, Optional[str]]:
    """Validate tool arguments against manifest schema."""
    required_args = tool_config.get("args", {})
    
    for arg_name, arg_spec in required_args.items():
        if arg_spec.get("required", False):
            if arg_name not in args:
                return False, f"Missing required argument: {arg_name}"
        
        # Type validation (basic)
        if arg_name in args:
            arg_type = arg_spec.get("type", "string")
            value = args[arg_name]
            
            if arg_type == "integer" and not isinstance(value, int):
                try:
                    args[arg_name] = int(value)
                except (ValueError, TypeError):
                    return False, f"Argument {arg_name} must be an integer"
            
            elif arg_type == "array" and not isinstance(value, list):
                return False, f"Argument {arg_name} must be an array"
            
            elif arg_type == "string" and not isinstance(value, str):
                args[arg_name] = str(value)
    
    # Fill defaults
    for arg_name, arg_spec in required_args.items():
        if arg_name not in args and "default" in arg_spec:
            args[arg_name] = arg_spec["default"]
    
    return True, None


async def invoke_tool(tool_name: str, args: Dict, env: Optional[Dict] = None) -> ToolResult:
    """
    Invoke a tool by name with given arguments.
    
    Args:
        tool_name: Name of the tool from manifest
        args: Arguments dictionary
        env: Optional environment variables/context
    
    Returns:
        ToolResult with ok, tool, result, error
    """
    if env is None:
        env = {}
    
    # Load tool config
    tool_config = get_tool_config(tool_name)
    if not tool_config:
        return ToolResult(
            ok=False,
            tool=tool_name,
            error=f"Tool '{tool_name}' not found in manifest"
        )
    
    # Validate args
    is_valid, error_msg = validate_args(tool_config, args)
    if not is_valid:
        return ToolResult(
            ok=False,
            tool=tool_name,
            error=error_msg
        )
    
    # Load tool module
    entrypoint = tool_config.get("entrypoint")
    if not entrypoint:
        return ToolResult(
            ok=False,
            tool=tool_name,
            error="Tool entrypoint not specified"
        )
    
    tool_path = TOOLS_DIR / entrypoint.replace("tools/", "")
    if not tool_path.exists():
        return ToolResult(
            ok=False,
            tool=tool_name,
            error=f"Tool implementation not found: {tool_path}"
        )
    
    try:
        # Dynamically import the tool module
        spec = importlib.util.spec_from_file_location(
            f"tools_{tool_name}",
            tool_path
        )
        if spec is None or spec.loader is None:
            return ToolResult(
                ok=False,
                tool=tool_name,
                error=f"Failed to load tool module: {tool_path}"
            )
        
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Call the tool's run function
        if hasattr(module, "run"):
            if callable(module.run):
                # Check if it's async
                import inspect
                if inspect.iscoroutinefunction(module.run):
                    result = await module.run(args, env)
                else:
                    result = module.run(args, env)
            else:
                return ToolResult(
                    ok=False,
                    tool=tool_name,
                    error="Tool module 'run' is not callable"
                )
        else:
            return ToolResult(
                ok=False,
                tool=tool_name,
                error="Tool module must export a 'run' function"
            )
        
        return ToolResult(
            ok=True,
            tool=tool_name,
            result=result
        )
    
    except Exception as e:
        return ToolResult(
            ok=False,
            tool=tool_name,
            error=f"Tool execution failed: {str(e)}"
        )


def list_tools() -> list[Dict]:
    """List all available tools from manifest."""
    manifest = load_manifest()
    tools = manifest.get("tools", [])
    
    # Return simplified tool info (name, description)
    return [
        {
            "name": tool.get("name"),
            "description": tool.get("description"),
        }
        for tool in tools
    ]

