import phonenumbers
from phonenumbers import geocoder

def get_country_from_phone(phone_str, default_region="JP"):
    try:
        # Remove spaces and dashes
        cleaned = phone_str.strip().replace(" ", "").replace("-", "")
        
        # If the number starts with +, use None as region (E.164 format)
        if cleaned.startswith("+"):
            number = phonenumbers.parse(cleaned, None)
        else:
            number = phonenumbers.parse(cleaned, default_region)

        if not phonenumbers.is_valid_number(number):
            return "Invalid number"
        
        country = geocoder.description_for_number(number, "en")
        return country

    except phonenumbers.NumberParseException as e:
        return f"Error: {str(e)}"

# Examples
print(get_country_from_phone("+819012345678"))   # => Japan
print(get_country_from_phone("1310720562"))     # => Japan (with "JP" as default region)
print(get_country_from_phone("12025550123", "US")) # => United States
