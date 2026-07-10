package main

import (
    "context"
    "embed"
    "errors"
    "fmt"
    "io/fs"
    "log"
    "mime"
    "net"
    "net/http"
    "os"
    "os/exec"
    "path"
    "runtime"
    "strings"
    "sync/atomic"
    "time"
)

const (
    appName       = "Fictional Meme"
    preferredAddr = "127.0.0.1:43127"
    identity      = "fictional-meme-desktop-v1"
)

var version = "dev"

//go:embed dist
var embeddedFiles embed.FS

type appServer struct {
    staticFS fs.FS
    lastPing atomic.Int64
    server   *http.Server
}

func main() {
    logFile, err := os.OpenFile(errorLogPath(), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o600)
    if err == nil {
        defer logFile.Close()
        log.SetOutput(logFile)
    }

    if existingInstance() {
        _ = openBrowser("http://" + preferredAddr + "/")
        return
    }

    listener, err := net.Listen("tcp", preferredAddr)
    if err != nil {
        listener, err = net.Listen("tcp", "127.0.0.1:0")
    }
    if err != nil {
        log.Fatalf("local server could not start: %v", err)
    }

    staticFS, err := fs.Sub(embeddedFiles, "dist")
    if err != nil {
        log.Fatalf("embedded application files are unavailable: %v", err)
    }

    app := &appServer{staticFS: staticFS}
    app.lastPing.Store(time.Now().Unix())

    mux := http.NewServeMux()
    mux.HandleFunc("/__fictional_meme/health", app.health)
    mux.HandleFunc("/__fictional_meme/ping", app.ping)
    mux.HandleFunc("/__fictional_meme/quit", app.quit)
    mux.HandleFunc("/", app.serveApp)

    app.server = &http.Server{
        Handler:           securityHeaders(mux),
        ReadHeaderTimeout: 5 * time.Second,
        IdleTimeout:       90 * time.Second,
    }

    go app.stopAfterInactivity()
    go func() {
        if err := app.server.Serve(listener); err != nil && !errors.Is(err, http.ErrServerClosed) {
            log.Printf("server error: %v", err)
        }
    }()

    address := listener.Addr().String()
    url := "http://" + address + "/"
    time.Sleep(150 * time.Millisecond)
    if err := openBrowser(url); err != nil {
        log.Printf("browser could not be opened automatically: %v; URL: %s", err, url)
    }

    select {}
}

func existingInstance() bool {
    client := &http.Client{Timeout: 700 * time.Millisecond}
    response, err := client.Get("http://" + preferredAddr + "/__fictional_meme/health")
    if err != nil {
        return false
    }
    defer response.Body.Close()
    return response.StatusCode == http.StatusOK && response.Header.Get("X-Fictional-Meme") == identity
}

func (a *appServer) health(w http.ResponseWriter, _ *http.Request) {
    w.Header().Set("X-Fictional-Meme", identity)
    w.Header().Set("Content-Type", "text/plain; charset=utf-8")
    w.Header().Set("Cache-Control", "no-store")
    _, _ = fmt.Fprintf(w, "%s %s", appName, version)
}

func (a *appServer) ping(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }
    a.lastPing.Store(time.Now().Unix())
    w.Header().Set("Cache-Control", "no-store")
    w.WriteHeader(http.StatusNoContent)
}

func (a *appServer) quit(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }
    w.WriteHeader(http.StatusNoContent)
    go func() {
        time.Sleep(250 * time.Millisecond)
        ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
        defer cancel()
        _ = a.server.Shutdown(ctx)
        os.Exit(0)
    }()
}

func (a *appServer) stopAfterInactivity() {
    ticker := time.NewTicker(60 * time.Second)
    defer ticker.Stop()
    for range ticker.C {
        lastSeen := time.Unix(a.lastPing.Load(), 0)
        if time.Since(lastSeen) > 10*time.Minute {
            ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
            _ = a.server.Shutdown(ctx)
            cancel()
            os.Exit(0)
        }
    }
}

func (a *appServer) serveApp(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet && r.Method != http.MethodHead {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }

    requested := strings.TrimPrefix(path.Clean("/"+r.URL.Path), "/")
    if requested == "." || requested == "" {
        requested = "index.html"
    }

    data, err := fs.ReadFile(a.staticFS, requested)
    if err != nil {
        if strings.Contains(path.Base(requested), ".") {
            http.NotFound(w, r)
            return
        }
        requested = "index.html"
        data, err = fs.ReadFile(a.staticFS, requested)
        if err != nil {
            http.Error(w, "application entry point is missing", http.StatusInternalServerError)
            return
        }
    }

    if requested == "index.html" {
        data = injectDesktopBridge(data)
        w.Header().Set("Cache-Control", "no-cache")
    } else if strings.HasPrefix(requested, "assets/") {
        w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
    }

    if contentType := mime.TypeByExtension(path.Ext(requested)); contentType != "" {
        w.Header().Set("Content-Type", contentType)
    }
    http.ServeContent(w, r, requested, time.Time{}, strings.NewReader(string(data)))
}

func injectDesktopBridge(index []byte) []byte {
    bridge := `<script>
(() => {
  const endpoint = '/__fictional_meme/ping';
  const ping = () => fetch(endpoint, { method: 'POST', cache: 'no-store' }).catch(() => {});
  ping();
  window.setInterval(ping, 15000);
  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'q') {
      event.preventDefault();
      fetch('/__fictional_meme/quit', { method: 'POST', keepalive: true }).finally(() => window.close());
    }
  });
})();
</script>`
    html := string(index)
    if strings.Contains(html, "</body>") {
        html = strings.Replace(html, "</body>", bridge+"</body>", 1)
    } else {
        html += bridge
    }
    return []byte(html)
}

func securityHeaders(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("X-Content-Type-Options", "nosniff")
        w.Header().Set("X-Frame-Options", "DENY")
        w.Header().Set("Referrer-Policy", "no-referrer")
        w.Header().Set("Cross-Origin-Resource-Policy", "same-origin")
        next.ServeHTTP(w, r)
    })
}

func openBrowser(url string) error {
    switch runtime.GOOS {
    case "windows":
        return exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
    case "darwin":
        return exec.Command("open", url).Start()
    default:
        return exec.Command("xdg-open", url).Start()
    }
}

func errorLogPath() string {
    return path.Join(os.TempDir(), "fictional-meme-desktop.log")
}
