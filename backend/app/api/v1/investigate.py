from fastapi import APIRouter, HTTPException, Request, status
from ...models.schemas import InvestigateRequest, InvestigateResponse, ErrorResponse, ErrorDetail
from ...agent.loop import run_investigate_loop
from ...security.governor import ClientGovernor

router = APIRouter(prefix="/v1", tags=["investigate"])

@router.post(
    "/investigate",
    response_model=InvestigateResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid ticker or mode"},
        429: {"model": ErrorResponse, "description": "Live quota exceeded for this client"},
        500: {"model": ErrorResponse, "description": "Unexpected server error"},
    },
    summary="Run broker-flow investigation for one IDX ticker",
)
async def investigate(request: InvestigateRequest, http_request: Request):
    # Only live mode bills Sectors credits, so only live mode is quota-checked.
    if request.mode == "live":
        client_id = http_request.client.host if http_request.client else "unknown"
        retry_after = ClientGovernor.check_and_record(client_id)
        if retry_after:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": {
                        "code": "LIVE_QUOTA_EXCEEDED",
                        "message": (
                            f"Kuota mode live terlampaui. Coba lagi dalam {retry_after} detik, "
                            "atau gunakan mode simulasi/cache (0 kredit)."
                        ),
                    }
                },
                headers={"Retry-After": str(int(retry_after) + 1)},
            )

    try:
        response = await run_investigate_loop(request)
        return response
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "INVALID_REQUEST", "message": str(ve)}},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": {"code": "INTERNAL_ERROR", "message": str(e)}},
        )
