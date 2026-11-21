# ==========================================================================
#  ĐƯA WEB "DÒNG CHẢY LỊCH SỬ" LÊN MẠNG TỪ MÁY NÀY (miễn phí, qua Cloudflare)
#
#  Cách dùng: nhấp đúp file CHAY-WEB-CONG-KHAI.bat (cùng thư mục).
#  - Script bật máy chủ web (cổng 3000) nếu chưa chạy, rồi mở đường hầm Cloudflare.
#  - Link công khai dạng https://....trycloudflare.com hiện trên màn hình,
#    được chép sẵn vào bộ nhớ tạm (Ctrl+V để dán) và lưu vào file link-cong-khai.txt.
#  - Để web luôn truy cập được: GIỮ cửa sổ này mở, máy bật và có mạng.
#    Trong lúc chạy, script giữ cho máy không tự ngủ.
#  - Đóng cửa sổ (hoặc bấm Ctrl+C) là web ngừng trên mạng.
#  - Mỗi lần chạy lại, link sẽ KHÁC lần trước.
# ==========================================================================
param([switch]$NoPause)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}
$root = $PSScriptRoot
Set-Location $root
$port = 3000
$cf = Join-Path $root 'tools\cloudflared.exe'
$linkFile = Join-Path $root 'link-cong-khai.txt'
$cfLog = Join-Path $root 'cloudflared.log'
$started = @()

function Wait-Exit($code) {
  if (-not $NoPause) { Write-Host ''; Read-Host 'Bấm Enter để đóng' | Out-Null }
  exit $code
}

if (-not (Test-Path $cf)) {
  Write-Host 'Không tìm thấy tools\cloudflared.exe.' -ForegroundColor Red
  Write-Host 'Tải file cloudflared-windows-amd64.exe tại https://github.com/cloudflare/cloudflared/releases, đổi tên thành cloudflared.exe và đặt vào thư mục tools.'
  Wait-Exit 1
}
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) {
  Write-Host 'Máy chưa cài Node.js (cần bản 22.13 trở lên): https://nodejs.org' -ForegroundColor Red
  Wait-Exit 1
}

# Giữ máy không tự ngủ trong lúc web đang chạy trên mạng
$keepAwake = $false
try {
  Add-Type -Namespace DCLS -Name Power -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint esFlags);'
  # ES_CONTINUOUS | ES_SYSTEM_REQUIRED (viết dạng chuỗi vì PowerShell 5.1 đọc 0x80000001 thành số âm)
  [void][DCLS.Power]::SetThreadExecutionState([Convert]::ToUInt32('80000001', 16))
  $keepAwake = $true
} catch {
  Write-Host 'Không bật được chế độ giữ máy thức. Hãy tự tắt chế độ ngủ của máy trong lúc chạy web.' -ForegroundColor Yellow
}

try {
  # 1) Bản dựng giao diện
  if (-not (Test-Path (Join-Path $root 'dist\index.html'))) {
    Write-Host 'Đang dựng giao diện (lần đầu mất khoảng 1 phút)...'
    & npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Dựng giao diện thất bại.' }
  }

  # 2) Máy chủ web
  $listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if ($listening) {
    Write-Host "Máy chủ web đã chạy sẵn ở cổng $port, dùng luôn."
  } else {
    Write-Host "Đang bật máy chủ web ở cổng $port..."
    $server = Start-Process -FilePath $node -ArgumentList '--env-file-if-exists=.env', 'server.js' -WorkingDirectory $root -PassThru -NoNewWindow `
      -RedirectStandardOutput (Join-Path $root 'server.log') -RedirectStandardError (Join-Path $root 'server-loi.log')
    $started += $server
    $ok = $false
    for ($i = 0; $i -lt 40; $i++) {
      Start-Sleep -Milliseconds 500
      if ($server.HasExited) { break }
      if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) { $ok = $true; break }
    }
    if (-not $ok) { throw 'Máy chủ web không bật được. Xem file server-loi.log.' }
  }

  # 3) Đường hầm Cloudflare
  Write-Host 'Đang mở đường hầm Cloudflare...'
  if (Test-Path $cfLog) { Remove-Item $cfLog -Force }
  $tunnel = Start-Process -FilePath $cf -ArgumentList 'tunnel', '--no-autoupdate', '--url', "http://localhost:$port" -PassThru -NoNewWindow `
    -RedirectStandardError $cfLog -RedirectStandardOutput (Join-Path $root 'cloudflared-out.log')
  $started += $tunnel
  $url = $null
  for ($i = 0; $i -lt 90 -and -not $url; $i++) {
    Start-Sleep -Seconds 1
    if ($tunnel.HasExited) { break }
    if (Test-Path $cfLog) {
      $m = Select-String -Path $cfLog -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -AllMatches -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($m) { $url = $m.Matches[0].Value }
    }
  }
  if (-not $url) { throw 'Không lấy được link từ Cloudflare. Kiểm tra mạng rồi chạy lại (chi tiết trong cloudflared.log).' }

  Set-Content -Path $linkFile -Value $url -Encoding UTF8
  try { Set-Clipboard -Value $url } catch {}
  Write-Host ''
  Write-Host '  WEB ĐÃ LÊN MẠNG. Gửi link này cho mọi người:' -ForegroundColor Green
  Write-Host ''
  Write-Host "      $url" -ForegroundColor Yellow
  Write-Host ''
  Write-Host '  (Link đã được chép, bấm Ctrl+V để dán. Cũng lưu trong file link-cong-khai.txt)'
  Write-Host '  Giữ cửa sổ này mở. Đóng cửa sổ hoặc bấm Ctrl+C để dừng.'
  Write-Host ''

  while (-not $tunnel.HasExited) {
    Start-Sleep -Seconds 5
    if ($server -and $server.HasExited) {
      Write-Host 'Máy chủ web đã dừng bất ngờ. Xem file server-loi.log rồi chạy lại.' -ForegroundColor Red
      break
    }
  }
  if ($tunnel.HasExited) { Write-Host 'Đường hầm Cloudflare đã đóng. Chạy lại để có link mới.' -ForegroundColor Red }
} catch {
  Write-Host $_.Exception.Message -ForegroundColor Red
  $failed = $true
} finally {
  foreach ($p in $started) { if ($p -and -not $p.HasExited) { try { Stop-Process -Id $p.Id -Force } catch {} } }
  # cho phép máy ngủ lại như bình thường (ES_CONTINUOUS)
  if ($keepAwake) { [void][DCLS.Power]::SetThreadExecutionState([Convert]::ToUInt32('80000000', 16)) }
}
if ($failed) { Wait-Exit 1 } else { Wait-Exit 0 }
