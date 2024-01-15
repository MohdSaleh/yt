# Use Python 3.11 base image
FROM python:3.11

# Install pymemgpt and git
RUN apt-get update && apt-get install -y git
RUN pip install pymemgpt

# Copy the setup script
COPY setup.sh /setup.sh

# Make the setup script executable
RUN chmod +x /setup.sh

# Run the setup script
RUN /setup.sh

# Set the working directory to the .memgpt directory
WORKDIR /root/.memgpt

# Expose port 3000
EXPOSE 3000

# Start memgpt server
CMD ["memgpt", "server", "--port", "3000"]