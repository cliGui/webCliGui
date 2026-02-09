#
# Read/display superuser information
#
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Read and display superuser information'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=False, help='Username of the superuser to display (shows all if not provided)')

    def handle(self, *args, **options):
        username = options.get('username')

        if username:
            # Display specific superuser
            try:
                user = User.objects.get(username=username, is_superuser=True)
                self.stdout.write(self.style.SUCCESS(f'Superuser found:'))
                self.stdout.write(f'  Username: {user.username}')
                self.stdout.write(f'  Email: {user.email}')
                self.stdout.write(f'  Is Active: {user.is_active}')
                self.stdout.write(f'  Date Joined: {user.date_joined}')
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Superuser "{username}" not found'))
        else:
            # Display all superusers
            superusers = User.objects.filter(is_superuser=True)
            if superusers.exists():
                self.stdout.write(self.style.SUCCESS(f'Found {superusers.count()} superuser(s):'))
                for user in superusers:
                    self.stdout.write(f'  • {user.username} ({user.email}) - Active: {user.is_active}')
            else:
                self.stdout.write(self.style.WARNING('No superusers found'))
