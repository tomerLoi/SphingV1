from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Location
from rest_framework import serializers
from rest_framework import status, generics, permissions
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework.exceptions import NotFound
import time

from .models import ITMember, Location, ISP, Log, ToNotice, Alert, UserProfile
from .serializers import ITMemberSerializer, LocationSerializer, ISPSerializer, AlertSerializer
from .logic import ping_ip
from core import logic

# Login endpoint
class CustomLoginView(APIView):
    permission_classes = []
    def post(self, request):
        email = request.data.get('username')
        password = request.data.get('password')
        user = None
        if email and password:
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
        if user is None:
            return Response({'detail': 'Invalid credentials'}, status=400)
        refresh = RefreshToken.for_user(user)
        site_list_view = SiteListCreateView()
        dashboard_response = site_list_view.get(request)
        dashboard = dashboard_response.data
        return Response({
            'token': str(refresh.access_token),
            'user_id': user.id,
            'username': user.username,
            'dashboard': dashboard
        })

# Sites endpoints
class SiteListCreateView(APIView):
    def get(self, request):
        start_time = time.time()
        continents = Location.objects.values_list('continent_name', flat=True).distinct()
        result = []
        for continent in continents:
            locations = Location.objects.filter(continent_name=continent)
            sites_data = []
            for site in locations:
                isps = site.isps.all()
                isps_data = []
                for isp in isps:
                    activity_level = isp.activity_level
                    isps_data.append({
                        'isp_id': isp.id,
                        'name': isp.name,
                        'ip': isp.ip_address,
                        'status': 'online' if activity_level > 80 else 'offline'
                    })
                sites_data.append({
                    'site_id': site.id,
                    'site_name': site.site_name,
                    'continent': site.continent_name,
                    'isps': isps_data
                })
            result.append({
                'continent': continent,
                'sites': sites_data
            })
        resp = Response(result)
        end_time = time.time()
        print(f"SiteListCreateView GET processing time: {end_time - start_time:.2f} seconds")
        return resp

    def post(self, request):
        start_time = time.time()
        data = request.data
        site_id = data.get('site_id')
        site_name = data.get('site_name')
        continent = data.get('continent')
        isps = data.get('isps', [])
        if not site_name or not isinstance(site_name, str) or len(site_name) > 255:
            return Response({'error': 'site_name is required and must be a string up to 255 chars'}, status=400)
        if not continent or not isinstance(continent, str):
            return Response({'error': 'continent is required and must be a string'}, status=400)
        if not isps or not isinstance(isps, list) or len(isps) < 1:
            return Response({'error': 'isps is required and must be a non-empty array'}, status=400)
        for isp in isps:
            if not isp.get('name') or not isp.get('ip'):
                return Response({'error': 'Each ISP must have a name and ip'}, status=400)
        known_continents = set(Location.objects.values_list('continent_name', flat=True).distinct())
        if continent not in known_continents:
            return Response({'error': 'continent must match a known continent'}, status=400)
        end_time = time.time()
        print(f"POST request processing time: {end_time - start_time:.2f} seconds")
        if site_id:
            try:
                site = Location.objects.get(id=site_id)
                site.site_name = site_name
                site.continent_name = continent
                site.save()
                site.isps.clear()
                message = 'Site updated successfully'
            except Location.DoesNotExist:
                return Response({'error': 'Site not found'}, status=404)
        else:
            site = Location.objects.create(site_name=site_name, continent_name=continent)
            message = 'Site created successfully'
        for isp in isps:
            isp_obj, _ = ISP.objects.get_or_create(name=isp['name'], ip_address=isp['ip'])
            site.isps.add(isp_obj)
        site.save()
        resp = {
            'site': {
                'site_id': site.id,
                'site_name': site.site_name,
                'continent': site.continent_name,
                'isps': [{'name': isp.name, 'ip': isp.ip_address} for isp in site.isps.all()]
            },
            'message': message
        }
        end_time = time.time()
        print(f"POST request processing time: {end_time - start_time:.2f} seconds")
        return Response(resp, status=200)

class SiteRetrieveUpdateDestroyView(APIView):
    def get_object(self, pk):
        try:
            return Location.objects.get(pk=pk)
        except Location.DoesNotExist:
            raise NotFound('Site not found')
    def get(self, request, pk):
        site = self.get_object(pk)
        isps = site.isps.all()
        isps_data = []
        for isp in isps:
            isps_data.append({
                'isp_id': isp.id,
                'name': isp.name,
                'ip': isp.ip_address,
                'status': 'online' if ping_ip(isp.ip_address) else 'offline'
            })
        return Response({'site_id': site.id, 'site_name': site.site_name, 'continent': site.continent_name, 'isps': isps_data})
    def put(self, request, pk):
        site = self.get_object(pk)
        site.site_name = request.data.get('site_name', site.site_name)
        site.continent_name = request.data.get('continent', site.continent_name)
        site.save()
        isps = request.data.get('isps', [])
        site.isps.clear()
        for isp in isps:
            isp_obj, _ = ISP.objects.get_or_create(name=isp['name'], ip_address=isp['ip'])
            site.isps.add(isp_obj)
        return Response({'site_id': site.id, 'site_name': site.site_name, 'continent': site.continent_name})
    def delete(self, request, pk):
        site = self.get_object(pk)
        isps = list(site.isps.all())
        site.delete()
        for isp in isps:
            related_name = None
            for rel in isp._meta.related_objects:
                if rel.related_model.__name__ == 'Location':
                    related_name = rel.get_accessor_name()
                    break
            if related_name:
                if getattr(isp, related_name).count() == 0:
                    isp.delete()
            else:
                if hasattr(isp, 'location_set') and isp.location_set.count() == 0:
                    isp.delete()
        return Response(status=204)

# Members endpoints
class MemberListCreateView(APIView):
    def get(self, request):
        start_time = time.time()
        members = ITMember.objects.all()
        data = []
        for m in members:
            entry = {
                'id': m.id,
                'full_name': m.full_name,
                'phone': m.phone_number,
                'email': m.email,
                'location': m.location,
                'is_global': True
            }
            entry['locations'] = []
            for user in User.objects.all():
                if user.username == m.full_name:
                    m.role = 'IT Member'
                    break
            else:
                m.role = 'Contact'
            entry['role'] = m.role
            if m.role == 'IT Member':
                entry['locations'] = ['All']
            else:
                for notice in ToNotice.objects.all():
                    for sender in notice.members.all():
                        if str(sender) == str(m.full_name):
                            sites = notice.sites.all()
                            if not sites:
                                print(f"No sites associated with notice ID {notice.id}")
                            else:
                                for site in sites:
                                    if hasattr(site, 'site_name'):
                                        entry['locations'].append(site.site_name)
                                    else:
                                        entry['locations'].append(f"Invalid site object in notice ID {notice.id}")
            data.append(entry)
        all_locations = Location.objects.all()
        locations_data = [{'site_name': loc.site_name} for loc in all_locations]
        data.append({'all_locations': locations_data})
        resp = Response(data)
        end_time = time.time()
        print(f"MemberListCreateView GET processing time: {end_time - start_time:.2f} seconds")
        return resp
    
    def post(self, request):
        data = request.data
        required_fields = ['full_name', 'role', 'email','location', 'phone']
        for field in required_fields:
            if not data.get(field):
                return Response({'error': f'{field} is required'}, status=400)
        try:
            validate_email(data['email'])
        except ValidationError:
            return Response({'error': 'Invalid email'}, status=400)
        try:
            member = ITMember.objects.create(
                full_name=data['full_name'],
                email=data['email'],
                phone_number=data.get('phone', data.get('phone_number', '')),
                location=data.get('location', '')
            )
            if data['role'].lower() == 'it member':
                password = data.get('password')
                if not password:
                    return Response({'error': 'Password is required for IT Member role'}, status=400)
                username = data['full_name']
                if User.objects.filter(username=username).exists():
                    return Response({'error': 'User with this username already exists'}, status=400)
                user = User.objects.create_user(username=username, password=password, email=data['email'])
            serializer = ITMemberSerializer(member)
            return Response(serializer.data, status=201)
        except Exception as e:
            return Response({'error': f'Server error: {e}'}, status=500)

# --- Fixed class ---
class MemberRetrieveUpdateDestroyView(APIView):
    def get_object(self, pk):
        try:
            return ITMember.objects.get(pk=pk)
        except ITMember.DoesNotExist:
            raise NotFound('ITMember not found')

    def put(self, request, pk):
        member = self.get_object(pk)
        data = request.data
        member.full_name = data.get('full_name', member.full_name)
        member.email = data.get('email', member.email)
        member.phone_number = data.get('phone', member.phone_number)
        locations_str = data.get('locations') or data.get('location') or ""
        if isinstance(locations_str, list):
            member.location = ", ".join(locations_str)
        else:
            member.location = locations_str
        member.save()
        ToNotice.objects.filter(members=member).delete()
        locations = [loc.strip() for loc in member.location.split(',') if loc.strip()]
        for location_name in locations:
            try:
                location = Location.objects.get(site_name=location_name)
                notice = ToNotice.objects.create(valid_till='2099-12-31')
                notice.members.add(member)
                notice.sites.add(location)
                notice.save()
            except Location.DoesNotExist:
                continue
        if data.get('role', '').lower() == 'it member':
            user, created = User.objects.get_or_create(username=member.full_name, defaults={'email': member.email})
            if created:
                password = data.get('password', None)
                if password:
                    user.set_password(password)
                    user.save()
        elif data.get('role', '').lower() == 'contact':
            try:
                user = User.objects.get(username=member.full_name)
                user.delete()
            except User.DoesNotExist:
                pass
        serializer = ITMemberSerializer(member)
        return Response(serializer.data, status=200)

    def delete(self, request, pk):
        member = self.get_object(pk)
        try:
            user = User.objects.get(username=member.full_name)
            user.delete()
        except User.DoesNotExist:
            pass
        member.delete()
        return Response({'message': 'ITMember and associated User (if any) deleted successfully'}, status=204)
# --- End fix ---

class MemberTestSMSView(APIView):
    def post(self, request, pk):
        return Response({'success': True})

class AlertListView(APIView):
    def get(self, request):
        start_time = time.time()
        limit = int(request.query_params.get('limit', 50))
        alerts = Alert.objects.all().order_by('-timestamp')[:limit]
        data = []
        for alert in alerts:
            data.append({
                'id': alert.id,
                'site_id': None,
                'isp_id': None,
                'timestamp': alert.timestamp,
                'type': 'critical',
                'message': f'Alert {alert.id}'
            })
        resp = Response(data)
        end_time = time.time()
        print(f"AlertListView GET processing time: {end_time - start_time:.2f} seconds")
        return resp

class LocationCreateWithISPsView(APIView):
    def post(self, request):
        name = request.data.get('name')
        continent = request.data.get('continent')
        isps = request.data.get('isps', [])
        if not all([name, continent]) or not isps or len(isps) < 2:
            return Response({'detail': 'Missing required fields or insufficient ISPs'}, status=400)
        location = Location.objects.create(site_name=name, continent_name=continent)
        for isp_data in isps:
            isp_name = isp_data.get('name')
            isp_ip = isp_data.get('ip')
            if not all([isp_name, isp_ip]):
                return Response({'detail': 'Missing ISP name or IP'}, status=400)
            isp, _ = ISP.objects.get_or_create(name=isp_name, ip_address=isp_ip)
            location.isps.add(isp)
        location.save()
        return Response({
            'id': location.id,
            'name': location.site_name,
            'continent': location.continent_name,
            'isps': [{'name': isp.name, 'ip': isp.ip_address} for isp in location.isps.all()]
        }, status=201)

class AddSiteContinentListView(APIView):
    def get(self, request):
        start_time = time.time()
        continents = Location.objects.values_list('continent_name', flat=True).distinct()
        resp = Response(list(continents))
        end_time = time.time()
        print(f"AddSiteContinentListView GET processing time: {end_time - start_time:.2f} seconds")
        return resp

class LocationDeleteWithISPsView(APIView):
    def post(self, request):
        location_id = request.data.get('location_id')
        if not location_id:
            return Response({'error': 'location_id is required'}, status=400)
        try:
            location = Location.objects.get(id=location_id)
        except Location.DoesNotExist:
            return Response({'error': 'Location not found'}, status=404)
        isps = list(location.isps.all())
        location.delete()
        deleted_isps = []
        for isp in isps:
            if isp.location_set.count() == 0:
                deleted_isps.append({'id': isp.id, 'name': isp.name, 'ip': isp.ip_address})
                isp.delete()
        return Response({'deleted_location_id': location_id, 'deleted_isps': deleted_isps}, status=200)
        
class LogListView(APIView):
    def get(self, request):
        start_time = time.time()
        logs = Log.objects.all().order_by('-timestamp')[:50]
        logs_data = [
            {
                'timestamp': log.timestamp,
                'message': log.message,
            }
            for log in logs
        ]
        resp = Response({'logs': logs_data})
        end_time = time.time()
        print(f"LogListView GET processing time: {end_time - start_time:.2f} seconds")
        return resp

class LocationListView(APIView):
    def get(self, request):
        locations = Location.objects.all()
        data = [
            {
                'site_name': loc.site_name,
            }
            for loc in locations
        ]
        return Response(data, status=200 if locations.exists() else 404)

class ContinentListView(APIView):
    def get(self, request):
        start_time = time.time()
        continents = Location.objects.values_list('continent_name', flat=True).distinct()
        data = [{'continent_name': continent} for continent in continents]
        resp = Response(data)
        end_time = time.time()
        print(f"ContinentListView GET processing time: {end_time - start_time:.2f} seconds")
        return resp
    
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        print(user)
        try:
            try:
                profile = ITMember.objects.filter(full_name=user).first()
                print(profile)
            except profile.DoesNotExist:
                return Response({'error': 'User profile not found'}, status=404)
            print(profile.phone_number)
            data = {
                'full_name': profile.full_name,
                'email': profile.email,
                'phone': profile.phone_number,
            }
            return Response(data, status=200)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=404)

    def put(self, request):
        user = request.user
        data = request.data
        try:
            profile = ITMember.objects.get(full_name=user)
            profile.full_name = data.get('full_name', profile.full_name)
            profile.email = data.get('email', profile.email)
            profile.phone_number = data.get('phone', profile.phone_number)
            profile.password = data.get('password')
            if profile.password:
                user.set_password(profile.password)
                user.save()
            profile.save()
            return Response({'message': 'Profile updated successfully'}, status=200)
        except ITMember.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=404)
