import CryptoJS from 'crypto-js'

export default defineEventHandler(async (event) => {
  const targetUrl = 'https://fd1lbpjfs1.execute-api.us-east-1.amazonaws.com/autenticar'
  const secretKey = 'TRAA(o)DdVAKLJJ134nbHUASHUljkjMB6243@!.4'
  const meuCpf = process.env.TB_CPF;
  const minhaSenha = process.env.TB_SENHA;

  const credenciais = Buffer.from(`${meuCpf}:${minhaSenha}`).toString('base64')
  // console.log('credenciais', credenciais)
  try {
    const response: any = await $fetch(targetUrl, {
      method: 'POST', 
      headers: {
        'Authorization': `Basic ${credenciais}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://tradicional.bet.br',
        'Referer': 'https://tradicional.bet.br/',
        'Content-Type': 'application/json'
      },
      body: {}
    })

    if (response.data) {
      const bytes = CryptoJS.AES.decrypt(response.data, secretKey)
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8)

      if (!decryptedText) throw new Error('Senha incorreta para descriptografar.')

      const jsonResult = JSON.parse(decryptedText)
      const { link } = jsonResult;
      const urlObjeto = new URL(link);
      const authToken = urlObjeto.searchParams.get('token');
      // console.log(authToken);
      if (!authToken) {
        throw new Error('O link veio sem token!')
      }

      return {
       sucesso: true,
        mensagem: "Login realizado e Token capturado!",
        token_de_acesso: authToken
      }
    }

    return response

  } catch (error) {
    return {
      sucesso: false,
      erro: String(error)
    }
  }
})