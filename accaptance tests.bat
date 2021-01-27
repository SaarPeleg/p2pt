cd client
start cmd.exe /k "http-server -p 8080 --entry-file=./index.html"
cd ..
cd tests
npx codeceptjs run --steps