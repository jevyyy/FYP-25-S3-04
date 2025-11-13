# Firebase Environment Variable Setup Guide

## Overview

This guide explains how to configure Firebase credentials using environment variables instead of the `service-account.json` file. This approach keeps your credentials out of version control and prevents them from being accidentally committed to GitHub.

## Why Use Environment Variables?

1. **Security**: Credentials stay out of git history
2. **No Revocation Issues**: Environment variables don't expire like service account keys can
3. **Easy Updates**: Change credentials without regenerating JSON files
4. **Git-Safe**: `.env` file is already in `.gitignore`

## Setup Instructions

### Step 1: Get Your Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `green-lens-47e9b`
3. Click the gear icon → **Project Settings**
4. Navigate to **Service accounts** tab
5. Click **"Generate new private key"**
6. Download the JSON file (keep it safe, you'll extract values from it)

### Step 2: Create .env File

1. Navigate to the backend directory:
   ```bash
   cd Green_Lens/backend
   ```

2. Copy the example file:
   ```bash
   cp .env.example .env
   ```

### Step 3: Extract Values from JSON

Open the downloaded service account JSON file. It will look like this:

```json
{
  "type": "service_account",
  "project_id": "green-lens-47e9b",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@green-lens-47e9b.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Step 4: Populate .env File

Open `Green_Lens/backend/.env` and fill in the Firebase section with values from your JSON:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=green-lens-47e9b
FIREBASE_PRIVATE_KEY_ID=abc123def456...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@green-lens-47e9b.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789...
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

**Important Notes:**
- Keep the `FIREBASE_PRIVATE_KEY` wrapped in quotes
- Keep all `\n` characters in the private key as-is
- Don't add extra spaces or line breaks

### Step 5: Install Dependencies

Make sure you have the required dependency:

```bash
pip install python-dotenv
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

### Step 6: Test Your Configuration

Run the Firebase connection test:

```bash
python test_firebase.py
```

You should see:
```
✓ Loading Firebase credentials from environment variables (.env)
✓ Valid environment variable format
✓ All required fields present
✓ Firebase Admin SDK initialized
...
```

### Step 7: Delete the JSON File (Optional)

Once you've confirmed environment variables work, you can delete the service account JSON file:

```bash
rm service-account.json
```

This ensures it never accidentally gets committed to git.

## Fallback Behavior

The application supports both methods:

1. **Environment Variables** (Preferred): Reads from `.env` file
2. **JSON File** (Fallback): Reads from `service-account.json`

If environment variables are not set, the system automatically falls back to the JSON file method.

## Troubleshooting

### "Firebase credentials not found" Error

**Problem**: Neither `.env` file nor `service-account.json` exists.

**Solution**:
1. Make sure `.env` file exists in `Green_Lens/backend/`
2. Verify all required Firebase variables are set
3. Or create `service-account.json` as fallback

### "Invalid grant: Invalid JWT Signature" Error

**Problem**: Private key is malformed or contains errors.

**Solution**:
1. Regenerate a new service account key from Firebase Console
2. Copy the entire `private_key` value including:
   - `-----BEGIN PRIVATE KEY-----`
   - All the encoded content
   - `-----END PRIVATE KEY-----`
   - Keep `\n` characters intact
3. Wrap in quotes: `FIREBASE_PRIVATE_KEY="..."`

### Environment Variables Not Loading

**Problem**: Changes to `.env` not taking effect.

**Solution**:
1. Restart the backend server completely
2. Make sure `.env` is in the correct directory (`Green_Lens/backend/`)
3. Check for typos in variable names (must match exactly)

### Private Key Format Issues

**Problem**: Private key not formatted correctly.

**Correct Format**:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**Common Mistakes**:
- ❌ Missing quotes
- ❌ Adding extra line breaks (keep `\n` as literal characters)
- ❌ Removing `\n` characters
- ❌ Splitting across multiple lines

## Updating Credentials

When your service account key expires or needs rotation:

1. Generate new private key from Firebase Console
2. Update values in `.env` file
3. Restart backend server
4. Test with `python test_firebase.py`

No need to change any code!

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use strong access controls** - Limit who can access production `.env`
3. **Rotate keys regularly** - Update every 90 days or after security incidents
4. **Use different keys** - Development, staging, and production should have separate keys
5. **Limit service account permissions** - Only grant necessary Firebase permissions

## Verification Checklist

Before deploying or sharing the repository:

- [ ] `.env` file exists in `Green_Lens/backend/`
- [ ] All Firebase variables are populated
- [ ] `python test_firebase.py` passes
- [ ] Backend server starts without errors
- [ ] `.env` is in `.gitignore`
- [ ] No `service-account.json` in git history
- [ ] Model retraining works successfully

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
- [Environment Variables in Python](https://pypi.org/project/python-dotenv/)

## Getting Help

If you encounter issues:

1. Run `python test_firebase.py` to diagnose
2. Check server logs for specific error messages
3. Verify `.env` file format matches the example
4. See `FIREBASE_AUTH_TROUBLESHOOTING.md` for authentication issues
5. See `NETWORK_TROUBLESHOOTING.md` for connectivity issues
