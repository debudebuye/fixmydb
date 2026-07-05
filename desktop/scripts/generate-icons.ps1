Add-Type -AssemblyName System.Drawing

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$iconDir = [System.IO.Path]::Combine($scriptDir, "..", "icons")
$iconDir = [System.IO.Path]::GetFullPath($iconDir)

$bgGradStart = [System.Drawing.Color]::FromArgb(124, 106, 247)
$bgGradEnd   = [System.Drawing.Color]::FromArgb(79, 70, 229)
$bgColor     = [System.Drawing.Color]::FromArgb(10, 10, 15)

function Draw-Icon($size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $radius = [Math]::Max(1, [int]($size * 0.22))

    # Outer dark rounded rect
    $outerRect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $outerPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $outerPath.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90) | Out-Null
    $outerPath.AddArc($size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90) | Out-Null
    $outerPath.AddArc($size - $radius * 2, $size - $radius * 2, $radius * 2, $radius * 2, 0, 90) | Out-Null
    $outerPath.AddArc(0, $size - $radius * 2, $radius * 2, $radius * 2, 90, 90) | Out-Null
    $outerPath.CloseFigure()
    $g.FillPath([System.Drawing.SolidBrush]::new($bgColor), $outerPath)

    # Inner gradient rounded rect
    $margin = [int]($size * 0.11)
    $innerSize = $size - $margin * 2
    $innerRadius = [Math]::Max(1, [int]($innerSize * 0.22))
    $innerPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $innerPath.AddArc($margin, $margin, $innerRadius * 2, $innerRadius * 2, 180, 90) | Out-Null
    $innerPath.AddArc($margin + $innerSize - $innerRadius * 2, $margin, $innerRadius * 2, $innerRadius * 2, 270, 90) | Out-Null
    $innerPath.AddArc($margin + $innerSize - $innerRadius * 2, $margin + $innerSize - $innerRadius * 2, $innerRadius * 2, $innerRadius * 2, 0, 90) | Out-Null
    $innerPath.AddArc($margin, $margin + $innerSize - $innerRadius * 2, $innerRadius * 2, $innerRadius * 2, 90, 90) | Out-Null
    $innerPath.CloseFigure()

    $innerRect = New-Object System.Drawing.RectangleF($margin, $margin, $innerSize, $innerSize)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($innerRect, $bgGradStart, $bgGradEnd, [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
    $g.FillPath($brush, $innerPath)

    # DB icon: cylinder shape
    $cylWidth = $innerSize * 0.5
    $cylHeight = $innerSize * 0.6
    $cx = $size / 2
    $cy = $size / 2

    $cylTop = $cy - $cylHeight / 2
    $cylLeft = $cx - $cylWidth / 2
    $ellipseH = $cylWidth * 0.2

    $penW = [int]($size * 0.045)
    if ($penW -lt 1) { $penW = 1 }
    $white = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 255, 255, 255), $penW)
    $white2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 255, 255, 255), $penW)

    # Top ellipse
    $g.DrawArc($white, $cylLeft, $cylTop, $cylWidth, $ellipseH, 0, 360)
    # Sides
    $g.DrawLine($white, $cylLeft, $cylTop + $ellipseH / 2, $cylLeft, $cylTop + $cylHeight - $ellipseH / 2)
    $g.DrawLine($white, $cylLeft + $cylWidth, $cylTop + $ellipseH / 2, $cylLeft + $cylWidth, $cylTop + $cylHeight - $ellipseH / 2)
    # Bottom ellipse
    $g.DrawArc($white2, $cylLeft, $cylTop + $cylHeight - $ellipseH, $cylWidth, $ellipseH, 0, 360)
    # Middle band
    $g.DrawArc($white2, $cylLeft, $cylTop + $cylHeight / 2 - $ellipseH / 2, $cylWidth, $ellipseH, 0, 360)

    $g.Dispose()
    $bmp
}

Write-Host "Generating icon.png (1024x1024)..."
$png1024 = Draw-Icon 1024
$pngPath = [System.IO.Path]::Combine($iconDir, "icon.png")
$png1024.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$png1024.Dispose()

Write-Host "Generating icon.ico (16,32,48,64,128,256)..."
$icoPath = [System.IO.Path]::Combine($iconDir, "icon.ico")

$sizes = @(16, 32, 48, 64, 128, 256)
$fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
$bw = New-Object System.IO.BinaryWriter($fs)

# ICO header
$bw.Write([UInt16]0)
$bw.Write([UInt16]1)
$bw.Write([UInt16]$sizes.Count)

$offset = 6 + $sizes.Count * 16
$pngBlobs = @{}

foreach ($s in $sizes) {
    $bmp = Draw-Icon $s
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBlobs[$s] = $ms.ToArray()
    $ms.Dispose()
    $bmp.Dispose()
}

# Write directory entries
foreach ($s in $sizes) {
    $data = $pngBlobs[$s]
    $w = $h = 0
    if ($s -lt 256) { $w = $s; $h = $s }
    $bw.Write([Byte]$w)
    $bw.Write([Byte]$h)
    $bw.Write([Byte]0)
    $bw.Write([Byte]0)
    $bw.Write([UInt16]1)
    $bw.Write([UInt16]32)
    $bw.Write([UInt32]$data.Length)
    $bw.Write([UInt32]$offset)
    $offset += $data.Length
}

# Write PNG data
foreach ($s in $sizes) {
    $bw.Write($pngBlobs[$s])
}

$bw.Dispose()
$fs.Dispose()

Write-Host "Done!"
Write-Host "  $icoPath"
Write-Host "  $pngPath"