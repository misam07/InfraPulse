"""Alert endpoints (display-only until Phase 6 adds threshold evaluation)."""

from fastapi import APIRouter, Query

from app.schemas.alerts import Alert, AlertStatus
from app.schemas.common import ListResponse
from app.services import fleet

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=ListResponse[Alert])
def list_alerts(
    status: AlertStatus | None = Query(default=None, description="Filter by status"),
) -> ListResponse[Alert]:
    alerts = fleet.get_alerts()
    if status is not None:
        alerts = [alert for alert in alerts if alert.status is status]
    return ListResponse(items=alerts)
