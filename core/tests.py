import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables from the .env file one directory up
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Load Twilio credentials from environment variables
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_phone_number = os.getenv('TWILIO_PHONE_NUMBER')
recipient_phone_number = '+972549199012'  # Correctly set the recipient phone number directly
if not account_sid or not auth_token or not twilio_phone_number:
    raise EnvironmentError("Twilio credentials are not set in environment variables.")

# Initialize Twilio client
client = Client(account_sid, auth_token)

# Send SMS
message = client.messages.create(
    body="Ping test completed. Output:\n" + "No output available",
    from_=twilio_phone_number,
    to=recipient_phone_number
)

print("SMS sent successfully. Message SID:", message.sid)