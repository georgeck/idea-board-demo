# Auth

InstantDB magic link flow. Reference docs: https://www.instantdb.com/docs/auth

## Flow

1. First visit → show modal: enter email → receive code → enter code → authenticated
2. After auth, check InstantDB profile for `displayName`
3. If not set → show display name modal → store in InstantDB profile
4. Display name modal only appears once (when not already stored)

## API

```ts
// Send code
db.auth.sendMagicCode({ email })

// Verify code
db.auth.verifyMagicCode({ email, code })
```
