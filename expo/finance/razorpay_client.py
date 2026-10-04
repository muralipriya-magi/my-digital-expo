import base64
import json
from urllib import error, request

from django.conf import settings


RAZORPAY_ORDER_URL = "https://api.razorpay.com/v1/orders"


class RazorpayConfigError(Exception):
    pass


class RazorpayAPIError(Exception):
    pass


def _auth_header():
    key_id = getattr(settings, "RAZORPAY_KEY_ID", "")
    key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "")
    if not key_id or not key_secret:
        raise RazorpayConfigError("Razorpay keys are not configured.")

    mode = getattr(settings, "RAZORPAY_MODE", "TEST")
    expected_prefix = "rzp_test_" if mode == "TEST" else "rzp_live_"
    if not key_id.startswith(expected_prefix):
        raise RazorpayConfigError(
            f"RAZORPAY_MODE={mode} requires a key ID beginning with {expected_prefix}."
        )

    token = base64.b64encode(f"{key_id}:{key_secret}".encode("utf-8")).decode("utf-8")
    return {"Authorization": f"Basic {token}"}


def create_order(amount_paise, receipt, notes=None):
    payload = json.dumps({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt,
        "payment_capture": 1,
        "notes": notes or {},
    }).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        **_auth_header(),
    }

    req = request.Request(RAZORPAY_ORDER_URL, data=payload, headers=headers, method="POST")

    try:
        with request.urlopen(req, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RazorpayAPIError(detail or "Unable to create Razorpay order.") from exc
    except error.URLError as exc:
        raise RazorpayAPIError("Unable to reach Razorpay from this environment.") from exc
