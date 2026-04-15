#!/bin/bash
set -e

# Load storage state from env var (raw JSON content of storage_state.json)
if [ -n "$NOTEBOOKLM_STORAGE_STATE" ]; then
    mkdir -p ~/.notebooklm
    python -c "
import os, json
data = os.environ['NOTEBOOKLM_STORAGE_STATE']
# Validate it's valid JSON
json.loads(data)
with open(os.path.expanduser('~/.notebooklm/storage_state.json'), 'w') as f:
    f.write(data)
print(f'NotebookLM auth loaded ({len(data)} bytes)')
"
fi

exec "$@"
