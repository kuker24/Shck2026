from typing import Any
from pydantic import BaseModel
from ..tools.allowlist import TOOL_ALLOWLIST

class PlannedStep(BaseModel):
    id: str
    role: str = "planner"
    title: str
    tool_name: str
    args: dict[str, Any]
    detail: str

class Plan(BaseModel):
    ticker: str
    mode: str
    steps: list[PlannedStep]

class Planner:
    @staticmethod
    def create_plan(ticker: str, mode: str = "live") -> Plan:
        """Create an ordered, credit-disciplined investigation plan."""
        steps: list[PlannedStep] = []

        if mode == "mock":
            steps.append(
                PlannedStep(
                    id="s1",
                    role="planner",
                    title="Merencanakan investigasi",
                    tool_name="load_mock_payload",
                    args={"ticker": ticker},
                    detail="Memuat dataset mock lokal untuk pengujian hemat kredit",
                )
            )
            steps.append(
                PlannedStep(
                    id="s2",
                    role="executor",
                    title="Mengambil ringkasan broker (top)",
                    tool_name="load_mock_payload",
                    args={"ticker": ticker},
                    detail=f"Mock broker-summary/top untuk {ticker}",
                )
            )
            steps.append(
                PlannedStep(
                    id="s3",
                    role="executor",
                    title="Mengambil free float",
                    tool_name="load_mock_payload",
                    args={"ticker": ticker},
                    detail=f"Mock free float {ticker}",
                )
            )
            steps.append(
                PlannedStep(
                    id="s4",
                    role="critic",
                    title="Meninjau hasil & menyusun narasi aman",
                    tool_name="draft_narrative",
                    args={"ticker": ticker},
                    detail="Meninjau tidak ada bahasa saran investasi & menyematkan disclaimer",
                )
            )
            return Plan(ticker=ticker, mode=mode, steps=steps)

        # LIVE MODE: Planned strictly according to allowlist and credit budget
        steps.append(
            PlannedStep(
                id="s1",
                role="planner",
                title="Merencanakan investigasi",
                tool_name="cache_get",
                args={"ticker": ticker},
                detail=f"Menyusun urutan pemanggilan data broker dan free float {ticker}",
            )
        )
        steps.append(
            PlannedStep(
                id="s2",
                role="executor",
                title="Mengambil ringkasan broker (top)",
                tool_name="fetch_broker_summary_top",
                args={"ticker": ticker},
                detail=f"Mengambil data akumulasi/distribusi sekuritas {ticker} (~2 kredit)",
            )
        )
        steps.append(
            PlannedStep(
                id="s3",
                role="executor",
                title="Mengambil free float",
                tool_name="fetch_free_float",
                args={"ticker": ticker},
                detail=f"Mengambil rasio kepemilikan publik {ticker}",
            )
        )
        steps.append(
            PlannedStep(
                id="s4",
                role="critic",
                title="Meninjau hasil & menyusun narasi aman",
                tool_name="draft_narrative",
                args={"ticker": ticker},
                detail="Validasi fakta, filtering bahasa spekulasi, & penyematan disclaimer",
            )
        )

        return Plan(ticker=ticker, mode=mode, steps=steps)
