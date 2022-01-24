import sendgrid from '@sendgrid/mail'

export async function debugSendEmailToken(email: string, token: string) {
    console.log(`email token for ${email}: ${token} `)
}

export async function sendEmailToken(email: string, token: string) {
    const msg = {
      to: email,
      from: 'EMAIL_ADDRESS_CONFIGURED_IN_SEND_GRID@email.com',
      subject: 'Login token for the modern backend API',
      text: `The login token for the API is: ${token}`,
    }
  
    await sendgrid.send(msg)
}