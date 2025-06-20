.PHONY: test

setup:
	npm install
	
run: run-hexlet run-google

run-hexlet:
	./page-loader.js https://ru.hexlet.io/courses?q%5Bsearch_text%5D=asd -o ./tmp

run-google:
	./page-loader.js https://www.google.com -o ./tmp

# delete files which include content from 'make run'
clean:
	node -e "require('fs/promises').rm('./tmp', { recursive: true, force: true })"

test:
	npm test