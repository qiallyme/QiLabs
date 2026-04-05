#!/usr/bin/env bash
set -e

QILABS_HOME="${HOME}/QiLabs"

echo "Setting up QiLabs at $QILABS_HOME..."

# Folders to create
FOLDERS=(
    "$QILABS_HOME/QiData/inbox"
    "$QILABS_HOME/QiData/processing"
    "$QILABS_HOME/QiData/reviewed"
    "$QILABS_HOME/QiData/failed"
    "$QILABS_HOME/QiData/manifests"
    "$QILABS_HOME/QiData/extracted_text"
    "$QILABS_HOME/QiData/embeddings_cache"
    "$QILABS_HOME/QiData/logs"
    "$QILABS_HOME/QiData/model_cache"
    "$QILABS_HOME/_QiOne_MonoRepo"
)

for FOLDER in "${FOLDERS[@]}"; do
    if [ ! -d "$FOLDER" ]; then
        mkdir -p "$FOLDER"
        echo "Created $FOLDER"
    else
        echo "$FOLDER already exists"
    fi
done

# Set Environment Variable for bash profile
if ! grep -q "QILABS_HOME" ~/.bashrc 2>/dev/null; then
    echo "export QILABS_HOME=\"$QILABS_HOME\"" >> ~/.bashrc
fi

if [[ -f ~/.zshrc ]] && ! grep -q "QILABS_HOME" ~/.zshrc 2>/dev/null; then
    echo "export QILABS_HOME=\"$QILABS_HOME\"" >> ~/.zshrc
fi

echo "Environment variable QILABS_HOME added to shell profiles."
echo "QiLabs installation complete!"
echo "Next Step: enroll your device."
