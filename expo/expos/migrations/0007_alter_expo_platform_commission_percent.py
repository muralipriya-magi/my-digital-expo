from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("expos", "0006_allow_multiple_stalls_per_vendor"),
    ]

    operations = [
        migrations.AlterField(
            model_name="expo",
            name="platform_commission_percent",
            field=models.DecimalField(decimal_places=2, default=70, max_digits=5),
        ),
    ]
