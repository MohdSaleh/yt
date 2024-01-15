#!/bin/bash

# Clone the GitHub repository
git clone https://github.com/MohdSaleh/yt.git

# Use the memgpt folder command to find the .memgpt directory's path
MEMGPT_PATH=$(memgpt folder | grep 'Opening home folder:' | cut -d' ' -f4)

# Check if the MEMGPT_PATH is found
if [ -z "$MEMGPT_PATH" ]; then
    echo "Failed to find the .memgpt directory"
    exit 1
fi

# Copy the necessary files to the .memgpt directory
cp yt/agi/chat_dev_yt_preset.yaml $MEMGPT_PATH/presets/chat_dev_yt_preset.yaml
cp yt/agi/config $MEMGPT_PATH/config
cp yt/agi/DeveloperYT $MEMGPT_PATH/personas/DeveloperYT
cp yt/agi/student.txt $MEMGPT_PATH/humans/student.txt
cp yt/agi/chat_dev_yt.txt $MEMGPT_PATH/system_prompts/chat_dev_yt.txt

# Cleanup
rm -rf yt
