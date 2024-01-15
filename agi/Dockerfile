# Use Python 3.11 base image
FROM python:3.11

# Install pymemgpt
RUN pip install pymemgpt

# Create required directories
RUN mkdir -p /.memgpt/presets /.memgpt/config /.memgpt/personas /.memgpt/humans /.memgpt/system_prompts

# Copy files and directories
COPY chat_dev_yt_preset.yaml /.memgpt/presets/chat_dev_yt_preset.yaml
COPY config /.memgpt/config
COPY DeveloperYT /.memgpt/personas/DeveloperYT
COPY student.txt /.memgpt/humans/student.txt
COPY chat_dev_yt.txt /.memgpt/system_prompts/chat_dev_yt.txt

# Copy the start script
COPY start.sh /start.sh

# Make the start script executable
RUN chmod +x /start.sh

# Set the working directory
WORKDIR /.memgpt

# Expose port 3000
EXPOSE 3000

# Start script
CMD ["/start.sh"]
