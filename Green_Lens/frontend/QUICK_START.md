# Quick Start Guide - Green Lens Frontend

## Getting "Network request failed" Error?

If you're testing on a **physical device** (iPhone/Android) and seeing this error, you need to configure the API URL.

### Quick Fix (3 Steps)

1. **Find your computer's IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux  
   ifconfig
   ```
   Look for something like `192.168.1.100` or `10.0.0.5`

2. **Create .env file:**
   ```bash
   cd Green_Lens/frontend
   cp .env.example .env
   ```

3. **Edit .env file** - Replace localhost with your computer's IP:
   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
   ```
   (Use YOUR actual IP address, not this example)

4. **Restart Expo:**
   ```bash
   npx expo start
   ```

That's it! Your phone can now connect to the backend running on your computer.

## Detailed Setup Instructions

For complete setup instructions, see: [NETWORK_SETUP_GUIDE.md](../../NETWORK_SETUP_GUIDE.md)

## Why This Happens

- **localhost** = the device itself (your phone)
- Your backend runs on your **computer**
- Your phone can't reach "localhost" - it needs your computer's network IP
- Both devices must be on the **same WiFi network**

## Testing on Emulator/Simulator?

If you're using iOS Simulator or Android Emulator (not a physical device), you can use `localhost`:
```bash
EXPO_PUBLIC_API_URL=http://localhost:5000
```

Emulators can reach the host machine using localhost.

## Checklist

Before testing on your phone:

- [ ] Backend is running (`python app.py` in backend folder)
- [ ] Created `.env` file in frontend folder
- [ ] Updated IP address in `.env` file
- [ ] Restarted Expo server
- [ ] Phone and computer on same WiFi
- [ ] Backend shows "Running on http://0.0.0.0:5000"

## Common Issues

### "Network request failed" persists

1. Make sure backend is running (check terminal)
2. Verify correct IP in `.env` file
3. Check firewall isn't blocking port 5000
4. Ensure same WiFi network
5. Try: `npx expo start -c` (clear cache)

### Can't find IP address

Try these commands:

**Windows:**
```bash
ipconfig | findstr IPv4
```

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Backend not starting

Check if models are downloaded:
```bash
cd Green_Lens/backend/downloaded_model
ls -lh *_best_model.keras
```

If missing, backend will try to download from Firebase.

## Need Help?

See the comprehensive [NETWORK_SETUP_GUIDE.md](../../NETWORK_SETUP_GUIDE.md) for detailed troubleshooting.
