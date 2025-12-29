import CryptoJS from 'crypto-js'
import sql from '../utils/db' // 🆕 1. Importamos nosso banco

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

        const encryptedMessage = response.data
        if (!encryptedMessage) {
            throw new Error('Não encontrei dados criptografados na resposta.')
        }

        const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey)
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8)

        if (!decryptedText) {
            throw new Error('Falha na descriptografia. A chave pode ter mudado.')
        }

       const jsonResult = JSON.parse(decryptedText)
        await sql`
            DELETE FROM historico_numeros 
            WHERE data_sorteio < NOW() - INTERVAL '30 days'
        `;

        if (jsonResult && jsonResult.result) {
            const listaSorteios = jsonResult.result;

            for (const sorteio of listaSorteios) {
                const [dataPt, hora] = sorteio.dataDrawn.split(' '); 
                const [dia, mes, ano] = dataPt.split('/');
                const dataFormatada = `${ano}-${mes}-${dia} ${hora}`;
                const dataFinal = dataFormatada + '+00';
                if (sorteio.prizes) {
                    for (const premio of sorteio.prizes) {
                        if (premio.group) {
                            const numero = Number(premio.group.trim().split(' ')[0]);

                            try {
                                const jaExiste = await sql`
                                    SELECT id FROM historico_numeros 
                                    WHERE numero = ${numero} 
                                    AND data_sorteio = ${dataFinal}
                                `;

                                if (jaExiste.length === 0) {
                                    await sql`
                                        INSERT INTO historico_numeros (numero, data_sorteio)
                                        VALUES (${numero}, ${dataFinal})
                                    `;
                                } else {
                                    // console.log('Registro duplicado');
                                }
                                
                            } catch (dbError) {
                                // console.error('ERRO NO BANCO:', dbError);
                            }
                        }
                    }
                }
            }
        } else {
            //  console.log('Estrutura de dados inesperada:', jsonResult);
        }

        return {
            success: true,
            original_encrypted: false,
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