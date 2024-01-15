#!/bin/bash

# Start memgpt server in the background
memgpt server --port 3000 &

# Wait for the server to start
sleep 10

# Execute the curl request
curl --request POST \
  --url http://localhost:3001/agents \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{"config": {"name": "YoungtechyAGI_v1", "persona": "DeveloperYT", "human": "student", "preset": "chat_dev_yt_preset", "model": "gpt-4-turbo", "model_endpoint_type": "openai", "model_endpoint": "https://agi.ryansaleh.com/v1"}, "user_id": "yt_admin_server"}'
