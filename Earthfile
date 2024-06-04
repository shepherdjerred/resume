VERSION 0.8
PROJECT sjerred/resume

build:
  FROM blang/latex:ubuntu
  COPY resume.tex .
  RUN pdflatex resume.tex
  SAVE ARTIFACT resume.pdf AS LOCAL resume.pdf

publish:
  FROM node:lts
  RUN npm install -g wrangler
  COPY +build/resume.pdf site/
  RUN --push --secret CLOUDFLARE_API_TOKEN=cloudflare_api_token --secret CLOUDFLARE_ACCOUNT_ID=cloudflare_account_id npx wrangler pages deploy site --project-name resume-sjerred
