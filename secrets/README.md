# SECRETS
Essa pasta guarda os SECRETs que todos os microserviços usam.
O docker carregar esses secrets da sua máquina para o container, insira os arquivos da lista abaixo para que todos funcionem perfeitamente.

## Arquivos necessários:
1. db_password.txt
    - senha do banco
2. pepper.txt
    - string adicionada a toda senha de usuário como forma de segurança extra
3. secret_jwt.txt
    - string usada para gerar o token JWT.

