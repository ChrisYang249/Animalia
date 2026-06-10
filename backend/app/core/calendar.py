import logging
from datetime import datetime, timedelta
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]
TOKEN_URI = "https://oauth2.googleapis.com/token"


def calendar_configured() -> bool:
    return bool(
        settings.GOOGLE_CLIENT_ID
        and settings.GOOGLE_CLIENT_SECRET
        and settings.GOOGLE_REFRESH_TOKEN
    )


def _build_service():
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    creds = Credentials(
        token=None,
        refresh_token=settings.GOOGLE_REFRESH_TOKEN,
        token_uri=TOKEN_URI,
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=SCOPES,
    )
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def create_visit_event(
    *,
    applicant_name: str,
    start: datetime,
    duration_minutes: Optional[int] = None,
    applicant_email: Optional[str] = None,
    phone: Optional[str] = None,
    liked_cat_names: Optional[list] = None,
    extra_attendees: Optional[list] = None,
) -> Optional[str]:
    """Create a Google Calendar event for an adoption visit. Returns the event id."""
    if not calendar_configured():
        logger.info("Google Calendar not configured; skipping booking")
        return None

    end = start + timedelta(minutes=duration_minutes or settings.VISIT_DURATION_MINUTES)

    description_lines = ["Adoption visit booked via Animalia."]
    if phone:
        description_lines.append(f"Phone: {phone}")
    if applicant_email:
        description_lines.append(f"Email: {applicant_email}")
    if liked_cat_names:
        description_lines.append(f"Liked cats: {', '.join(liked_cat_names)}")

    event = {
        "summary": f"Adoption visit — {applicant_name}",
        "description": "\n".join(description_lines),
        "start": {"dateTime": start.isoformat(), "timeZone": settings.VISIT_TIMEZONE},
        "end": {"dateTime": end.isoformat(), "timeZone": settings.VISIT_TIMEZONE},
    }
    attendee_emails = []
    if applicant_email:
        attendee_emails.append(applicant_email)
    attendee_emails.extend(settings.visit_staff_attendees)
    if extra_attendees:
        attendee_emails.extend(extra_attendees)
    # de-duplicate, preserve order
    seen = set()
    attendees = []
    for email in attendee_emails:
        key = email.lower()
        if key not in seen:
            seen.add(key)
            attendees.append({"email": email})
    if attendees:
        event["attendees"] = attendees

    try:
        service = _build_service()
        created = (
            service.events()
            .insert(
                calendarId=settings.GOOGLE_CALENDAR_ID,
                body=event,
                sendUpdates="all",
            )
            .execute()
        )
        event_id = created.get("id")
        logger.info("Created calendar event %s for %s", event_id, applicant_name)
        return event_id
    except Exception:
        logger.exception("Failed to create calendar event for %s", applicant_name)
        return None


def delete_visit_event(event_id: str) -> bool:
    if not calendar_configured() or not event_id:
        return False
    try:
        service = _build_service()
        service.events().delete(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            eventId=event_id,
            sendUpdates="all",
        ).execute()
        logger.info("Deleted calendar event %s", event_id)
        return True
    except Exception:
        logger.exception("Failed to delete calendar event %s", event_id)
        return False


def parse_visit_start(visit_date: datetime, visit_time: str) -> Optional[datetime]:
    """Combine the visit date with a free-text time like '2:00 PM' or '14:30'."""
    import re

    text = visit_time.strip().lower().replace(".", "")
    match = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", text)
    if not match:
        return None

    hour = int(match.group(1))
    minute = int(match.group(2) or 0)
    meridiem = match.group(3)

    if meridiem == "pm" and hour != 12:
        hour += 12
    elif meridiem == "am" and hour == 12:
        hour = 0

    if not (0 <= hour <= 23 and 0 <= minute <= 59):
        return None

    return visit_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
