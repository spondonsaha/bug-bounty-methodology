import { useState } from "react";

const checklistData = [
  {
    id: 1, phase: "RECON", color: "#00ff9f", icon: "🔭",
    title: "Subdomain Enumeration",
    description: "Find all subdomains of target",
    tools: ["subfinder", "amass", "assetfinder", "dnsx", "httpx", "naabu","crt.sh","waybackurl","magicrecon"],
    steps: [
      { id: "1a", text: "Run: subfinder -d target.com -all -recursive -t 200 -silent -o subfinder-rescursive.txt" },
      { id: "1b", text: "Run: amass enum -passive -d target.com | tee -a subs.txt" },
      { id: "1c", text: "Run: assetfinder -subs-only target.com | tee assetfinder.txt" },
      { id: "1d", text: "Deduplicate: sort -u subs.txt -o subs_unique.txt" },
      { id: "1e", text: "Check live: httpx -l subs_unique.txt -mc 200,301,302,403,500 -o live.txt" },
      { id: "1f", text: "Port scan: naabu -list live.txt -top-ports 1000 -o ports.txt" },
      { id: "1g", text: "Fingerprint tech stack with whatweb on all live hosts" },
      { id: "1h", text: "Screenshot all live hosts with gowitness or eyewitness" },
      {id: "1i",text:"Run: findomain --quiet -t target.com | tee findomain.txt"},
      {id: "1j", text: "Run: sublist3r -d target.com -t 50 -o sublist3r.txt"},
      {id: "1k", text: "crt.sh: curl -s -H 'Accept: application/json' 'https://crt.sh/?q=%25.target.com&output=json' | jq -r '.[].name_value' | sed 's/\\*\\.//g' | sort -u | httpx -silent" },
      {id:"1l", text: "wayback: curl -s 'http://web.archive.org/cdx/search/cdx?url=*.target.com/*&output=text&fl=original&collapse=urlkey' | sed -e 's_https*://__' -e 's/\/.*//g' | sort -u | anew wayback_subs2.txt"},
      {id: "1m",text: "Magicrecon: magicrecon -w target.com"}
      ]
  },
  {
    id: 2, phase: "RECON", color: "#00ff9f", icon: "🔍",
    title: "Google Dork & GitHub Dork",
    description: "Find exposed info via search engines",
    tools: ["Google", "GitHub", "Shodan", "Censys", "grep.app"],
    steps: [
      { id: "2a", text: "Google: site:target.com ext:php | ext:json | ext:env | ext:xml" },
      { id: "2b", text: "Google: site:target.com inurl:admin | inurl:api | inurl:dev | inurl:test" },
      { id: "2c", text: 'Google: site:target.com "api_key" | "secret" | "password" | "token"' },
      { id: "2d", text: "Google: site:target.com intitle:index.of" },
      { id: "2e", text: 'GitHub: "target.com" password | secret | api_key | access_token' },
      { id: "2f", text: 'GitHub: "target.com" language:python | language:js DB_PASSWORD' },
      { id: "2g", text: "Check grep.app for leaked source code mentioning target" },
      { id: "2h", text: "Shodan: hostname:target.com — find exposed services/ports" },
      { id: "2i", text: "Censys: check expired SSL certs, open ports, hidden services" },
      {id: "2j", text: "Google Dork: Follow steps on https://taksec.github.io/google-dorks-bug-bounty/"},
      {id: "2k", text: "Github Dork: https://github.com/techgaun/github-dorks/blob/master/github-dorks.txt"}
    ],
  },
  {
    id: 3, phase: "RECON", color: "#00ff9f", icon: "📡",
    title: "Live & 404 Findings",
    description: "Analyze live hosts, error pages & hidden paths",
    tools: ["httpx", "waybackurls", "gau", "ffuf", "feroxbuster, dnsx"],
    steps: [
      {id: "3a",text:"Live Subdomains: dnsx -l uniq_sub.txt -r /home/kali/tools/resolvers.txt -o live_subs.txt"},
      {id: "3b", text: "Live subdomain with IP:  dnsx -l live_subs.txt -a -resp-only -o live_with_ips.txt"},
      {id: "3c",text: "Banner Grabbing: httpx -l live_subs.txt -title -sc -location -p 80,443,8000,8080,8443 -td -cl -probe -o httpx_output.txt"},
      { id: "3d", text: "Run waybackurls target.com | tee wayback.txt" },
      { id: "3e", text: "Run gau target.com --subs | tee gau.txt" },
      { id: "3c", text: "Merge & filter: cat wayback.txt gau.txt | sort -u | grep '?'" },
      { id: "3f", text: "Check 403 bypass: add X-Original-URL, X-Rewrite-URL headers" },
      { id: "3g", text: "Check 403 bypass path variation: /admin → /admin/ → /Admin → /%2fadmin" },
      { id: "3h", text: "Check 404 pages for stack traces, version numbers, internal paths" },
      { id: "3i", text: "Fuzz dirs: ffuf -w wordlist.txt -u https://target.com/FUZZ" },
      { id: "3j", text: "Check: /.git/ /.env /backup.zip /.DS_Store /phpinfo.php /config.json" },
      { id: "3k", text: "Check: /robots.txt /sitemap.xml /security.txt /.well-known/" },
    ],
  },
  {
    id: 4, phase: "RECON", color: "#00ff9f", icon: "📜",
    title: "JS File Analysis",
    description: "Extract secrets and endpoints from JavaScript files",
    tools: ["LinkFinder", "SecretFinder", "JSParser", "katana", "truffleHog"],
    steps: [
      { id: "4a", text: "Complete JS: subfinder -d target.com -silent | httpx -silent | katana -d 5 -jc -silent | grep -iE '\.js$' | anew js.txt"},
      {id: "4b",text: "Extract Secret: cat js.txt | httpx -silent -sr -srd js_files/ && nuclei -t exposures/ -target js.txt"},
      {id:"4c",text: "LinkFinder on JS Files: cat js.txt | xargs -I@ -P10 bash -c 'python3 linkfinder.py -i @ -o cli 2>/dev/null' | anew endpoints.txt"},
      {id:"4d",text: "API Keys from JS: cat js.txt | nuclei -t http/exposures/tokens/ -silent | anew api_keys.txt"},
      {id: "4e",text: "Extract S3 Buckets from JS: cat js.txt | xargs -I@ curl -s @ | grep -oE '[a-zA-Z0-9.-]+\.s3\.amazonaws\.com|s3://[a-zA-Z0-9.-]+|s3-[a-zA-Z0-9-]+\.amazonaws\.com/[a-zA-Z0-9.-]+' | sort -u | anew s3_from_js.txt"},
      { id: "4f", text: "Collect all JS: katana -u target.com -jc | grep '.js' | tee jsfiles.txt" },
      { id: "4g", text: "Run LinkFinder on each JS file for hidden endpoints" },
      { id: "4h", text: "Run SecretFinder for API keys, tokens, secrets in JS" },
      { id: "4i", text: "Manually search: apiKey, secret, password, token, aws_access" },
      { id: "4j", text: "Check for hardcoded credentials or internal staging URLs" },
      { id: "4k", text: "Look for commented-out debug endpoints or test routes" },
      { id: "4l", text: "Check source maps (.js.map) — may expose original source code" },
      { id: "4m", text: "Run truffleHog on JS files for high-entropy strings" },
    ],
  },
  {
    id: 5, phase: "DNS", color: "#ff6b35", icon: "🌐",
    title: "Subdomain Takeover",
    description: "Find dangling CNAMEs & takeover opportunities",
    tools: ["subjack", "nuclei", "dig", "dnsx", "can-i-take-over-xyz"],
    steps: [
      { id: "5a", text: "Run: subjack -w subs.txt -t 100 -timeout 30 -ssl" },
      { id: "5b", text: "Run: nuclei -l subs.txt -t takeovers/ -o takeover_results.txt" },
      { id: "5c", text: "Manual check: dig subdomain.target.com CNAME" },
      { id: "5d", text: "Check EdOverflow/can-i-take-over-xyz for service fingerprints" },
      { id: "5e", text: "Verify NXDOMAIN: dig pointed-domain.com A" },
      { id: "5f", text: "Visit subdomain — look for default/unclaimed service page" },
      { id: "5g", text: "Document all DNS evidence with screenshots — DO NOT register domains" },
      {id:"5h",text: "Subzy: subzy r --targets lists.txt"},
      { id: "5i", text: "Run: nuclei -l subs.txt -t exposures/,takeovers/ -severity medium,high,critical" },
      { id: "5j", text: "Check dangling DNS: dnsx -l subs.txt -cname -o cnames.txt — look for dead CNAMEs" },
      { id: "5k", text: "Check all CNAME chains: dig +trace subdomain.target.com — follow full DNS path" },
      { id: "5l", text: "Check NS takeover: dig target.com NS — are nameservers registered and active?" },
      { id: "5m", text: "Check MX takeover: dig target.com MX — are mail servers still claimed?" },
      { id: "5n", text: "Test S3 bucket takeover: dig sub.target.com — if CNAME to s3.amazonaws.com, check if bucket exists" },
      { id: "5o", text: "Test GitHub Pages takeover: CNAME to username.github.io — is the repo still active?" },
      { id: "5p", text: "Test Heroku takeover: CNAME to *.herokudns.com — check if app is unclaimed" },
      { id: "5q", text: "Test Azure takeover: CNAME to *.azurewebsites.net — verify app service exists" },
      { id: "5r", text: "Test Fastly takeover: CNAME to *.fastly.net — check if service is configured" },
      { id: "5s", text: "Test Shopify takeover: CNAME to shops.myshopify.com — is store still active?" },
      { id: "5t", text: "Test Tumblr takeover: CNAME to domains.tumblr.com — is blog still claimed?" },
      { id: "5u", text: "Test SendGrid takeover: CNAME to sendgrid.net — is the account still active?" },
      { id: "5v", text: "Check wildcard DNS: dig nonexistent123.target.com — if resolves, wildcard is set" },
      { id: "5w", text: "Use tko-subs: tko-subs -domains=subs.txt -data=providers-data.csv -output=output.txt" },
      { id: "5x", text: "Manual fingerprint check: curl -sk https://subdomain.target.com | grep 'There is no app configured'" },
      { id: "5y", text: "Check dead subdomains with NXDOMAIN: cat subs.txt | dnsx -silent -rcode nxdomain" },
      { id: "5z", text: "Cross-check findings with HackerOne disclosed reports — is this already reported?" },
    ],
  },
  {
    id: 6, phase: "WEB", color: "#c084fc", icon: "↩️",
    title: "Open Redirect",
    description: "Find unvalidated redirect parameters",
    tools: ["Burp Suite", "gf", "qsreplace", "openredirex"],
    steps: [
      { id: "6a", text: "Find params: ?redirect= ?url= ?next= ?return= ?goto= ?dest=" },
      { id: "6b", text: "Test basic: ?redirect=https://evil.com" },
      { id: "6c", text: "Test bypass: ?redirect=//evil.com and ?redirect=\\\\evil.com" },
      { id: "6d", text: "Test: ?redirect=https://target.com@evil.com" },
      { id: "6e", text: "Test encoding: ?redirect=https://evil.com%23target.com" },
      { id: "6f", text: "Use gf redirect on wayback/gau URLs | qsreplace https://evil.com" },
      { id: "6g", text: "Test OAuth redirect_uri — chain with account takeover" },
      { id: "6h", text: "Check JS for open redirect: window.location = userInput pattern" },
      { id: "6i", text: "Test double URL encoding: ?redirect=https%3A%2F%2Fevil.com" },
      { id: "6j", text: "Test protocol bypass: ?redirect=javascript:alert(1) — can chain to XSS" },
      { id: "6k", text: "Test CRLF injection in redirect: ?redirect=https://evil.com%0d%0aLocation:https://evil.com" },
      { id: "6l", text: "Test whitelisted domain bypass: ?redirect=https://evil.com?allowed=target.com" },
      { id: "6m", text: "Test open redirect in POST body: change Location header value in intercepted response" },
    ],
  },
  {
    id: 7, phase: "AUTH", color: "#fbbf24", icon: "🔐",
    title: "Broken Access Control (BAC)",
    description: "Test authorization on all endpoints",
    tools: ["Burp Suite", "Autorize", "AuthMatrix"],
    steps: [
      { id: "7a", text: "Create 2 accounts: admin/high-priv (victim) + low-priv (attacker)" },
      { id: "7b", text: "Map all endpoints while logged in as high-priv user" },
      { id: "7c", text: "Install Autorize Burp extension — auto replay as low-priv" },
      { id: "7d", text: "Test horizontal: change victim ID to another user's ID" },
      { id: "7e", text: "Test vertical: access /admin /dashboard /settings as low-priv" },
      { id: "7f", text: "Test unauthenticated: replay authenticated requests without token" },
      { id: "7g", text: "Try changing role param: role=user → role=admin in body/cookie" },
      { id: "7h", text: "Test HTTP method override: POST with X-HTTP-Method-Override: DELETE" },
      { id: "7i", text: "Test parameter pollution: add duplicate role=admin alongside role=user" },
      { id: "7j", text: "Test UUID/GUID predictability — increment or decode base64 encoded IDs" },
      { id: "7k", text: "Test forced browsing: directly access /admin/users /admin/panel /manage" },
      { id: "7l", text: "Test API versioning BAC: endpoint locked in /v2 but open in /v1" },
      { id: "7m", text: "Test referrer-based access control: add Referer: https://target.com/admin" },
      { id: "7n", text: "Test wildcard path bypass: /admin/. or /admin/* or /admin/..;/" },
      { id: "7o", text: "Test CORS + BAC chain: steal token via CORS then use for privilege escalation" },
      { id: "7p", text: "Test multi-tenant isolation: access other organization's data by changing org_id" },
      { id: "7q", text: "Test JSON parameter injection: {'role':'user','role':'admin'} duplicate keys" },
      { id: "7r", text: "Test GraphQL BAC: query other users' data by changing viewer ID in query" },
      { id: "7s", text: "Test state/status manipulation: order_status=pending → order_status=approved" },
      { id: "7t", text: "Test account switch: login as UserA, capture token, switch to UserB's resources" },
      { id: "7u", text: "Test cookie manipulation: decode base64 cookie, change role/user_id, re-encode" },
      { id: "7v", text: "Test path traversal in access control: /api/users/../../admin/users" },
      { id: "7w", text: "Test feature flagging bypass: add X-Feature-Flag: beta or X-Internal: true header" },
      { id: "7x", text: "Test mass assignment: PATCH /user with {isAdmin: true, verified: true}" },
      { id: "7y", text: "Test archive/export endpoint: /export/all-users accessible without admin role?" },
      { id: "7z", text: "Test notification/email triggers: can low-priv user trigger admin-only emails?" },
    ],
  },
  {
    id: 8, phase: "AUTH", color: "#fbbf24", icon: "📱",
    title: "2FA / OTP Bypass",
    description: "Bypass two-factor authentication mechanisms",
    tools: ["Burp Suite", "Burp Intruder", "Turbo Intruder"],
    steps: [
      { id: "8a", text: "Check if OTP code is leaked in response body, headers, or cookies" },
      { id: "8b", text: "Brute force OTP: use Burp Intruder to try 000000–999999" },
      { id: "8c", text: "Test rate limiting on OTP endpoint — is there a lockout?" },
      { id: "8d", text: "Response manipulation: change 'verified':false → 'verified':true" },
      { id: "8e", text: "Test OTP reuse — can the same OTP be used more than once?" },
      { id: "8f", text: "Test OTP for different accounts — use victim OTP on attacker account" },
      { id: "8g", text: "Skip 2FA step — directly request the post-2FA authenticated endpoint" },
      { id: "8h", text: "Send null/empty OTP: otp=null, otp=, remove otp param entirely" },
      { id: "8i", text: "Test backup codes — are they predictable or unlimited in quantity?" },
      { id: "8j", text: "Check if 2FA is enforced on ALL login methods: SSO, OAuth, API keys" },
      { id: "8k", text: "Test OTP expiry — does a 30-min-old code still work?" },
      { id: "8l", text: "Check if password reset flow bypasses 2FA completely" },
      { id: "8m", text: "Test 2FA on remember-me device — can it be forged via cookie?" },
      { id: "8n", text: "Test concurrent login sessions — does new login invalidate old 2FA?" },
      { id: "8o", text: "Test OTP length manipulation: send 4-digit code instead of 6-digit" },
      { id: "8p", text: "Test negative OTP value: otp=-123456 — does server accept negative numbers?" },
      { id: "8q", text: "Test array bypass: otp[]=123456 — some frameworks accept first array element" },
      { id: "8r", text: "Test integer overflow: send extremely large OTP number like 9999999999999" },
      { id: "8s", text: "Test OTP in different parameters: code=, token=, pin=, mfa=, twofa=, auth=" },
      { id: "8t", text: "Test status code manipulation: if 403 returned, change to 200 in response" },
      { id: "8u", text: "Test 2FA enrollment bypass: skip enrollment step, directly access app" },
      { id: "8v", text: "Test SIM swap scenario: can attacker receive OTP by controlling phone number?" },
      { id: "8w", text: "Test OTP predictability: request 5 OTPs in a row — is there a pattern?" },
      { id: "8x", text: "Test race condition on OTP: send valid + invalid OTP simultaneously" },
      { id: "8y", text: "Test cross-account OTP: generate OTP for account A, use it on account B login" },
      { id: "8z", text: "Test 2FA via API endpoint: does mobile API /api/v1/verify enforce 2FA?" },
      { id: "8aa", text: "Test TOTP secret exposure: check if QR code secret is leaked in page source" },
      { id: "8ab", text: "Test disable 2FA without password: can attacker disable 2FA with just session?" },
      { id: "8ac", text: "Test 2FA bypass via support: social engineer reset — is 2FA removable via ticket?" },
      { id: "8ad", text: "Test OTP via email vs SMS inconsistency — different channel, same code accepted?" },
      { id: "8ae", text: "Test CSRF on 2FA disable endpoint — no CSRF token = attacker can disable victim 2FA" },
      { id: "8af", text: "Test trusted device token — is it a weak/short value that can be brute forced?" },
      { id: "8ag", text: "Test account recovery flow — does magic link or recovery code bypass 2FA?" },
      { id: "8ah", text: "Test 2FA on password change — is 2FA required before changing password?" },
    ],
  },
  {
    id: 9, phase: "AUTH", color: "#fbbf24", icon: "🪙",
    title: "JWT Attacks",
    description: "Attack JSON Web Token implementation flaws",
    tools: ["jwt_tool", "Burp JWT Editor", "jwt.io"],
    steps: [
      { id: "9a", text: "Decode JWT at jwt.io — inspect header, payload, signature" },
      { id: "9b", text: "Test alg:none attack — remove signature, set alg to none" },
      { id: "9c", text: "Test RS256 → HS256 confusion using public key as HMAC secret" },
      { id: "9d", text: "Brute force weak secret: jwt_tool token -C -d wordlist.txt" },
      { id: "9e", text: "Test JWT header injection: kid parameter path traversal" },
      { id: "9f", text: "Test jku/x5u header — point to attacker-controlled JWKS endpoint" },
      { id: "9g", text: "Modify payload: role, admin, user_id, exp (expiry timestamp)" },
      { id: "9h", text: "Check if expired JWTs are still accepted by the server" },
    ],
  },
  {
    id: 10, phase: "AUTH", color: "#fbbf24", icon: "🔑",
    title: "IDOR",
    description: "Access unauthorized objects by manipulating references",
    tools: ["Burp Suite", "Autorize", "Paramalyzer"],
    steps: [
      { id: "10a", text: "Map all object references: IDs, UUIDs, filenames, hashes" },
      { id: "10b", text: "Test numeric IDs: change 1001 → 1002 in all requests" },
      { id: "10c", text: "Test GUIDs — can you enumerate or predict them?" },
      { id: "10d", text: "Test in ALL HTTP methods: GET, POST, PUT, PATCH, DELETE" },
      { id: "10e", text: "Test in headers, cookies, body params, URL path, query string" },
      { id: "10f", text: "Test indirect IDOR: export, download, invoice, PDF generation endpoints" },
      { id: "10g", text: "Chain IDOR + privilege escalation for critical impact" },
      { id: "10h", text: "Test IDOR on delete/update operations — not just read" },
    ],
  },
  {
    id: 11, phase: "AUTH", color: "#fbbf24", icon: "🔒",
    title: "Authentication Flaws",
    description: "Test login, registration & password reset flows",
    tools: ["Burp Suite", "Hydra"],
    steps: [
      { id: "11a", text: "Test username enumeration via different error messages or timing" },
      { id: "11b", text: "Test password reset token — is it guessable, short, or reusable?" },
      { id: "11c", text: "Test password reset link expiry — does old link still work?" },
      { id: "11d", text: "Test account takeover via password reset Host header poisoning" },
      { id: "11e", text: "Test email param manipulation in reset request: add CC/BCC field" },
      { id: "11f", text: "Test default credentials: admin/admin, admin/password, test/test" },
      { id: "11g", text: "Test remember-me token — is it long-lived and unpredictable?" },
      { id: "11h", text: "Test login CSRF — is CSRF token present on login form?" },
      { id: "11i", text: "Test concurrent login — does app invalidate old session on new login?" },
      { id: "11j", text: "Test email case sensitivity: Admin@target.com vs admin@target.com — same account?" },
      { id: "11k", text: "Test username case sensitivity: ADMIN vs admin — does it create duplicate accounts?" },
      { id: "11l", text: "Test email with special chars: admin+test@target.com — does it bypass uniqueness check?" },
      { id: "11m", text: "Test password reset token entropy — decode base64, check if timestamp-based" },
      { id: "11n", text: "Test password reset token for different users — are tokens sequential or predictable?" },
      { id: "11o", text: "Test simultaneous reset tokens — request 5 resets, does old token still work?" },
      { id: "11p", text: "Test pre-account takeover: register attacker@target.com before victim does — account merged?" },
      { id: "11q", text: "Test OAuth + password login merge: create account via OAuth then via password same email" },
      { id: "11r", text: "Test account lockout policy: after X failed attempts, is account locked? Is lockout bypassable?" },
      { id: "11s", text: "Test lockout bypass: rotate IP via X-Forwarded-For after hitting lockout threshold" },
      { id: "11t", text: "Test long password DoS: send 10,000 character password — causes bcrypt CPU spike?" },
      { id: "11u", text: "Test password change without old password: CSRF + no old password = account takeover" },
      { id: "11v", text: "Test password reset via username instead of email: /reset?user=admin" },
      { id: "11w", text: "Test HTTP vs HTTPS login — does app allow login over plain HTTP?" },
      { id: "11x", text: "Test login response timing: valid user takes longer than invalid — confirms username enum" },
      { id: "11y", text: "Test registration with disposable email: is it allowed? Can it bypass verification?" },
      { id: "11z", text: "Test account deletion and re-registration: deleted account data still accessible?" },
      { id: "11aa", text: "Test magic link authentication — is link single-use? Does it expire properly?" },
      { id: "11ab", text: "Test SSO bypass: does logging in via Google/Facebook skip email verification?" },
      { id: "11ac", text: "Test password complexity bypass: does app enforce complexity in API vs UI differently?" },
      { id: "11ad", text: "Test login with null password"}
    ],
  },
  {
    id: 12, phase: "WEB", color: "#c084fc", icon: "🔄",
    title: "SSRF",
    description: "Make server fetch attacker-controlled URLs",
    tools: ["Burp Collaborator", "interactsh", "nuclei"],
    steps: [
      { id: "12a", text: "Find params: ?url= ?webhook= ?fetch= ?path= ?dest= ?load=" },
      { id: "12b", text: "Test AWS metadata: ?url=http://169.254.169.254/latest/meta-data/" },
      { id: "12c", text: "Test GCP metadata: ?url=http://metadata.google.internal/" },
      { id: "12d", text: "Test blind SSRF via Burp Collaborator / interactsh" },
      { id: "12e", text: "SSRF bypass: 127.0.0.1, 0.0.0.0, [::1], localhost, 0x7f000001" },
      { id: "12f", text: "Try SSRF via SVG / XML / PDF file upload" },
      { id: "12g", text: "Check import URL, image fetch, webhook, embed URL features" },
      { id: "12h", text: "Test internal port scan: ?url=http://127.0.0.1:[PORT]" },
    ],
  },
  {
    id: 13, phase: "WEB", color: "#c084fc", icon: "🏠",
    title: "Host Header & CORS Attacks",
    description: "Manipulate Host, Origin & forwarding headers",
    tools: ["Burp Suite", "nuclei", "CORSy"],
    steps: [
      { id: "13a", text: "Test Host header injection: change Host: to attacker.com" },
      { id: "13b", text: "Test password reset poisoning via malicious Host header" },
      { id: "13c", text: "Test X-Forwarded-Host: attacker.com — does app reflect it?" },
      { id: "13d", text: "CORS: Origin: https://attacker.com — check ACAO response header" },
      { id: "13e", text: "CORS: Origin: null — allowed in some misconfigured apps" },
      { id: "13f", text: "CORS: Origin: https://target.com.attacker.com — subdomain bypass" },
      { id: "13g", text: "Check web cache poisoning via Host/X-Forwarded-Host headers" },
      { id: "13h", text: "Check if CORS allows credentials: Access-Control-Allow-Credentials: true" },
      { id: "13i", text: "Test X-Forwarded-For: 127.0.0.1 — does app treat request as coming from localhost?" },
      { id: "13j", text: "Test CORS wildcard: does response return Access-Control-Allow-Origin: * with credentials?" },
      { id: "13k", text: "Test Origin: https://targetcorp.com — does app match partial domain string?" },
      { id: "13l", text: "Test X-Host / X-Forwarded-Server / X-Original-Host headers — reflected in response?" },
      { id: "13m", text: "Test CORS on sensitive endpoints: /api/user /api/token /account — not just homepage" },
    ],
  },
  {
    id: 14, phase: "WEB", color: "#c084fc", icon: "🍪",
    title: "Session Management",
    description: "Test session tokens and cookie security",
    tools: ["Burp Suite", "OWASP Testing Guide"],
    steps: [
      { id: "14a", text: "Check cookie flags: Secure, HttpOnly, SameSite on all cookies" },
      { id: "14b", text: "Test session fixation: set your own session ID before login" },
      { id: "14c", text: "Test if session is properly invalidated after logout" },
      { id: "14d", text: "Test session after password change — old session still valid?" },
      { id: "14e", text: "Analyze token randomness — is it predictable or sequential?" },
      { id: "14f", text: "Test CSRF on state-changing requests (no SameSite + no CSRF token)" },
      { id: "14g", text: "Test cookie scope — available across all subdomains?" },
      { id: "14h", text: "Test concurrent sessions — same account used simultaneously?" },
    ],
  },
  {
    id: 15, phase: "API", color: "#22d3ee", icon: "◈",
    title: "GraphQL Testing",
    description: "Find introspection, injection & auth flaws",
    tools: ["GraphQL Voyager", "InQL Burp", "Altair", "graphw00f"],
    steps: [
      { id: "15a", text: "Find endpoints: /graphql /api/graphql /gql /query" },
      { id: "15b", text: "Test introspection: {__schema{types{name fields{name}}}}" },
      { id: "15c", text: "Use InQL Burp extension to dump full schema automatically" },
      { id: "15d", text: "Visualize schema with GraphQL Voyager" },
      { id: "15e", text: "Test IDOR via queries — modify id parameters in all queries" },
      { id: "15f", text: "Test all mutations for unauthorized data modification" },
      { id: "15g", text: "Test query batching for rate limit bypass" },
      { id: "15h", text: "Test injections in query string arguments (SQLi, SSTI)" },
      { id: "15i", text: "Introspection disabled? Try field suggestion / alias attacks" },
      { id: "15j", text: "Test GraphQL CSRF: send mutation via GET request — no CSRF token needed?" },
      { id: "15k", text: "Test query depth attack: deeply nested query {a{b{c{d{e{f{}}}}}}} — causes DoS?" },
      { id: "15l", text: "Test circular query fragments: fragment A on Type { ...B } fragment B on Type { ...A }" },
      { id: "15m", text: "Test field duplication: request same field 1000x times in one query — server crash?" },
      { id: "15n", text: "Test alias overload: {a1:user{id} a2:user{id} a3:user{id}...} — bypass rate limit" },
      { id: "15o", text: "Test __typename leakage: {__typename} — reveals internal object type names" },
      { id: "15p", text: "Test unauthenticated mutations: createUser, deleteUser, updatePassword without token" },
      { id: "15q", text: "Test GraphQL subscription endpoint: /graphql/subscriptions — auth enforced?" },
      { id: "15r", text: "Test mass assignment via mutation: updateUser(input:{role:ADMIN, verified:true})" },
      { id: "15s", text: "Test sensitive data in __type: {__type(name:'User'){fields{name description}}}" },
      { id: "15t", text: "Test query whitelist bypass: slightly modify allowed query to access forbidden data" },
      { id: "15u", text: "Test persisted queries: /_graphql?queryId=123 — can you enumerate query IDs?" },
      { id: "15v", text: "Test GraphQL over WebSocket: ws:// endpoint — does it enforce authentication?" },
      { id: "15w", text: "Test error verbosity: invalid query — does error reveal schema, DB, stack trace?" },
      { id: "15x", text: "Test inline fragment abuse: ...on AdminUser{secretField} to access hidden types" },
      { id: "15y", text: "Test directive injection: @skip @include @deprecated — unexpected behavior?" },
      { id: "15z", text: "Test multipart file upload via GraphQL mutation — bypass upload restrictions" },
      { id: "15aa", text: "Test GraphQL playground exposed: /graphql/playground /graphiql — publicly accessible?" },
      { id: "15ab", text: "Test object-level auth: query returns all users but should only return current user" },
      { id: "15ac", text: "Test null/undefined input: mutation with null values — unexpected server behavior?" },
    ],
  },
  {
    id: 16, phase: "API", color: "#22d3ee", icon: "⚡",
    title: "API Endpoint Discovery",
    description: "Map all API endpoints and test each",
    tools: ["Burp Suite", "kiterunner", "swagger-ui", "arjun"],
    steps: [
      { id: "16a", text: "Find API docs: /swagger /api/docs /openapi.json /v1/api-docs" },
      { id: "16b", text: "Run: kr scan https://target.com -w routes-large.kite (kiterunner)" },
      { id: "16c", text: "Extract endpoints from JS files with LinkFinder / JSParser" },
      { id: "16d", text: "Try HTTP method switching: GET→POST→PUT→DELETE→PATCH on each" },
      { id: "16e", text: "Test API versioning: /v1/ vs /v2/ vs /v3/ — older = less secure" },
      { id: "16f", text: "Fuzz hidden params: arjun -u https://target.com/api/endpoint" },
      { id: "16g", text: "Test mass assignment: send extra fields in POST/PUT body" },
      { id: "16h", text: "Remove auth token entirely — test for unauthenticated API access" },
      { id: "16i", text: "Test API key in different locations: header, query param, body, cookie — any accepted?" },
      { id: "16j", text: "Test HTTP verb tunneling: POST with X-HTTP-Method-Override: DELETE or _method=DELETE" },
      { id: "16k", text: "Test Content-Type switching: change application/json → application/xml — XXE possible?" },
      { id: "16l", text: "Test API parameter pollution: id=1&id=2 — which value does server process?" },
      { id: "16m", text: "Test JWT none algorithm on API: remove signature, set alg:none in API auth header" },
      { id: "16n", text: "Test API rate limit bypass: add X-Forwarded-For, rotate with different values" },
      { id: "16o", text: "Test shadow APIs: /api/v1/internal /api/private /api/debug /api/test endpoints" },
      { id: "16p", text: "Test API with different Accept headers: application/xml, text/html — different responses?" },
      { id: "16q", text: "Test BOLA (Broken Object Level Auth): /api/v1/users/{id} — access other user objects" },
      { id: "16r", text: "Test BFLA (Broken Function Level Auth): /api/v1/admin/users accessible as normal user?" },
      { id: "16s", text: "Test JSON injection: {'username': 'admin', 'role': 'admin'} — extra fields accepted?" },
      { id: "16t", text: "Test API caching: send request twice — is sensitive data being cached by CDN/proxy?" },
      { id: "16u", text: "Test CORS on every API endpoint — not just root domain" },
      { id: "16v", text: "Test regex bypass in API validation: email field accepts <script> if regex is weak" },
      { id: "16w", text: "Test API with empty bearer token: Authorization: Bearer — server error reveals info?" },
      { id: "16x", text: "Test GraphQL over REST: /api/graphql endpoint hidden behind REST-looking URL" },
      { id: "16y", text: "Test API wildcard routes: /api/v1/users/* — does wildcard expose unintended data?" },
      { id: "16z", text: "Test server-side filtering bypass: ?filter=all or ?admin=true hidden query params" },
      { id: "16aa", text: "Test API response filtering: full object returned but frontend hides fields — check raw response" },
      { id: "16ab", text: "Test batch API requests: [{id:1},{id:2},{id:3}] — does batch skip auth per item?" },
      { id: "16ac", text: "Test API with old/legacy endpoints from Wayback Machine — /api/v0/ /api/beta/" },
      { id: "16ad", text: "Test multipart/form-data on JSON endpoints — does parser handle it unexpectedly?" },
      { id: "16ae", text: "Test Unicode/special char injection in API params: null bytes, RTL chars, emojis" },
      { id: "16af", text: "Test API key rotation: after key reset, does old API key still work?" },
      { id: "16ag", text: "Test excessive data exposure: /api/v1/me returns password_hash, tokens, internal fields?" },
      { id: "16ah", text: "Test API for debug endpoints: /api/debug /api/health /api/status — info disclosure?" },
      { id: "16ai", text: "Test broken object property level auth: PATCH /api/user — can you modify read-only fields?" },
      { id: "16aj", text: "Test API with numeric overflow: send id=99999999999 — causes 500 error revealing stack?" },
    ],
  },
  {
    id: 17, phase: "INJECT", color: "#f87171", icon: "💉",
    title: "XSS",
    description: "Inject malicious scripts into web pages",
    tools: ["Burp Suite", "dalfox", "XSSHunter", "kxss"],
    steps: [
      { id: "17a", text: "Find all input reflection points using Burp passive scan" },
      { id: "17b", text: "Test reflected: <script>alert(1)</script> in all params" },
      { id: "17c", text: "Test stored XSS in profile fields, comments, bio, address" },
      { id: "17d", text: "Test DOM XSS via URL hash: /#<img src=x onerror=alert(1)>" },
      { id: "17e", text: "Run: dalfox url 'https://target.com/page?param=FUZZ'" },
      { id: "17f", text: "Test XSS in HTTP headers: User-Agent, Referer, X-Forwarded-For" },
      { id: "17g", text: "Use XSSHunter payload for blind XSS in admin/support panels" },
      { id: "17h", text: "Test CSP bypass if Content-Security-Policy header is present" },
      { id: "17i", text: "Test XSS via SVG file upload with embedded script tag" },
    ],
  },
  {
    id: 18, phase: "INJECT", color: "#f87171", icon: "🗄️",
    title: "SQL Injection",
    description: "Inject SQL into database queries",
    tools: ["sqlmap", "Burp Suite", "ghauri"],
    steps: [
      { id: "18a", text: "Find injection points: input fields, URL params, headers, cookies" },
      { id: "18b", text: "Test basic: ' OR 1=1-- and \" OR 1=1--" },
      { id: "18c", text: "Run: sqlmap -u 'https://target.com/page?id=1' --dbs --batch" },
      { id: "18d", text: "Test blind time-based: ' OR SLEEP(5)-- and 1; WAITFOR DELAY '0:0:5'--" },
      { id: "18e", text: "Test SQLi in HTTP headers: Cookie, User-Agent, Referer" },
      { id: "18f", text: "Test SQLi in JSON body parameters of POST requests" },
      { id: "18g", text: "Test second-order SQLi: inject in profile, trigger elsewhere" },
      { id: "18h", text: "Check error messages — do they reveal DB type or query structure?" },
    ],
  },
  {
    id: 19, phase: "INJECT", color: "#f87171", icon: "📁",
    title: "File Upload Vulnerabilities",
    description: "Bypass file upload restrictions",
    tools: ["Burp Suite", "ExifTool", "weevely"],
    steps: [
      { id: "19a", text: "Find all file upload functionality across the app" },
      { id: "19b", text: "Test uploading .php .jsp .aspx webshell directly" },
      { id: "19c", text: "Extension bypass: .php → .php5 .pHp .php.jpg .phtml .php%00.jpg" },
      { id: "19d", text: "Change Content-Type to image/jpeg while uploading .php" },
      { id: "19e", text: "Test double extension: malicious.php.jpg" },
      { id: "19f", text: "Embed PHP in image EXIF metadata using ExifTool" },
      { id: "19g", text: "Upload SVG with script tag for stored XSS" },
      { id: "19h", text: "Upload XML/XLSX for XXE injection test" },
      { id: "19i", text: "Check if uploaded files are accessible at a public URL" },
      { id: "19j", text: "Test magic bytes bypass: add GIF89a; header to PHP file — GIF89a;<?php system($_GET['cmd']);?>" },
      { id: "19k", text: "Test null byte injection: malicious.php%00.jpg — server strips after null byte" },
      { id: "19l", text: "Test path traversal in filename: ../../../var/www/html/shell.php" },
      { id: "19m", text: "Test filename injection: sleep(10).php — command in filename causes delay?" },
      { id: "19n", text: "Test zip slip attack: upload zip containing ../../../etc/passwd symlink" },
      { id: "19o", text: "Test polyglot file: valid image AND valid PHP simultaneously — bypasses content check" },
      { id: "19p", text: "Test .htaccess upload: upload .htaccess with AddType application/x-httpd-php .jpg" },
      { id: "19q", text: "Test .user.ini upload: auto_prepend_file=shell.php — executes on every PHP request" },
      { id: "19r", text: "Test large file upload DoS: upload 10GB file — causes storage/memory exhaustion" },
      { id: "19s", text: "Test IIS bypass: malicious.asp;.jpg or malicious.asp:.jpg on IIS servers" },
      { id: "19t", text: "Test case sensitivity: malicious.PHP .Php .PHp — case bypass on Linux servers" },
      { id: "19u", text: "Test right-to-left override: rename using RLO unicode char — gpj.php appears as php.jpg" },
      { id: "19v", text: "Test archive extraction: upload .tar.gz with symlinks pointing to /etc/passwd" },
      { id: "19w", text: "Test PDF upload for SSRF: embed external URL in PDF /URI action" },
      { id: "19x", text: "Test upload race condition: upload shell.php then access it before server renames it" },
      { id: "19y", text: "Test filename XSS: upload file named <script>alert(1)</script>.jpg — reflected in UI?" },
      { id: "19z", text: "Test Content-Disposition bypass: change filename in multipart form-data header" },
      { id: "19aa", text: "Test second extension parsing: shell.php.png — some servers execute as PHP" },
      { id: "19ab", text: "Test image resize bypass: malicious code survives image resizing/processing?" },
      { id: "19ac", text: "Test chunked upload: split webshell across multiple chunks — bypass content scanner" },
      { id: "19ad", text: "Test file overwrite: upload file with same name as existing critical file — overwrite?" },
      { id: "19ae", text: "Test SSRF via file URL: upload file referencing file:///etc/passwd as source URL" },
      { id: "19af", text: "Check upload directory listing: visit /uploads/ — is directory browsing enabled?" },
      { id: "19ag", text: "Test CSV injection: upload CSV with =cmd|'/C calc'!A1 formula — opens on admin import" },
          ],
  },
  {
    id: 20, phase: "INJECT", color: "#f87171", icon: "📂",
    title: "LFI / Path Traversal",
    description: "Read local server files via path manipulation",
    tools: ["Burp Suite", "dotdotpwn", "ffuf", "LFISuite"],
    steps: [
      { id: "20a", text: "Find params: ?file= ?page= ?include= ?path= ?template=" },
      { id: "20b", text: "Test: ?file=../../../../etc/passwd" },
      { id: "20c", text: "Test null byte: ?file=../../../etc/passwd%00.jpg" },
      { id: "20d", text: "Test URL encoding: %2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd" },
      { id: "20e", text: "Test double encoding: ..%252f..%252f..%252fetc/passwd" },
      { id: "20f", text: "Read: /etc/passwd /etc/hosts /proc/self/environ /var/log/apache2/access.log" },
      { id: "20g", text: "PHP wrapper: php://filter/convert.base64-encode/resource=index.php" },
      { id: "20h", text: "Try LFI → RCE via log poisoning (inject PHP in User-Agent, include log)" },
    ],
  },
  {
    id: 21, phase: "INJECT", color: "#f87171", icon: "📝",
    title: "SSTI",
    description: "Server-Side Template Injection for RCE",
    tools: ["Burp Suite", "tplmap", "SSTImap"],
    steps: [
      { id: "21a", text: "Find reflection points: error pages, user profile, email templates" },
      { id: "21b", text: "Test detection: {{7*7}} — does response show 49?" },
      { id: "21c", text: "Test alternate syntax: ${7*7} #{7*7} *{7*7} <%= 7*7 %>" },
      { id: "21d", text: "Identify engine: {{7*'7'}} → 7777777 = Jinja2 / Twig" },
      { id: "21e", text: "Run: tplmap -u 'https://target.com/page?name=test'" },
      { id: "21f", text: "Test RCE payload for Jinja2 template engine" },
      { id: "21g", text: "Check all user-controlled inputs that appear in email templates" },
      { id: "21h", text: "Check error pages — do they render user input through a template?" },
    ],
  },
  {
    id: 22, phase: "INJECT", color: "#f87171", icon: "📄",
    title: "XXE Injection",
    description: "Inject malicious XML external entities",
    tools: ["Burp Suite", "XXEinjector"],
    steps: [
      { id: "22a", text: "Find XML input: SOAP endpoints, file uploads (.xml .xlsx .docx .svg)" },
      { id: "22b", text: "Change Content-Type to application/xml and inject XML body" },
      { id: "22c", text: "Test basic XXE with external entity pointing to /etc/passwd" },
      { id: "22d", text: "Test blind XXE via OOB — SYSTEM pointing to your collaborator" },
      { id: "22e", text: "Test XXE via SVG image upload" },
      { id: "22f", text: "Test XXE via Excel/Word file upload (xl/workbook.xml)" },
      { id: "22g", text: "Try error-based XXE to exfiltrate file contents" },
      { id: "22h", text: "Test SSRF via XXE pointing to http://169.254.169.254/" },
    ],
  },
  {
    id: 23, phase: "LOGIC", color: "#f472b6", icon: "🧠",
    title: "Business Logic Flaws",
    description: "Exploit flaws in application workflow & logic",
    tools: ["Burp Suite", "Manual Testing"],
    steps: [
      { id: "23a", text: "Apply same discount/coupon code multiple times" },
      { id: "23b", text: "Set item price or quantity to negative or zero values" },
      { id: "23c", text: "Skip payment step — directly request order confirmation endpoint" },
      { id: "23d", text: "Manipulate quantity in request body: buy 1, receive 100" },
      { id: "23e", text: "Test race condition on coupon/referral/reward claims" },
      { id: "23f", text: "Workflow bypass: skip step 2 of 3 in multi-step process" },
      { id: "23g", text: "Try to access premium features with free/unverified account" },
      { id: "23h", text: "Manipulate hidden form fields: price, discount, user_id, role" },
      { id: "23i", text: "Test negative refunds or zero-price orders via currency manipulation" },
      { id: "23j", text: "Test free trial abuse: create new account after trial expires — same card, different email" },
      { id: "23k", text: "Test referral self-abuse: refer yourself using different email — earn infinite credits" },
      { id: "23l", text: "Test currency confusion: pay in low-value currency, receive high-value currency equivalent" },
      { id: "23m", text: "Test integer overflow in quantity: send quantity=2147483648 — wraps to negative number" },
      { id: "23n", text: "Test price rounding exploit: item costs $0.001 — buy 1000 for $0 after rounding" },
      { id: "23o", text: "Test gift card abuse: apply gift card, refund original order — gift card balance kept?" },
      { id: "23p", text: "Test account balance manipulation: transfer $100 to yourself from same account" },
      { id: "23q", text: "Test promo code stacking: apply multiple promo codes simultaneously" },
      { id: "23r", text: "Test shipping address manipulation: change address after payment confirmation" },
      { id: "23s", text: "Test order status manipulation: pending → completed — directly via API call" },
      { id: "23t", text: "Test subscription downgrade abuse: downgrade plan but keep premium features active" },
      { id: "23u", text: "Test digital product duplication: buy once, trigger download multiple times" },
      { id: "23v", text: "Test wallet/credit race condition: redeem same credit simultaneously from 2 devices" },
      { id: "23w", text: "Test expired coupon: modify request timestamp or expiry date field in body" },
      { id: "23x", text: "Test geographical price bypass: change country/currency param to cheaper region" },
      { id: "23y", text: "Test invoice manipulation: modify invoice PDF/amount before payment gateway receives it" },
      { id: "23z", text: "Test loyalty points abuse: earn points on refunded orders — points not revoked?" },
      { id: "23aa", text: "Test feature toggle bypass: disabled features still accessible via direct API call" },
      { id: "23ab", text: "Test account tier bypass: free tier account accessing enterprise API endpoints" },
      { id: "23ac", text: "Test multi-step checkout race: complete same checkout from 2 tabs simultaneously" },
      { id: "23ad", text: "Test hidden admin discount: intercept request, add discount_code=INTERNAL or STAFF" },
      { id: "23ae", text: "Test cart price caching: add item at sale price, remove from cart, re-add at full price" },
      { id: "23af", text: "Test bundle pricing abuse: add bundled item individually cheaper than bundle price" },
      { id: "23ag", text: "Test partner/affiliate commission abuse: generate fake referrals via automated accounts" },
      { id: "23ah", text: "Test SaaS seat limit bypass: add more users than licensed seats via API" },
      { id: "23ai", text: "Test invoice currency param: change currency=USD to currency=VND — massive price drop" },
      { id: "23aj", text: "Test product review for unpurchased items — can you review without buying?" },
    ],
  },
  {
    id: 24, phase: "LOGIC", color: "#f472b6", icon: "⏱️",
    title: "Rate Limiting & Race Conditions",
    description: "Bypass rate limits and exploit timing issues",
    tools: ["Burp Turbo Intruder", "Python asyncio", "Burp Repeater"],
    steps: [
      { id: "24a", text: "Test OTP/login brute force — is there a proper rate limit?" },
      { id: "24b", text: "Bypass rate limit: rotate IP via X-Forwarded-For header" },
      { id: "24c", text: "Bypass: vary User-Agent or add X-Real-IP header" },
      { id: "24d", text: "Race condition on coupon: send 50 simultaneous requests" },
      { id: "24e", text: "Race condition on money transfer — double spend attack" },
      { id: "24f", text: "Race condition on account creation — duplicate account exploit" },
      { id: "24g", text: "Use Burp Turbo Intruder for high-concurrency race testing" },
      { id: "24h", text: "Test rate limit on password reset and email verification endpoints" },
    ],
  },
  {
    id: 25, phase: "LOGIC", color: "#f472b6", icon: "🔗",
    title: "OAuth & SSO Attacks",
    description: "Test OAuth flows for token and account takeover",
    tools: ["Burp Suite", "Manual testing"],
    steps: [
      { id: "25a", text: "Check state parameter — is CSRF protection properly implemented?" },
      { id: "25b", text: "Test redirect_uri bypass: extra slash, subdomain, path traversal" },
      { id: "25c", text: "Test token leakage in Referer header after OAuth redirect" },
      { id: "25d", text: "Test authorization code reuse — can same code be used twice?" },
      { id: "25e", text: "Test account linking CSRF — force-link attacker account to victim" },
      { id: "25f", text: "Test OAuth token for another client_id (audience bypass)" },
      { id: "25g", text: "Check if open redirect can be chained to steal OAuth token" },
      { id: "25h", text: "Test implicit flow — is access_token exposed in URL fragment?" },
    ],
  },
];

const phaseColors = {
  RECON: "#00ff9f",
  DNS: "#ff6b35",
  WEB: "#c084fc",
  AUTH: "#fbbf24",
  API: "#22d3ee",
  INJECT: "#f87171",
  LOGIC: "#f472b6",
};

export default function BugHuntingChecklist() {
  const [completed, setCompleted] = useState({});
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const toggleStep = (stepId) => setCompleted((p) => ({ ...p, [stepId]: !p[stepId] }));
  const toggleCard = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const totalSteps = checklistData.reduce((a, c) => a + c.steps.length, 0);
  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((completedCount / totalSteps) * 100);
  const phases = ["ALL", ...Object.keys(phaseColors)];

  const filtered = checklistData.filter((c) => {
    const matchPhase = filter === "ALL" || c.phase === filter;
    const matchSearch = search === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.steps.some((s) => s.text.toLowerCase().includes(search.toLowerCase()));
    return matchPhase && matchSearch;
  });

  const getCardProg = (card) => {
    const done = card.steps.filter((s) => completed[s.id]).length;
    return { pct: Math.round((done / card.steps.length) * 100), done, total: card.steps.length };
  };

  const expandAll = () => { const o = {}; filtered.forEach((c) => (o[c.id] = true)); setExpanded((p) => ({ ...p, ...o })); };
  const collapseAll = () => { const o = {}; filtered.forEach((c) => (o[c.id] = false)); setExpanded((p) => ({ ...p, ...o })); };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#060610", fontFamily: "'Courier New', monospace", color: "#e2e8f0", margin: 0, padding: 0, boxSizing: "border-box" }}>

      {/* Scanline */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,159,0.007) 2px,rgba(0,255,159,0.007) 4px)" }} />

      {/* ─── HEADER — edge to edge ─── */}
      <div style={{ width: "100%", background: "#08081a", borderBottom: "2px solid #1e293b", padding: "36px 40px 28px", boxSizing: "border-box", position: "relative", zIndex: 1 }}>

        {/* Badge */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ display: "inline-block", border: "1px solid #00ff9f30", padding: "4px 20px", borderRadius: 99, fontSize: 10, color: "#00ff9f", letterSpacing: 4, background: "#00ff9f08" }}>
            ◈ AUTHORIZED USE ONLY — Spondon Saha ◈
          </span>
        </div>

        {/* Title — two lines, never overlapping */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: "clamp(28px, 4.5vw, 60px)", fontWeight: 900, color: "#ffffff", letterSpacing: -1, lineHeight: 1.05, textShadow: "0 0 60px rgba(0,255,159,0.12)" }}>
            BUG HUNTER'S
          </div>
          <div style={{ fontSize: "clamp(28px, 4.5vw, 60px)", fontWeight: 900, color: "#00ff9f", letterSpacing: -1, lineHeight: 1.05, textShadow: "0 0 60px rgba(0,255,159,0.45)" }}>
            MASTER CHECKLIST
          </div>
        </div>

        <div style={{ textAlign: "center", color: "#475569", fontSize: 11, letterSpacing: 3, marginBottom: 28 }}>
          {checklistData.length} CATEGORIES &nbsp;·&nbsp; {totalSteps} STEPS &nbsp;·&nbsp; 2026 EDITION
        </div>

        {/* Stats — full width grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 20 }}>          {[
            { label: "CATEGORIES", value: checklistData.length, color: "#00ff9f" },
            { label: "TOTAL STEPS", value: totalSteps, color: "#22d3ee" },
            { label: "COMPLETED", value: completedCount, color: "#f472b6" },
            { label: "PROGRESS", value: `${progress}%`, color: "#fbbf24" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#0d0d20", border: `1px solid ${s.color}22`, borderRadius: 12, padding: "18px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: 3, marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 8 }}>
            <span>OVERALL PROGRESS</span>
            <span style={{ color: "#00ff9f" }}>{completedCount} / {totalSteps} steps</span>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,#00ff9f,#22d3ee,#c084fc,#f472b6)", borderRadius: 99, transition: "width 0.5s ease", boxShadow: "0 0 16px rgba(0,255,159,0.35)" }} />
          </div>
        </div>
      </div>

      {/* ─── BODY — full width ─── */}
      <div style={{ width: "100%", padding: "24px 40px", boxSizing: "border-box", position: "relative", zIndex: 1 }}>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍   Search techniques, tools, payloads, commands..."
          style={{ width: "100%", boxSizing: "border-box", background: "#0d0d20", border: "1px solid #1e293b", borderRadius: 10, padding: "13px 18px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", marginBottom: 16, outline: "none" }}
        />

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          {phases.map((phase) => {
            const col = phaseColors[phase] || "#00ff9f";
            const active = filter === phase;
            return (
              <button key={phase} onClick={() => setFilter(phase)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${active ? col : "#1e293b"}`, background: active ? `${col}18` : "#0d0d20", color: active ? col : "#64748b", fontSize: 10, letterSpacing: 2, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", fontWeight: active ? 700 : 400 }}>{phase}</button>
            );
          })}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {[["EXPAND ALL", expandAll], ["COLLAPSE ALL", collapseAll]].map(([lbl, fn]) => (
              <button key={lbl} onClick={fn} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #1e293b", background: "#0d0d20", color: "#64748b", fontSize: 9, letterSpacing: 1, cursor: "pointer", fontFamily: "inherit" }}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 20 }}>
          {Object.entries(phaseColors).map(([ph, col]) => (
            <div key={ph} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: col }} />
              <span style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>{ph}</span>
            </div>
          ))}
        </div>

        {/* Cards — responsive 2-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 600px), 1fr))", gap: 10 }}>
          {filtered.map((card) => {
            const { pct, done, total } = getCardProg(card);
            const isOpen = expanded[card.id];
            const allDone = done === total;
            const col = card.color;

            return (
              <div key={card.id} style={{ background: "#0d0d20", border: `1px solid ${allDone ? col + "55" : "#1a1a30"}`, borderRadius: 12, overflow: "hidden", transition: "all 0.3s", boxShadow: allDone ? `0 0 28px ${col}14` : "none" }}>

                {/* Header row */}
                <div onClick={() => toggleCard(card.id)} style={{ padding: "15px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, userSelect: "none" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: `${col}12`, border: `1px solid ${col}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {allDone ? "✅" : card.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontSize: 9, letterSpacing: 2, color: col, background: `${col}15`, padding: "2px 8px", borderRadius: 4, border: `1px solid ${col}22`, whiteSpace: "nowrap" }}>{card.phase}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>{String(card.id).padStart(2, "0")}. {card.title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{card.description}</div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0, marginRight: 8 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: pct === 100 ? col : "#475569" }}>{pct}%</div>
                    <div style={{ fontSize: 9, color: "#334155" }}>{done}/{total}</div>
                  </div>

                  <div style={{ color: "#334155", fontSize: 14, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>▾</div>
                </div>

                {/* Mini progress */}
                <div style={{ height: 2, background: "#0a0a18" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: col, transition: "width 0.3s", boxShadow: pct > 0 ? `0 0 8px ${col}70` : "none" }} />
                </div>

                {/* Body */}
                {isOpen && (
                  <div style={{ padding: "16px 18px", borderTop: "1px solid #0f0f22" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                      {card.tools.map((t) => (
                        <span key={t} style={{ fontSize: 10, padding: "3px 10px", background: "#111128", borderRadius: 99, color: "#64748b", letterSpacing: 1, border: "1px solid #1a1a30" }}>{t}</span>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {card.steps.map((step) => {
                        const isDone = completed[step.id];
                        return (
                          <div key={step.id} onClick={() => toggleStep(step.id)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", background: isDone ? `${col}09` : "#0a0a18", border: `1px solid ${isDone ? col + "30" : "#14142a"}`, transition: "all 0.15s" }}>
                            <div style={{ width: 17, height: 17, borderRadius: 4, flexShrink: 0, marginTop: 2, border: `2px solid ${isDone ? col : "#2d3748"}`, background: isDone ? col : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#060610", fontWeight: 900, transition: "all 0.15s" }}>
                              {isDone ? "✓" : ""}
                            </div>
                            <code style={{ fontSize: 11.5, lineHeight: 1.7, color: isDone ? "#334155" : "#94a3b8", textDecoration: isDone ? "line-through" : "none", wordBreak: "break-all" }}>
                              {step.text}
                            </code>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#1e293b", fontSize: 14 }}>
            No results found for "{search}"
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 32, textAlign: "center", padding: "22px 32px", border: "1px solid #1a1a30", borderRadius: 12, background: "#0d0d20" }}>
          <div style={{ color: "#f87171", fontSize: 10, letterSpacing: 3, marginBottom: 8 }}>⚠️ LEGAL & ETHICAL REMINDER</div>
          <p style={{ color: "#334155", fontSize: 11, margin: "0 0 8px", lineHeight: 2 }}>
            Only test targets with <span style={{ color: "#64748b" }}>explicit written permission</span>. Verify scope before every test.<br />
            Document everything • Report responsibly • Unauthorized testing is illegal.
          </p>
          <p style={{ color: "#1e293b", fontSize: 10, margin: 0, letterSpacing: 3 }}>BUILT BY SPONDON • 2026</p>
        </div>

      </div>
    </div>
  );
}
