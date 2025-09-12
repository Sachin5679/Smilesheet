# OralVis Task

An application for dental submissions and report management.  
- **Patients** can upload teeth photos, view submissions, and download PDF reports.  
- **Admins** can view all submissions, annotate images, save annotations, and generate PDF reports.  

---

## Setup Instructions

### Backend

1. Navigate to the backend folder:
```
cd backend
```
2. Install dependencies
```
npm install
```
3. Create a .env file with the following variables:
```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
PORT=5000
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_REGION=<your-aws-region>
AWS_BUCKET_NAME=<your-s3-bucket-name>
```
4. Start backend
```
npm run dev
```

### Frontend

1. Navigate to the frontend folder:
```
cd frontend
```
2. Install dependencies:
```
npm install
```
3. Start the frontend app:
```
npm start
```

---

## Demo Credentials
```
Patient:
Email: newuser@example.com
Password: 123456

Admin:
Email: bob@example.com
Password: 123456
```
