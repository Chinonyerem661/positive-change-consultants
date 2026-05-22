param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [Parameter(Mandatory=$true)][string]$OutputPath,
  [int]$Padding = 12
)

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Bitmap]::new($InputPath)
$minX = $source.Width
$minY = $source.Height
$maxX = 0
$maxY = 0

for ($y = 0; $y -lt $source.Height; $y++) {
  for ($x = 0; $x -lt $source.Width; $x++) {
    if ($source.GetPixel($x, $y).A -gt 0) {
      if ($x -lt $minX) { $minX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}

if ($maxX -le $minX -or $maxY -le $minY) {
  throw "No visible pixels found."
}

$left = [Math]::Max(0, $minX - $Padding)
$top = [Math]::Max(0, $minY - $Padding)
$right = [Math]::Min($source.Width - 1, $maxX + $Padding)
$bottom = [Math]::Min($source.Height - 1, $maxY + $Padding)
$width = $right - $left + 1
$height = $bottom - $top + 1

$crop = [System.Drawing.Rectangle]::new($left, $top, $width, $height)
$output = $source.Clone($crop, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$output.Dispose()
$source.Dispose()
