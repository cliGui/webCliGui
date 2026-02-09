#
# Update a superuser's credentials
#
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Update a superuser\'s email and/or password'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True, help='Username of the superuser to update')
        parser.add_argument('--email', type=str, required=False, help='New email address')
        parser.add_argument('--password', type=str, required=False, help='New password')

    def handle(self, *args, **options):
        username = options['username']
        email = options.get('email')
        password = options.get('password')

        if not email and not password:
            self.stdout.write(self.style.ERROR('Please provide at least --email or --password to update'))
            return

        try:
            user = User.objects.get(username=username, is_superuser=True)

            if email:
                user.email = email

            if password:
                user.set_password(password)

            user.save()
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" updated successfully'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Superuser "{username}" not found'))
