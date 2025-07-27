from django.apps import AppConfig

class CoreConfig(AppConfig):
    name = 'core'

    def ready(self):
        from .logic import ensure_users_are_members, ensure_no_duplicate_notices
        ensure_users_are_members()


from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        import sys
        if 'runserver' not in sys.argv:
            return
        from django.db import connection
        try:
            from .models import ISP
            from .logic import start_concurrent_pings
            # Check if the table exists
            if 'core_isp' in connection.introspection.table_names():
                ip_list = list(ISP.objects.values_list('ip_address', flat=True))
                if ip_list:
                    start_concurrent_pings(ip_list)
        except Exception:
            pass
