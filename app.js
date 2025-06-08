const {
    createBot,
     createProvider,
      createFlow,
       addKeyword,
       EVENTS,
       addAnswer
   } = require("@bot-whatsapp/bot")

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const nodemailer = require('nodemailer');

// Configuración
const transporter = nodemailer.createTransport({
  host: 'mail.ejemplo.com',
  port: 465,
  secure: true,
  auth: {
    user: 'a@correo.com',
    pass: '--------'
  },
  tls: {
    rejectUnauthorized: false // si estás teniendo problemas con certificados
  },
  connectionTimeout: 10000, // aumentar timeout si es necesario (milisegundos)
  logger: true, // activa logs detallados
  debug: true   // modo debug
});



const flowFunciono = addKeyword('si').addAnswer(['Muy bien, me alegra haber sido de ayuda😁.', 'Hasta pronto.',],{media:'https://media.tenor.com/Oh8hxdAREWkAAAAe/gato-like.png'})
const flowNoFunciono = addKeyword('no').addAction(async (_, { flowDynamic }) => {
    return await flowDynamic('Lo siento mucho😓, ¿Podrías darme tu nombre?', {media:'https://pbs.twimg.com/ext_tw_video_thumb/1603799265633091586/pu/img/AyVrw8XIrTDtaeOe.jpg'})
})
.addAction({ capture: true }, async (ctx, { flowDynamic }) => 
{
    const name = ctx.body
    const numeroDeWhatsapp = ctx.from
    const mensaje = "El servicio de: " + name + ", presenta fallas ⚙️, favor de comunicarse a su número de teléfono, el cuál es: "+  numeroDeWhatsapp + "."

    //Construir mensaje
    const mailOptions = {
    from: 'andy@desaaye.com',
    to: 'tekcared@gmail.com',
    subject: 'Falla en el servicio de internet.',
    text: mensaje,
  };
  
  // Envío
  transporter.sendMail(mailOptions, async function(error, info) {
    if (error) {
      console.error(error)
       return await flowDynamic('Ha ocurrido un problema😵, vuelve a intentarlo más tarde, por favor.')
    } else {
      console.log('Correo enviado: ' + info.response)
       return await  flowDynamic('Ya hemos pasado tu reporte, uno de nuestros tecnicos se pondrá en contacto contigo para buscar una solución.⚙️')
    }
  });

}
).addAnswer('Ya hemos pasado tu reporte, uno de nuestros tecnicos se pondrá en contacto contigo para buscar una solución')


const flowReiniciar = addKeyword(['no','3','4',]).addAnswer([
    ' Intenta desconectando los equipos, espera 1 minuto y vuelve a conectar los equipos, espera 10 minutos y revisa la red ',
    '¿Funcionó? Si o No.',
], {capture:true},null,[flowFunciono, flowNoFunciono])

const flowWIFI3 = addKeyword('no').addAnswer([
    'Asegurate que el modem tenga el foquito de WLAN o WIFI encendido, de no ser así, apaga y prende el modem, espera unos 8 minutos y vé si resultó.',
    '¿Funcionó? Si o No.', 
],{capture:true},null,[flowFunciono, flowNoFunciono]
)

const flowWIFI2 = addKeyword('no').addAnswer([
    ' Revisa que tu celular reconozca la red, si la reconoce vuelve a ingresar la contraseña.',
    '¿Funcionó? Si o No.', 
    ],{capture:true},null,[flowFunciono,flowWIFI3,])

const flowWIFI = addKeyword('1').addAnswer([
    'Verifica que tu dispositivo ( celular, laptop, pc, tableta, etc) tenga el wifi encendido, de no ser así, por favor enciendelo y espera 5 minutos para verificar que tengas señal.',
    '¿Funcionó? Si o No.', 
], {capture: true}, null, [flowFunciono, flowWIFI2]
    )

const flowNoInternet2 = addKeyword('no').addAnswer([
    'Asegurate de que la antena esté conectada a la luz, de no ser así, conectala y espera 8 min, después verifica si ya llegó el internet.',
    '¿Funcionó? Si o No.',
], {capture: true }, null, [flowFunciono,flowReiniciar])

const flowNoInternet = addKeyword('2').addAnswer([
    'Asegurate que el modem esté prendido, de no ser así, conecta los cables del modem y enciendelo, espera 5 minutos y verifica que tengas internet.',
    '¿Funcionó? Si o No.',
 ],{capture: true},null,[flowFunciono,flowNoInternet2] )



const flowPrincipal = addKeyword(["Hola", "ola", "Buenos", "Buenas", "buen", "que onda", "como estas",
"estas", "hows it going", "que tal","que pasa", "como te va", "andres",
 "Qué tal", "Cómo estás", "Cómo te va", "Qué pasa", "Saludos", "Cómo andas", "Qué onda", 
 "Hola, ¿qué haces?", "Hola, ¿cómo has estado?", "¡Saludos cordiales!", "¡Hola, amigo!", "¡Hola, compañero!", 
 "¡Un placer saludarte!", "¡Qué gusto verte!", "¡Hola, qué hay de nuevo?",
 "¡Hola, buen amigo!", 'ayuda','tengo un problema', 'no tengo internet'])
   .addAnswer('🙌 Hola bienvenido a *Tekca Red*, ¿En qué te puedo ayudar?',
   {        media: 'https://pbs.twimg.com/media/CMn0I8xWgAAfGci?format=jpg&name=small', }
   )
   .addAnswer(
       [
           'Por favor, ingresa el número de la opción.',
           '1.- No hay señal wifi.',
           '2.- No hay internet en ningún dispositivo.',
           '3.- El internet está muy lento.',
           '4.- El internet viene y se va.'
   ],{capture: true},null,[flowWIFI,flowNoInternet, flowReiniciar] )


const main = async () => {
   const adapterDB = new MockAdapter()
   const adapterFlow = createFlow([flowPrincipal])
   const adapterProvider = createProvider(BaileysProvider)

   createBot({
       flow: adapterFlow,
       provider: adapterProvider,
       database: adapterDB,
   })

   QRPortalWeb()
}

main()
