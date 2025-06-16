import phonenumbers
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import phonenumbers
from phonenumbers import geocoder
from phonenumbers.phonenumberutil import region_code_for_number
from babel import Locale
import pycountry
import re


# Load .env variables
load_dotenv()

# Get the path from the environment and set it for Google credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Now you can safely use BigQuery
from google.cloud import bigquery
client = bigquery.Client()

def safe_int(val):
    try:
        return int(float(val))
    except:
        return 0

def safe_str(val):
    return str(val) if val is not None else ""

def parse_date_parts(date_str):
    try:
        parts = date_str.split("/")
        year = int(parts[0]) if len(parts) > 0 else 0
        month = parts[1] if len(parts) > 1 else "01"
        return year, month
    except:
        return 0, "01"

def check_booking_not_exist(data):
    print(data)
    client = bigquery.Client()

    query = f"""
        SELECT COUNT(*) as count
        FROM `airhostbooking-461314.airhost.reservations`
        WHERE 'AirHost予約ID' = '{data["AirHost予約ID"]}'
    """
    query_job = client.query(query)
    result = query_job.result()
    row = list(result)[0]
    if row["count"] > 0:
        return False
    else:
        return True

def normalize_number(raw_number):
    try:
        if isinstance(raw_number, float):
            raw_number = str(int(raw_number))
        elif isinstance(raw_number, str) and 'e+' in raw_number.lower():
            raw_number = str(int(float(raw_number)))
    except:
        pass

    digits = re.sub(r'\D', '', str(raw_number))
    if not digits.startswith('+') and len(digits) >= 10:
        digits = '+' + digits
    return digits

def get_country_name(phone_number):
    try:
        parsed_number = phonenumbers.parse(phone_number, None)
        if not phonenumbers.is_valid_number(parsed_number):
            return "無効な番号"

        region_code = region_code_for_number(parsed_number)
        if region_code:
            locale = Locale('ja')
            # country = pycountry.countries.get(alpha_2=region_code)
            # return country.name if country else "Unknown"
            country_name = locale.territories.get(region_code.upper(), "不明")
            return country_name
        else:
            return "不明"
    except:
        return "解析エラー"

def insert_calendar(data):
    print(len(data))
    pre_data = []
    calendar_data = []
    for booking in data:
        if not any(booking["物件名"] in item for item in pre_data):
            pre_data.append({booking["物件名"]: [booking]})
        else:
            for item in pre_data:
                if booking["物件名"] in item:
                    item[booking["物件名"]].append(booking)
    for item in pre_data:
        prop = list(item.keys())[0]
        print(prop)
        # for reservation in item[prop]:
        # print(item[prop])
        try:
            sorted_data = sorted(
                item[prop],
                key=lambda x: datetime.strptime(x['チェックイン'], '%Y/%m/%d')
            )
            for reservation in sorted_data:
                reservation["チェックイン"] = datetime.strptime(reservation["チェックイン"], '%Y/%m/%d').strftime('%Y-%m-%d')
                reservation["チェックアウト"] = datetime.strptime(reservation["チェックアウト"], '%Y/%m/%d').strftime('%Y-%m-%d')
                calendar_data.append(reservation)
        

            print(f"  チェックイン: {sorted_data[0]['チェックイン']}, チェックアウト: {sorted_data[-1]['チェックアウト']}")
            print(f"  物件名: {prop}, レビュー数: {sorted_data[0]}")
        except Exception as e:
            print(f"Error sorting dates for {prop}: {e}")
            # continue
            

def get_calendar(airhostId = None):
    print("Getting reservations for airhostId:", airhostId)