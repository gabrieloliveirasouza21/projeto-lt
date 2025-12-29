import sql from "../utils/db";

export default defineEventHandler(async (event) => {
    try {
        const filtroDia = sql`WHERE data_sorteio > NOW() - INTERVAL '1 day'`;
        const filtroSemana = sql`WHERE data_sorteio > NOW() - INTERVAL '7 days'`;
        const filtroMes = sql``;

        const [
            diaQuentes, diaFrios,
            semanaQuentes, semanaFrios,
            mesQuentes, mesFrios
        ] = await Promise.all([
            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroDia} GROUP BY numero ORDER BY total DESC LIMIT 5`,
            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroDia} GROUP BY numero ORDER BY total ASC LIMIT 5`,

            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroSemana} GROUP BY numero ORDER BY total DESC LIMIT 5`,
            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroSemana} GROUP BY numero ORDER BY total ASC LIMIT 5`,

            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroMes} GROUP BY numero ORDER BY total DESC LIMIT 5`,
            sql`SELECT numero, COUNT(*) as total FROM historico_numeros ${filtroMes} GROUP BY numero ORDER BY total ASC LIMIT 5`
        ]);

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
        return {
            dia: { quentes: [], frios: [] },
            semana: { quentes: [], frios: [] },
            mes: { quentes: [], frios: [] }
        }
    }
})