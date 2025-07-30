from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views
from .views import LogListView, LocationDeleteWithISPsView

urlpatterns = [
    path('login/', views.CustomLoginView.as_view(), name='custom_login'),
    path('sites/', views.SiteListCreateView.as_view(), name='site-list-create'),
    path('sites/<int:pk>/', views.SiteRetrieveUpdateDestroyView.as_view(), name='site-detail'),
    path('it_members/<int:pk>/', views.MemberRetrieveUpdateDestroyView.as_view(), name='member-detail'),
    path('createsite/', views.LocationCreateWithISPsView.as_view(), name='location-create-with-isps'),
    path('addsite/', views.AddSiteContinentListView.as_view(), name='addsite'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('it_members/', views.MemberListCreateView.as_view(), name='it-member-list-create'),
    path('alerts/', LogListView.as_view(), name='log-list'),
    path('locations/', views.LocationListView.as_view(), name='location-list'),
    path('continents/', views.ContinentListView.as_view(), name='continent-list'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
]