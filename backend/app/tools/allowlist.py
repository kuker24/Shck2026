class ToolNotAllowedError(Exception):
    pass

TOOL_ALLOWLIST = {
    "fetch_broker_summary_top",
    "fetch_free_float",
    "draft_narrative",
    "load_mock_payload",
    "cache_get",
    "cache_put",
}

def verify_tool_allowed(tool_name: str):
    if tool_name not in TOOL_ALLOWLIST:
        raise ToolNotAllowedError(
            f"Akses alat ditolak: '{tool_name}' tidak terdaftar dalam allowlist yang diizinkan."
        )
