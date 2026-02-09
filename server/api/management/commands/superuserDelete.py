#
# Delete a superuser
#
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Delete a superuser by username'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True, help='Username of the superuser to delete')

    def handle(self, *args, **options):
        username = options['username']

        try:
            user = User.objects.get(username=username, is_superuser=True)
            user.delete()
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" deleted successfully'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Superuser "{username}" not found'))
