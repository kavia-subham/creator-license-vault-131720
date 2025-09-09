#!/bin/bash
cd /home/kavia/workspace/code-generation/creator-license-vault-131720/creator_license_vault_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

