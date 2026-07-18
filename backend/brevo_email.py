from typing import Tuple, Optional
import os
from dotenv import load_dotenv
from brevo import Brevo, SendTransacEmailRequestSender, SendTransacEmailRequestToItem
from models import RequestStatus

load_dotenv()
brevoClient = Brevo(api_key=os.getenv("BREVO_API_KEY", ""))


def get_status_email_template(
    status: RequestStatus,
    user_name: str,
    item_name: str = "your item",
    is_reverted: bool = False,
    is_declined: bool = False,
) -> Tuple[str, str]:

    base_style = """
    margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #1f2937;
    """
    card_style = """
    max-width: 580px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    """

    if is_declined:
        subject = f"Update on your request for '{item_name}'"
        badge_color = "#ef4444"
        status_text = "Declined"
        body_content = f"""
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">Hi {user_name},</p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">We wanted to let you know that your request for <strong>{item_name}</strong> could not be completed and has been declined by the owner.</p>
        <p style="font-size: 14px; line-height: 1.5; color: #4b5563; margin-bottom: 24px;">Feel free to browse other available listings on the app!</p>
        """

    elif status == RequestStatus.PENDING:
        badge_color = "#3b82f6"  # Blue
        status_text = "Pending Approval"

        if is_reverted:
            subject = f"Status update: Your request for '{item_name}' is pending again"
            body_content = f"""
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">Hi {user_name},</p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">The status of your request for <strong>{item_name}</strong> has been updated back to <strong>pending</strong>.</p>
            <p style="font-size: 14px; line-height: 1.5; color: #4b5563; margin-bottom: 24px;">The owner is re-reviewing the details. We'll alert you the moment the status updates again.</p>
            """
        else:
            subject = f"Your request for '{item_name}' has been submitted!"
            body_content = f"""
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">Hi {user_name},</p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">Your request to secure <strong>{item_name}</strong> has been successfully initiated.</p>
            <p style="font-size: 14px; line-height: 1.5; color: #4b5563; margin-bottom: 24px;">The owner is currently reviewing your request. We'll send you another update the moment they approve it.</p>
            """

    elif status == RequestStatus.ACCEPTED:
        subject = f"Great news! Your request for '{item_name}' was accepted 🎉"
        badge_color = "#10b981"  # Green
        status_text = "Ready for Pickup"
        body_content = f"""
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">Hi {user_name},</p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">The owner has <strong>approved</strong> your request for <strong>{item_name}</strong>!</p>
        <p style="font-size: 14px; line-height: 1.5; color: #4b5563; margin-bottom: 24px;">The item is now waiting for you. Please coordinate with the owner to arrange your pickup/handover location.</p>
        """

    elif status == RequestStatus.COMPLETED:
        subject = f"Handover confirmed: '{item_name}' marked as completed!"
        badge_color = "#6b7280"  # Muted Gray
        status_text = "Completed"
        body_content = f"""
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">Hi {user_name},</p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">The handover for <strong>{item_name}</strong> has been confirmed, and the request is officially complete.</p>
        <p style="font-size: 14px; line-height: 1.5; color: #4b5563; margin-bottom: 24px;">Thank you for using BiteBack! We hope everything went smoothly.</p>
        """
    else:
        raise ValueError("Invalid request status")

    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="{base_style}">
        <div style="{card_style}">
            <div style="margin-bottom: 24px;">
                <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; tracking: 0.05em; background-color: {badge_color}; color: white; padding: 4px 10px; border-radius: 9999px;">
                    {status_text}
                </span>
            </div>
            {body_content}
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
                Sent via BiteBack App
            </p>
        </div>
    </body>
    </html>
    """

    return subject, html_template


def sendBrevoEmail(
    email: str,
    name: str,
    status: RequestStatus,
    item_name: str,
    is_reverted: bool = False,
    is_declined: bool = False,
) -> None:
    subject, html_content = get_status_email_template(
        status=status,
        user_name=name,
        item_name=item_name,
        is_reverted=is_reverted,
        is_declined=is_declined,
    )

    result = brevoClient.transactional_emails.send_transac_email(
        subject=subject,
        html_content=html_content,
        sender=SendTransacEmailRequestSender(
            name="BiteBack",
            email="motpanliviuwork@gmail.com",
        ),
        to=[
            SendTransacEmailRequestToItem(
                email=email,
                name=name,
            )
        ],
    )
    print("Email sent. Message ID:", result.message_id)
