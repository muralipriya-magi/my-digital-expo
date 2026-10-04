from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expos', '0004_alter_stallbooking_unique_together_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='theme',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='theme_images/'),
        ),
    ]
