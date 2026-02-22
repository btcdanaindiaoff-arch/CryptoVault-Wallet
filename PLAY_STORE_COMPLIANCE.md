# Google Play Store Compliance Guide
## Web3 Non-Custodial Wallet App

---

## 1. Wallet Type: Non-Custodial = Easier Approval

**This app is a self-custody (non-custodial) wallet.** Under Google Play policy (updated 2024), non-custodial wallets are **explicitly exempt** from licensing requirements. Users control their own private keys — the developer never holds funds.

> "Non-custodial wallets are out of scope of the Cryptocurrency Exchanges and Software Wallets policy."
> — Google Play Developer Policy

**Key implication:** You do NOT need a financial services license, VASP registration, or regulatory approval to publish a non-custodial wallet.

---

## 2. Required Play Console Steps

### Step 1 — Financial Features Declaration
1. Open Play Console → your app → **App content**
2. Click **Financial features**
3. Select: **"Software wallet"** (non-custodial)
4. Answer "No" to exchange/custodial questions
5. Save and publish the declaration

### Step 2 — App Content Ratings
- Complete the **IARC questionnaire** accurately
- Under "Finance" category: select wallet, not exchange
- Rating will be: **Everyone / Teen** (appropriate for a wallet)

### Step 3 — Data Safety Form
Fill out the Data Safety section (mandatory since 2022):

| Data Type | Collected? | Shared? | Notes |
|-----------|-----------|---------|-------|
| Device ID | No | No | We never collect |
| Crash logs | Optional | No | Only if analytics added |
| Financial info | No | No | Keys stay on device |
| Location | No | No | Not used |
| Personal info | No | No | No accounts/KYC |

**Key message:** "This app does not collect or transmit any user data. Private keys are stored locally on-device using Android Keystore."

---

## 3. App Description — Compliant Language

### DO use:
- "Self-custody wallet — you control your private keys"
- "Send, receive, and manage crypto assets"
- "Connect to decentralized applications (DApps)"
- "Staking rewards through network validation"
- "Non-custodial — we never store your keys or funds"

### DO NOT use:
- "Earn guaranteed returns" or any APY guarantees
- "Investment platform" or "trading platform"
- "Buy crypto" without a licensed partner
- "100% safe" or similar absolute security claims
- "Exchange" in the primary description
- Any language implying financial advice

### Sample Compliant Short Description (80 chars):
```
Self-custody crypto wallet. ETH, BNB & MATIC. DApp browser. Your keys.
```

### Sample Compliant Full Description Opening:
```
CryptoVault is a non-custodial Web3 wallet that puts you in full control
of your digital assets. Your private keys never leave your device.

FEATURES:
- Multi-chain support: Ethereum, BNB Chain, Polygon
- Send & receive ETH, BNB, MATIC and ERC-20/BEP-20 tokens
- Built-in DApp browser with wallet injection
- NFT gallery to view your collectibles
- Network staking delegation (rewards vary, not guaranteed)
- Token swap via decentralized aggregators
- Biometric + PIN security

SECURITY:
Private keys are encrypted and stored in Android Keystore.
We never have access to your funds. Recovery phrase is stored
locally only — back it up safely.

This is not a financial product. Crypto assets are volatile.
Only invest what you can afford to lose.
```

---

## 4. Play Store Policies — Compliance Checklist

### Crypto Wallet Policy
- [x] Non-custodial architecture (user holds keys)
- [x] No in-app fiat currency purchase (no on-ramp without licensed partner)
- [x] No guaranteed financial returns stated
- [x] Financial Features Declaration completed

### Blockchain Content Policy
- [x] NFT display only — no wagering/gambling with NFTs
- [x] Staking described as "network validation" not "guaranteed yield"
- [x] Swap functionality routes to decentralized protocols only
- [x] No promotion of "earn by playing" or similar

### Malware / Security Policy
- [x] No remote code execution
- [x] No dynamic code loading from untrusted sources
- [x] Private keys stored in Android Keystore (not SharedPreferences/plain storage)
- [x] No clipboard sniffing or screen capture of sensitive screens
- [x] WebView DApp browser sandboxed with limited permissions

### Permissions — Minimum Required Only
```xml
<!-- AndroidManifest.xml — only these permissions -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />           <!-- QR scanner -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />    <!-- fingerprint -->
<uses-permission android:name="android.permission.USE_FINGERPRINT" />  <!-- legacy -->
<uses-permission android:name="android.permission.VIBRATE" />          <!-- PIN feedback -->
```

DO NOT request:
- READ_CONTACTS, READ_SMS, ACCESS_FINE_LOCATION (not needed — instant rejection risk)
- WRITE_EXTERNAL_STORAGE (use app-scoped storage instead)

### Target SDK & Build Requirements
```gradle
android {
    compileSdk 34
    defaultConfig {
        minSdk 24          // Android 7.0+
        targetSdk 34       // Required by Play Store 2024
    }
}
```

---

## 5. Store Listing Assets Required

| Asset | Size | Notes |
|-------|------|-------|
| App icon | 512x512 PNG | No alpha, no screenshots of other apps |
| Feature graphic | 1024x500 PNG | Required for featuring |
| Phone screenshots | 2-8, min 320px wide | Show real app UI |
| Short description | Max 80 chars | No keyword stuffing |
| Full description | Max 4000 chars | Must match app functionality |

### Screenshot Requirements
- Show actual wallet UI (home screen, send/receive, DApp browser)
- Do NOT show competitor app names or logos
- Do NOT show actual private keys or seed phrases
- Include at least 1 screenshot showing the non-custodial / security aspect

---

## 6. Technical Requirements for Approval

### Android Keystore — Key Storage (Critical)
```kotlin
// Use Android Keystore for all sensitive data
// react-native-keychain handles this automatically with:
Keychain.setGenericPassword(service, encrypted, {
  accessControl: ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
})
```

### Screenshot Prevention on Sensitive Screens
```kotlin
// Add to MainActivity.kt for PIN/seed phrase screens
window.setFlags(
  WindowManager.LayoutParams.FLAG_SECURE,
  WindowManager.LayoutParams.FLAG_SECURE
)
```

### Network Security Config
```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
  <base-config cleartextTrafficPermitted="false">
    <trust-anchors>
      <certificates src="system" />
    </trust-anchors>
  </base-config>
</network-security-config>
```

### ProGuard Rules (release build)
```
-keep class com.trustclone.** { *; }
-keep class org.bitcoinj.** { *; }
-keep class com.facebook.react.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
```

---

## 7. Submission Process Step-by-Step

### Pre-submission Checklist
- [ ] App signed with release keystore (keep this safe — cannot change)
- [ ] targetSdk = 34, minSdk = 24
- [ ] AAB (Android App Bundle) built, not APK
- [ ] All screens tested on physical device
- [ ] No crashes on startup, no ANRs in testing
- [ ] Privacy Policy URL live and accessible
- [ ] Terms of Service URL live and accessible

### Build Release AAB
```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Play Console Submission Order
1. Create app → select "App" type, "Free"
2. Complete **App content** section fully before uploading APK
3. Upload AAB to **Internal testing** track first
4. Test with 5+ internal testers for 2+ days
5. Move to **Closed testing** (beta) — test for 1 week minimum
6. Apply for **Production** rollout at 10% → 50% → 100%

### Expected Review Times
| Track | Timeline |
|-------|----------|
| Internal | Instant |
| Closed beta | 1-3 days |
| Production (first) | 7-14 days |
| Production (updates) | 1-3 days |

---

## 8. Common Rejection Reasons & Fixes

| Rejection Reason | Fix |
|-----------------|-----|
| "Impersonates another app" | Change app name, icon, and description to be original |
| "Metadata policy violation" | Remove any competitor brand names from description |
| "Financial features declaration missing" | Complete the declaration in App Content section |
| "Dangerous permissions" | Remove unnecessary permissions from manifest |
| "Misleading functionality" | Ensure screenshots match actual app features |
| "Malware / unsafe code" | Remove any WebView with `setAllowUniversalAccessFromFileURLs(true)` |
| "Deceptive design" | Remove countdown timers, fake urgency in UI |

---

## 9. Ongoing Compliance (Post-Launch)

- Monitor Google Play Policy updates (subscribe to [policy blog](https://android-developers.googleblog.com))
- Update targetSdk annually (Google requires targeting latest SDK within 1 year of release)
- Respond to Play Store policy emails within 7 days
- Keep Privacy Policy and Terms of Service current
- Never add custodial features without completing the full exchange compliance form
- If you add a fiat on-ramp: partner with a licensed provider (MoonPay, Transak, Ramp Network) and declare it

---

## 10. Privacy Policy Template (Required)

Your Privacy Policy must state:
1. What data is collected (for this app: none beyond crash logs if any)
2. How it is stored (locally on device, encrypted)
3. Whether it is shared (no)
4. How users can delete their data (delete wallet = all local data gone)
5. Contact email for privacy inquiries

Host it at a permanent URL before submitting (e.g., `https://yourdomain.com/privacy`).

---

*Last updated: 2025. Always verify against the current [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/).*
