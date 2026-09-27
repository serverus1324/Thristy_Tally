$ErrorActionPreference = "Stop"

# ---- Working Directory: CARPETA DONDE ESTA ESTE SCRIPT ----
$PROJECT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $PROJECT_DIR

# ---- Workaround espacios en ruta de usuario ----
$env:MAVEN_USER_HOME = "C:\maven_home"

# ---- Cargar .env al proceso (NO hardcodear secretos aqui) ----
$envPath = Join-Path $PROJECT_DIR ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "ERROR: No se encontro .env en $PROJECT_DIR" -ForegroundColor Red
    Write-Host "Copia .env.example como .env y rellena los valores." -ForegroundColor Yellow
    exit 1
}
Get-Content $envPath -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) { return }
    $name, $value = $line -split "=", 2
    $n = $name.Trim()
    $v = $value.Trim()
    if (-not [string]::IsNullOrEmpty($n)) {
        [System.Environment]::SetEnvironmentVariable($n, $v, "Process")
    }
}

# ---- Validar variables CRITICAS ----
$missing = @()
if ([string]::IsNullOrEmpty($env:MONGODB_URI)) { $missing += "MONGODB_URI" }
if ([string]::IsNullOrEmpty($env:JWT_SECRET)) { $missing += "JWT_SECRET" }
if ($env:JWT_SECRET -and $env:JWT_SECRET.Length -lt 32) { $missing += "JWT_SECRET (>=32 chars, actual=$($env:JWT_SECRET.Length))" }
if ($missing.Count -gt 0) {
    Write-Host "ERROR: Faltan variables en .env: $($missing -join ', ')" -ForegroundColor Red
    exit 2
}

# ============================================================
# DETECTAR JAVA (evita hardcodear rutas con espacios o tildes)
# ============================================================
function Get-JavaExe {
    # 1) JAVA_HOME si existe
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
        return "$env:JAVA_HOME\bin\java.exe"
    }
    # 2) java en PATH
    $fromPath = (Get-Command java -ErrorAction SilentlyContinue).Source
    if ($fromPath -and (Test-Path $fromPath)) {
        return $fromPath
    }
    # 3) Buscar JDK 17 en Downloads (tu caso)
    $dl = Join-Path $env:USERPROFILE "Downloads"
    if (Test-Path $dl) {
        $jdkDirs = Get-ChildItem $dl -Directory -Filter "*jdk*17*" -ErrorAction SilentlyContinue
        foreach ($d in $jdkDirs) {
            $candidate = Join-Path $d.FullName "bin\java.exe"
            if (Test-Path $candidate) { return $candidate }
            $inner = Get-ChildItem $d.FullName -Directory -Filter "jdk*" -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($inner) {
                $candidate2 = Join-Path $inner.FullName "bin\java.exe"
                if (Test-Path $candidate2) { return $candidate2 }
            }
        }
    }
    return $null
}
$JAVA = Get-JavaExe
if (-not $JAVA -or -not (Test-Path $JAVA)) {
    Write-Host "ERROR: No se encontro java.exe." -ForegroundColor Red
    Write-Host "  • Define JAVA_HOME apuntando a tu JDK 17, o"
    Write-Host "  • Agrega JDK 17 al PATH, o"
    Write-Host "  • Instala JDK 17 (requerido por Spring Boot 3.x)"
    exit 3
}

# ---- Verificar version Java (Spring Boot 3.x requiere >= 17) ----
$oldEAP = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
try {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $JAVA
    $psi.Arguments = "-version"
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $p = [System.Diagnostics.Process]::Start($psi)
    $verOutput = $p.StandardError.ReadToEnd()
    $p.WaitForExit()
} finally {
    $ErrorActionPreference = $oldEAP
}
if ($verOutput -notmatch '"(1\d|[2-9]\d)\.') {
    Write-Host "ERROR: Java detectado es demasiado viejo. Se requiere Java >= 17." -ForegroundColor Red
    Write-Host "Version detectada: $verOutput"
    exit 3
}

# ---- JAR compilado ----
$JAR = Join-Path $PROJECT_DIR "target\CalcGastosU-0.0.1-SNAPSHOT.jar"
if (-not (Test-Path $JAR)) {
    Write-Host "ERROR: No existe $JAR" -ForegroundColor Red
    Write-Host "Antes de ejecutar este script, corre:  .\package-backend.ps1" -ForegroundColor Yellow
    exit 4
}

# ---- Liberar puerto 8081 si ya esta ocupado ----
try {
    $used = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
    if ($used) {
        $pids = $used.OwningProcess | Select-Object -Unique
        Write-Host "Puerto 8081 ocupado por PID(s): $($pids -join ', '). Liberando..." -ForegroundColor Yellow
        Stop-Process -Id $pids -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
} catch {}

# ---- Resumen ----
$profileVal = if ([string]::IsNullOrEmpty($env:SPRING_PROFILES_ACTIVE)) { "dev" } else { $env:SPRING_PROFILES_ACTIVE }
$dbVal      = if ([string]::IsNullOrEmpty($env:MONGODB_DATABASE))      { "(from URI)" } else { $env:MONGODB_DATABASE }
$javaShort  = ($verOutput -split "`r?`n" | Select-Object -First 1) -replace 'version ',''
$jwtStatus  = if ($env:JWT_SECRET) { "$($env:JWT_SECRET.Length) chars OK" } else { "MISSING" }

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CalcGastosU  -  Starting backend"                        -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Working dir : $PROJECT_DIR"
Write-Host "  Profile     : $profileVal"
Write-Host "  Port        : 8081"
Write-Host "  Java        : $javaShort"
Write-Host "  Java path   : $JAVA"
Write-Host "  Mongo DB    : $dbVal"
Write-Host "  JWT Secret  : $jwtStatus"
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ---- ARRANCAR ----
& $JAVA -jar $JAR
