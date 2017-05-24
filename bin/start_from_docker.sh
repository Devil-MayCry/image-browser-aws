echo "start delpoying..."

# use production as env
export NODE_ENV=production

# delpoy by pm2-docker
pm2-docker start "dist/app.js" -i 0

echo "end delpoying"