# 🗄️ Database Schema

## 👤 Collection: users

| Field | Type | Description |
|-------|------|-------------|
| uniqueId | String | Unique identifier |
| userName | String | Full name |
| mobileNumber | String | Unique mobile number |
| role | String | `admin`, `resident`, `gatekeeper` |
| residentType | String | `owner`, `tenant` (Optional for non-residents) |
| owner_id| String | ID of owner (Optional for tenants) |
| flatNumber | String | Flat number (Resident only) |
| vehicleNumber | String | Vehicle number (Resident only) |
| societyId | String | ID of the society |
| photo_url | String | URL to profile photo |
| fcmToken | String | Firebase Cloud Messaging token |
| createdAt | Date | Timestamp |

## 🚶 Collection: visitors

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique ID |
| visitor_name | String | Name |
| mobile | String | Mobile number |
| flat_number | String | Target flat |
| purpose | String | Purpose of visit |
| status | String | `pending`, `checked-in`, `checked-out` |
| check_in_time | Date | In time |
| check_out_time | Date | Out time |
| gatekeeper_id | String | Checked by |
| resident_id | String | Resident visited |
| society_id | String | Society ID |
| created_at | Date | Timestamp |

## 📱 Collection: preapprovedguests

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique ID |
| qr_token | String | Unique QR token |
| resident_id | String | Requestor |
| visitor_name | String | Guest name |
| mobile | String | Guest mobile |
| valid_date | Date | Expiry date |
| status | String | `pending`, `used` |
| society_id | String | Society ID |
| created_at | Date | Timestamp |
