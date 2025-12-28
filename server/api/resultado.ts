import CryptoJS from 'crypto-js'

export default defineEventHandler(async (event) => {
    const hoje = new Date()
    const ano = hoje.getFullYear()
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    const dia = String(hoje.getDate()).padStart(2, '0')
    const dataDinamica = `${ano}-${mes}-${dia}`

    const authResponse: any = await $fetch('/api/auth');
    const token = authResponse.token_de_acesso;
    if (!token) {
        return { erro: 'Não foi possível autenticar o robô.' }
    }
    // 2. URL com a variável injetada
    const targetUrl = `https://xd5h02qsge.execute-api.us-east-1.amazonaws.com/resultados/prognosticos-aberto?produto=BT&loteria=BT&dtEnd=${dataDinamica}&aovivo=true`

    const secretKey = 'TRAA(o)DdVAKLJJ134nbHUASHUljkjMB6243@!.4'

    try {
        const response: any = await $fetch(targetUrl, {
            headers: {
                "accept": "application/json, text/plain, */*",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                "Authorization": `${token}`,
                "priority": "u=1, i",
                "sec-ch-ua": "\"Google Chrome\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "type": "usuario",
                "Referer": "https://slotnuxtprd.tradicional.bet.br/"
            },
            "body": null,
            "method": "GET"
        });
        // Na sua imagem, o texto criptografado estava dentro de 'data'
        // Ex: { success: true, data: "U2FsdGVk..." }
        const encryptedMessage = response.data
        // console.log('RESPOSTA DO SITE:', JSON.stringify(response, null, 2))
        if (!encryptedMessage) {
            throw new Error('Não encontrei dados criptografados na resposta.')
        }

        // 3. A Mágica do Hacker Ético (Descriptografar) 🔓
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey)

        // O resultado sai em Bytes, precisamos converter para Texto (Utf8)
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8)

        // Se a senha estiver errada ou o dado corrompido, decryptedText vem vazio
        if (!decryptedText) {
            throw new Error('Falha na descriptografia. A chave pode ter mudado.')
        }

        // 4. Transformamos o texto (String) em Objeto JavaScript (JSON)
        const jsonResult = JSON.parse(decryptedText)

        return {
            success: true,
            original_encrypted: false, // Só pra gente saber que foi tratado
            data: jsonResult
        }

    } catch (error) {
        console.error(error)
        return {
            success: false,
            message: 'Erro ao buscar resultados',
            error: String(error)
        }
    }
})