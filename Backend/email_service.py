from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_USERNAME,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_PORT=587,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    MAIL_DEBUG=1,
    USE_CREDENTIALS=True,
)


fm = FastMail(conf)

def generar_email_verificacion(nombre, link):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
        <div style="
          max-width:600px;
          margin:auto;
          background:white;
          padding:30px;
          border-radius:8px;
          box-shadow:0 0 10px rgba(0,0,0,0.1);
        ">

          <h2 style="color:#2c3e50;">Verificación de Cuenta</h2>

          <p>Hola <b>{nombre}</b>,</p>

          <p>
            Gracias por registrarte en <b>EjerciciosFNI</b>.
            Para activar tu cuenta, haz clic en el siguiente botón:
          </p>

          <div style="text-align:center; margin:30px 0;">
            <a href="{link}"
               style="
                 background:#4CAF50;
                 color:white;
                 padding:12px 25px;
                 text-decoration:none;
                 border-radius:5px;
                 font-weight:bold;
               ">
              Verificar cuenta
            </a>
          </div>

          <p style="font-size:14px;color:#777;">
            Si tú no creaste esta cuenta, ignora este mensaje.
          </p>

          <hr>

          <p style="font-size:12px;color:#aaa;text-align:center;">
            © 2026 HendrixSoka. Todos los derechos reservados.
          </p>

        </div>
      </body>
    </html>
    """


async def enviar_email_de_verficacion(correo, nombre, token):

    link = f"{settings.VERIFY_EMAIL_BASE_URL}/verify?token={token}"

    html = generar_email_verificacion(nombre, link)

    message = MessageSchema(
        subject="Verifica tu cuenta",
        recipients=[correo],
        body=html,      
        subtype="html" 
    )

    await fm.send_message(message)

