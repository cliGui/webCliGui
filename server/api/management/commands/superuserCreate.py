#
# Create a superuser with provided or environment variable credentials
#
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os

class Command(BaseCommand):
    help = 'Create a superuser with predefined credentials'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username for the superuser')
        parser.add_argument('--email', type=str, help='Email for the superuser')
        parser.add_argument('--password', type=str, help='Password for the superuser')

    def handle(self, *args, **options):
        username = options.get('username')
        email = options.get('email')
        password = options.get('password')

        if not username:
            username = os.getenv('DJANGO_ADMIN_USER', 'admin')

        if not email:
            email = os.getenv('DJANGO_ADMIN_EMAIL', 'admin@example.com')

        if not password:
            password = os.getenv('DJANGO_ADMIN_PASSWORD', 'secret123')

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'Superuser "{username}" already exists'))
        else:
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" created successfully'))
