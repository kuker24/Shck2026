from typing import Literal, Optional
from pydantic import BaseModel, Field

RoleType = Literal["planner", "executor", "critic"]
StepStatusType = Literal["pending", "running", "done", "error", "skipped"]
ModeType = Literal["mock", "live", "cache"]

class InvestigateRequest(BaseModel):
    ticker: str = Field(..., min_length=2, max_length=10, description="IDX ticker symbol")
    mode: ModeType = Field(default="mock", description="Investigation mode")

class BrokerRow(BaseModel):
    broker_code: str
    broker_name: str
    net_value: float
    buy_value: float
    sell_value: float
    rank: int

class Brokers(BaseModel):
    top_buyers: list[BrokerRow] = Field(default_factory=list)
    top_sellers: list[BrokerRow] = Field(default_factory=list)

class FreeFloat(BaseModel):
    percent: Optional[float] = None
    shares: Optional[float] = None
    as_of: Optional[str] = None
    note: Optional[str] = None

class Step(BaseModel):
    id: str
    role: RoleType
    title: str
    status: StepStatusType
    detail: Optional[str] = None

class ErrorDetail(BaseModel):
    code: str
    message: str

class InvestigateResponse(BaseModel):
    ticker: str
    mode: ModeType
    as_of: Optional[str] = None
    credit_estimate: Optional[float] = 0.0
    steps: list[Step] = Field(default_factory=list)
    brokers: Brokers = Field(default_factory=Brokers)
    free_float: FreeFloat = Field(default_factory=FreeFloat)
    narrative: str = ""
    disclaimer: str
    error: Optional[ErrorDetail] = None

class ErrorResponse(BaseModel):
    error: ErrorDetail
