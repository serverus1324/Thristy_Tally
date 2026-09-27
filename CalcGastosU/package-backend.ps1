$ErrorActionPreference = "Stop"

$PROJECT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $PROJECT_DIR

$env:MAVEN_USER_HOME = "C:\maven_home"
$MVNW = Join-Path $PROJECT_DIR "mvnw.cmd"

if (-not (Test-Path $MVNW)) {
    Write-Host "ERROR: No se encontro mvnw.cmd en $PROJECT_DIR" -ForegroundColor Red
    exit 1
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CalcGastosU  —  Building JAR (skipTests)"                 -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Working dir    : $PROJECT_DIR"
Write-Host "  MAVEN_USER_HOME: $env:MAVEN_USER_HOME"
Write-Host ""

& $MVNW clean package "-DskipTests"
$exit = $LASTEXITCODE

Write-Host ""
if ($exit -eq 0) {
    $JAR = Join-Path $PROJECT_DIR "target\CalcGastosU-0.0.1-SNAPSHOT.jar"
    if (Test-Path $JAR) {
        $size = [math]::Round((Get-Item $JAR).Length / 1MB, 1)
        Write-Host "✅ BUILD SUCCESS  →  $JAR  ($size MB)" -ForegroundColor Green
        Write-Host "Ahora ejecuta:  .\run-backend.ps1" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Build OK pero no se encontro el JAR en target\" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ BUILD FAILED — exit code $exit" -ForegroundColor Red
    exit $exit
}
