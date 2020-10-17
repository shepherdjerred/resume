# Resume
Forked from https://github.com/sb2nov/resume

### Build using Docker
```sh
docker build -t latex .
docker run --rm -i -v "$PWD":/data latex pdflatex sourabh_bajaj_resume.tex
```

