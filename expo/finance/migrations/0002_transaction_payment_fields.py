# Generated manually for payment integration.

import uuid
from django.db import migrations, models


def backfill_payment_references(apps, schema_editor):
    Transaction = apps.get_model("finance", "Transaction")

    for transaction in Transaction.objects.all():
        if not transaction.payment_reference:
            prefix = "STALL" if transaction.transaction_type == "STALL" else "TICKET"
            transaction.payment_reference = f"{prefix}-{uuid.uuid4().hex[:12].upper()}"
            transaction.save(update_fields=["payment_reference"])


class Migration(migrations.Migration):

    dependencies = [
        ("finance", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="transaction",
            name="payment_method",
            field=models.CharField(
                choices=[
                    ("CARD", "Card"),
                    ("UPI", "UPI"),
                    ("NETBANKING", "Net Banking"),
                    ("WALLET", "Wallet"),
                ],
                default="CARD",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="transaction",
            name="payment_reference",
            field=models.CharField(default="", max_length=64),
            preserve_default=False,
        ),
        migrations.RunPython(backfill_payment_references, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="transaction",
            name="payment_reference",
            field=models.CharField(default=uuid.uuid4, max_length=64, unique=True),
        ),
    ]
