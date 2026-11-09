FROM denoland/deno:2.5.6
WORKDIR /app
COPY main.ts deno.json* ./
RUN deno cache main.ts
USER deno
ENV PORT=8080
EXPOSE 8080
CMD ["run", "--allow-net", "--allow-env", "--allow-read", "main.ts"]
