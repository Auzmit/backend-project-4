.PHONY: test

setup:
	npm install

run:
	page-loader --output /var/tmp https://ru.hexlet.io/courses
# ./page-loader.js https://ru.hexlet.io/courses -o ./tmp

# delete files which include content from 'make run'
clean:
	rm -rf /var/tmp/ru-hexlet-io-courses.html /var/tmp/ru-hexlet-io-courses_files

test:
	npm test