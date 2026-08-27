import subprocess
import sys
import os
import time
import webbrowser
import signal

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

def main():
    print("=" * 60)
    print("🎙️  VOXORA — AI Voice Studio Launcher")
    print("=" * 60)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(base_dir, "venv", "Scripts", "python.exe") if os.name == "nt" else os.path.join(base_dir, "venv", "bin", "python")
    
    if not os.path.exists(venv_python):
        venv_python = sys.executable

    frontend_dir = os.path.join(base_dir, "frontend")

    print("[1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [venv_python, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=base_dir
    )

    time.sleep(1.5)

    print("[2/3] Starting Vite Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir
    )

    time.sleep(2)
    print("[3/3] Opening browser at http://localhost:5173 ...")
    webbrowser.open("http://localhost:5173")

    print("\n✅ Voxora is running!")
    print("• Frontend: http://localhost:5173")
    print("• Backend API: http://127.0.0.1:8000/docs")
    print("Press Ctrl+C in this terminal to stop all servers.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping Voxora servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done. Goodbye!")

if __name__ == "__main__":
    main()
