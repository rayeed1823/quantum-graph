import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# 1. SECURITY & HOSTS
# Change DEBUG to False for production, or use an environment variable
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')

# Read secret key from environment or default to a dummy key (replace for prod)
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-your-local-dev-key')

# Allow your Render domain and local environment
ALLOWED_HOSTS = [
    'quantum-graph-ij8i.onrender.com',
    'localhost',
    '127.0.0.1',
    '*',  # Keeps wildcard active to avoid any domain mismatch issues during setup
]


# 2. INSTALLED APPS
# Make sure your app is registered here
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'graph_app',  # Your application
]


# 3. MIDDLEWARE
# Include WhiteNoise right after SecurityMiddleware to serve static files automatically
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Serves static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# 4. STATIC FILES CONFIGURATION
# Django needs STATIC_ROOT configured so collectstatic can bundle your JS/CSS on Render
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

STATIC_ROOT = BASE_DIR / 'staticfiles'

# Enables efficient storage and caching for static files with WhiteNoise
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'