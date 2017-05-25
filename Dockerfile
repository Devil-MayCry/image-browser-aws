FROM docker.gagogroup.cn:5000/cent7:node

VOLUME ["/home/ec2-user/s3-gagobucket"]

# Add all files to /usr/local/image-browser-aws/
WORKDIR /usr/local/
RUN mkdir image-browser-aws/
ADD . image-browser-aws/

# Build
WORKDIR /usr/local/image-browser-aws/
RUN sh bin/build.sh

# Just make sure that we are in the right permission
RUN chmod 777 bin/start_from_docker.sh
