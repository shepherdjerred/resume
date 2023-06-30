VERSION 0.7
PROJECT sjerred/resume

pipeline:
  PIPELINE --push
  TRIGGER push main
  BUILD +publish
  BUILD +devcontainer

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

devcontainer:
  FROM earthly/dind:ubuntu
  WORKDIR /workspace
  ARG TARGETARCH
  ARG version=0.1.11-beta.0
  RUN curl --location --fail --silent --show-error -o /usr/local/bin/devpod https://github.com/loft-sh/devpod/releases/download/v$version/devpod-linux-$TARGETARCH
  RUN chmod +x /usr/local/bin/devpod
  COPY .devcontainer/devcontainer.json .
  RUN --push --secret GITHUB_TOKEN=github_token echo $GITHUB_TOKEN | docker login ghcr.io -u shepherdjerred --password-stdin
  WITH DOCKER
    RUN devpod provider add docker && \
      devpod build github.com/shepherdjerred/resume --repository ghcr.io/shepherdjerred/resume
  END
