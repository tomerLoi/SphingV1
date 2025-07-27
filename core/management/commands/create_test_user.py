from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import ITMember, UserProfile

class Command(BaseCommand):
    help = 'Create a test user and IT member for login.'

    def handle(self, *args, **kwargs):
        member, _ = ITMember.objects.get_or_create(
            full_name='Test User',
            phone_number='050-1234567',
            location='Tel Aviv',
            email='testuser@email.com'
        )
        user, created = User.objects.get_or_create(username='testuser@email.com', email='testuser@email.com')
        if created:
            user.set_password('testpass123')
            user.save()
        UserProfile.objects.get_or_create(user=user, member=member)
        self.stdout.write(self.style.SUCCESS('Test user created: testuser@email.com / testpass123'))
