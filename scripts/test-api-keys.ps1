param(
  [string]$EnvFile = ".env"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Mask-Secret([string]$value) {
  if ([string]::IsNullOrEmpty($value)) { return "<empty>" }
  $trimmed = $value.Trim()
  if ($trimmed.Length -le 8) { return ("*" * $trimmed.Length) }
  return ("*" * ($trimmed.Length - 4)) + $trimmed.Substring($trimmed.Length - 4)
}

function Looks-Like-Placeholder([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) { return $true }
  $v = $value.Trim()
  if ($v -match "^(x{6,}|X{6,}|_+)$") { return $true }
  if ($v -match "xxxx|XXXX|placeholder|changeme|example") { return $true }
  if ($v -match "^sk_test_x+$") { return $true }
  if ($v -match "^whsec_x+$") { return $true }
  return $false
}

function Load-DotEnv([string]$path) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Env file not found: $path"
  }

  $vars = @{}
  Get-Content -LiteralPath $path -ErrorAction Stop | ForEach-Object {
    $line = $_
    if ($null -eq $line) { return }
    $line = $line.Trim()
    if ($line.Length -eq 0) { return }
    if ($line.StartsWith("#")) { return }
    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }
    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1)
    if (($val.StartsWith("'") -and $val.EndsWith("'")) -or ($val.StartsWith('"') -and $val.EndsWith('"'))) {
      $val = $val.Substring(1, $val.Length - 2)
    }
    $vars[$key] = $val
  }
  return $vars
}

function New-Result([string]$name, [string]$status, [string]$detail) {
  [PSCustomObject]@{
    Name   = $name
    Status = $status
    Detail = $detail
  }
}

function Safe-InvokeJson([string]$name, [scriptblock]$fn, [string[]]$redact = @()) {
  try {
    $data = & $fn
    return New-Result $name "OK" $data
  } catch {
    $msg = $_.Exception.Message
    foreach ($r in $redact) {
      if (-not [string]::IsNullOrEmpty($r)) { $msg = $msg.Replace($r, "<redacted>") }
    }
    if ($msg.Length -gt 220) { $msg = $msg.Substring(0, 220) + "..." }
    return New-Result $name "FAIL" $msg
  }
}

Write-Host "Loading env from $EnvFile"
$dotenv = Load-DotEnv $EnvFile
foreach ($k in $dotenv.Keys) {
  Set-Item -Path ("Env:" + $k) -Value $dotenv[$k]
}

$results = @()

# --- AWS (uses AWS CLI) ---
if (Looks-Like-Placeholder $env:AWS_ACCESS_KEY_ID -or Looks-Like-Placeholder $env:AWS_SECRET_ACCESS_KEY) {
  $results += New-Result "AWS STS GetCallerIdentity" "SKIP" "Missing/placeholder AWS credentials"
} else {
  $results += Safe-InvokeJson "AWS STS GetCallerIdentity" {
    $json = aws sts get-caller-identity --output json 2>$null
    if ([string]::IsNullOrWhiteSpace($json)) { throw "aws cli returned no output" }
    $obj = $json | ConvertFrom-Json
    "Account=$($obj.Account) Arn=$($obj.Arn)"
  }
}

# --- OpenAI ---
if (Looks-Like-Placeholder $env:OPENAI_API_KEY) {
  $results += New-Result "OpenAI (list models)" "SKIP" "Missing/placeholder OPENAI_API_KEY"
} else {
  $results += Safe-InvokeJson "OpenAI (list models)" {
    $headers = @{ Authorization = "Bearer $($env:OPENAI_API_KEY)" }
    $resp = Invoke-RestMethod -Method Get -Uri "https://api.openai.com/v1/models" -Headers $headers -TimeoutSec 30
    $count = 0
    if ($resp.data) { $count = @($resp.data).Count }
    "models=$count key=$(Mask-Secret $env:OPENAI_API_KEY)"
  } @($env:OPENAI_API_KEY)
}

# --- Census Data API ---
if (Looks-Like-Placeholder $env:CENSUSDATA_KEY) {
  $results += New-Result "Census (sample query)" "SKIP" "Missing/placeholder CENSUSDATA_KEY"
} else {
  $results += Safe-InvokeJson "Census (sample query)" {
    $uri = "https://api.census.gov/data/2022/acs/acs1?get=NAME&for=us:1&key=$($env:CENSUSDATA_KEY)"
    $r = Invoke-WebRequest -Method Get -Uri $uri -TimeoutSec 30 -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode)" }
    $body = [string]$r.Content
    $ctype = ""
    try { $ctype = [string]$r.Headers["Content-Type"] } catch { $ctype = "" }
    if ($ctype -and ($ctype -notmatch "json") -and ($body -match "<title>Invalid Key</title>")) {
      throw "Invalid Census API key"
    }
    $resp = $null
    try { $resp = $body | ConvertFrom-Json } catch {
      $snippet = $body
      if ($snippet.Length -gt 120) { $snippet = $snippet.Substring(0, 120) + "..." }
      throw "Non-JSON response body: $snippet"
    }
    if (-not ($resp -is [object[]])) { throw "Unexpected JSON type: $($resp.GetType().FullName)" }
    $rows = [Math]::Max(0, @($resp).Count - 1)
    "rows=$rows key=$(Mask-Secret $env:CENSUSDATA_KEY)"
  } @($env:CENSUSDATA_KEY)
}

# --- Telegram ---
if (Looks-Like-Placeholder $env:TELEGRAM_BOT_TOKEN) {
  $results += New-Result "Telegram (getMe)" "SKIP" "Missing/placeholder TELEGRAM_BOT_TOKEN"
} else {
  $results += Safe-InvokeJson "Telegram (getMe)" {
    $uri = "https://api.telegram.org/bot$($env:TELEGRAM_BOT_TOKEN)/getMe"
    $resp = Invoke-RestMethod -Method Get -Uri $uri -TimeoutSec 30
    if (-not $resp.ok) { throw "Telegram returned ok=false" }
    $u = $resp.result.username
    "username=$u token=$(Mask-Secret $env:TELEGRAM_BOT_TOKEN)"
  } @($env:TELEGRAM_BOT_TOKEN)
}

# --- Stripe ---
if (Looks-Like-Placeholder $env:STRIPE_SECRET_KEY) {
  $results += New-Result "Stripe (account)" "SKIP" "Missing/placeholder STRIPE_SECRET_KEY"
} else {
  $results += Safe-InvokeJson "Stripe (account)" {
    $headers = @{ Authorization = "Bearer $($env:STRIPE_SECRET_KEY)" }
    $resp = Invoke-RestMethod -Method Get -Uri "https://api.stripe.com/v1/account" -Headers $headers -TimeoutSec 30
    "id=$($resp.id) charges_enabled=$($resp.charges_enabled) key=$(Mask-Secret $env:STRIPE_SECRET_KEY)"
  } @($env:STRIPE_SECRET_KEY)
}

if (Looks-Like-Placeholder $env:STRIPE_WEBHOOK_SECRET) {
  $results += New-Result "Stripe webhook secret" "SKIP" "Cannot validate without a signed webhook payload (current=$(Mask-Secret $env:STRIPE_WEBHOOK_SECRET))"
} else {
  $results += New-Result "Stripe webhook secret" "SKIP" "Cannot validate without a signed webhook payload (current=$(Mask-Secret $env:STRIPE_WEBHOOK_SECRET))"
}

# --- GitHub PAT ---
$results += Safe-InvokeJson "GitHub (GET /user)" {
  if (Looks-Like-Placeholder $env:GITHUB_PAT_WRITE) { throw "Missing/placeholder GITHUB_PAT_WRITE" }
  $authScheme = "token"
  if ($env:GITHUB_PAT_WRITE.StartsWith("github_pat_")) { $authScheme = "Bearer" }
  $headers = @{
    Authorization = "$authScheme $($env:GITHUB_PAT_WRITE)"
    "User-Agent"  = "press-page-keycheck"
    Accept        = "application/vnd.github+json"
  }
  $resp = Invoke-RestMethod -Method Get -Uri "https://api.github.com/user" -Headers $headers -TimeoutSec 30
  "login=$($resp.login) id=$($resp.id) pat=$(Mask-Secret $env:GITHUB_PAT_WRITE)"
} @($env:GITHUB_PAT_WRITE)

# --- Hugging Face ---
$results += Safe-InvokeJson "HuggingFace (whoami)" {
  if (Looks-Like-Placeholder $env:HUGGINGFACE_WRITE) { throw "Missing/placeholder HUGGINGFACE_WRITE" }
  $headers = @{ Authorization = "Bearer $($env:HUGGINGFACE_WRITE)" }
  $resp = Invoke-RestMethod -Method Get -Uri "https://huggingface.co/api/whoami-v2" -Headers $headers -TimeoutSec 30
  $name = $resp.name
  if ([string]::IsNullOrEmpty($name) -and $resp.user) { $name = $resp.user.name }
  "name=$name token=$(Mask-Secret $env:HUGGINGFACE_WRITE)"
} @($env:HUGGINGFACE_WRITE)

# --- Google AI (Generative Language API) ---
if (Looks-Like-Placeholder $env:GOOGLE_AI_KEY) {
  $results += New-Result "Google AI (list models)" "SKIP" "Missing/placeholder GOOGLE_AI_KEY"
} else {
  $results += Safe-InvokeJson "Google AI (list models)" {
    $uri = "https://generativelanguage.googleapis.com/v1beta/models?key=$($env:GOOGLE_AI_KEY)"
    $resp = Invoke-RestMethod -Method Get -Uri $uri -TimeoutSec 30
    $count = 0
    if ($resp.models) { $count = @($resp.models).Count }
    "models=$count key=$(Mask-Secret $env:GOOGLE_AI_KEY)"
  } @($env:GOOGLE_AI_KEY)
}

# --- AWS Console / other non-API secrets ---
$results += New-Result "AWS console username/password" "SKIP" "Not validated via API call; test interactively in browser"
$results += New-Result "Telegram webhook URL" "SKIP" "Empty/unset" 
$results += New-Result "GITHUB_REPO_URL" "SKIP" "Empty/unset"

$results | Format-Table -AutoSize

$failed = @($results | Where-Object { $_.Status -eq "FAIL" }).Count
if ($failed -gt 0) {
  Write-Host ""
  Write-Host "Some checks failed: $failed" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "All runnable checks passed." -ForegroundColor Green
