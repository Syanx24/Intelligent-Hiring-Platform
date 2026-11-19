# Intelligent Hiring Platform

Under development.

## About Us image management

Set `ABOUT_US_ADMIN_PASSWORD` in the backend environment before using the About Us page's image manager. Keep this password on the backend only; the About Us page asks for it once to unlock image controls for the current page session.

Uploaded profile portraits, per-person profile backgrounds, and the page banner background are stored in Cloudinary, with their URLs stored separately in MongoDB. Team names, roles, and social links continue to come from `frontend/src/Data/teamMembers.json`.
