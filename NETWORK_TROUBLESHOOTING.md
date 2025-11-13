# Network Troubleshooting Guide

## Common Error: "Network request failed"

This error occurs when the mobile app cannot connect to the backend API server. This guide will help you diagnose and fix the issue.

---

## Quick Diagnosis

**Use the "Test Backend Connection" button** in Developer Settings → Retrain Model section to quickly check if your app can reach the backend.

---

## Root Causes & Solutions

### 1. Backend Server Not Running

**Symptom:** Connection test fails immediately

**Solution:**
```bash
# Start the backend server
cd Green_Lens/backend
python app.py

# You should see:
# * Running on http://0.0.0.0:5000
```

**Verify it's running:**
- Open browser and go to `http://localhost:5000/categories`
- You should see JSON with available categories

---

### 2. Missing or Incorrect .env Configuration

**Symptom:** App is trying to connect to wrong URL

**Solution:**

1. **Check if .env file exists:**
   ```bash
   cd Green_Lens/frontend
   ls -la .env
   ```

2. **If missing, create it:**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env with correct URL:**

   **For Emulator/Simulator (iOS Simulator, Android Emulator):**
   ```bash
   EXPO_PUBLIC_API_URL=http://localhost:5000
   ```

   **For Physical Device (iPhone, Android with Expo Go):**
   ```bash
   # Use your computer's IP address
   EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
   ```

4. **Find your computer's IP address:**

   **Windows:**
   ```bash
   ipconfig
   # Look for "IPv4 Address" under your WiFi adapter
   # Example: 192.168.1.100
   ```

   **Mac:**
   ```bash
   ifconfig | grep "inet "
   # Or: System Preferences → Network → WiFi → Advanced → TCP/IP
   # Example: 192.168.1.100
   ```

   **Linux:**
   ```bash
   ip addr show
   # Or: ifconfig | grep "inet "
   # Example: 192.168.1.100
   ```

5. **Restart Expo after changing .env:**
   ```bash
   # Stop current Expo server (Ctrl+C)
   npx expo start
   ```

---

### 3. Phone and Computer Not on Same WiFi

**Symptom:** Connection works on emulator but not physical device

**Solution:**
1. **Check phone WiFi:** Settings → WiFi → Note the network name
2. **Check computer WiFi:** Ensure it's on the SAME network
3. **Avoid guest networks** - They often block device-to-device communication
4. **Disable VPN** - VPNs can interfere with local network connections

---

### 4. Firewall Blocking Port 5000

**Symptom:** Backend is running, .env is correct, same WiFi, but still can't connect

**Solution:**

**Windows Firewall:**
```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="Flask Backend" dir=in action=allow protocol=TCP localport=5000
```

**Mac Firewall:**
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Add Python to allowed apps
4. Or temporarily disable firewall for testing

**Linux (UFW):**
```bash
sudo ufw allow 5000/tcp
```

---

### 5. Using "localhost" on Physical Device

**Symptom:** Works on emulator but not physical device

**Problem:** Physical devices cannot reach "localhost" - it refers to the phone itself, not your computer.

**Solution:**
Replace `localhost` in `.env` with your computer's actual IP address:

```bash
# Wrong (only works on emulator):
EXPO_PUBLIC_API_URL=http://localhost:5000

# Correct (works on physical device):
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

---

## Testing Checklist

Use this checklist to systematically diagnose the issue:

### Backend Tests

- [ ] Backend server is running (`python app.py`)
- [ ] Can access backend in browser: `http://localhost:5000/categories`
- [ ] Backend shows no errors in console
- [ ] Port 5000 is not in use by another application

### Frontend Configuration

- [ ] `.env` file exists in `Green_Lens/frontend/`
- [ ] `EXPO_PUBLIC_API_URL` is set correctly in `.env`
- [ ] Used IP address (not localhost) for physical device
- [ ] Restarted Expo after changing `.env`

### Network Tests

- [ ] Phone and computer on same WiFi network
- [ ] Can ping computer from phone (use network utility apps)
- [ ] Firewall allows port 5000
- [ ] No VPN active on either device

### App Tests

- [ ] "Test Backend Connection" button shows success
- [ ] Console logs show correct URL being used
- [ ] No proxy settings interfering

---

## Advanced Troubleshooting

### Check What URL the App is Using

Add this to see the actual URL in use:

```javascript
// In Developer_Settings.jsx
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
console.log('Using API URL:', API_BASE_URL);
```

Then check the console output in Expo.

### Test Backend from Phone's Browser

Open your phone's browser and visit:
```
http://<YOUR_COMPUTER_IP>:5000/categories
```

If this works, the issue is with the app configuration.
If this fails, the issue is with network/firewall.

### Check Expo is Reading .env

In your app, add a test component:
```javascript
console.log('ENV:', process.env.EXPO_PUBLIC_API_URL);
```

If it shows `undefined`, Expo isn't reading the `.env` file.

### Verify Port is Listening

**On backend computer:**

**Windows:**
```powershell
netstat -ano | findstr :5000
```

**Mac/Linux:**
```bash
netstat -an | grep 5000
# Or:
lsof -i :5000
```

You should see something like:
```
tcp4  0  0  *.5000  *.*  LISTEN
```

---

## Common Mistakes

### ❌ Mistake 1: Using localhost on Physical Device
```bash
# This ONLY works on emulator:
EXPO_PUBLIC_API_URL=http://localhost:5000
```

### ✅ Solution:
```bash
# Use your computer's IP:
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

### ❌ Mistake 2: Not Restarting Expo
Changed `.env` but didn't restart Expo server.

### ✅ Solution:
Always restart after changing `.env`:
```bash
# Press Ctrl+C to stop
npx expo start
```

### ❌ Mistake 3: Wrong IP Address
Using IP from wrong network adapter (VPN, virtual machine, etc.)

### ✅ Solution:
Use IP from your active WiFi adapter:
```bash
# Windows: Look for "Wireless LAN adapter Wi-Fi"
# Mac/Linux: Look for "en0" or "wlan0"
```

### ❌ Mistake 4: Guest WiFi Network
Phone on guest network which isolates devices.

### ✅ Solution:
Connect to main WiFi network (not guest network).

---

## Still Not Working?

### Enable Debug Mode

1. **Backend Debug:**
   ```python
   # In app.py, ensure debug mode:
   app.run(host='0.0.0.0', port=5000, debug=True)
   ```

2. **Frontend Debug:**
   ```javascript
   // Add extensive logging in performRetraining:
   console.log('API_BASE_URL:', API_BASE_URL);
   console.log('API_URL:', API_URL);
   console.log('Attempting fetch...');
   ```

3. **Network Monitoring:**
   - Use Chrome DevTools Network tab
   - Use React Native Debugger
   - Check Expo console for errors

### Get Help

When asking for help, provide:
1. **Error message** (full text)
2. **Testing environment** (physical device/emulator, OS)
3. **Console logs** (both frontend and backend)
4. **Configuration:**
   - Content of `.env` file (remove sensitive data)
   - Output of "Test Backend Connection"
   - Your computer's IP address
   - Device's IP address
5. **Test results:**
   - Can you access backend in browser?
   - Are both devices on same WiFi?
   - Does firewall allow port 5000?

---

## Quick Reference

### Essential Commands

```bash
# Find IP address (Windows)
ipconfig

# Find IP address (Mac/Linux)
ifconfig | grep "inet "

# Start backend
cd Green_Lens/backend && python app.py

# Create .env
cd Green_Lens/frontend && cp .env.example .env

# Edit .env (use your favorite editor)
nano .env
# or
code .env

# Restart Expo
npx expo start

# Test backend in browser
# Visit: http://<YOUR_IP>:5000/categories
```

### Port Configuration

| Environment | URL |
|------------|-----|
| iOS Simulator | `http://localhost:5000` |
| Android Emulator | `http://localhost:5000` or `http://10.0.2.2:5000` |
| Physical Device | `http://192.168.1.100:5000` (use your computer's IP) |
| Production | `https://your-domain.com` |

---

## Success Indicators

✅ **Everything is working when:**
1. "Test Backend Connection" shows success
2. Backend console shows incoming requests
3. Retraining starts without "Network request failed" error
4. Browser can access `http://<YOUR_IP>:5000/categories`

---

## Prevention

To avoid these issues in the future:

1. **Document your IP:** Write down your computer's IP address
2. **Create .env early:** Set up `.env` before first run
3. **Test connection first:** Always test before attempting retraining
4. **Stable network:** Use reliable WiFi (not public/guest networks)
5. **Firewall rules:** Configure firewall once, not per session
