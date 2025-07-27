
import subprocess
import platform
import threading
import time
from .models import *




def start_concurrent_pings(ip_addresses, count=1, timeout=1000, wait_time=5):
    """
    Starts a background thread for each IP address to continuously ping them concurrently every 10 seconds.
    Waits for a specified time before returning the initial results.
    Returns a dictionary with IP addresses as keys and their latest ping results as values.
    """
    ping_results = {ip: None for ip in ip_addresses}

    def ping_loop(ip_address):
        while True:
            reachable = ping_ip(ip_address, count, timeout)
            ping_results[ip_address] = reachable
            time.sleep(10)

    # Start threads for each IP address
    for ip_address in ip_addresses:
        thread = threading.Thread(target=ping_loop, args=(ip_address,), daemon=True)
        thread.start()

    # Allow some time for threads to perform initial pings
    time.sleep(wait_time)

    # Start a background thread for periodic updates and monitoring
    def periodic_updates():
        while True:
            if all(result is not None for result in ping_results.values()):
                update_isp_activity_level(ping_results)
            monitor_isp_connectivity()
            delete_false_alerts()
            check_round_of_three_alerts()
            time.sleep(10)  # Wait before the next round of updates

    monitoring_thread = threading.Thread(target=periodic_updates, daemon=True)
    monitoring_thread.start()

    return ping_results


def ping_ip(ip_address, count=1, timeout=1000):
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

def monitor_isp_connectivity(threshold=80):
    """
    Monitors the ping results for a given ISP and creates an alert instance
    in the model if the success rate for any IP address falls below the specified threshold.
    """
    """
        Loops through all ISPs in the database and checks their connectivity level.
        Updates all ISPs with the same IP address and creates or removes alerts based on the success rate.
        """

    try:
        isps = ISP.objects.all()
        checked_ids = set()
        for isp in isps:
            isp_id = isp.id
            if isp_id in checked_ids:
                continue
            checked_ids.add(isp_id)
            alert_exists = Alert.objects.filter(isps__id=isp_id).exists()
            if alert_exists:
                # If this ISP is below threshold, keep alert, else remove
                if isp.activity_level < threshold:
                    continue
                else:
                    remove_alerts_by_ip(isp.ip_address)
            else:
                # If this ISP is below threshold, create alert
                if isp.activity_level < threshold:
                    create_alert(isp.ip_address, isp.activity_level)
    except Exception as e:
        print(f"An error occurred while monitoring ISP connectivity: {e}")

def create_alert(ip_address, success_rate):
    """
    Creates an alert instance in the model for the given IP address and success rate.
    """
    try:
        if success_rate < 80 and not check_alert_exists(ip_address):
            isps = list(ISP.objects.filter(ip_address=ip_address))
            if not isps:
                isp = ISP.objects.create(ip_address=ip_address, name=f"ISP_{ip_address}")
                isps = [isp]
            alert = Alert.objects.create(success_rate=success_rate)
            for isp in isps:
                alert.isps.add(isp)
            create_log_entry(f"Alert created for {ip_address} is down with success rate {success_rate}")
    except Exception as e:
        print(f"An error occurred while creating an alert: {e}")
        
def check_alert_exists(ip_address):
    """
    Checks whether an alert exists for the given ISP IP address.
    Returns True if an alert exists, False otherwise.
    """
    try:
        isps = ISP.objects.filter(ip_address=ip_address)
        if isps.exists():
            return Alert.objects.filter(isps__in=isps).exists()
        return False
    except Exception as e:
        print(f"An error occurred while checking for an alert: {e}")
        return False
     
def remove_alerts_by_ip(ip_address):
    """
    Removes all alerts associated with the given IP address.
    """
    try:
        isps = ISP.objects.filter(ip_address=ip_address)
        if isps.exists():
            print(f"Removing alerts for ISPs with IP {ip_address}")
            alerts = Alert.objects.filter(isps__in=isps)
            if alerts.exists():
                print(f"Found {alerts.count()} alerts to delete for ISPs with IP {ip_address}")
                alerts.delete()
                create_log_entry(f"Deleted alerts for ISPs with IP {ip_address} ip is back online")
            else:
                print(f"No alerts found for ISPs with IP {ip_address}")
        else:
            print(f"No ISPs found with IP {ip_address}")
    except Exception as e:
        print(f"An error occurred while removing alerts: {e}")
             
def delete_false_alerts():
    """
    Deletes alerts that do not have a corresponding ISP address.
    For each alert, checks if the associated IP address exists in the ISP model.
    If the IP address does not exist, removes the alert.
    """
    try:
        alerts = Alert.objects.all()
        for alert in alerts:
            isps = alert.isps.all()
            for isp in isps:
                if not ISP.objects.filter(ip_address=isp.ip_address).exists():
                    #print(f"IP address {isp.ip_address} does not exist. Removing from alert.")
                    alert.isps.remove(isp)
                    create_log_entry(f"Removed ISP {isp.name} ({isp.ip_address}) from alert {alert.id} as it does not exist.")
            if not alert.isps.exists():  # If no ISPs are associated with the alert, delete it
                print(f"No valid ISPs associated with alert {alert.id}. Deleting alert.")
                alert.delete()
    except Exception as e:
        print(f"An error occurred while deleting false alerts: {e}")
                
#users and members logic 

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
                print(f"Member created for user {user.username}")
    except Exception as e:
        print(f"An error occurred while ensuring users are members: {e}")
        

def create_log_entry(message):
    """
    Creates a new log entry in the Log model with the given message.
    """
    try:
        Log.objects.create(message=message, timestamp=time.strftime('%Y-%m-%d %H:%M:%S'))
        print(f"Log entry created: {message}")
    except Exception as e:
        print(f"An error occurred while creating a log entry: {e}")


def delete_old_logs(days=3):
    """
    Deletes log entries older than the specified number of days.
    """
    try:
        cutoff_time = time.time() - (days * 24 * 60 * 60)
        old_logs = Log.objects.filter(timestamp__lt=time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(cutoff_time)))
        count = old_logs.count()
        old_logs.delete()
        print(f"Deleted {count} log entries older than {days} days.")
    except Exception as e:
        print(f"An error occurred while deleting old logs: {e}")
        
def check_round_of_three_alerts():
    """
    Checks all alerts to see if they are in a 'round of three' state.
    A 'round of three' means that (current time - alert timestamp) / 3 is rounded to 10 seconds.
    """
    try:
        alerts = Alert.objects.all()
        current_time = time.time()
        for alert in alerts:
            alert_time = time.mktime(alert.timestamp.timetuple())
            elapsed_time = current_time - alert_time
            if (elapsed_time / 3) % 10 == 0:
                print(f"Alert {alert.id} is in a round of three state.")
                hours_active = int(elapsed_time // 3600)
                create_log_entry(f"Alert {alert.id} has been active for {hours_active} hours.")
    except Exception as e:
        print(f"An error occurred while checking round of three alerts: {e}")
        