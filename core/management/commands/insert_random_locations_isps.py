from django.core.management.base import BaseCommand
import random
import string
from core.models import Location, ISP

class Command(BaseCommand):
    help = 'Insert 20 random locations and 40 random ISPs into the database.'

    def handle(self, *args, **options):
        continents = [
            'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Australia', 'Antarctica'
        ]

        def random_string(length=8):
            return ''.join(random.choices(string.ascii_letters, k=length))

        def random_ip():
            return '.'.join(str(random.randint(1, 254)) for _ in range(4))

        # Create 40 random ISPs
        isps = []
        for i in range(40):
            name = f"ISP_{random_string(5)}_{i}"
            ip = random_ip()
            isp, _ = ISP.objects.get_or_create(name=name, ip_address=ip)
            isps.append(isp)

        # Create 20 random Locations, each with 2 random ISPs
        for i in range(20):
            site_name = f"Site_{random_string(6)}_{i}"
            continent = random.choice(continents)
            location = Location.objects.create(site_name=site_name, continent_name=continent)
            assigned_isps = random.sample(isps, 2)
            for isp in assigned_isps:
                location.isps.add(isp)
            location.save()

        self.stdout.write(self.style.SUCCESS('Inserted 20 random locations and 40 random ISPs into the database.'))
