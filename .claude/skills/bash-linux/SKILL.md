# Bash & Linux Skill

Essential commands and patterns for shell scripting and Linux administration.

## File Operations

```bash
# List files with details
ls -la

# Find files by name
find . -name "*.js" -type f

# Find files modified in last 24h
find . -mtime -1

# Search content in files
grep -r "pattern" --include="*.ts"

# Count lines in files
wc -l src/**/*.ts

# Disk usage
du -sh */
df -h
```

## Text Processing

```bash
# View file content
cat file.txt
head -n 20 file.txt
tail -n 20 file.txt
tail -f logs/app.log  # Follow live

# Search and filter
grep "error" log.txt
grep -i "error" log.txt        # Case insensitive
grep -v "debug" log.txt        # Exclude pattern
grep -E "error|warn" log.txt   # Multiple patterns

# Transform text
sed 's/old/new/g' file.txt
sed -i 's/old/new/g' file.txt  # In-place edit

# Column extraction
awk '{print $1, $3}' file.txt
cut -d',' -f1,3 data.csv

# Sort and unique
sort file.txt
sort -u file.txt      # Unique
sort -n file.txt      # Numeric
uniq -c sorted.txt    # Count occurrences
```

## Process Management

```bash
# List processes
ps aux
ps aux | grep node

# Find process by port
lsof -i :3000
netstat -tlnp | grep 3000

# Kill process
kill PID
kill -9 PID           # Force kill
pkill -f "node"       # Kill by name

# Background processes
command &             # Run in background
nohup command &       # Persist after logout
jobs                  # List background jobs
fg %1                 # Bring to foreground

# Monitor resources
top
htop
free -h              # Memory usage
```

## Network

```bash
# HTTP requests
curl https://api.example.com
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' URL
curl -o file.zip URL  # Download

# DNS lookup
nslookup domain.com
dig domain.com

# Port scanning
nc -zv host 80
telnet host 80

# Network info
ifconfig
ip addr
ping host
traceroute host
```

## Archives & Compression

```bash
# Tar
tar -cvf archive.tar folder/     # Create
tar -xvf archive.tar             # Extract
tar -czvf archive.tar.gz folder/ # Create gzipped
tar -xzvf archive.tar.gz         # Extract gzipped

# Zip
zip -r archive.zip folder/
unzip archive.zip
```

## Permissions

```bash
# Change permissions
chmod 755 script.sh       # rwxr-xr-x
chmod +x script.sh        # Add execute
chmod -R 644 folder/      # Recursive

# Change ownership
chown user:group file
chown -R user:group folder/

# Permission reference
# 7 = rwx (read, write, execute)
# 6 = rw- (read, write)
# 5 = r-x (read, execute)
# 4 = r-- (read only)
```

## Shell Scripting

```bash
#!/bin/bash

# Variables
NAME="value"
echo $NAME
echo "${NAME}_suffix"

# Arguments
echo "Script: $0"
echo "First arg: $1"
echo "All args: $@"
echo "Arg count: $#"

# Conditionals
if [ "$VAR" == "value" ]; then
    echo "Match"
elif [ -f "file.txt" ]; then
    echo "File exists"
else
    echo "No match"
fi

# File tests
[ -f file ]    # File exists
[ -d dir ]     # Directory exists
[ -z "$VAR" ]  # Variable is empty
[ -n "$VAR" ]  # Variable is not empty

# Loops
for i in 1 2 3; do
    echo $i
done

for file in *.txt; do
    echo "Processing $file"
done

while read line; do
    echo "$line"
done < file.txt

# Functions
my_function() {
    local var="$1"
    echo "Received: $var"
    return 0
}
my_function "argument"

# Exit codes
command && echo "Success" || echo "Failed"
if command; then
    echo "Success"
fi
```

## Environment Variables

```bash
# Set variable
export VAR="value"

# Read from .env file
export $(cat .env | xargs)

# Common variables
echo $HOME
echo $PATH
echo $PWD
echo $USER

# Add to PATH
export PATH="$PATH:/new/path"
```

## Useful One-Liners

```bash
# Find large files
find . -size +100M -type f

# Delete node_modules recursively
find . -name "node_modules" -type d -prune -exec rm -rf {} +

# Count files by extension
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn

# Watch command output
watch -n 1 'command'

# Parallel execution
cat urls.txt | xargs -P 4 -I {} curl {}

# Replace in multiple files
find . -name "*.js" -exec sed -i 's/old/new/g' {} +

# Create directory structure
mkdir -p project/{src,tests,docs}/{components,utils}

# Backup with date
cp file.txt file.txt.$(date +%Y%m%d)
```

## SSH

```bash
# Connect
ssh user@host
ssh -p 2222 user@host

# Copy files
scp file.txt user@host:/path/
scp -r folder/ user@host:/path/

# SSH tunnel
ssh -L 3000:localhost:3000 user@host

# SSH config (~/.ssh/config)
Host myserver
    HostName 192.168.1.100
    User myuser
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

## Cron Jobs

```bash
# Edit crontab
crontab -e

# Format: minute hour day month weekday command
# Examples:
0 * * * *     command   # Every hour
0 0 * * *     command   # Daily at midnight
0 0 * * 0     command   # Weekly on Sunday
*/5 * * * *   command   # Every 5 minutes
```
