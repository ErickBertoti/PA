# Express Backend 

Todo código do Backend está na pasta express, só rode os comando do Back no terminal estando dentro da pasta.

## Setup

### .env

Crie um arquivo .env no express e insira as linhas abaixo:

```env
DATABASE_URL=''

AWS_BUCKET_NAME='pa-gerenciador-arquivos'
AWS_BUCKET_REGION='us-east-1'
AWS_ACCESS_KEY='AKIAWPPO6RMPMCLURGPX'
AWS_SECRET_ACCESS_KEY='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'
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
