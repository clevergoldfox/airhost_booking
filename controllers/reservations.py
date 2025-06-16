import phonenumbers
import os
from dotenv import load_dotenv
from datetime import datetime
import phonenumbers
from phonenumbers import geocoder
from phonenumbers.phonenumberutil import region_code_for_number
from babel import Locale
import pycountry
import pytz
# import datetime
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

def insert_reservations(data):
    print(len(data))
    for booking in data:
        if check_booking_not_exist(booking):
            # Get the next available ID
            table_id = "airhostbooking-461314.airhost.reservations"
            
            query = """
                SELECT COUNT(*) as total
                FROM `airhostbooking-461314.airhost.reservations`
            """
            next_id = 1
            # Run the query
            query_job = client.query(query)
            result = query_job.result()
            if result.total_rows == 0:
                next_id = 1
                print("The reservations table is empty.")
            else:
                query = """
                    SELECT IFNULL(MAX(id), 0) + 1 AS next_id
                    FROM `airhostbooking-461314.airhost.reservations`
                """
                next_id = list(client.query(query))[0].next_id
        
            national_phone = get_country_name(normalize_number(booking["電話番号"])) if booking["電話番号"] else None
            try:
                予約日 = datetime.strptime(booking.get("予約日"),"%Y/%m/%d").date().isoformat()
                year, month = parse_date_parts(safe_str(booking.get("予約日")))
                合計日数 = safe_int(booking.get("合計日数"))
                販売 = safe_int(booking.get("販売"))

                rows_to_insert = [{
                    "id": next_id,
                    "booking_site": safe_str(booking.get("予約サイト")),
                    "channel_id": safe_str(booking.get("チャンネル予約ID")),
                    "airhost_id": safe_str(booking.get("AirHost予約ID")),
                    "check_in": datetime.strptime(booking.get("チェックイン"),"%Y/%m/%d").date().isoformat(),
                    "check_out": datetime.strptime(booking.get("チェックアウト"),"%Y/%m/%d").date().isoformat(),
                    "property_name": safe_str(booking.get("物件名")),
                    "property_tag": safe_str(booking.get("物件タグ")),
                    "property_num": safe_str(booking.get("部屋番号")),
                    "guest_name": safe_str(booking.get("ゲスト名")),
                    "phone": safe_str(booking.get("電話番号")),
                    "email": safe_str(booking.get("メールアドレス")),
                    "nationality": safe_str(booking.get("国籍")),
                    "guest_add": safe_str(booking.get("ゲストアドレス")),
                    "situation": safe_str(booking.get("状態")),
                    "checkin_situation": safe_str(booking.get("チェックイン状態")),
                    "paid_str": safe_str(booking.get("支払い済み")),
                    "guest_num": safe_int(booking.get("ゲスト数")),
                    "total_days": 合計日数,
                    "booking_date": 予約日,
                    "currency": safe_str(booking.get("通貨")),
                    "sale": 販売,
                    "ota_fee": safe_int(booking.get("OTA サービス料")),
                    "payout": safe_int(booking.get("受取金")),
                    "paid_int": safe_int(booking.get("支払済み（補助金/クーポン）")),
                    "ota_paid": safe_int(booking.get("OTA 決済")),
                    "credit": safe_int(booking.get("クレジット")),
                    "cash": safe_int(booking.get("現金")),
                    "uncollected": safe_int(booking.get("未収")),
                    "cleaning_fee": safe_int(booking.get("クリーニング代")),
                    "support_fee": safe_int(booking.get("サポート料金")),
                    "comment": safe_str(booking.get("コメント")),
                    "pricing_plan": safe_str(booking.get("料金プラン")),
                    "adult": safe_int(booking.get("大人")),
                    "child": safe_int(booking.get("子供")),
                    "explanation": safe_str(booking.get("説明")),
                    "paid_fee": safe_int(booking.get("決済手数料")),
                    "cancel": safe_str(booking.get("キャンセル")),
                    "booking_engine_coupons": safe_str(booking.get("予約エンジンクーポン")),
                    "update_time": datetime.fromisoformat(booking.get("更新日時")).replace(tzinfo=None).isoformat(sep=' '),
                    "infant": safe_int(booking.get("幼児")),
                    "pin": safe_int(booking.get("PIN")),
                    "xyear": str(year),
                    "monthly29_or_more": 合計日数 if 合計日数 > 28 else 0,
                    "bnb28_or_less": 合計日数 if 合計日数 <= 28 else 0,
                    "nationality_phone": national_phone,
                    "year": year,
                    "year_int": year,
                    "fiscal_year": year,
                    "year_month": f"{year}/{month}",
                    "sale_monthly": 販売 if 合計日数 > 28 else 0,
                    "sale_bnb": 販売 if 合計日数 <= 28 else 0,
                    "year_bnb_sale": 販売 if 合計日数 <= 28 else 0,
                    "preyear_bnb_sale": 0,
                    "bnb_days": 合計日数 if 合計日数 <= 28 else 0,
                    "type": "民泊" if 合計日数 <= 28 else "マンスリ",
                    "type_num": 1 if 合計日数 <= 28 else 2
                }]

                # rows_to_insert = [{
                #     "id": next_id,
                #     "予約サイト": booking["予約サイト"],
                #     "チャンネル予約ID": booking["チャンネル予約ID"],
                #     "AirHost予約ID": booking["AirHost予約ID"],
                #     "チェックイン": booking["チェックイン"],
                #     "チェックアウト": booking["チェックアウト"],
                #     "物件名": booking["物件名"],
                #     "物件タグ": booking["物件タグ"],
                #     "部屋番号": booking["部屋番号"],
                #     "ゲスト名": booking["ゲスト名"],
                #     "電話番号": booking["電話番号"],
                #     "メールアドレス": booking["メールアドレス"],
                #     "国籍": booking["国籍"],
                #     "ゲストアドレス": booking["ゲストアドレス"],
                #     "状態": booking["状態"],
                #     "チェックイン状態": booking["チェックイン状態"],
                #     "支払い済み": booking["支払い済み"],
                #     "ゲスト数": int(booking["ゲスト数"]),
                #     "合計日数": int(booking["合計日数"]),
                #     "予約日": booking["予約日"],
                #     "通貨": booking["通貨"],
                #     "販売": int(booking["販売"]),
                #     "OTA サービス料": int(booking["OTA サービス料"]),
                #     "受取金": int(booking["受取金"]),
                #     "支払済み": int(booking["支払済み（補助金/クーポン）"]),
                #     "OTA 決済": int(booking["OTA 決済"]),
                #     "クレジット": int(booking["クレジット"]),
                #     "現金": int(booking["現金"]),
                #     "未収": int(booking["未収"]),
                #     "クリーニング代": int(booking["クリーニング代"]),
                #     "サポート料金": int(booking["サポート料金"]),
                #     "コメント": booking["コメント"],
                #     "料金プラン": booking["料金プラン"],
                #     "大人": int(booking["大人"]),
                #     "子供": int(booking["子供"]),
                #     "説明": booking["説明"],
                #     "決済手数料": int(booking["決済手数料"]),
                #     "キャンセル": booking["キャンセル"],
                #     "予約エンジンクーポン": booking["予約エンジンクーポン"],
                #     "宿泊者名": booking["宿泊者名"],
                #     "更新日時": booking["更新日時"],
                #     "幼児": int(booking["幼児"]),
                #     "PIN": int(booking["PIN"]),
                #     "x年度": booking["予約日"].split("/")[0],
                #     "マンスリー29日以上": int(booking["合計日数"]) if int(booking["合計日数"]) > 28 else 0,
                #     "民泊28日以下": int(booking["合計日数"]) if int(booking["合計日数"]) <= 28 else 0,
                #     "国籍_電話番号": national_phone,
                #     "年度": int(booking["予約日"].split("/")[0]),
                #     "年度_数値": int(booking["予約日"].split("/")[0]),
                #     "年度選択制限表示": int(booking["予約日"].split("/")[0]),
                #     "年月": booking["予約日"].split("/")[0] + "/" + booking["予約日"].split("/")[1],
                #     "売上_マンスリー29日以上対象": int(booking["販売"]) if int(booking["合計日数"]) > 28 else 0,
                #     "売上_宿泊28日以下対象": int(booking["販売"]) if int(booking["合計日数"]) <= 28 else 0,
                #     "民泊_今年度売上": int(booking["販売"]) if int(booking["合計日数"]) <= 28 else 0,
                #     "民泊_前年度売上": 0,
                #     "民泊合計日数": int(booking["合計日数"]) if int(booking["合計日数"]) <= 28 else 0,
                #     "種別": "民泊" if int(booking["合計日数"]) <= 28 else "マンスリ" if int(booking["合計日数"]) > 28 else None,
                #     "種別_数値": 1 if int(booking["合計日数"]) <= 28 else 2 if int(booking["合計日数"]) > 28 else 0
                # }]
                print("Rows to insert:", next_id)
            except Exception as e:
                print("Error preparing data for insertion:", e)
            try:
                errors = client.insert_rows_json(table_id, rows_to_insert)
            except Exception as e:
                print("Error preparing data for insertion:", e)

            if errors:
                print("Insert failed:", errors)
            else:
                print("User inserted successfully.")
        else:
            print("This booking is already exists. not inserted.")
    return({"status": "success", "message": "successfully added"})

def get_reservations(airhostId = None):
    print("Getting reservations for airhostId:", airhostId)
    if not airhostId:
        query = """
            SELECT *
            FROM `airhostbooking-461314.airhost.reservations`
        """
    else:
        query = f"""
            SELECT *
            FROM `airhostbooking-461314.airhost.reservations`
            WHERE airhostId = '{airhostId}'
        """
    query_job = client.query(query)
    results = query_job.result()
    
    return [dict(row) for row in results]