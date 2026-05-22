param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [Parameter(Mandatory=$true)][string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Bitmap]::new($InputPath)
$output = [System.Drawing.Bitmap]::new($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

function Is-CheckerBackground {
  param([System.Drawing.Color]$Color)

  $max = [Math]::Max($Color.R, [Math]::Max($Color.G, $Color.B))
  $min = [Math]::Min($Color.R, [Math]::Min($Color.G, $Color.B))
  $brightness = ($Color.R + $Color.G + $Color.B) / 3
  $saturation = $max - $min

  if ($brightness -lt 168) { return $false }
  if ($saturation -gt 24) { return $false }

  return $true
}

for ($y = 0; $y -lt $source.Height; $y++) {
  for ($x = 0; $x -lt $source.Width; $x++) {
    $pixel = $source.GetPixel($x, $y)

    if (Is-CheckerBackground $pixel) {
      $output.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
    } else {
      $output.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $pixel.R, $pixel.G, $pixel.B))
    }
  }
}

$directory = Split-Path -Parent $OutputPath
if ($directory -and -not (Test-Path -LiteralPath $directory)) {
  New-Item -ItemType Directory -Path $directory | Out-Null
}

$output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$output.Dispose()
$source.Dispose()
