FROM denoland/deno:distroless-1.46.3
ENV TZ="Europe/London"
WORKDIR /app
COPY deno.json deno.lock *.ts ./
RUN ["deno", "cache", "--reload", "--lock=deno.lock", "main.ts"]
USER nonroot
ENTRYPOINT ["deno", "run", "--allow-env=VRM_PASSWORD,OCTOPUS_API_KEY", "--allow-net=vrmapi.victronenergy.com,api.octopus.energy", "main.ts"]