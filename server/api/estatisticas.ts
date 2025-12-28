import sql from "../utils/db"

export default defineEventHandler(async (event) => {
    try {
        // Usamos Promise.all para rodar as duas consultas em paralelo (mais rápido)
        const [quentes, frios] = await Promise.all([
            // 1. Os Mais Sorteados (Top 5) 🔥
            sql`
                SELECT numero, COUNT(*) as total
                FROM historico_numeros
                GROUP BY numero
                ORDER BY total DESC
                LIMIT 5
            `,
            // 2. Os Menos Sorteados (Bottom 5) ❄️
            sql`
                SELECT numero, COUNT(*) as total
                FROM historico_numeros
                GROUP BY numero
                ORDER BY total ASC
                LIMIT 5
            `
        ])

        return {
            quentes, // Lista dos Top 5
            frios    // Lista dos Bottom 5
        }

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
        return { quentes: [], frios: [] }
    }
})