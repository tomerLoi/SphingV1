import subprocess
import platform
import threading
import time
from .models import *
import datetime
from django.utils import timezone
import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables from the .env file one directory up
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))




def start_concurrent_pings(ip_addresses, count=1, timeout=1000):
    """
    Starts a background thread for each IP address to continuously ping them concurrently.
    Updates ISP activity levels after all pings are completed.
    Runs periodic tasks every 10 seconds.
    """
    ping_results = {ip: None for ip in ip_addresses}

    def ping_and_update():
        while True:
            # Ping all IPs and update activity levels
            for ip_address in ip_addresses:
                reachable = ping_ip(ip_address, count, timeout)
                ping_results[ip_address] = reachable
            time.sleep(10)
            update_isp_activity_level(ping_results)
            ensure_users_are_members()
            ensure_locations_have_to_notice()
            monitor_activity()

    # Start a single thread to handle all pings and periodic tasks
    thread = threading.Thread(target=ping_and_update, daemon=True)
    thread.start()

    return ping_results

def ping_ip(ip_address, count=5, timeout=1000):
    """
    Pings an IP address. Returns True if reachable, False otherwise.
    count: number of echo requests
    timeout: timeout in milliseconds
    """

    param_count = '-n' if platform.system().lower() == 'windows' else '-c'
    param_timeout = '-w' if platform.system().lower() == 'windows' else '-W'
    # On Windows, timeout is in ms; on Unix, it's in seconds
    timeout_val = str(timeout if platform.system().lower() == 'windows' else int(timeout/1000))
    try:
        result = subprocess.run([
            'ping', param_count, str(count), param_timeout, timeout_val, ip_address
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output = result.stdout.decode()

        
        # Calculate percentage of successful pings
        if result.returncode == 0:
            success_count = output.lower().count('reply from')
            
            return (success_count / count) * 100
        else:
            return 0
    except Exception as e:
        #print(f"An error occurred: {e}")
        return 0

def update_isp_activity_level(ping_results):
    """
    Safely updates ISP activity levels using a thread-safe approach for SQLite.
    Handles 'database is locked' errors by retrying the operation.
    """
    for ip_address, success_rate in ping_results.items():
        retry_attempts = 5  # Number of retry attempts for 'database is locked' errors
        for attempt in range(retry_attempts):
            try:
                # Use a thread-safe approach to handle SQLite database updates
                with threading.Lock():
                    isps = ISP.objects.filter(ip_address=ip_address)
                    for isp in isps:
                        isp.activity_level = success_rate
                        isp.save()
                break  # Exit retry loop if operation succeeds
            except Exception as e:
                if "database is locked" in str(e).lower():
                    print(f"Database is locked. Retrying ({attempt + 1}/{retry_attempts})...")
                    time.sleep(0.5)  # Wait before retrying
                else:
                    print(f"An error occurred while updating ISP activity level for {ip_address}: {e}")
                    break  # Exit retry loop for non-retryable errors

def ensure_users_are_members():
    """
    Ensures that every user in the database is also a member.
    If a corresponding member does not exist, it creates one.
    """

    try:
        users = User.objects.all()
        for user in users:
            member_exists = ITMember.objects.filter(full_name=user.username).exists()
            if not member_exists:
                ITMember.objects.create(full_name=user.username, phone_number='', location='', email=user.email)
    except Exception as e:
        pass

def ensure_locations_have_to_notice():
    """
    Ensures that each Location has a corresponding ToNotice object.
    If a ToNotice object does not exist, it creates one with default values.
    """
    try:
        locations = Location.objects.all()
        for location in locations:
            to_notice_exists = ToNotice.objects.filter(sites=location).exists()
            if not to_notice_exists:
                from django.utils import timezone
                to_notice = ToNotice.objects.create(
                    sites=location,
                    valid_till=timezone.make_aware(datetime.datetime(2099, 1, 1))
                )
                to_notice.members.set([])
    except Exception as e:
        pass
      
def create_log_entry(description):
    """
    Create a log entry with the given description.
    """
    try:
        # Ensure timezone-aware datetime for Log.timestamp
        log = Log.objects.create(message=description, timestamp=timezone.now())
        notify_members_on_log(description)
    except Exception as e:
        pass

# --- Notification logic ---
def notify_members_on_log(log_message):
    """
    Notifies relevant ITMembers by email and SMS when a log is created.
    - If the member is also a User, notify for all logs.
    - If not a User, notify only if the member is in ToNotice for the log's location.
    """
    description, location_name, isp, ip_address = parse_log_message(log_message)
    
    if not location_name:
        return
    
    # Get all ITMembers
    for member in ITMember.objects.all():
        
        # Check if member is also a User
        is_user = User.objects.filter(username=member.full_name).exists()
        
        should_notify = False
        if is_user:
            should_notify = True
        else:
            # Not a user: check ToNotice for this location
            try:
                loc = Location.objects.get(site_name=location_name)
                
                to_notice = ToNotice.objects.filter(sites=loc, members=member).exists()
                
                if to_notice:
                    should_notify = True
            except Location.DoesNotExist:
                pass
        
        if should_notify:
            # Send email and SMS (replace with real services)
            send_email(member.email, f"Alert: {description}", log_message)
            send_sms(member.phone_number, log_message)

# Load Twilio credentials from environment variables
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Initialize Twilio client
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_email(to_email, subject, body):
    """
    Sends an email using Twilio SendGrid API (or similar service).
    Replace this with actual implementation for email sending.
    """
    # Implement email sending logic here using Twilio SendGrid or other email service

def send_sms(to_number, message):
    """
    Sends an SMS using Twilio API.
    """
    try:
        message = twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_number
        )
    except Exception as e:
        pass
        

def create_alert(isp, success_rate):
    """
    Creates an alert for the given ISP with the specified message and resolved status.
    """
    try:
        from django.utils import timezone
        Alert.objects.create(isps=isp, success_rate=success_rate, timestamp=timezone.now())
    except Exception as e:
        pass

def parse_log_message(log_message):
    """
    Parses a log message into its components: description, location, ISP, and IP address.
    Handles both standard (colon-separated) and simple status messages.

    Returns:
        tuple: (description, location, isp, ip_address)
    """
    try:
        if not log_message or not isinstance(log_message, str):
            return None, None, None, None
        parts = log_message.split(':')
        if len(parts) == 4:
            description = parts[0].strip()
            location = parts[1].strip()
            isp = parts[2].strip()
            ip_address = parts[3].strip()
            return description, location, isp, ip_address
        # Handle 'ISP ... is back up. Alert resolved.'
        elif log_message.lower().startswith("isp") and "back up" in log_message.lower() and "alert resolved" in log_message.lower():
            import re
            match = re.match(r"ISP ([^ ]+) is back up\. Alert resolved\.", log_message)
            if match:
                isp_name = match.group(1)
                description = log_message.strip()
                return description, None, isp_name, None
            else:
                description = log_message.strip()
                return description, None, None, None
        # Add more custom parsing as needed for other formats
        return log_message.strip(), None, None, None
    except Exception as e:
        return log_message if isinstance(log_message, str) else None, None, None, None

def filter_logs(isp_name, ip_address, minutes):
    """
    Filters logs for a specific ISP and IP address within the last given number of minutes.

    Args:
        isp_name (str): The name of the ISP to filter logs for.
        ip_address (str): The IP address to filter logs for.
        minutes (int): The time period in minutes to look back.

    Returns:
        list: A list of filtered logs matching the criteria.
    """
    try:
        from django.utils import timezone
        time_threshold = timezone.now() - datetime.timedelta(minutes=minutes)
        recent_logs = Log.objects.filter(timestamp__gte=time_threshold)
        filtered_logs = []

        for log in recent_logs:
            description, location, log_isp, log_ip = parse_log_message(log.message)
            if log_isp == isp_name and log_ip == ip_address:
                filtered_logs.append(log)

        return filtered_logs
    except Exception as e:
        return []

def monitor_activity():
    """
    Monitors ISP activity and handles alerts and logs based on ISP status.
    """
    try:
        isps = ISP.objects.all()

        for isp in isps:
            location = isp.site if hasattr(isp, 'site') else None

            if isp.activity_level < 80:  # ISP is down
                recent_alert = Alert.objects.filter(isps=isp).order_by('-timestamp').first()
                if not recent_alert:
                    create_alert(isp, isp.activity_level)
                else:
                    time_since_alert = (timezone.now() - recent_alert.timestamp).total_seconds() / 60

                    filtered_logs = filter_logs(isp.name, isp.ip_address, 30)
                    if not filtered_logs and time_since_alert > 10:
                        create_log_entry(
                            description=f"Site down: {location.site_name if location else 'Unknown'}: {isp.name}: {isp.ip_address}"
                        )
                    if not filtered_logs and time_since_alert > 180:  # More than 3 hours
                        filtered_logs_3_hours = filter_logs(isp.name, isp.ip_address, 180)
                        if not filtered_logs_3_hours:
                            create_log_entry(
                                description=f"ISP is down for more than {time_since_alert / 60} hours: {isp.name} ({isp.ip_address}) : {location.site_name if location else 'Unknown'} : {isp.name} : {isp.ip_address}"
                            )
            else:  # ISP is up
                alert = Alert.objects.filter(isps=isp).first()

                if alert:
                    time_since_alert = (timezone.now() - alert.timestamp).total_seconds() / 60

                    if time_since_alert > 10:
                        alert.delete()
                        location_name = location.site_name if location else 'Unknown'
                        create_log_entry(
                            description=f"ISP is back up: {location_name}: {isp.name}: {isp.ip_address}"
                        )
    except Exception as e:
        pass
