docker stop agilecontainer
docker rm -f agilecontainer
docker rmi agileimage

mvn clean verify

docker build -f DockerfileDev -t agileimage:0.1 .

docker run \
  --name agilecontainer \
  -v "$(pwd)/target:/tmp/target:rw" \
  -p 8080:8080 \
  --env-file .env \
  -d agileimage:0.1