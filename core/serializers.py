from rest_framework import serializers
from .models import ITMember, UserProfile, Location, ISP, ToNotice, Alert
from django.contrib.auth.models import User

class ITMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = ITMember
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_superuser']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = UserProfile
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class ISPSerializer(serializers.ModelSerializer):
    class Meta:
        model = ISP
        fields = '__all__'

class ToNoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToNotice
        fields = '__all__'

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'
