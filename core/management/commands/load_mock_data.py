from django.core.management.base import BaseCommand
from core.models import Location, ISP

MOCK_DATA = [
    {"continent": "Israel", "site_name": "Hamada 1", "isp_1": "194.31.58.5", "isp_2": "", "isp_1_name": "Bezeq", "isp_2_name": "Partner"},
    {"continent": "Israel", "site_name": "Maskit E", "isp_1": "77.137.181.250", "isp_2": "192.117.183.210", "isp_1_name": "Cellcom", "isp_2_name": "HOT"},
    {"continent": "Israel", "site_name": "Yokneam Fabrinet CM", "isp_1": "192.117.170.158", "isp_2": "3.3.3.3", "isp_1_name": "Netvision", "isp_2_name": "012 Smile"},
    {"continent": "USA", "site_name": "Roseville", "isp_1": "66.60.177.70", "isp_2": "50.229.80.6", "isp_1_name": "AT&T", "isp_2_name": "Comcast"},
    {"continent": "USA", "site_name": "Texas", "isp_1": "12.11.78.90", "isp_2": "38.87.164.114", "isp_1_name": "Verizon", "isp_2_name": "Spectrum"},
    {"continent": "EMEA", "site_name": "Sofia", "isp_1": "82.103.70.238", "isp_2": "4.4.4.4", "isp_1_name": "Vivacom", "isp_2_name": "A1 Bulgaria"},
    {"continent": "EMEA", "site_name": "Schweinfurt", "isp_1": "93.188.25.68", "isp_2": "15.15.15.15", "isp_1_name": "Deutsche Telekom", "isp_2_name": "Vodafone"},
    {"continent": "EMEA", "site_name": "Munich", "isp_1": "217.6.189.37", "isp_2": "16.16.16.16", "isp_1_name": "O2 Germany", "isp_2_name": "Unitymedia"},
    {"continent": "Asia", "site_name": "Bangalore", "isp_1": "45.112.138.22", "isp_2": "49.249.50.62", "isp_1_name": "Airtel", "isp_2_name": "Reliance Jio"},
    {"continent": "Asia", "site_name": "Tokyo", "isp_1": "210.227.234.210", "isp_2": "211.0.211.62", "isp_1_name": "NTT", "isp_2_name": "SoftBank"}
]

class Command(BaseCommand):
    help = 'Load mock site and ISP data into the database.'

    def handle(self, *args, **kwargs):
        for item in MOCK_DATA:
            location, _ = Location.objects.get_or_create(site_name=item["site_name"], continent_name=item["continent"])
            if item["isp_1"]:
                isp1, _ = ISP.objects.get_or_create(ip_address=item["isp_1"], name=item["isp_1_name"])
                location.isps.add(isp1)
            if item["isp_2"]:
                isp2, _ = ISP.objects.get_or_create(ip_address=item["isp_2"], name=item["isp_2_name"])
                location.isps.add(isp2)
        self.stdout.write(self.style.SUCCESS('Mock data loaded successfully.'))
