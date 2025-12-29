<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

definePageMeta({
    middleware: [
        function (to, from) {
            const { token } = useAuth()
            // Se não tiver token, manda pro login
            if (!token.value) {
                return navigateTo('/login')
            }
        }
    ]
})

useHead({
    title: 'Dashboard'
})

// --- Lógica de Dados (Mantida) ---
interface ApiResponse {
    statusCode: number;
    statusInfo: string;
    data: {
        key: string;
        views: number;
    }[];
}

const config = useRuntimeConfig()
const { token, logout } = useAuth()
const placar: any = ref({});
const cinco_primeiros_num: any = ref([]);
const cinco_ultimos_num: any = ref([])

// --- Lógica do Timer e Sorteios ---
const drawTimes = [
    "11:20", "12:20", "13:20", "14:20",
    "18:20", "19:20", "20:20", "21:20", "22:20", "23:20"
];

const timeRemaining = ref(0); // Em milissegundos

const updateTimer = () => {
    const now = new Date();
    let nextDrawDate: Date | null = null;

    // 1. Procura o próximo horário HOJE
    for (const timeStr of drawTimes) {
        const [h = 0, m] = timeStr.split(':').map(Number);
        const drawDate = new Date();
        drawDate.setHours(h, m, 0, 0);

        if (drawDate > now) {
            nextDrawDate = drawDate;
            break;
        }
    }

    // 2. Se não achou hoje, pega o primeiro de AMANHÃ
    if (!nextDrawDate) {
        const [h = 0, m] = drawTimes[0]!.split(':').map(Number);
        nextDrawDate = new Date();
        nextDrawDate.setDate(nextDrawDate.getDate() + 1);
        nextDrawDate.setHours(h, m, 0, 0);
    }

    // 3. Calcula a diferença
    const diff = nextDrawDate.getTime() - now.getTime();
    timeRemaining.value = Math.max(0, diff);
    //   timeRemaining.value = 4000;
}

// Formatação (Minutos e Segundos)
const formattedMinutes = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60000);
    return minutes.toString().padStart(2, '0');
});

const formattedSeconds = computed(() => {
    const seconds = Math.floor((timeRemaining.value % 60000) / 1000);
    return seconds.toString().padStart(2, '0');
});

// Lógica da Urgência (Faltam menos de 5 segundos?)
const isUrgent = computed(() => {
    return timeRemaining.value > 0 && timeRemaining.value <= 5000;
});


// --- Fetch de Dados da API (Mantido) ---
const getFormattedDateUTC = (date: Date) => {
    return date.toISOString().slice(0, 16)
}

const timeParams = ref({ from: '', to: '' })

const updateTimeWindow = () => {
    const now = new Date()
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
    timeParams.value = {
        from: getFormattedDateUTC(tenMinutesAgo),
        to: getFormattedDateUTC(now)
    }
}

const { data: apiData, error } = await useFetch<ApiResponse>('/api/v2/h5live/views/os', {
    baseURL: config.public.apiBase as string,
    headers: { 'x-access-token': token.value ?? '' },
    query: timeParams,
    immediate: !!token.value
})

const totalViews = computed(() => {
    if (!apiData.value || !apiData.value.data) return 0
    return apiData.value.data.reduce((acc, item) => acc + (item.views || 0), 0)
})

// --- Ciclo de Vida ---
let dataTimer: ReturnType<typeof setInterval>
let countdownTimer: ReturnType<typeof setInterval>

onMounted(async () => {
    // 1. Busca os dados
    const resposta: any = await $fetch('/api/resultado');
    
    // 👇 AJUSTE 1: Verificamos o caminho correto (data -> result)
    if (resposta && resposta.data && resposta.data.result) {
        
        const listaDeSorteios = resposta.data.result;

        // 👇 AJUSTE 2: O Primeiro Loop (passa por cada horário/sorteio)
        listaDeSorteios.forEach((sorteio: any) => {
            
            // Pegamos os prêmios DENTRO desse sorteio específico
            const premiosDoSorteio = sorteio.prizes;

            if (premiosDoSorteio) {
                // 👇 AJUSTE 3: O Segundo Loop (sua lógica antiga entra aqui)
                premiosDoSorteio.forEach((premio: any) => {
                    const { group } = premio;
                    
                    if (group) {
                        const numero = Number(group.trim().split(' ')[0]);

                        // Lógica de contagem no placar
                        if (!placar.value[numero]) {
                            placar.value[numero] = 1;
                        } else {
                            placar.value[numero] += 1;
                        }
                    }
                });
            }
        });

        // 3. Ordenar e pegar o Top 5 (isso continua igual fora dos loops)
        const listaCompleta = Object.entries(placar.value);
        listaCompleta.sort((a: any, b: any) => b[1] - a[1]);
        
        cinco_primeiros_num.value = listaCompleta.slice(0, 5);
        cinco_ultimos_num.value = listaCompleta.slice(-5).reverse();
        console.log(cinco_primeiros_num.value);
    }
});

onMounted(() => {
    updateTimeWindow();
    updateTimer(); // Roda imediatamente

    // Atualiza dados a cada 30s
    dataTimer = setInterval(updateTimeWindow, 30000);

    // Atualiza o relógio a cada 1 segundo (1000ms)
    countdownTimer = setInterval(updateTimer, 1000);
})

onUnmounted(() => {
    clearInterval(dataTimer);
    clearInterval(countdownTimer);
})
</script>

<template>
    <div class="dashboard-wrapper">

        <header class="dashboard-header">
            <div>
                <h1 class="page-title">Dashboard em Tempo Real</h1>
                <p class="page-subtitle">Monitoramento de espectadores</p>
            </div>
            <button class="logout-btn" @click="logout">
                Sair
            </button>

            <div class="timer-container" :class="{ 'urgent-pulse': isUrgent }">
                <span class="timer-label">Próximo Sorteio:</span>
                <span class="timer-clock">
                    {{ formattedMinutes }}:{{ formattedSeconds }}
                </span>
            </div>
        </header>

        <div v-if="error" class="error-alert">
            <strong>Erro:</strong> {{ error.message }}
        </div>

        <div v-else-if="apiData && apiData.data" class="content-container">

            <div class="dashboard-grid">
                <div class="card total-card">
                    <div class="card-header">
                        <h2>Total de Espectadores</h2>
                    </div>
                    <div class="card-body centered">
                        <span class="stat-value">{{ totalViews }}</span>
                        <span class="stat-label">ao vivo</span>
                    </div>
                </div>

                <div class="card list-card">
                    <div class="card-header">
                        <h2>Sistemas</h2>
                    </div>
                    <div class="card-body">
                        <ul class="system-list">
                            <li v-for="(item, index) in apiData.data" :key="index" class="list-item">
                                <span class="system-name">{{ item.key }}</span>
                                <div class="count-badge">{{ item.views }}</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="top-numbers-section" v-if="cinco_primeiros_num.length > 0">
                <h3 class="section-title">Mais Sorteados (Top 5) 🔥</h3>
                <div class="balls-container">
                    <div v-for="(item, index) in cinco_primeiros_num" :key="index" class="ball-wrapper">
                        <div class="lottery-ball hot-ball"> {{ item[0] }}
                        </div>
                        <span class="ball-count">{{ item[1] }}x</span>
                    </div>
                </div>
            </div>

            <div class="top-numbers-section cold-section" v-if="cinco_ultimos_num.length > 0">
                <h3 class="section-title">Menos Sorteados (Frios) ❄️</h3>
                <div class="balls-container">
                    <div v-for="(item, index) in cinco_ultimos_num" :key="index" class="ball-wrapper">
                        <div class="lottery-ball cold-ball">
                            {{ item[0] }}
                        </div>
                        <span class="ball-count">{{ item[1] }}x</span>
                    </div>
                </div>
            </div>

        </div>

        <div v-else class="loading-container">Carregando...</div>
    </div>
</template>

<style scoped>
/* Layout Principal */
.dashboard-wrapper {
    max-width: 1000px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: white;
    /* Texto base branco para o cabeçalho */
}

/* Cabeçalho com Timer */
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 1rem;
}

.page-title {
    font-size: 2.2rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(to right, #ffffff, #93c5fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.page-subtitle {
    margin-top: 0.5rem;
    color: #94a3b8;
    font-size: 1.1rem;
}

/* Timer Container */
.timer-container {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.3s ease;
}

.timer-label {
    font-size: 0.8rem;
    color: #cbd5e1;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.timer-clock {
    font-family: 'Courier New', Courier, monospace;
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
}

/* --- A MÁGICA DOS CARTÕES BRANCOS --- */
.dashboard-grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.card {
    /* Isso aqui é o que faz o texto aparecer! Fundo branco quase opaco */
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    color: #334155;
    /* Texto escuro dentro do cartão branco */
    overflow: hidden;
}

.card-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.card-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e3a8a;
}

.card-body {
    padding: 1.5rem;
}

.card-body.centered {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

/* Tipografia dos Números */
.stat-value {
    font-size: 5rem;
    line-height: 1;
    font-weight: 800;
    color: #3b82f6;
}

.stat-label {
    margin-top: 0.5rem;
    text-transform: uppercase;
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
}

/* Lista */
.system-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #f1f5f9;
}

.count-badge {
    background-color: #eff6ff;
    color: #2563eb;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-weight: 700;
}

/* Animação Urgente (Pulse Vermelho) */
.urgent-pulse {
    background-color: #ef4444 !important;
    /* Força o vermelho */
    border-color: #f87171;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
    animation: pulse 0.5s infinite alternate;
}

/* Botão de Sair (Estilo Glass) */
.logout-btn {
    background: rgba(255, 255, 255, 0.1);
    /* Fundo transparente igual ao timer */
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    margin-left: 1rem;
    /* Dá um espacinho se estiver colado em algo */
}

/* Efeito ao passar o mouse */
.logout-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    /* Fica um pouco mais branco */
    transform: translateY(-2px);
    /* Sobe levemente */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Container da nova seção */
.top-numbers-section {
    margin-top: 2rem;
    /* Espaço entre os cards e as bolas */
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    /* Fundo sutil */
    padding: 1.5rem;
    border-radius: 12px;
}

.section-title {
    font-size: 1.2rem;
    color: #fff;
    margin-bottom: 1rem;
    font-weight: 600;
}

/* Flexbox para alinhar as bolinhas lado a lado */
.balls-container {
    display: flex;
    justify-content: center;
    /* Centraliza no meio da tela */
    gap: 1.5rem;
    /* Espaço entre as bolinhas */
    flex-wrap: wrap;
}

.ball-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* O Estilo da Bolinha */
.lottery-ball {
    width: 60px;
    height: 60px;
    background-color: #fff;
    /* Fundo branco */
    color: #333;
    /* Texto escuro */
    border-radius: 50%;
    /* Faz virar um círculo perfeito */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 800;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    /* Sombra para dar volume 3D */
    transition: transform 0.2s;
}

.lottery-ball:hover {
    transform: scale(1.1);
    /* Efeito legal ao passar o mouse */
}

.ball-count {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #ccc;
}

.logout-btn:active {
    transform: translateY(0);
    /* Volta ao normal ao clicar */
}

/* ... (Seus estilos anteriores continuam aqui) ... */

/* Ajuste para separar as seções */
.cold-section {
    margin-top: 1.5rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 1.5rem;
}

/* 🔥 ESTILO QUENTE */
.hot-ball {
    border: 3px solid #ff4500; /* Laranja Fogo */
    color: #333;
    box-shadow: 0 0 15px rgba(255, 69, 0, 0.4); /* Brilho laranja */
}

/* ❄️ ESTILO FRIO */
.cold-ball {
    border: 3px solid #00bfff; /* Azul Gelo */
    color: #333;
    box-shadow: 0 0 15px rgba(0, 191, 255, 0.4); /* Brilho azul */
}

/* Efeito ao passar o mouse */
.hot-ball:hover {
    transform: scale(1.1);
    background-color: #fff5f0;
}

.cold-ball:hover {
    transform: scale(1.1);
    background-color: #f0faff;
}

@keyframes pulse {
    from {
        transform: scale(1);
    }

    to {
        transform: scale(1.05);
    }
}
</style>