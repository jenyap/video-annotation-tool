


.PHONY: install run

install:
	python3 -m venv ../venv --copies --prompt "annotation-tool"
	../venv/bin/pip install -U pip wheel setuptools && ../venv/bin/pip install -r src/requirements.txt

.ONESHELL:
run:
	export FLASK_APP='video'
	export FLASK_ENV='development'
	../venv/bin/python3 src/app.py
