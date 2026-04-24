"""Thin entry point — delegates to runner.main."""
from .runner import main
import sys
if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
