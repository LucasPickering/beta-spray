#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main() -> None:
    """Run administrative tasks."""
    # Settings *have* to be overrided for either dev or prd
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "")

    from django.conf import settings

    # Start debugger. Run in the process that _doesn't_ restart during a reload,
    # so the debugger remains connected. Only do this when running the main
    # server though. It creates issues during migrations or other things
    # https://stackoverflow.com/a/62944426/1907353
    if (
        settings.DEBUG
        and sys.argv[1] == "runserver"
        and not os.environ.get("RUN_MAIN")
    ):
        import debugpy

        debug_port = 8001
        debugpy.listen(("0.0.0.0", debug_port))
        print(f"Debugger listening on port {debug_port}")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
