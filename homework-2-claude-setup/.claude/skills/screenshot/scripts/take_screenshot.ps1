param(
    [string]$Path,
    [ValidateSet('default', 'temp')]
    [string]$Mode = 'default',
    [int[]]$Region,
    [switch]$ActiveWindow
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

function Resolve-OutputPath {
    param([string]$Path, [string]$Mode)

    if ($Path) {
        $parent = Split-Path -Parent $Path
        if ($parent -and -not (Test-Path $parent)) {
            New-Item -ItemType Directory -Path $parent -Force | Out-Null
        }
        return $Path
    }

    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $name = "screenshot-$stamp.png"

    if ($Mode -eq 'temp') {
        return Join-Path $env:TEMP $name
    }

    $pics = Join-Path $env:USERPROFILE 'Pictures\Screenshots'
    if (-not (Test-Path $pics)) {
        New-Item -ItemType Directory -Path $pics -Force | Out-Null
    }
    return Join-Path $pics $name
}

function Get-VirtualScreenBounds {
    $vs = [System.Windows.Forms.SystemInformation]::VirtualScreen
    return New-Object System.Drawing.Rectangle($vs.X, $vs.Y, $vs.Width, $vs.Height)
}

function Get-ActiveWindowBounds {
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public class W {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
}
"@
    $hwnd = [W]::GetForegroundWindow()
    $rect = New-Object W+RECT
    [void][W]::GetWindowRect($hwnd, [ref]$rect)
    return New-Object System.Drawing.Rectangle($rect.L, $rect.T, $rect.R - $rect.L, $rect.B - $rect.T)
}

if ($Region) {
    if ($Region.Count -ne 4) { throw "Region must be 4 integers: x,y,width,height" }
    $bounds = New-Object System.Drawing.Rectangle($Region[0], $Region[1], $Region[2], $Region[3])
}
elseif ($ActiveWindow) {
    $bounds = Get-ActiveWindowBounds
}
else {
    $bounds = Get-VirtualScreenBounds
}

$bitmap = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)

$out = Resolve-OutputPath -Path $Path -Mode $Mode
$bitmap.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()

Write-Output $out
