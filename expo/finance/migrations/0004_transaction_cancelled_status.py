from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("finance", "0003_transaction_booking_payload_and_more")]

    operations = [
        migrations.AlterField(
            model_name="transaction",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Pending"),
                    ("SUCCESS", "Success"),
                    ("FAILED", "Failed"),
                    ("CANCELLED", "Cancelled"),
                ],
                default="PENDING",
                max_length=20,
            ),
        ),
    ]
