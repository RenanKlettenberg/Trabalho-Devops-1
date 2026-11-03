FROM nginx:alpine

# O nginx.conf vira um "template": na inicialização a imagem oficial troca
# ${USUARIO_URL}, ${GRUPOS_URL}... pelos valores das variáveis de ambiente.
# Assim a mesma imagem aponta para os containers (local) ou para o Render (DEV/HOMOL).
COPY nginx-main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY auth.js /etc/nginx/njs/auth.js

# Só estas variáveis são substituídas no template; as do próprio nginx
# ($host, $request_uri, $servico...) ficam intactas.
ENV NGINX_ENVSUBST_FILTER="_URL$|^NGINX_LOCAL_RESOLVERS$"

# Preenche NGINX_LOCAL_RESOLVERS com o DNS do ambiente (Docker local ou Render),
# usado pelo "resolver" do nginx.conf.
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1

EXPOSE 80
