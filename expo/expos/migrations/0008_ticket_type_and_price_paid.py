from decimal import Decimal

from django.db import migrations, models


def seed_existing_ticket_prices(apps, schema_editor):
    Ticket = apps.get_model("expos", "Ticket")
    for ticket in Ticket.objects.select_related("expo").all():
      ticket.price_paid = ticket.expo.ticket_price
      ticket.ticket_type = "ADULT"
      ticket.save(update_fields=["price_paid", "ticket_type"])


class Migration(migrations.Migration):

    dependencies = [
        ("expos", "0007_alter_expo_platform_commission_percent"),
    ]

    operations = [
        migrations.AddField(
            model_name="ticket",
            name="price_paid",
            field=models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=10),
        ),
        migrations.AddField(
            model_name="ticket",
            name="ticket_type",
            field=models.CharField(choices=[("ADULT", "Adult"), ("CHILD", "Child")], default="ADULT", max_length=20),
        ),
        migrations.AlterUniqueTogether(
            name="ticket",
            unique_together=set(),
        ),
        migrations.RunPython(seed_existing_ticket_prices, migrations.RunPython.noop),
    ]
