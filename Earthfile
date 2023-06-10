VERSION 0.7

build:
  FROM blang/latex:ubuntu
  COPY resume.tex .
  RUN pdflatex resume.tex
  SAVE ARTIFACT resume.pdf AS LOCAL resume.pdf
