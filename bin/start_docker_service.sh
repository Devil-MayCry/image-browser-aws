# start docker and run the service bash script to run the service

docker run -d -v /home/ec2-user/s3-gagobucket docker.gagogroup.cn:5000/image-browser-aws /usr/local/image-browser-aws/bin/start_from_docker.sh