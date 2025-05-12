import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv'; // Adicionar para carregar variáveis de ambiente

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

console.log('Configurações de Email:');
console.log(`- Host: ${process.env.EMAIL_HOST}`);
console.log(`- Port: ${process.env.EMAIL_PORT}`);
console.log(`- Secure: ${process.env.EMAIL_SECURE}`);
console.log(`- User: ${process.env.EMAIL_USER ? '******' : 'não definido'}`);
console.log(`- Password: ${process.env.EMAIL_PASSWORD ? '******' : 'não definido'}`);

// Configuração do transportador de email com mais logs
const createTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'gerenciadordedocumentos82@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'jhbr ulzn epnw orlt',
      },
      tls: {
        rejectUnauthorized: false // Permite certificados autoassinados em desenvolvimento
      }
    });
    
    console.log('Transportador de email criado com sucesso');
    return transporter;
  } catch (error) {
    console.error('Erro ao criar transportador de email:', error);
    throw error;
  }
};

// Função para verificar se uma ferramenta está próxima da expiração
const isNearExpiration = (expirationDate) => {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
  
  // Retorna true se faltar 30, 15, 7 ou 3 dias para expirar
  return [30, 15, 7, 6, 5, 4, 3, 2, 1].includes(diffDays);
};

// Função para enviar email de notificação
export const sendExpirationNotification = async (tool) => {
  const { id, name, description, responsible, responsibleEmail, expirationDate } = tool;
  
  console.log(`Tentando enviar notificação para ferramenta ${name} (ID: ${id})`);
  
  const formattedDate = new Date(expirationDate).toLocaleDateString('pt-BR');
  const daysUntilExpiration = Math.ceil(
    (new Date(expirationDate) - new Date()) / (1000 * 3600 * 24)
  );
  
  // Verifica se há um email para notificar
  if (!responsibleEmail) {
    console.error(`Ferramenta ${name} (ID: ${id}) não possui email de responsável definido`);
    return { success: false, error: 'Email do responsável não definido' };
  }
  
  try {
    // Criar um transportador sob demanda para cada envio
    const transporter = createTransporter();
    
    // Verificar se o transportador está pronto
    transporter.verify(function(error, success) {
      if (error) {
        console.error('Erro na verificação do transportador:', error);
      } else {
        console.log('Servidor está pronto para enviar mensagens');
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Sistema de Gerenciamento" <gerenciadordedocumentos82@gmail.com>',
      to: responsibleEmail,
      subject: `ALERTA: Ferramenta ${name} expira em ${daysUntilExpiration} dias`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #e53e3e;">Alerta de Expiração de Ferramenta</h2>
          <p>Olá, ${responsible}.</p>
          <p>Este é um aviso importante sobre a ferramenta/licença sob sua responsabilidade:</p>
          
          <div style="background-color: #f8f8f8; padding: 15px; border-left: 4px solid #3182ce; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #3182ce;">${name}</h3>
            <p><strong>Descrição:</strong> ${description}</p>
            <p><strong>Data de Expiração:</strong> ${formattedDate}</p>
            <p><strong>Dias Restantes:</strong> <span style="color: #e53e3e; font-weight: bold;">${daysUntilExpiration} dias</span></p>
          </div>
          
          <p>Por favor, tome as medidas necessárias para renovar esta licença ou ferramenta antes que expire.</p>
          
          <p>Atenciosamente,<br>Sistema de Gerenciamento de Ferramentas e Licenças</p>
          
          <div style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            Este é um email automático. Não responda a esta mensagem.
          </div>
        </div>
      `,
    };

    console.log(`Enviando email para ${responsibleEmail} sobre a ferramenta ${name}`);
    
    // Enviar email com promise para melhor tratamento de erros
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email enviado com sucesso para ${responsibleEmail}: ${info.messageId}`);
    
    // Atualiza a data da última notificação
    await prisma.tool.update({
      where: { id: tool.id },
      data: { lastNotification: new Date() }
    });
    console.log(`Registro de notificação atualizado para ferramenta ${name} (ID: ${id})`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Erro ao enviar email para ${responsibleEmail}:`, error);
    return { success: false, error: error.message };
  }
};

// Função para verificar todas as ferramentas e enviar notificações
export const checkExpiringTools = async () => {
  console.log('Iniciando verificação de ferramentas próximas da expiração...');
  
  try {
    const tools = await prisma.tool.findMany();
    console.log(`Encontradas ${tools.length} ferramentas para verificar`);
    
    let notificationsSent = 0;
    let toolsNearExpiration = 0;
    
    for (const tool of tools) {
      const daysUntilExpiration = Math.ceil(
        (new Date(tool.expirationDate) - new Date()) / (1000 * 3600 * 24)
      );
      
      if (isNearExpiration(tool.expirationDate)) {
        toolsNearExpiration++;
        console.log(`Ferramenta ${tool.name} (ID: ${tool.id}) está próxima da expiração (${daysUntilExpiration} dias)`);
        
        // Verifica se já enviou notificação hoje
        const shouldSendNotification = !tool.lastNotification || 
          new Date(tool.lastNotification).toDateString() !== new Date().toDateString();
        
        if (shouldSendNotification) {
          console.log(`Enviando notificação para ferramenta ${tool.name} (ID: ${tool.id})`);
          const result = await sendExpirationNotification(tool);
          
          if (result.success) {
            notificationsSent++;
          } else {
            console.error(`Falha ao enviar notificação para ferramenta ${tool.name} (ID: ${tool.id}):`, result.error);
          }
        } else {
          console.log(`Notificação já enviada hoje para ferramenta ${tool.name} (ID: ${tool.id})`);
        }
      } else {
        console.log(`Ferramenta ${tool.name} (ID: ${tool.id}) não está próxima da expiração (${daysUntilExpiration} dias)`);
      }
    }
    
    console.log(`Verificação concluída: ${toolsNearExpiration} ferramentas próximas da expiração, ${notificationsSent} notificações enviadas`);
    return { success: true, notificationsSent, toolsNearExpiration };
  } catch (error) {
    console.error('Erro ao verificar ferramentas:', error);
    return { success: false, error: error.message };
  } finally {
    // Fechando a conexão do Prisma
    await prisma.$disconnect();
  }
};