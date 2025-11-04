"""Utility script to run the backend and frontend development servers together."""

from __future__ import annotations

import atexit
import os
import signal
import subprocess
import sys
import time
from typing import List


class ProcessManager:
    """Manage child processes and ensure they are terminated gracefully."""

    def __init__(self) -> None:
        self._processes: List[subprocess.Popen] = []
        signal.signal(signal.SIGINT, self._handle_signal)
        signal.signal(signal.SIGTERM, self._handle_signal)
        atexit.register(self.shutdown)

    def add(self, process: subprocess.Popen) -> None:
        self._processes.append(process)

    def _handle_signal(self, signum: int, frame) -> None:  # type: ignore[override]
        print(f"\nReceived signal {signum}. Shutting down child processes...")
        self.shutdown()
        sys.exit(0)

    def shutdown(self) -> None:
        for proc in self._processes:
            if proc.poll() is None:
                proc.terminate()
        for proc in self._processes:
            if proc.poll() is None:
                try:
                    proc.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    proc.kill()


def ensure_python_dependencies() -> None:
    try:
        import uvicorn  # noqa: F401
    except ImportError as exc:  # pragma: no cover - runtime guard
        print(
            "Python dependency check failed: `uvicorn` is required to run the backend.\n"
            "Install it with `pip install -r backend/requirements.txt` and try again."
        )
        raise SystemExit(1) from exc


def ensure_node_dependencies() -> str:
    from shutil import which

    npm_path = which("npm")
    if npm_path is None:
        print(
            "Node.js dependency check failed: `npm` command not found.\n"
            "Install Node.js (which includes npm) and ensure it is on your PATH."
        )
        raise SystemExit(1)

    if which("node") is None:
        print(
            "Node.js dependency check failed: `node` command not found.\n"
            "Install Node.js and ensure it is on your PATH."
        )
        raise SystemExit(1)

    return npm_path

def main() -> None:
    ensure_python_dependencies()
    npm_executable = ensure_node_dependencies()

    manager = ProcessManager()

    backend_cmd = [sys.executable, os.path.join(os.getcwd(), "main.py")]
    print("Starting backend server with:", " ".join(backend_cmd))
    backend_proc = subprocess.Popen(backend_cmd)
    manager.add(backend_proc)

    frontend_cmd = [npm_executable, "run", "start"]
    print(
        "Starting frontend server with:",
        " ".join(frontend_cmd),
        "(cwd=frontend)",
    )
    frontend_proc = subprocess.Popen(frontend_cmd, cwd="frontend")
    manager.add(frontend_proc)

    try:
        while True:
            exited = [proc for proc in manager._processes if proc.poll() is not None]
            if exited:
                exit_messages = ", ".join(
                    f"{cmd_description(proc)} exited with code {proc.returncode}"
                    for proc in exited
                )
                print(exit_messages)
                break
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received. Shutting down child processes...")
    finally:
        manager.shutdown()


def cmd_description(proc: subprocess.Popen) -> str:
    args = proc.args
    if isinstance(args, list):
        return " ".join(str(part) for part in args)
    return str(args)


if __name__ == "__main__":
    main()
