from fastapi import APIRouter, HTTPException, status
from ...models.schemas import InvestigateRequest, InvestigateResponse, ErrorResponse, ErrorDetail
from ...agent.loop import run_investigate_loop

router = APIRouter(prefix="/v1", tags=["investigate"])

@router.post(
    "/investigate",
    response_model=InvestigateResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid ticker or mode"},
        500: {"model": ErrorResponse, "description": "Unexpected server error"},
    },
    summary="Run broker-flow investigation for one IDX ticker",
)
async def investigate(request: InvestigateRequest):
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
