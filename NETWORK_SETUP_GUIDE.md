# Network Setup Guide - Fixing "Network request failed" Error

## Problem
When testing on a physical device (iOS/Android) using Expo Go, you're getting:
```
ERROR  Prediction failed: [TypeError: Network request failed]
```

## Root Cause
The frontend is configured to connect to `http://localhost:5000`, but:
- **localhost** refers to the device itself (your iPhone/Android phone)
- Your backend is running on your development computer
- The device cannot reach your computer using "localhost"

## Solution

### Step 1: Find Your Computer's Local IP Address

**On Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

**On macOS/Linux:**
```bash
ifconfig
# Look for "inet" under your active network adapter (usually en0 or wlan0)
# Example: inet 192.168.1.100
```

**Quick way (works on most systems):**
- The Expo output shows: `exp://192.168.1.115:8081`
- Your computer is likely on the same subnet: `192.168.1.X`
- Common IP patterns: 192.168.1.X, 192.168.0.X, 10.0.0.X

### Step 2: Create .env File in Frontend Directory

Navigate to: `Green_Lens/frontend/`

Create a file named `.env` (note the dot at the beginning):

```bash
cd Green_Lens/frontend
cp .env.example .env
```

### Step 3: Edit the .env File

Open `Green_Lens/frontend/.env` and replace `localhost` with your computer's IP:

```bash
# Replace this:
EXPO_PUBLIC_API_URL=http://localhost:5000

# With your computer's IP (example):
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

**Important Notes:**
- Use your actual IP address, not the example
- Keep the port number `:5000`
- Don't add quotes around the URL
- The `.env` file is git-ignored (safe, won't be committed)

### Step 4: Restart Expo

After creating/modifying the `.env` file:

1. Stop the current Expo server (Ctrl+C in terminal)
2. Restart it:
   ```bash
   cd Green_Lens/frontend
   npx expo start
   ```
3. Scan the QR code again on your device

### Step 5: Verify Backend is Running

Make sure your backend is running:

```bash
cd Green_Lens/backend
python app.py
```

You should see:
```
Loading FLOWER model...
Loading PLANT model...
Loading ARCHITECTURE model...
Loaded 3 models successfully
* Running on http://0.0.0.0:5000
```

### Step 6: Test Connection

From your development computer's browser, visit:
```
http://YOUR_IP:5000/health
```

You should see:
```json
{
  "status": "healthy",
  "models_loaded": 3,
  "available_categories": ["flower", "plant", "architecture"],
  "flower_loaded": true,
  "plant_loaded": true,
  "architecture_loaded": true
}
```

## Common Issues

### Issue: Still getting "Network request failed"

**Possible Causes:**

1. **Backend not running**
   - Check if backend terminal shows any errors
   - Restart backend: `python app.py`

2. **Firewall blocking connections**
   - Temporarily disable firewall
   - Or add exception for port 5000

3. **Wrong IP address**
   - Double-check your computer's IP
   - Make sure phone and computer are on same WiFi network

4. **Expo not picking up .env changes**
   - Clear Expo cache: `npx expo start -c`
   - Delete and recreate .env file
   - Make sure file is named exactly `.env` (not `.env.txt`)

5. **Different WiFi networks**
   - Ensure phone and computer are on the SAME WiFi network
   - Some networks isolate devices (guest networks, public WiFi)

### Issue: Can't find computer's IP address

Try these alternatives:

**Windows:**
```bash
# Method 1
ipconfig | findstr IPv4

# Method 2
curl ifconfig.me
```

**macOS/Linux:**
```bash
# Method 1
ifconfig | grep "inet "

# Method 2
ip addr show | grep "inet "

# Method 3 (if connected to WiFi)
ifconfig en0 | grep "inet "
```

### Issue: Backend crashes when loading models

If you see errors about missing model files:

1. Check if models exist:
   ```bash
   cd Green_Lens/backend/downloaded_model
   ls -lh *_best_model.keras
   ```

2. If missing, backend will try to download from Firebase
3. Make sure `service-account.json` is configured
4. Check Firebase Storage has the required files

## Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    Your WiFi Router                          │
│                    (e.g., 192.168.1.1)                       │
└─────────────────────────────────────────────────────────────┘
            │                              │
            │                              │
    ┌───────▼───────┐              ┌──────▼──────┐
    │ Your Computer │              │ Your Phone  │
    │               │              │             │
    │ Backend:      │◄────────────►│ Frontend:   │
    │ 192.168.1.100 │   Network    │ Expo Go     │
    │ Port: 5000    │   Request    │             │
    └───────────────┘              └─────────────┘
```

When you use `http://192.168.1.100:5000`, your phone can reach your computer over the local network.

## Quick Checklist

- [ ] Found your computer's local IP address
- [ ] Created `.env` file in `Green_Lens/frontend/`
- [ ] Updated `EXPO_PUBLIC_API_URL` with your IP
- [ ] Restarted Expo server
- [ ] Backend is running (shows "Running on http://0.0.0.0:5000")
- [ ] Both devices on same WiFi network
- [ ] Tested `/health` endpoint from browser
- [ ] Rescanned QR code on phone
- [ ] Tried taking a photo in the app

## For Production Deployment

When deploying to production:

1. Deploy backend to a server (Heroku, AWS, Google Cloud, etc.)
2. Get your production backend URL (e.g., `https://api.greenlens.com`)
3. Update `.env`:
   ```bash
   EXPO_PUBLIC_API_URL=https://api.greenlens.com
   ```
4. Build production app with this configuration

## Need More Help?

If you're still having issues:

1. Check backend terminal for errors
2. Check Expo terminal for errors
3. Verify both devices are on same network:
   ```bash
   # On computer
   ping 192.168.1.115  # Your phone's IP from Expo output
   ```
4. Try accessing backend from phone's browser:
   ```
   http://YOUR_COMPUTER_IP:5000/health
   ```

## Security Note

The `.env` file is automatically ignored by git (listed in `.gitignore`), so your local IP address won't be committed to the repository. This is safe for development.

For production, use proper environment variables and HTTPS.
