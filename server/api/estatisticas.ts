import sql from "../utils/db";

export default defineEventHandler(async (event) => {
    try {
        // Definimos os filtros de tempo
        const filtroDia = sql`WHERE data_sorteio > NOW() - INTERVAL '1 day'`;
        const filtroSemana = sql`WHERE data_sorteio > NOW() - INTERVAL '7 days'`;
        const filtroMes = sql``; // Mês é "tudo que tem no banco" (já limpamos > 30 dias)

        // Rodamos as 6 consultas em paralelo para ser super rápido ⚡
        const [
            diaQuentes, diaFrios,
            semanaQuentes, semanaFrios,
            mesQuentes, mesFrios
        ] = await Promise.all([
            // --- 📅 DIA (HOJE) ---
            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroDia} GROUP BY numero ORDER BY total DESC LIMIT 5`,
            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroDia} GROUP BY numero ORDER BY total ASC LIMIT 5`,

            // --- 🗓️ SEMANA ---
            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroSemana} GROUP BY numero ORDER BY total DESC LIMIT 5`,
            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroSemana} GROUP BY numero ORDER BY total ASC LIMIT 5`,

            // --- 📆 MÊS (GERAL) ---
            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroMes} GROUP BY numero ORDER BY total DESC LIMIT 5`,
            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroMes} GROUP BY numero ORDER BY total ASC LIMIT 5`
        ]);

        // Montamos o objeto do jeitinho que você pediu 📦
        return {
            dia: {
                quentes: diaQuentes,
                frios: diaFrios
            },
            semana: {
                quentes: semanaQuentes,
                frios: semanaFrios
            },
            mes: {
                quentes: mesQuentes,
                frios: mesFrios
            }
        }

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
        // Retornamos vazio se der erro, mantendo a estrutura para não quebrar o front
        return {
            dia: { quentes: [], frios: [] },
            semana: { quentes: [], frios: [] },
            mes: { quentes: [], frios: [] }
        }
    }
})