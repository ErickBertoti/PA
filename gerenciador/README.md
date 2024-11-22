# Express Backend 

Todo código do Backend está na pasta express, só rode os comando do Back no terminal estando dentro da pasta.

## Setup

### .env

Crie um arquivo .env no express e insira as linhas abaixo:

```env
DATABASE_URL='mysql://root:senha@localhost:3306/nomedobanco'

AWS_BUCKET_NAME='pa-gerenciador-arquivos'
AWS_BUCKET_REGION='us-east-1'

Também iriam aqui as chaves da AWS, como são privadas, pedimos que peça à nossa equipe se for necessário para você.

JWT_SECRET_KEY='fLz8@iC6zP#m0U76vx3h23Qx0VjzE8Fr'
```

Adicione a Url do banco local que criou. A [database url](https://www.prisma.io/docs/concepts/database-connectors/mysql#base-url-and-path) tem que ser pra um banco MySQL, se quiser usar outro precisa alterar o prisma antes. 


## Executar

```sh
npm i
npm start
```

Vá na api no [localhost 8080](http://localhost:8080)

# React Frontend

Todo código do Frontend está na pasta express, só rode os comando do Front no terminal estando dentro da pasta.

## Executar

```sh
npm i
npm run dev
```

Vá no app no [localhost 3000](http://localhost:3000)
