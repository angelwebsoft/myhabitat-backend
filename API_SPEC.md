# 🔌 API Specification (Backend Contract)

This document defines request & response format based on current database schema.

---

## 🔐 POST /login

### Request:

{
"mobileNumber": "string"
}

### Response:

{
"success": true,
"data": {
"uniqueId": "usr_1",
"userName": "Amit Shah",
"role": "admin | gatekeeper | resident",
"societyId": "soc_1",
"fcmToken": "string"
}
}

---

## 👤 GET /users

### Response:

{
"success": true,
"data": [
{
"uniqueId": "usr_1",
"userName": "Amit Shah",
"mobileNumber": "9000000001",
"role": "admin",
"flatNumber": "Office",
"societyId": "soc_1"
}
]
}

---

## 🚶 GET /visitors

### Response:

{
"success": true,
"data": [
{
"id": "vis_mmj6tnsm",
"visitor_name": "Vijay",
"mobile": "9898153215",
"flat_number": "A103",
"purpose": "Guest",
"status": "checked-in | checked-out",
"check_in_time": "ISO_DATE",
"check_out_time": "ISO_DATE | null",
"gatekeeper_id": "usr_2",
"resident_id": "usr_6",
"society_id": "soc_1",
"created_at": "ISO_DATE"
}
]
}

---

## ➕ POST /visitor/add

### Request:

{
"visitor_name": "string",
"mobile": "string",
"flat_number": "string",
"purpose": "string",
"gatekeeper_id": "string",
"resident_id": "string",
"society_id": "string"
}

### Response:

{
"success": true,
"message": "Visitor added successfully"
}

---

## 🔄 POST /visitor/check-in

### Request:

{
"visitor_id": "string"
}

### Response:

{
"success": true,
"message": "Visitor checked-in"
}

---

## 🔄 POST /visitor/check-out

### Request:

{
"visitor_id": "string"
}

### Response:

{
"success": true,
"message": "Visitor checked-out"
}

---

## 📱 GET /preapproved-guests

### Response:

{
"success": true,
"data": [
{
"id": "pre_mmkaxlyvm77e2e",
"qr_token": "q_mmkaxlzmrazjgazx",
"resident_id": "usr_6",
"visitor_name": "test",
"mobile": "9879845211",
"valid_date": "ISO_DATE",
"society_id": "soc_1",
"status": "pending | used | expired",
"created_at": "ISO_DATE"
}
]
}

---

## 🔍 POST /preapproved/verify

### Request:

{
"qr_token": "string"
}

### Response:

{
"success": true,
"data": {
"visitor_name": "string",
"mobile": "string",
"resident_id": "string",
"status": "valid | expired | used"
}
}

---

## 🚫 Not Implemented

- /complaints
- /notices

---

## ⚠️ Rules

- Always return `success` key
- Keep response format consistent
- Do NOT rename fields (must match DB)
- Use ISO format for all dates
- Status values must be exact:
  - checked-in
  - checked-out
  - pending
  - used
  - expired

---

## 🔄 Data Source

Collections used:

- users
- visitors
- preapprovedguests

---

## 🎯 Notes

- This API strictly follows DB schema
- Any change in DB must reflect here
- Frontend must follow this contract strictly
