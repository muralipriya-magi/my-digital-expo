# ExpoSphere deployment guide: Render + Vercel

This project is structured as two services:

- `expo/` — Django API, PostgreSQL database, admin, media API, and daily reminders.
- `expo-frontend/` — Vite/React static website.

## 1. Prepare the repository

Push the entire `my expo` folder to a private GitHub repository. Do **not** commit either `.env` file, `venv`, `node_modules`, `media`, `dist`, or `staticfiles`. The included `render.yaml` creates the Django API and PostgreSQL database automatically when you select **New Blueprint Instance** in Render.

## 2. Create PostgreSQL on Render

If you use `render.yaml`, Render automatically supplies `DATABASE_URL`. For a manual service, create a Render PostgreSQL database and set `DATABASE_URL` to its internal connection string. The application also supports these separate variables for local development:

```text
DB_NAME=<database name>
DB_USER=<username>
DB_PASSWORD=<password>
DB_HOST=<internal hostname>
DB_PORT=5432
```

## 3. Deploy the Django API on Render

Create a **Web Service** connected to the repository.

```text
Root directory: expo
Build command: pip install -r requirements-production.txt && python manage.py collectstatic --noinput && python manage.py migrate
Start command: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
Health check path: /api/health/
```

Set these environment variables. Generate `DJANGO_SECRET_KEY` with a password generator; never reuse the example value.

```text
DJANGO_SECRET_KEY=<long random secret>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=<your-render-api-name>.onrender.com
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_SECURE_HSTS_SECONDS=31536000
DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS=True
DJANGO_SECURE_HSTS_PRELOAD=True
FRONTEND_URL=https://<your-vercel-site>.vercel.app
CORS_ALLOWED_ORIGINS=https://<your-vercel-site>.vercel.app
CSRF_TRUSTED_ORIGINS=https://<your-vercel-site>.vercel.app
EMAIL_HOST_USER=<gmail address>
EMAIL_HOST_PASSWORD=<Google App Password>
DEFAULT_FROM_EMAIL=ExpoSphere <your gmail address>
RAZORPAY_KEY_ID=<Razorpay live key id>
RAZORPAY_KEY_SECRET=<Razorpay live key secret>
```

Do not use test Razorpay keys in the live deployment.

## 4. Persistent uploaded media

Ticket QR codes and theme images currently use Django's local `media/` folder. Render's filesystem is ephemeral, so configure Cloudinary or Amazon S3 before allowing real ticket sales. Until then, a redeploy can remove uploaded QR images.

## 5. Deploy React on Vercel

Import the same repository as a Vercel project with:

```text
Root directory: expo-frontend
Build command: npm run build
Output directory: dist
```

Add this Vercel environment variable before deploying:

```text
VITE_API_BASE_URL=https://<your-render-api-name>.onrender.com/api/
```

After Vercel creates the site URL, update `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` in Render, then redeploy the API.

## 6. Schedule event reminders

Create a Render Cron Job using the same repository and Django environment variables:

```text
Root directory: expo
Command: python manage.py send_expo_reminders
Schedule: 0 3 * * *
```

The command is idempotent: each 7-day, 1-day, and event-day reminder is recorded once per ticket holder. Test it without sending email:

```powershell
python manage.py send_expo_reminders --dry-run
```

## 7. Release checklist

- Open `https://<api>/api/health/` and confirm `{"status":"ok","database":"ok"}`.
- Create a visitor account and confirm the welcome email.
- Use Forgot Password and confirm the reset link points to Vercel.
- Complete a Razorpay test payment before switching to live keys.
- Scan a ticket on a phone over HTTPS.
- Confirm that QR images remain available after a test redeploy; if not, configure Cloudinary/S3 first.
