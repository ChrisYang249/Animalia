import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Iterable, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


def _smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD)


def send_email(
    *,
    to_addresses: Iterable[str],
    subject: str,
    body_text: str,
    body_html: Optional[str] = None,
) -> bool:
    recipients = [addr.strip() for addr in to_addresses if addr and addr.strip()]
    if not recipients:
        logger.warning("No recipients for email: %s", subject)
        return False

    if not _smtp_configured():
        logger.info("SMTP not configured; skipping email: %s", subject)
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM or settings.SMTP_USER
    message["To"] = ", ".join(recipients)
    message.attach(MIMEText(body_text, "plain"))

    if body_html:
        message.attach(MIMEText(body_html, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(message["From"], recipients, message.as_string())
        logger.info("Sent email to %s: %s", recipients, subject)
        return True
    except Exception:
        logger.exception("Failed to send email: %s", subject)
        return False


def send_visit_request_notification(*, application: dict) -> bool:
    """Notify staff that a new visit request was submitted."""
    liked_names = ", ".join(cat["name"] for cat in application.get("liked_cats") or []) or "None listed"
    visit_date = application.get("visit_date")
    if hasattr(visit_date, "strftime"):
        visit_date_str = visit_date.strftime("%B %d, %Y")
    else:
        visit_date_str = str(visit_date)

    subject = f"New visit request — {application['applicant_name']}"
    body_text = f"""A new visit request was submitted on Animalia.

Name: {application['applicant_name']}
Email: {application.get('email') or '—'}
Phone: {application.get('phone') or '—'}
Visit date: {visit_date_str}
Visit time: {application.get('visit_time')}
Liked cats: {liked_names}

Review it in the staff portal under Visit Requests.
"""

    return send_email(
        to_addresses=settings.visit_request_notify_emails,
        subject=subject,
        body_text=body_text,
    )
