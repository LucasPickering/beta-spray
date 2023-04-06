#!/usr/bin/env python3

"""
This is a general-purpose script for running useful development commands. It's
basically a shell script, but bash sucks so I wrote it in Python.
"""

import argparse
import json
import subprocess
import sys
import time


def main() -> None:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(title="subcommands")

    deploy_parser = subparsers.add_parser("deploy")
    deploy_parser.set_defaults(func=deploy)
    deploy_parser.add_argument(
        "--watch",
        "-w",
        action="store_true",
        help="Wait for the CI pipeline to finish",
    )

    # Call the function associated with the given subcommand
    args = parser.parse_args()
    args.func(args)


def deploy(args: argparse.Namespace) -> None:
    """
    Deploy the current branch to the development environment
    """

    branch = git_branch()
    workflow = "build-deploy.yml"
    run(
        "gh",
        "workflow",
        "run",
        workflow,
        "-F",
        "environment=development",
        "-r",
        branch,
    )

    if args.watch:
        time.sleep(3)  # It takes a bit for the run to appear in the CI...
        # gh client is kinda shit so it doesn't spit out the run ID. Let's just
        # grab the latest for this branch and hope it's the one we just started
        runs = json.loads(
            run(
                "gh",
                "run",
                "list",
                "--workflow",
                workflow,
                "--branch",
                branch,
                "--json",
                "databaseId,status,conclusion",
            )
        )
        run_id = str(runs[0]["databaseId"])
        # Watch the output
        p = subprocess.Popen(
            ["gh", "run", "watch", run_id],
            stdout=sys.stdout,
        )
        p.wait()


def db(args: argparse.Namespace) -> None:
    print(args)


def run(*command: str) -> str:
    """
    Run a command with its arguments, and return its stdout output. Raise an
    exception if it has a non-zero exit code.
    """
    return subprocess.check_output(command).decode()


def git_branch() -> str:
    """
    Get current git branch name
    """
    return run("git", "rev-parse", "--abbrev-ref", "HEAD").strip()


if __name__ == "__main__":
    main()
