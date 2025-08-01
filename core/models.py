from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_migrate
from django.dispatch import receiver

class ITMember(models.Model):
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=50)
    location = models.CharField(max_length=255)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.full_name

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    member = models.OneToOneField(ITMember, on_delete=models.CASCADE)
    # Password is handled by User model (hashed)

    def __str__(self):
        return self.user.username

class Location(models.Model):
    site_name = models.CharField(max_length=255)
    continent_name = models.ForeignKey("Continent", verbose_name=("Continent"), on_delete=models.CASCADE)

    def __str__(self):
        return self.site_name

class Continent(models.Model):
    continent_name = models.CharField(max_length=255)

    def __str__(self):
        return self.continent_name

    @receiver(post_migrate)
    def create_default_continents(sender, **kwargs):
        if sender.name == "core":  # Ensure this runs only for the 'core' app
            if not Continent.objects.exists():
                default_continents = ["Israel", "Europe", "Asia", "US"]
                for continent_name in default_continents:
                    Continent.objects.create(continent_name=continent_name)



class ISP(models.Model):
    ip_address = models.GenericIPAddressField(protocol='IPv4')
    name = models.CharField(max_length=255)
    site = models.ForeignKey('Location', related_name='isps', on_delete=models.CASCADE)
    activity_level = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.ip_address})"

class ToNotice(models.Model):
    sites = models.OneToOneField(Location, related_name='notices', on_delete=models.CASCADE)
    members = models.ManyToManyField(ITMember, related_name='notices')
    valid_till = models.DateField()

    def __str__(self):
        return f"Notice {self.id} valid till {self.valid_till}"

class Alert(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    isps = models.ForeignKey(ISP, related_name='alerts', on_delete=models.CASCADE)
    success_rate = models.FloatField(default=1)

    def __str__(self):
        return f"Alert {self.id} at {self.timestamp}"
    
class Log(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    message = models.TextField()

    def __str__(self):
        return f"Log {self.id} at {self.timestamp}"
