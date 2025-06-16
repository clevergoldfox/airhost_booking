import phonenumbers
from phonenumbers import geocoder
from phonenumbers.phonenumberutil import region_code_for_number
import pycountry
import re

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
            return "Invalid"

        region_code = region_code_for_number(parsed_number)
        if region_code:
            country = pycountry.countries.get(alpha_2=region_code)
            return country.name if country else "Unknown"
        else:
            return "Unknown"
    except:
        return "Parse Error"

# Your input
raw_numbers = [
    "61423886744", "50660574884", "13107205626", "4.91624E+11", "3.51926E+11",
    "13474205764", "61417628509", "4.91783E+11", "13108552168", "60123331337",
    "+61 422 267 118", "61409534536", "61417637886", "48732922125",
    "61455100199", "14158106593", "12404497238", "14136367231",
    "6.28176E+11", "13233847265", "14159719114", "+33 6 31 22 01 56"
]

# Print corrected output
for raw in raw_numbers:
    norm = normalize_number(raw)
    country = get_country_name(norm)
    print(f"{raw} -> {country}")
