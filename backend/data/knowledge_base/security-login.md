# Login and Authentication

## Login Methods

Nova supports multiple ways to log into your account:

**Email and password:** Enter your registered email address and password on the login screen.

**Biometric login (mobile):** After your first login on a device, enable Face ID or fingerprint authentication for quick access. Go to Settings > Security > Biometric Login.

**Magic link:** Request a one-time login link sent to your email. Useful when you can't remember your password. The link expires after 15 minutes and can only be used once.

## Trusted Devices

When you log in from a new device, Nova will ask you to verify via 2FA. After verification, you can choose to "Trust this device" so you won't need 2FA for future logins from that device.

View and manage trusted devices: Settings > Security > Trusted Devices. You can remove any device at any time, which will require 2FA on the next login from that device.

## Active Sessions

View all active sessions (devices currently logged into your account): Settings > Security > Active Sessions. Each session shows:
- Device type and operating system
- Location (approximate, based on IP address)
- Last active time

You can end any session remotely by tapping "Log Out" next to it.

## Account Lockout

For security, your account is temporarily locked after 5 consecutive failed login attempts. The lockout lasts 15 minutes. After the lockout period, you can try again or reset your password.

If you believe someone is trying to access your account, change your password immediately and enable 2FA if you haven't already.

## Session Timeout

For security, Nova sessions expire after:
- **Mobile app:** 30 days of inactivity (biometric re-authentication required)
- **Web browser:** 24 hours of inactivity
- **After password change:** All sessions are ended immediately
